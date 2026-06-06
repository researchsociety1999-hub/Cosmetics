# 08 — Minimum Viable Business Operating System (Spec)

Goal: turn the existing admin surface into an operable business platform **without** changing routing, brand, or the payment core. Everything below fits the current architecture: Next.js App Router server components under `/admin`, Supabase service-role data layer (`lib/supabaseClient.ts:supabaseAdmin`), and the existing `requireAdminSession` gate.

## Evidence validation (2026-06-06)

The architectural assumptions this spec relies on were re-verified. Tag: **[C]** Confirmed · **[P]** Partially evidenced · **[N]** Not confirmed.

| Assumption the spec builds on | Tag | Evidence |
|---|---|---|
| Admin pages are server components calling `requireAdminSession` | C | `admin/products/page.tsx:104`, `admin/lib/session.ts:20-30` |
| Writes go through `"use server"` actions that re-verify session | C | `admin/orders/[id]/actions.ts:29-34` |
| `supabaseAdmin` (service role) is the admin data client | C | `lib/supabaseClient.ts:44-46`, `admin/lib/overviewData.ts:74` |
| Admin-only tables use RLS-on / no-policy pattern | C | `chat_logs` via `admin/lib/chatLogStore.ts:5-7`; migration note `migrations/20260427_*.sql:201-202` |
| `admin_users` table exists but is unused | C | `migrations/20260427_*.sql:212`; grep in `src` → 0 hits |
| `analytics_events` table exists with RLS but unused by app | C | `migrations/20260427_*.sql:178-184`; grep in `src` → 0 hits |
| `order_status_history` exists (reusable for audit) | C | `migrations/20260427_*.sql:145-154`; grep in `src` → 0 hits |
| KPI revenue currently summed client-side, all statuses | C | `admin/lib/overviewData.ts:88-113` |
| `ADMIN_ACTOR="admin"` placeholder (no real operator identity) | C | `admin/orders/[id]/actions.ts:22` |
| Proposed `order_audit_log` DDL is **not yet applied** | N | proposal only; no such table in migrations |
| Exact `order_status_history` column shape fits audit needs | P | table referenced in RLS migration; full column list not read in this audit |

---

---

## Design principles (match existing patterns)
- New admin pages are server components under `next-app/src/app/admin/*` calling `await requireAdminSession("/admin/<path>")` (mirrors `admin/products/page.tsx:104`).
- All writes go through `"use server"` actions that **re-verify** the session (mirrors `admin/orders/[id]/actions.ts:29`).
- Data access via `supabaseAdmin` only; RLS stays deny-by-default for admin-only tables (pattern already used by `chat_logs`, `admin/lib/chatLogStore.ts:5-7`).
- Reuse existing UI primitives: `AdminShell`, `KpiCard`, `StatusChip`, filters.

---

## 1. Admin pages (MVP)

| Page | Status today | MVP scope |
|---|---|---|
| Overview (`/admin`) | exists | Fix KPI status filter (B01); add **conversion**, **funnel**, **top products** once events exist |
| Orders (`/admin/orders`, `/[id]`) | exists (good) | Add audit-log timeline panel on detail page |
| Products (`/admin/products`) | read-only | Add **create/edit** (price, sale price, status, stock, copy, coming-soon) |
| Promotions (`/admin/promotions`) | **new** | List + create/expire promo codes & campaigns |
| Analytics (`/admin/analytics`) | **new** | Revenue trend, orders/day, AOV, conversion funnel, top SKUs |
| Audit log (`/admin/audit`) | **new** | Filterable feed of operator actions |
| Customers (`/admin/customers`) | exists (derived) | Add per-customer order history drill-down |

---

## 2. Metrics (definitions)

| Metric | Definition | Source |
|---|---|---|
| Gross revenue | Σ `total_cents` where status ∈ revenue set | `orders` (fix B01) |
| Net revenue | Gross − refunds/cancellations | `orders` + `payments` |
| Orders | count where status ∈ revenue set | `orders` |
| AOV | Gross revenue ÷ orders | derived |
| Conversion rate | `purchase` sessions ÷ `view_item`/visit sessions | GA4 / `analytics_events` (needs B02) |
| Funnel | view_item → add_to_cart → begin_checkout → purchase | events (needs B02) |
| Product performance | units + revenue by product | `order_items` join `products` |
| Cart abandonment | begin_checkout without purchase | events (needs B02) |

---

## 3. Access rules
- All `/admin/*` gated by `requireAdminSession` (today: shared password).
- **Recommended evolution (B11):** map authenticated Supabase users to `admin_users` (table already exists, `migrations/20260427_*.sql:212`) for per-operator identity → enables real audit attribution (replace `ADMIN_ACTOR="admin"` in `admin/orders/[id]/actions.ts:22`).
- Mutating tables (`order_audit_log`, `promo_*`, product writes) remain **service-role only**, no anon/authenticated RLS policies (pattern from `chat_logs`).

---

## 4. Supabase objects needed

### Reuse (already in schema, currently unused)
- `order_status_history` — back the order audit timeline instead of a new table if shape fits.
- `analytics_events` — destination for funnel/UTM events (policies exist, `migrations/20260427_*.sql:178-184`).
- `admin_users` — operator identity for roles.

### New (if `order_status_history` insufficient)
```sql
-- order_audit_log: durable operator action trail (service-role only; RLS on, no policies)
create table if not exists public.order_audit_log (
  id           bigint generated always as identity primary key,
  order_id     uuid not null references public.orders(id) on delete cascade,
  actor        text not null,              -- admin_users.id once roles land
  action       text not null,              -- 'promote_status' | 'update_tracking' | 'update_eta' | ...
  payload      jsonb not null default '{}',
  created_at   timestamptz not null default now()
);
create index if not exists idx_order_audit_log_order_id on public.order_audit_log(order_id);
alter table public.order_audit_log enable row level security; -- no policies → service role only
```

### Views / RPC (perf at scale — defer until needed, see B20)
- `admin_revenue_daily` materialized view (date, gross_cents, orders) to avoid client-side `Σ total_cents` (`overviewData.ts:91`).
- `product_performance` view (product_id, units, revenue_cents) from `order_items`.

---

## 5. Rollout order (lowest risk → highest)
1. **Observability first** — wire funnel events (B02) + error monitoring (B05). Cheap, additive, unlocks every later metric.
2. **Fix reported truth** — KPI status filter (B01) + KPI unit tests.
3. **Audit log** (B03) — table + action inserts + read-only `/admin/audit`; replaces console.log.
4. **Analytics page** (`/admin/analytics`) — revenue trend + funnel once events accrue.
5. **Product CRUD** (B07) — create/edit with validation + audit coverage.
6. **Promotions admin** (B14).
7. **Admin roles** (B11) — switch attribution to real operators.
8. **Perf** (B20) — views/RPC when volume demands.

Each step ships independently behind the existing admin gate; none requires routing, brand, or checkout changes.
