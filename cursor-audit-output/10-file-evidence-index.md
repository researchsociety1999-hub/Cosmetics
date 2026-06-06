# 10 — File Evidence Index

Master index of the files that ground this audit. Re-verified by static read + targeted grep on 2026-06-06.

**Verification legend:** ✅ Confirmed in code · 🟡 Partially evidenced · ⬜ Not confirmed (requires runtime/dashboard).

---

## Customer-facing commerce

| File (path:line) | Verify | Why it matters | Supports backlog |
|---|---|---|---|
| `next-app/src/app/api/create-checkout-session/route.ts` | ✅ | Rate-limited; validates shipping; creates pending order before Stripe redirect | B06, B19 |
| `next-app/src/app/api/stripe/webhook/route.ts:135-191` | ✅ | Signature verify; 400=no-retry / 5xx=retry; finalize paid/async/fail | B05 |
| `next-app/src/app/lib/checkout.ts:36` | ✅ | `taxAmount = 0` hard-coded | B19 |
| `next-app/src/app/lib/checkout.ts:20-26` | ✅ | Free-shipping threshold / flat shipping logic | (tests `07`) |
| `next-app/src/app/actions/cart.ts:93-311` | ✅ | Guest-cookie + authed Supabase cart paths | B02 (add_to_cart), `07` |
| `next-app/src/app/lib/queries.ts:1104-1106` | ✅ | `getJournalEntries` returns mock data | B16 |
| `next-app/src/app/lib/queries.ts:1108-1178` | ✅ | wishlist/loyalty/profile/addresses return empty stubs | (content) |
| `next-app/src/app/lib/queries.ts:614-644` | ✅ | In-memory stock filtering after fetch | B20 |
| `next-app/src/app/components/AddToCartForm.tsx:40-54` | ✅ | Fires only a11y `CustomEvent("mystique:cart-feedback")` — **no analytics event** | B02 |

## Analytics / observability

| File (path:line) | Verify | Why it matters | Supports |
|---|---|---|---|
| `next-app/src/app/components/GoogleAnalytics.tsx:62-68` | ✅ | `trackEvent` helper defined; consent-gated | B02 |
| `next-app/src/app/components/GoogleAnalytics.tsx` (grep) | ✅ | Only callers of `gtag` are this file (`page_view`) + `PurchaseEvent` (`purchase`); **no funnel events** | B02 |
| `next-app/src/app/components/PurchaseEvent.tsx:63` | ✅ | Only `purchase` fires, once per order | B02 |
| `next-app/src/app/layout.tsx:146-148` | ✅ | Vercel Speed Insights + Web Analytics mounted | — |
| `next-app/src/app/layout.tsx:136-143` | ✅ | GA4 production-gated + consent Suspense | — |
| grep `utm`/`UTM` in `next-app/src` | ✅ (0 hits) | UTM attribution **not captured** anywhere | B13 |
| grep `analytics_events` in `next-app/src` | ✅ (0 hits) | Table exists in schema, **unused by app** | B13, `08` |
| grep `Sentry`/`datadog`/`bugsnag` in `next-app` source | ✅ (0 app imports) | No first-party error monitoring wired | B05 |

## Admin / business ops

| File (path:line) | Verify | Why it matters | Supports |
|---|---|---|---|
| `next-app/src/app/admin/lib/overviewData.ts:88-99` | ✅ | Revenue/order KPIs query **all** orders — no status filter | B01 |
| `next-app/src/app/admin/lib/overviewData.ts:43-47` | ✅ | "Today" boundary uses local server time | B01 |
| `next-app/src/app/admin/products/page.tsx:163` | ✅ | "add one in Supabase" — admin product list is **read-only** | B07 |
| `next-app/src/app/admin/orders/[id]/actions.ts:3-8` | ✅ | AUDIT-HOOK comment: audit is `console.log` until table exists | B03 |
| `next-app/src/app/admin/orders/[id]/actions.ts:22,97` | ✅ | `ADMIN_ACTOR="admin"` (no per-user id); console-only trail | B03, B11 |
| `next-app/src/app/admin/orders/[id]/actions.ts:29-34` | ✅ | Server actions re-verify admin session (defense in depth) | — |
| `next-app/src/app/admin/lib/orderTransitions.ts` | ✅ | `ALLOWED_TRANSITIONS` guard on status changes | `07` admin tests |
| `next-app/src/app/lib/adminSession.ts:10-27` | ✅ | HMAC-signed cookie via `MYSTIQUE_ADMIN_SECRET`; single shared password model | B11 |
| `next-app/src/app/lib/adminLoginAttempts.ts:10` | ✅ | Lockout is in-memory `Map<string,...>` (resets on redeploy) | B06 |
| `next-app/src/app/admin/lib/session.ts:20-30` | ✅ | `requireAdminSession` gate (no `middleware.ts`) | — |
| grep `admin_users`/`order_status_history` in `next-app/src` | ✅ (0 hits) | Tables exist in schema, **unused by app** | B03, B11 |

