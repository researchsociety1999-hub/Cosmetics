# 02 — Gap Analysis (Done / Partial / Missing)

Status legend: ✅ Done · 🟡 Partial · ❌ Missing · evidence in file paths.

---

## Self-validation (2026-06-06)

Each major claim below re-verified by static read + grep. Tag: **[C]** Confirmed in code · **[P]** Partially evidenced · **[N]** Not confirmed (runtime/dashboard). Full mapping in `10-file-evidence-index.md`.

| Claim | Tag | Evidence |
|---|---|---|
| Full commerce path built & defensively coded | C | `create-checkout-session/route.ts`, `stripe/webhook/route.ts` |
| Journal is mock data | C | `queries.ts:1104-1106` |
| wishlist/loyalty/profile/addresses are empty stubs | C | `queries.ts:1108-1178` |
| Rate limiting is in-memory | C | `lib/adminLoginAttempts.ts:10`, `api/chat/route.ts:44` |
| Tax hard-coded to 0 | C | `lib/checkout.ts:36` |
| Admin product list is read-only | C | `admin/products/page.tsx:163` |
| Admin KPIs count all order statuses | C | `admin/lib/overviewData.ts:88-99` |
| Order audit is console-only | C | `admin/orders/[id]/actions.ts:3-8,97` |
| `trackEvent` defined but no funnel events fire | C | grep: only callers are GA `page_view` + `PurchaseEvent`; `AddToCartForm.tsx:40-54` fires only an a11y CustomEvent |
| UTM attribution not captured | C | grep `utm` in `next-app/src` → 0 hits |
| `analytics_events`/`order_status_history`/`admin_users` unused by app | C | grep in `next-app/src` → 0 hits (only a comment in `actions.ts:6`) |
| No first-party error monitoring | C | no Sentry/datadog import in `next-app` source |
| CI was Playwright-only | C | `.github/workflows/playwright.yml:37` (now complemented by added `ci.yml`) |
| Migrations split across two dirs | C | `/supabase/migrations` + `/next-app/supabase` |
| In-memory stock filter / client-side revenue sum | C | `queries.ts:614-644`, `overviewData.ts:91` |
| Duplicate admin product query (list + stats) | C | `admin/products/page.tsx:111-114` |
| No explicit catalog caching/revalidate strategy | P | no `unstable_cache`/cache tags in `queries.ts`; not every route segment exhaustively read |
| Branch staleness | P | `git branch -a` shows stale remotes; ages inferred |
| Layout-shift / Web Vitals values | N | requires runtime/Speed Insights data |
| Supabase backup retention | N | plan-dependent; not in repo |

---

## A. Customer-facing status

### Complete & working ✅
| Area | Evidence |
|---|---|
| Catalog + PDP + search | `lib/queries.ts:getProducts/getProductBySlug/searchProducts`, `shop/page.tsx`, `products/[slug]/page.tsx` |
| Cart (guest cookie + authed Supabase) | `actions/cart.ts:93-311`, `lib/cart.ts` |
| Checkout → Stripe → pending order | `api/create-checkout-session/route.ts` |
| Webhook finalize (paid/async/fail) + idempotent | `api/stripe/webhook/route.ts`, idempotency in `finalizePaidOrderFromStripe` (test `tests/integration/stripe-webhook.test.ts:233-269`) |
| Guest order tracking | `order/[guestToken]/page.tsx`, migration `20260430_guest_order_token.sql` |
| Magic-link auth + order history | `actions/auth.ts`, `auth/callback`, `account/orders/*` |
| Transactional email | `lib/email.ts`, `actions/contact.ts` |
| Security headers + CSP | `next.config.js:31-139` |
| Error/loading/not-found/global-error | `error.tsx`, `global-error.tsx`, `not-found.tsx`, 6× `loading.tsx` |
| SEO basics (metadata, OG, sitemap, robots, structured data) | `layout.tsx:29-67`, `sitemap.ts`, `robots.ts`, `lib/structuredData.ts` |

### Partial 🟡
| Area | Gap | Evidence |
|---|---|---|
| Journal/editorial | Hard-coded mock content, not DB-backed | `queries.ts:1104-1106` `getJournalEntries` returns `mockJournalEntries` |
| Wishlist / loyalty / saved addresses / profile | Stubs return empty | `queries.ts:1108-1178` |
| Press mentions | Placeholder links rewritten to `#` | `queries.ts:1029-1041` |
| Product photography | Off by default behind env flag | `.env.example:37-39` `NEXT_PUBLIC_SHOW_CATALOG_PRODUCT_PHOTOS` |

