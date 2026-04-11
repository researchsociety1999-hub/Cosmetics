# Mystique (Next.js) — deployment checklist

Target: **Vercel** hosting the `next-app` project. Configure the same variables on **Production** and **Preview** unless noted.

## 1. Vercel project

- [ ] Import the repo; set **Root Directory** to `next-app` (or deploy only that app).
- [ ] **Framework Preset:** Next.js.
- [ ] **Node:** match `package.json` engines if present; otherwise current LTS is fine.

## 2. Environment variables (see `.env.example`)

- [ ] `NEXT_PUBLIC_SITE_URL` — canonical `https://` origin for production (magic links, Stripe redirects, Open Graph base, sitemap). Previews: set per-branch URL or rely on `VERCEL_URL` fallback when unset.
- [ ] Supabase: `NEXT_PUBLIC_SUPABASE_URL` (or `SUPABASE_URL`), anon/publishable key, and **`SUPABASE_SERVICE_ROLE_KEY`** for orders, promos, newsletter persistence.
- [ ] Stripe: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`.
- [ ] Resend: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`; optional admin inboxes (`ORDERS_ADMIN_EMAIL`, etc.).
- [ ] Social URLs: any `NEXT_PUBLIC_SOCIAL_*_URL` you want in the footer.
- [ ] Optional: `ENABLE_INTEGRATION_HEALTH=1` on a staging project only if you want `/api/health/integrations` live in production (defaults to **404** in prod).

## 3. Supabase dashboard

- [ ] **Auth → URL configuration:** Site URL and **Redirect URLs** must include your Vercel production domain and any preview domains you use for OAuth/magic links.
- [ ] **RLS:** anon (or the key used by the server client) can `SELECT` published `products`; policies match `SUPABASE_SETUP.md` at repository root.
- [ ] Tables used by checkout/newsletter (`orders`, `order_items`, `newsletter_subscribers`, etc.) exist and match app expectations.

## 4. Stripe dashboard

- [ ] **Webhooks:** endpoint `https://<your-domain>/api/stripe/webhook` with `checkout.session.completed` (and any other events you implemented).
- [ ] Use **live** vs **test** keys consistently with Vercel **Production** vs **Preview**.

## 5. Resend dashboard

- [ ] Verify **sending domain** for `RESEND_FROM_EMAIL`.
- [ ] Confirm API key is for the correct environment.

## 6. Post-deploy smoke tests

- [ ] Home, shop, product PDP loads from Supabase.
- [ ] Sign-in / magic link (check link host matches `NEXT_PUBLIC_SITE_URL` or preview URL).
- [ ] Test checkout (Stripe test mode on preview).
- [ ] `GET /robots.txt` and `GET /sitemap.xml` return expected hosts.

## 7. Ongoing operations

- [ ] Monitor Stripe webhook delivery and Supabase logs for failed inserts.
- [ ] Rotate keys from dashboards if leaked; update Vercel env and redeploy.

---

## Ship readiness (severity-ranked)

### Must-fix (before revenue / public launch)

- [ ] Production env: Supabase URL + keys, **service role** for orders/newsletter, Stripe live keys + webhook secret, Resend + verified domain, **`NEXT_PUBLIC_SITE_URL`** on the real domain.
- [ ] Supabase Auth redirect URLs include production (and previews if you test auth there).
- [ ] Smoke: checkout, webhook delivery, order row creation, customer email (if enabled).

### Should-fix (soon after launch or before high traffic)

- [ ] Remove or lock down **`/test`** in production (layout sets `noindex`; consider deleting the route or IP-gating).
- [ ] Mobile nav: no focus trap on the `<details>` menu — acceptable for MVP; revisit if you add many links or modal-style drawers.
- [ ] Set **`NEXT_PUBLIC_STUDIO_EMAIL`** in production to a monitored inbox (Contact, Privacy, Terms). Until set, the Contact sidebar explains that replies go through the form only.
- [ ] Journal section remains largely **mock-backed** until wired to CMS/DB — set expectations in content/SEO if indexed.

### Nice-to-have

- [ ] Per-route **loading.tsx** for heavy pages beyond shop/PDP root.
- [ ] Structured data (Product, Organization) on PDP/home.
- [ ] E2E suite against preview with real Stripe test + Supabase test project.