## QA / CI

| File (path:line) | Verify | Why it matters | Supports |
|---|---|---|---|
| `.github/workflows/playwright.yml:37-38` | ✅ | CI ran **only** Playwright (`npm run test`); Vitest excluded | B04, B08 |
| `.github/workflows/ci.yml` (added this pass) | ✅ | Adds lint + typecheck + Vitest unit/integration gate | B04, B08 |
| `vitest.config.ts:25` | ✅ | Collects `tests/unit/**` + `tests/integration/**` | B04 |
| `playwright.config.ts:16-17,86-101` | ✅ | Ignores unit/integration; deterministic mock-catalog env | `07` |
| `tests/integration/stripe-webhook.test.ts:233-269` | ✅ | Proves webhook idempotency contract | `07` |
| `tests/e2e/admin.spec.ts:24-29,87-166` | ✅ | Documents in-memory limiter + gate/lockout coverage; **no authed mutation tests** | B06, `07` |
| `tests/unit/{cart,checkout,promo}.test.ts` | ✅ | Unit coverage exists (62 pass + 2 todo, re-run 2026-06-06) | `07` |

## Performance / reliability

| File (path:line) | Verify | Why it matters | Supports |
|---|---|---|---|
| `next-app/next.config.js:96-126` | ✅ | next/image remotePatterns + qualities | — |
| `next-app/next.config.js:88-89` | ✅ | `optimizePackageImports:["framer-motion"]` | — |
| `next-app/next.config.js:31-81` | ✅ | Security headers + CSP allowlists | Security |
| `next-app/src/app/admin/products/page.tsx:111-114` | ✅ | Two catalog queries (list + stats) per render | B20 |
| `next-app/src/app/api/chat/route.ts:44` | ✅ | In-memory `rateLimitStore = new Map()` | B06 |
| `next-app/src/app/layout.tsx:107-112` | ✅ | Supabase preconnect / dns-prefetch | — |
| Web Vitals (LCP/CLS) actual values | ⬜ | Claimed "not measured" — requires runtime/Speed Insights data | (perf) |
| Catalog caching/revalidate strategy | 🟡 | No `unstable_cache`/`revalidate`/cache tags found in `queries.ts`; not every route segment config exhaustively read | B20 |

## Release / ops

| File (path:line) | Verify | Why it matters | Supports |
|---|---|---|---|
| `package.json:11-12` (pre-fix) | ✅ | Duplicate `test:integration` key — fixed this pass | B12 |
| `package.json:21-23` (post-fix) | ✅ | `engines.node >=20` added | B17 |
| `/supabase/migrations/*` + `/next-app/supabase/*` | ✅ | Migrations split across two dirs | B09 |
| `.github/` (pre-fix) | ✅ | Only `workflows/`; no PR/issue templates — added this pass | B10 |
| `next-app/.env.example` | ✅ | Thorough env documentation | Ops |
| `README.md` / `next-app/DEPLOYMENT.md` | ✅ | Setup + deploy docs exist | Ops |
| Supabase backup retention / PITR | ⬜ | Plan-dependent; **not verifiable from repo** | Ops |
| Git stale branches | 🟡 | `git branch -a` shows stale remotes; staleness age inferred, not authoritative | F |

---

### Self-audit outcome
- **Claims confirmed in code:** all Critical/High backlog items (B01–B07) are ✅ confirmed against named files.
- **Partially evidenced:** catalog caching strategy, branch staleness age, bundle-size risk magnitude (config present, magnitude unmeasured).
- **Not confirmed (runtime/dashboard only):** Web Vitals values, Supabase backup retention. These are explicitly flagged here and in `docs/RUNBOOK.md`.
- **No claim was found to be contradicted by code during validation.**
