# 09 — Cursor Execution Plan (Phased)

Practical, incremental, production-safe. Each phase is independently shippable and maps to backlog IDs in `03-priority-backlog.md`. "Cursor-safe" tasks can be auto-applied; "Review" tasks need a human on the PR.

---

## Phase 1 — Safest production fixes (this pass + immediate next)
**Outcome:** hygiene + truth + observability foundation. No money/schema/auth risk.

| Task | Backlog | Mode |
|---|---|---|
| Remove duplicate npm script; pin Node engine | B12, B17 | Cursor-safe ✅ done |
| Add CI: lint + typecheck + vitest unit/integration | B04, B08 | Cursor-safe ✅ done (`ci.yml`) |
| PR/issue templates, CHANGELOG, RUNBOOK | B10, B18 | Cursor-safe ✅ done |
| Enforce admin `noindex` at layout | B15 | Cursor-safe ✅ done |
| **Wire funnel events** `view_item`/`add_to_cart`/`begin_checkout` via existing `trackEvent` (consent-gated, additive) | B02 | Cursor-safe (recommended next) |
| Fix KPI status filter | B01 | **Review** (financial) |

**Verify:** `npm run lint && npm run test:unit && npm run test:integration && npm run build`.

---

## Phase 2 — Admin operations
**Outcome:** admin becomes operable, with accountability.

| Task | Backlog | Mode |
|---|---|---|
| Order audit log: table + action inserts + read-only `/admin/audit` | B03 | Review (schema/RLS) |
| Product CRUD (create/edit: price, status, stock, copy) with validation + audit | B07 | Review |
| Promotions admin (create/expire codes & campaigns) | B14 | Review |
| Add admin order-action unit tests (transition guard + unauthorized) | `07` #1 | Cursor-safe |

---

## Phase 3 — Analytics maturity
**Outcome:** funnel/conversion/attribution answerable.

| Task | Backlog | Mode |
|---|---|---|
| Error monitoring (Sentry/equivalent) wired into error boundaries | B05 | Review (dep + secret + CSP) |
| UTM capture → cookie → persist on order/`analytics_events` | B13 | Review (privacy/schema) |
| `/admin/analytics` page: revenue trend, AOV, funnel, top SKUs | `08` §1 | Review (reads `analytics_events`) |
| Product-performance view/RPC | B20 | Review |

---

## Phase 4 — QA hardening
**Outcome:** regressions caught before merge.

| Task | Backlog | Mode |
|---|---|---|
| Chat route unit tests (injection/sanitisation/rate-limit/retry) | `07` #2 | Cursor-safe |
| KPI computation unit tests (guards B01) | `07` #3 | Cursor-safe |
| Magic-link happy-path E2E | `07` #4 | Cursor-safe |
| Guest-token access-control E2E | `07` #5 | Cursor-safe |
| Webhook → real Supabase E2E (staging) | `07` | Review (env) |
| Add coverage thresholds to `vitest.config.ts` | D | Cursor-safe |

---

## Phase 5 — Release hygiene & reliability
**Outcome:** repeatable, safe releases.

| Task | Backlog | Mode |
|---|---|---|
| Consolidate migrations to one ordered dir + README | B09 | Review |
| Durable rate limiting (Supabase/KV) | B06 | Review (security) |
| Admin roles via `admin_users` + Supabase auth | B11 | Review (auth model) |
| Delete stale remote branches; adopt tag/version flow | F | Review (destructive) |
| Backup/restore runbook; secret rotation runbook | F | Cursor-safe (docs) |
| Decide sales-tax strategy | B19 | Review (legal) |

---

### Suggested first PR after this audit
> "Phase 1 analytics + KPI truth": wire `view_item`/`add_to_cart`/`begin_checkout` (B02, Cursor-safe) **and** propose the KPI status filter (B01) as a clearly-flagged review change, with new KPI unit tests. Small, high-signal, unlocks Phase 3.
