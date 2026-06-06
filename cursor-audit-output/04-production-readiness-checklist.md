# 04 — Production Readiness Checklist

Checkbox state reflects the **current repo** (static read). `[x]` = evidence found · `[ ]` = missing/unconfirmed · `[~]` = partial.

---

## Security
- [x] Security headers (X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy) — `next.config.js:31-47`
- [x] Content-Security-Policy with scoped allowlists — `next.config.js:49-81`
- [x] Service-role key isolated server-side; `sb_secret_` misuse detection — `lib/supabaseClient.ts:25-26`
- [x] Supabase RLS policies + missing-policy backfill — `supabase/migrations/20260427_*.sql`
- [x] Admin session signed (HMAC) + httpOnly + sameSite=strict + secure in prod — `lib/adminSession.ts`, `actions/adminAuth.ts:50-56`
- [x] Server actions re-verify admin session (not just page gate) — `admin/orders/[id]/actions.ts:29-34`
- [x] Webhook signature verification — `webhook/route.ts:135-139`
- [x] Input sanitisation for search/PostgREST OR injection — `queries.ts:406-414`
- [x] Chat prompt-injection guard — `api/chat/route.ts:46-61`
- [~] Rate limiting present but **in-memory** (not durable) — `api/chat/route.ts:44`
- [ ] Per-user admin roles (single shared password today) — `lib/adminSession.ts`
- [ ] Secret rotation runbook — *not confirmed in code*
- [~] Admin `noindex` per-page only (not enforced at layout) — `admin/page.tsx:12`

## Admin Ops
- [x] Admin auth gate on all admin pages — `admin/lib/session.ts`
- [x] Order list/detail + guarded status transitions — `admin/orders/[id]/actions.ts`, `orderTransitions.ts`
- [x] Tracking # + ETA editing — `admin/orders/[id]/actions.ts:58-177`
- [x] Inventory visibility (low/out-of-stock) — `admin/lib/productsQuery.ts`
- [x] Fulfillment queue — `admin/fulfillment/page.tsx`
- [x] Chatbot diagnostics + chat logs (Supabase-backed) — `admin/lib/chatLogStore.ts`
- [ ] Product create/edit/delete in admin — `admin/products/page.tsx:163` (read-only)
- [ ] Promo/discount admin CRUD — managed in DB
- [ ] Durable operational audit log — `admin/orders/[id]/actions.ts:3-8` (console only)
- [ ] Content/journal management — `queries.ts:1104` (mock)
- [~] Customer support workflow (list + chatbot; no case/ticket model)

## Analytics
- [x] Vercel Web Analytics — `layout.tsx:148`
- [x] Web Vitals (Speed Insights) — `layout.tsx:146`
- [x] GA4 optional + consent gate — `layout.tsx:136-143`, `components/GoogleAnalytics.tsx:33`
- [x] `purchase` event — `components/PurchaseEvent.tsx:63`
- [ ] `view_item` event
- [ ] `add_to_cart` event
- [ ] `begin_checkout` event
- [ ] Funnel/drop-off measurable
- [ ] UTM attribution captured/persisted
- [ ] Error monitoring (Sentry/equivalent)
- [ ] `analytics_events` table populated by app — table exists, unused

## QA
- [x] Unit tests (cart/checkout/promo) — `tests/unit/*`
- [x] Integration test (webhook) — `tests/integration/stripe-webhook.test.ts`
- [x] E2E suite (~18 specs) — `tests/*.spec.ts`, `next-app/e2e/*`
- [x] Deterministic test catalog — `playwright.config.ts:86-101`
- [x] Mocking strategy — `vi.mock`/`vi.hoisted`
- [ ] Vitest run in CI — `.github/workflows/playwright.yml:37` (E2E only)
- [ ] Lint + typecheck gated in CI
- [ ] Coverage thresholds
- [~] Admin authed-mutation E2E (gate-only today)
- [~] Magic-link happy-path E2E

## Performance
- [x] next/image + remotePatterns + qualities — `next.config.js:96-126`
- [x] `optimizePackageImports` + bundle analyzer — `next.config.js:88-89`
- [x] Route-level loading states + Suspense — `*/loading.tsx`, `layout.tsx:139`
- [x] Error + global-error boundaries — `error.tsx`, `global-error.tsx`
- [x] Supabase preconnect/dns-prefetch — `layout.tsx:107-112`
- [x] Node runtime pinned for webhook/chat — `webhook/route.ts:15`
- [x] Deferred client bits — `components/DeferredClientBits.tsx`
- [~] Explicit caching/revalidate strategy for catalog
- [~] Duplicate admin product query (list + stats) — `admin/products/page.tsx:111`

## Release Ops
- [x] `.env.example` thorough — `next-app/.env.example`
- [x] README + DEPLOYMENT.md + SUPABASE_SETUP.md
- [x] CI on push/PR to main (Playwright) — `.github/workflows/playwright.yml`
- [ ] PR template
- [ ] Issue templates
- [ ] CHANGELOG / release notes
- [ ] Single ordered migrations source
- [ ] Rollback runbook
- [ ] Backup/restore runbook
- [ ] Branch cleanup (stale remotes)
- [~] Node version pinned (added at root in safe pass; verify across workspaces)

---

### Launch gate recommendation
**Go for storefront** once `Security` and `Performance` blanks are accepted/triaged and `B01` (KPI status filter) is fixed.
**No-go for "business operating system"** until Admin Ops (`B03`, `B07`) and Analytics (`B02`, `B05`) blanks are addressed.