### Fragile / risky ⚠️
| Area | Risk | Evidence |
|---|---|---|
| Rate limiting | In-memory; resets per instance, inconsistent across serverless | `api/chat/route.ts:44`, `lib/adminLoginAttempts.ts` (per E2E notes `tests/e2e/admin.spec.ts:24-29`) |
| Tax | Hard-coded `taxAmount = 0` | `lib/checkout.ts:36` |
| Stock filtering | Done in-memory after fetch (fine <few hundred SKUs, degrades at scale) | `queries.ts:614-644` |

---

## B. Admin / business operating system

| Capability | Status | Evidence |
|---|---|---|
| Admin auth | 🟡 single shared password + HMAC cookie; **no roles/users** | `lib/adminSession.ts`, `actions/adminAuth.ts:39`; `admin_users` table unused |
| Product catalog management | ❌ **read-only**; edits done in Supabase directly | `admin/products/page.tsx:163` ("add one in Supabase") |
| Inventory visibility | ✅ counts/low-stock/out-of-stock badges | `admin/lib/productsQuery.ts`, `admin/page.tsx:54-93` |
| Order management | ✅ list, detail, status transitions (guarded), tracking, ETA | `admin/orders/[id]/actions.ts`, `admin/lib/orderTransitions.ts` |
| Fulfillment workflow | ✅ queue + filters | `admin/fulfillment/page.tsx`, `admin/lib/fulfillmentQuery.ts` |
| Customer support workflow | 🟡 customers list (derived) + chatbot diagnostics; no ticket/case model | `admin/customers/page.tsx`, `admin/chatbot/page.tsx` |
| Content / journal management | ❌ no admin; journal is mock data | `queries.ts:1104` |
| Discount / promo management | 🟡 promo applied at checkout; **no admin CRUD** | `lib/promo.ts`, `actions/promo.ts`; promo edited in DB |
| Analytics dashboard (rev/orders/conv/AOV/product perf) | 🟡 rev/orders/AOV exist but **count all statuses**; no conversion, no product performance | `admin/lib/overviewData.ts:88-113` |
| Operational audit / event logs | ❌ `console.log` only; `order_status_history`/`analytics_events` unused | `admin/orders/[id]/actions.ts:3-8,97` |
| Contact triage / email workflows | 🟡 contact emails the studio; no inbox/triage state | `actions/contact.ts` |

---

## C. Analytics maturity

| Check | Status | Evidence |
|---|---|---|
| Vercel Analytics | ✅ | `layout.tsx:148` |
| Web Vitals collection | ✅ Speed Insights | `layout.tsx:146` |
| GA4 wiring (optional) | ✅ consent-gated | `layout.tsx:136-143`, `components/GoogleAnalytics.tsx` |
| Event tracking coverage | ❌ `trackEvent` defined but **0 callers** | `components/GoogleAnalytics.tsx:62` (grep: no usage) |
| `view_item` / product view | ❌ | none |
| `add_to_cart` | ❌ | `components/AddToCartForm.tsx` fires no event |
| `begin_checkout` / checkout-start | ❌ | `checkout/CheckoutClient.tsx` fires no event |
| `purchase` | ✅ once per order | `components/PurchaseEvent.tsx:63` |
| Checkout funnel visibility | ❌ no intermediate events → no funnel | derived from above |
| UTM attribution capture | ❌ not captured/persisted | no `utm_` handling found |
| Error monitoring | ❌ no Sentry/equivalent dep | `next-app/package.json` |
| Server-side operational metrics | 🟡 structured `console.log`/`console.error` → Vercel logs only | `webhook/route.ts:46`, `orders/[id]/actions.ts:97` |
| Can answer business questions? | 🟡 revenue/orders yes (if status fixed); conversion/funnel/attribution **no** | overview + missing events |

---

## D. QA depth

