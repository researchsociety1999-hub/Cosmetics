# 01 — System Inventory

What exists today, grouped by domain. Every entry is grounded in a file path.

---

## Workspace layout

| Path | Purpose |
|---|---|
| `/next-app` | Production Next.js 16 app (source of truth) |
| `/mystique-sync` | Separate utility package (Supabase image scanner / hero sync) — `mystique-sync/src/modules/supabase/*` |
| `/tests` | Playwright E2E + Vitest unit/integration |
| `/next-app/e2e` | Additional Playwright specs (checkout-stripe, shop-filter, accessibility-smoke) |
| `/supabase/migrations` | Root migrations (RLS/index, guest token, payments unique) |
| `/next-app/supabase` | App-local migrations + seeds (chat_logs, coming_soon, volume label, seeds) |
| `.github/workflows/playwright.yml` | CI (Playwright only) |

---

## Public routes (`next-app/src/app/**/page.tsx`)

| Route | File |
|---|---|
| `/` (home) | `page.tsx` |
| `/shop` | `shop/page.tsx` (+ `ShopCatalogBody.tsx`) |
| `/products/[slug]` | `products/[slug]/page.tsx` (+ `loading.tsx`) |
| `/cart` | `cart/page.tsx` |
| `/checkout` | `checkout/page.tsx` (+ `CheckoutClient.tsx`) |
| `/checkout/success`, `/checkout/cancel` | `checkout/success/page.tsx`, `checkout/cancel/page.tsx` |
| `/order/confirmation`, `/order/[guestToken]` | guest order tracking |
| `/account`, `/account/login`, `/account/signup`, `/account/orders`, `/account/orders/[orderId]` | magic-link auth + order history |
| `/auth/error` (page), `/auth/callback`, `/auth/confirm` (route handlers) | Supabase auth flow |
| `/search` | `search/page.tsx` (+ `SearchExperience.tsx`) |
| `/journal`, `/journal/[slug]` | editorial (mock data — see below) |
| `/ingredients`, `/routines`, `/about`, `/faq`, `/press`, `/media`, `/careers`, `/stockists` | content pages |
| `/privacy`, `/terms`, `/cookies` | legal |
| `/contact` | contact form |
| `/test` | dev-only; redirects to `/shop` in production (`test/page.tsx:8`) |

Boundaries: `loading.tsx` (root, shop, products, about, journal, routines), `error.tsx`, `global-error.tsx`, `not-found.tsx`, `robots.ts`, `sitemap.ts`.

---

## Admin tools (`next-app/src/app/admin/**`) — single-password gate

| Route | File | Capability |
|---|---|---|
| `/admin` | `admin/page.tsx` | KPI overview + inventory pulse + recent orders |
| `/admin/login` | `admin/login/page.tsx` | Password-only login (no email field) |
| `/admin/products` | `admin/products/page.tsx` | **Read-only** product list, filters, inventory stats |
| `/admin/products/[id]` | `admin/products/[id]/page.tsx` | Product detail (read) |
| `/admin/orders` | `admin/orders/page.tsx` | Order list + filters |
| `/admin/orders/[id]` | `admin/orders/[id]/page.tsx` + `actions.ts` | Status transition, tracking #, ETA (writes) |
| `/admin/fulfillment` | `admin/fulfillment/page.tsx` | Fulfillment queue |
| `/admin/customers` | `admin/customers/page.tsx` | Customer list (derived from orders) |
| `/admin/chatbot` | `admin/chatbot/page.tsx` | Chat log diagnostics, themes, knowledge gaps, test console |
| `/admin/settings` | `admin/settings/page.tsx` | Config status |

Auth: `lib/adminSession.ts` (HMAC-signed cookie, `MYSTIQUE_ADMIN_SECRET`), gate `admin/lib/session.ts:requireAdminSession`, login `actions/adminAuth.ts`, in-memory lockout `lib/adminLoginAttempts.ts`.

---

## API route handlers (`next-app/src/app/api/**`)

| Endpoint | File | Notes |
|---|---|---|
| `POST /api/create-checkout-session` | `create-checkout-session/route.ts` | Rate-limited, validates shipping, creates pending order, Stripe session |
| `POST /api/stripe/webhook` | `stripe/webhook/route.ts` | Signature verify, finalize paid order, async payment, fail/expire |
| `POST /api/send-email` | `send-email/route.ts` | Resend wrapper |
| `POST /api/newsletter` | `newsletter/route.ts` | Newsletter signup |
| `GET /api/search` | `search/route.ts` | Product search |
| `GET /api/cart-summary` | `cart-summary/route.ts` | Cart totals |
| `POST /api/chat` | `chat/route.ts` | OpenRouter Ritual Companion, injection guard, in-memory rate limit, chat logging |
| `GET /api/health/integrations` | `health/integrations/route.ts` | Gated by `ENABLE_INTEGRATION_HEALTH` |
| `GET /api/health/inventory` | `health/inventory/route.ts` | Gated by `ENABLE_INVENTORY_HEALTH` |

---

## Server actions (`next-app/src/app/actions/**`)

`cart.ts` (add/update/remove, guest cookie + Supabase), `contact.ts` (rate-limited Resend), `auth.ts` (magic link), `adminAuth.ts` (admin login/logout), `promo.ts` (promo apply/clear).

---

## Data / integration layer (`next-app/src/app/lib/**`)

`queries.ts` (catalog/orders/reviews/promo/press/ingredients), `checkout.ts` (totals/validation), `checkoutOrders.ts` (Stripe order lifecycle), `stripe.ts`, `email.ts`, `cart.ts`, `promo.ts`, `supabaseClient.ts` (anon + service clients), `supabaseServer.ts` (SSR auth), `rateLimit.ts`, `siteUrl.ts`, `format.ts`, `types.ts`, `structuredData.ts`, `socialMetadata.ts`, `integrationEnv.ts`/`integrationProbes.ts` (health).

---

## Integrations

| Integration | Wiring |
|---|---|
| Supabase | `lib/supabaseClient.ts`, `lib/supabaseServer.ts`, RLS migrations in `/supabase/migrations` |
| Stripe | `lib/stripe.ts`, `api/create-checkout-session`, `api/stripe/webhook` |
| Resend | `lib/email.ts`, `actions/contact.ts`, `api/send-email` |
| OpenRouter (chat) | `api/chat/route.ts` (`OPENROUTER_API_KEY`, `OPENROUTER_MODEL`) |
| Vercel Analytics | `layout.tsx:148` `<Analytics/>` |
| Vercel Speed Insights | `layout.tsx:146` `<SpeedInsights/>` |
| Google Analytics 4 (optional) | `layout.tsx:136-143`, `components/GoogleAnalytics.tsx` |

---

## Supabase schema (inferred from migrations + RLS)

Surfaced tables: `products`, `product_variants`, `categories`, `orders`, `order_items`, `payments`, `reviews`, `promo_campaigns`, `promo_codes`, `press_mentions`, `ingredients`, `cart_items`, `chat_logs`.

**Exists in DB but NOT used by the app** (opportunity surface): `admin_users`, `analytics_events`, `order_status_history`, `inventory_logs`, `returns`, `wishlists`, `loyalty_program`, `referrals`, `sales_channels`, `channel_orders`, `bundle_items`, `profiles`, `addresses`, `newsletter_subscribers`. Evidence: `supabase/migrations/20260427_fix_security_performance_rls_indexes.sql` (policies/indexes for all of these) vs. `queries.ts` returning `[]`/`null` for wishlist/loyalty/profile/addresses (`queries.ts:1108-1178`).
