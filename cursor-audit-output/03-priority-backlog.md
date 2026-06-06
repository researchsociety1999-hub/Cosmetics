# 03 — Priority Backlog

Severity: Critical / High / Medium / Low · Effort: S (<2h) / M (half-day–1d) / L (multi-day).
"Safe in Cursor?" = whether the change is low-risk enough to auto-apply vs. needs human review (financial logic, schema, payments, auth).

## Evidence validation (2026-06-06)

Each item's underlying problem re-verified. Tag: **[C]** Confirmed in code · **[P]** Partially evidenced · **[N]** Not confirmed. See `10-file-evidence-index.md`.

| ID | Tag | Verifying evidence |
|---|---|---|
| B01 | C | `admin/lib/overviewData.ts:88-99` (no status filter) |
| B02 | C | grep: `trackEvent` no external callers; `AddToCartForm.tsx:40-54` fires only a11y event |
| B03 | C | `admin/orders/[id]/actions.ts:3-8,97` |
| B04 | C | `.github/workflows/playwright.yml:37`; `package.json` test scripts |
| B05 | C | no monitoring import in `next-app` source |
| B06 | C | `lib/adminLoginAttempts.ts:10`, `api/chat/route.ts:44` |
| B07 | C | `admin/products/page.tsx:163` |
| B08 | C | `.github/workflows/playwright.yml` (no lint/tsc step) |
| B09 | C | two migration dirs exist |
| B10 | C | `.github/` had workflows only |
| B11 | C | `lib/adminSession.ts`; `admin_users` unused (grep 0) |
| B12 | C | `package.json:11-12` (pre-fix) — fixed |
| B13 | C | grep `utm` → 0 hits; `analytics_events` unused (grep 0) |
| B14 | C | `lib/promo.ts` read path only; no admin CRUD page |
| B15 | C | per-page `robots` only (pre-fix) — fixed at layout |
| B16 | C | `queries.ts:1104` |
| B17 | C | root `package.json` had no `engines` (pre-fix) — fixed |
| B18 | C | no runbook existed (pre-fix) — fixed |
| B19 | C | `lib/checkout.ts:36` |
| B20 | P | `queries.ts:614-644`, `overviewData.ts:91` confirmed; perf *magnitude* unmeasured |

| ID | Title | Area | Severity | User/Business impact | Evidence | Recommended fix | Effort | Safe in Cursor? |
|---|---|---|---|---|---|---|---|---|
| B01 | Admin KPIs count pending+failed orders | Analytics/Admin | Critical | Operators see inflated revenue/order counts → bad decisions | `admin/lib/overviewData.ts:88-99` | Add `.in("status",["paid","processing","fulfilled","shipped","delivered"])` to count + sum queries; define canonical "revenue" status set | S | Needs review |
| B02 | Conversion funnel events missing | Analytics | High | No add-to-cart/checkout-start visibility → cannot optimize conversion or spend | `components/GoogleAnalytics.tsx:62` (unused), `AddToCartForm.tsx`, `CheckoutClient.tsx` | Call `trackEvent("view_item"/"add_to_cart"/"begin_checkout")` (consent-gated, additive) | M | Yes |
| B03 | Durable order audit log | Admin Ops | High | No accountability/forensics for order mutations | `admin/orders/[id]/actions.ts:3-8,97` | Implement `order_audit_log` (or use existing `order_status_history`) inserts in each action | M | Needs review (schema) |
| B04 | Vitest unit/integration not in CI | QA | High | Cart/checkout/webhook regressions can merge unblocked | `.github/workflows/playwright.yml:37`, `package.json:10-12` | Add CI job: `npm run test:unit && npm run test:integration` | S | Yes |
| B05 | No error monitoring | Observability | High | Production errors invisible beyond raw Vercel logs | `next-app/package.json` (no monitoring dep) | Add Sentry (or Vercel error tracking) for client+server; wire into `error.tsx`/`global-error.tsx` | M | Needs review (new dep + DSN) |
| B06 | In-memory rate limits | Reliability/Security | High | Limits reset per instance → bypassable; admin lockout inconsistent | `api/chat/route.ts:44`, `lib/adminLoginAttempts.ts` | Move to Supabase table or Upstash/Vercel KV-backed limiter | M | Needs review |
| B07 | No product CRUD in admin | Admin Ops | High | Catalog edited by hand in Supabase → operational risk, no guardrails | `admin/products/page.tsx:163` | Add admin product create/edit (price, status, stock, copy) via service-role server actions with validation | L | Needs review |
| B08 | Lint + typecheck not gated in CI | QA | Medium | Type/lint regressions reach main | `.github/workflows/playwright.yml` | Add CI step: `npm run lint` + `tsc --noEmit` | S | Yes |
| B09 | Migrations split across two dirs | Release Ops | Medium | Ordering/drift risk, unclear source of truth | `/supabase/migrations`, `/next-app/supabase` | Consolidate to one ordered dir + `migrations/README.md` with apply order | M | Needs review |
| B10 | No PR/issue templates, no CHANGELOG | Release Ops | Medium | Inconsistent reviews, no release notes | `.github/**` | Add `PULL_REQUEST_TEMPLATE.md`, `ISSUE_TEMPLATE/*`, `CHANGELOG.md` | S | Yes |
| B11 | Single shared admin password | Security | Medium | No per-user accountability; `admin_users` table unused | `lib/adminSession.ts`, `actions/adminAuth.ts:39` | Phase in Supabase-auth-backed admin roles using existing `admin_users` | L | Needs review |
| B12 | Duplicate `test:integration` key | Hygiene | Medium | Confusing/overwritten npm script | `package.json:11-12` | Remove duplicate line | S | Yes ✅ done |
| B13 | UTM attribution not captured | Analytics | Medium | Cannot attribute orders to campaigns | no `utm_` handling | Capture UTM params → cookie → persist on order/`analytics_events` | M | Needs review (writes order data) |
| B14 | Promo/discount admin CRUD | Admin Ops | Medium | Promos edited in DB by hand | `lib/promo.ts` | Admin page to create/expire promo codes/campaigns | M | Needs review |
| B15 | Admin robots metadata not global | SEO/Security | Low | Risk an admin route gets indexed if a page omits per-page robots | per-page `robots:{index:false}` only | Add `robots` to admin `layout.tsx` metadata / login page | S | Yes |
| B16 | Journal is mock data | Content | Low | Editorial cannot be managed | `queries.ts:1104` | Back journal with Supabase table + admin editor (post-launch) | L | Needs review |
| B17 | `engines`/Node pin missing at root | Hygiene | Low | Local/CI Node drift | root `package.json` | Add `"engines":{"node":">=20"}` | S | Yes ✅ done |
| B18 | No deploy/rollback/incident runbook | Release Ops | Medium | Slow incident response, risky rollbacks | no runbook | Add `docs/RUNBOOK.md` (deploy, rollback, webhook re-drive, secret rotation) | S | Yes ✅ done |
| B19 | Tax hard-coded to 0 | Commerce | Medium | No sales tax collected → compliance risk if required | `lib/checkout.ts:36` | Confirm tax strategy (Stripe Tax?) before scaling jurisdictions | M | Needs review (legal/payments) |
| B20 | In-memory stock filter + client revenue sum | Performance | Low | Degrades at large catalog/order volume | `queries.ts:614-644`, `overviewData.ts:91` | Move to SQL RPC/materialized view when volume grows | M | Needs review |