| Check | Status | Evidence |
|---|---|---|
| Unit tests | ✅ cart, checkout, promo | `tests/unit/*.test.ts` |
| Integration tests | ✅ stripe webhook | `tests/integration/stripe-webhook.test.ts` |
| E2E tests | ✅ ~18 specs (storefront, cart/checkout, auth, admin gate, a11y, search, image fallback, content) | `tests/*.spec.ts`, `next-app/e2e/*.spec.ts` |
| Auth coverage | 🟡 error-sanitisation + admin gate; no full magic-link happy path | `tests/auth-flow.spec.ts`, `tests/e2e/admin.spec.ts` |
| Cart/checkout coverage | ✅ unit + e2e | `tests/unit/checkout.test.ts`, `tests/cart-and-checkout.spec.ts` |
| Admin flows coverage | 🟡 gate + login only; no authed order-mutation e2e | `tests/e2e/admin.spec.ts` |
| Contact flow coverage | 🟡 partial via content-and-support | `tests/content-and-support.spec.ts` |
| Test data strategy | ✅ `ALLOW_MOCK_CATALOG`/`E2E_MOCK_CATALOG` embedded catalog | `queries.ts:54-72`, `playwright.config.ts:86-101` |
| Mocking strategy | ✅ `vi.mock` + `vi.hoisted` for Stripe/orders | `tests/integration/stripe-webhook.test.ts:39-60` |
| CI gating | 🟡 **Playwright only**; Vitest not run in CI | `.github/workflows/playwright.yml:37-38` |
| Broken/stale tests | none found in static read | — |
| Missing critical regression coverage | webhook->DB E2E, admin authed mutations, funnel events | derived |

---

## E. Performance / reliability

| Check | Status | Evidence |
|---|---|---|
| Image optimization / next/image | ✅ remotePatterns, qualities `[75,88,90]` | `next.config.js:96-126` |
| Bundle size controls | ✅ `optimizePackageImports:["framer-motion"]`, bundle-analyzer wired | `next.config.js:88-89,142-146` |
| Unnecessary client components | 🟡 deferred via `DeferredClientBits` (good); not exhaustively audited | `components/DeferredClientBits.tsx`, `layout.tsx:127` |
| Data fetching / caching | 🟡 admin pages `force-dynamic` (correct); catalog has no explicit revalidate/cache tags | `admin/page.tsx:15`, `queries.ts` (no `unstable_cache`/tags) |
| Loading/suspense | ✅ route-level loading + Suspense for GA tracker | multiple `loading.tsx`, `layout.tsx:139` |
| Error boundaries | ✅ error + global-error | `error.tsx`, `global-error.tsx` |
| Slow routes / duplicate queries | 🟡 products page runs 2 catalog queries (list + stats) | `admin/products/page.tsx:111-114` |
| Layout shift | 🟡 font `display:swap` + preconnect (good); not measured here | `layout.tsx:14-27,107-112` |
| Third-party script loading | ✅ GA via `@next/third-parties`; production-gated | `layout.tsx:136` |
| Edge/runtime compat | ✅ webhook + chat pinned `runtime="nodejs"` | `webhook/route.ts:15`, `chat/route.ts:17` |
| Supabase query efficiency | 🟡 in-memory stock filter + client-side revenue sum | `queries.ts:614-644`, `overviewData.ts:91` |
| Stripe/webhook robustness | ✅ signature verify, retry semantics, idempotent | `webhook/route.ts:172-191` |

---

## F. Release hygiene / operations

| Check | Status | Evidence |
|---|---|---|
| Branch hygiene | 🟡 2 local + several stale remotes (`design/homepage-redesign`, `perf/core-web-vitals-fixes`, `chore/repo-cleanup`, etc.) | `git branch -a` |
| Release/version process | ❌ no tags/version bump flow; `next-app` pinned `0.1.0` | `next-app/package.json:3` |
| Changelog/release notes | ❌ none | repo root |
| Issue / PR templates | ❌ none (`.github/` has workflows only) | `.github/**` |
| CI checks | 🟡 E2E only; no lint/typecheck/unit gate | `.github/workflows/playwright.yml` |
| Environment documentation | ✅ thorough | `next-app/.env.example`, `README.md:144-159`, `next-app/DEPLOYMENT.md` |
| Migration discipline | 🟡 split across two dirs; no single ordered source | `/supabase/migrations` + `/next-app/supabase` |
| Rollback readiness | ❌ not documented | no runbook |
| Backup / restore readiness | ❌ not documented | — |
| Secret handling / rotation | 🟡 correct separation (service key server-only, sb_secret detection); **no rotation runbook** | `supabaseClient.ts:25-26`, `.env.example:30-31` |
