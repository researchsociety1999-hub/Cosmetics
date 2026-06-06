# 00 — Executive Summary

**Repo:** Mystique / Cosmetics · **App source of truth:** `/next-app` · **Stack:** Next.js 16 App Router, TypeScript, Tailwind v4, Supabase, Stripe, Resend, Vercel, Playwright + Vitest.
**Audit date:** 2026-06-06 · **Method:** static read of repo only. Runtime/production state not inspected; claims unverifiable in code are marked *not confirmed in code*.

---

## One-page assessment

Mystique is a **genuinely mature storefront**, not a prototype. The customer-facing commerce path (catalog → PDP → cart → Stripe checkout → webhook finalization → confirmation/guest tracking → transactional email) is fully built, defensively coded, and covered by real tests. Security headers, CSP, rate limiting, RLS migrations, idempotent webhooks, and graceful error/loading/not-found boundaries are all present.

The gap is **the business operating system around the store**, not the store itself:

- **Admin is read-mostly.** Products cannot be created/edited from the admin UI (catalog edits happen directly in Supabase — see `next-app/src/app/admin/products/page.tsx:163`). Order management exists (status transitions, tracking, ETA) but operational mutations are logged only to `console.log`, not to a durable audit table (`next-app/src/app/admin/orders/[id]/actions.ts:3-8`).
- **Analytics is page-view deep, not funnel deep.** A `trackEvent` helper exists (`next-app/src/app/components/GoogleAnalytics.tsx:62`) but is **never called anywhere**. Only `page_view` and `purchase` fire. No `view_item`, `add_to_cart`, or `begin_checkout` — the conversion funnel is invisible.
- **Revenue KPIs are inflated.** The overview sums/counts **all** orders regardless of status (pending/failed included) — `next-app/src/app/admin/lib/overviewData.ts:88-99`.
- **CI runs E2E only.** Vitest unit + integration tests exist but are **not** in GitHub Actions (`.github/workflows/playwright.yml` runs `npm run test` = Playwright only).
- **Reliability footgun at scale:** rate limiting and the chat limiter are **in-memory** (`next-app/src/app/api/chat/route.ts:44`), which silently degrade across serverless instances/regions.

**The architecture is sound. The work remaining is operational maturity, observability, and CI discipline — all achievable incrementally without touching the brand, routing, or payment core.**

---

## Production Readiness Score: **74 / 100**

| Dimension | Score | Reasoning |
|---|---|---|
| Customer-facing commerce | 18/20 | Full path built, tested, defensively coded. Minor: in-memory rate limits. |
| Security & data boundaries | 16/20 | CSP, RLS, signed admin cookie, service-role isolation. Single shared admin password (no roles); no secret rotation story. |
| Admin / business ops | 11/20 | Order ops + diagnostics real; product CRUD missing; audit log is console-only. |
| Analytics & observability | 7/20 | Vercel Analytics on; funnel events unwired; no error monitoring; `analytics_events` table unused. |
| QA & CI | 12/15 | Strong test set; unit/integration excluded from CI; no coverage gate. |
| Release / ops hygiene | 10/15 | Good docs + env example; split migration dirs; no PR/issue templates; no CHANGELOG; stale branches. |
| **Total** | **74/100** | Solid launch candidate for storefront; **not yet** an operable business platform. |

Not production-ready *as a business operating system*. **Is** close to production-ready *as a storefront* once the top critical items below are closed.

---

## Top 10 Risks

| # | Risk | Evidence | Severity |
|---|---|---|---|
| 1 | Admin revenue/order KPIs count pending+failed orders → wrong financials shown to operators | `admin/lib/overviewData.ts:88-99` (no `.eq("status",…)`) | Critical |
| 2 | No conversion funnel telemetry; `trackEvent` defined but unused → cannot measure add-to-cart/checkout-start/drop-off | `components/GoogleAnalytics.tsx:62`, no callers (grep) | High |
| 3 | Order operations have no durable audit trail (console.log only) → no accountability/forensics | `admin/orders/[id]/actions.ts:3-8,97` | High |
| 4 | In-memory rate limiting + chat limiter → bypassable / inconsistent across serverless instances | `api/chat/route.ts:44`, `lib/adminLoginAttempts.ts` (in-memory per E2E notes) | High |
| 5 | Vitest unit/integration tests not gated in CI → regressions in cart/checkout/webhook can merge | `.github/workflows/playwright.yml:37-38`, root `package.json:9-12` | High |
| 6 | No product CRUD in admin; catalog managed by hand in Supabase → operational fragility & training risk | `admin/products/page.tsx:163` | High |
| 7 | No error monitoring (Sentry/equivalent); errors only reach Vercel function logs | no monitoring dep in `next-app/package.json` | High |
| 8 | Single shared admin password (no per-user roles); `admin_users` table exists but unused | `lib/adminSession.ts`, `actions/adminAuth.ts:39` | Medium |
| 9 | Migrations split across `/supabase/migrations` and `/next-app/supabase/migrations` → drift/ordering risk | both dirs exist with overlapping dates | Medium |
| 10 | Duplicate `test:integration` script key + no PR/issue templates/CHANGELOG → release hygiene gaps | root `package.json:11-12`; `.github/` has workflows only | Medium |

---

## Top 10 Fastest Wins

| # | Win | Effort | Safe in Cursor? |
|---|---|---|---|
| 1 | Remove duplicate `test:integration` key in root `package.json` | S | Yes ✅ (done) |
| 2 | Add CI step to run `npm run test:unit` + `test:integration` (Vitest) | S | Yes |
| 3 | Add `.github/PULL_REQUEST_TEMPLATE.md` + issue templates | S | Yes ✅ (done) |
| 4 | Add `CHANGELOG.md` seeded from git log | S | Yes ✅ (done) |
| 5 | Filter admin KPIs to paid/processing/fulfilled statuses (fix inflated revenue) | S | Needs review (financial logic) |
| 6 | Wire `trackEvent("add_to_cart"|"view_item"|"begin_checkout")` into existing components | M | Yes (additive, consent-gated) |
| 7 | Add a `/docs/RUNBOOK.md` (deploy, rollback, webhook re-drive, incident) | S | Yes ✅ (done) |
| 8 | Add `robots:{index:false}` metadata to admin layout/login (currently per-page only) | S | Yes |
| 9 | Consolidate Supabase migrations into one ordered directory + README | M | Needs review (migration discipline) |
| 10 | Add `engines` (Node 20) to root `package.json` to match CI | S | Yes ✅ (done) |

See `05-safe-fixes-now.md` for exactly what was applied in this pass.
