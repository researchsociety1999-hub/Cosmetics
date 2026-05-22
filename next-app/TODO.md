# Mystique — Next.js App Tasks

This file tracks active development tasks. Completed items are removed.
For full project context see `/README.md` and `/SUPABASE_SETUP.md`.

---

## 🚀 Sprint 1 — Production Readiness (Current)

> Focus: Unblock live orders, env config, and core commerce flow.

### ✅ AI-Completed
- [x] Generate SQL seed script for `is_published` audit → `supabase/seed-is-published.sql`
- [x] Scaffold `reviews` table insert script → `supabase/seed-reviews.sql`
- [x] Add `volume_size_label` column migration SQL → `supabase/add-volume-size-label-migration.sql`
- [x] Write Playwright E2E test for Stripe checkout happy path → `e2e/checkout-stripe.spec.ts`
- [x] Write Playwright E2E test for `/shop` category filter → `e2e/shop-filter.spec.ts`
- [x] Write Playwright E2E accessibility smoke tests → `e2e/accessibility-smoke.spec.ts`
- [x] Generate accessibility checklist → `ACCESSIBILITY_CHECKLIST.md`
- [x] Build `ProductVolumeSizeLabel` component → `src/app/components/ProductVolumeSizeLabel.tsx`

### 🛠️ Manual / Config
- [ ] Run `supabase/seed-is-published.sql` — review & execute in Supabase SQL editor
- [ ] Run `supabase/seed-reviews.sql` — update product_id values first
- [ ] Run `supabase/add-volume-size-label-migration.sql` — then populate `volume_size_label` per product
- [ ] Replace "Coming soon" products with shoppable in-stock SKUs on homepage
- [ ] Verify Stripe webhook is registered and functional in production (Stripe Dashboard → Webhooks)
- [ ] Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL` in Vercel env for order confirmation emails
- [ ] Confirm `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel (server-only, never exposed to client)
- [ ] Wire `<ProductVolumeSizeLabel>` into `ProductPurchaseClient.tsx` and PDP

---

## 🗂️ Sprint 2 — Content & UX Polish

> Focus: Fill in content gaps, improve mobile experience, and PDP quality.

### ✅ AI-Completed
- [x] Generate `press_mentions` seed rows → `supabase/seed-press-mentions.sql`
- [x] Generate `categories` seed rows → `supabase/seed-categories.sql`

### 🤖 AI-Ready (next)
- [ ] Build `volume_size_label` display in PDP (wire into `ProductPurchaseClient.tsx`)
- [ ] Improve PDP media gallery — add zoom/texture lightbox using Framer Motion
- [ ] Tighten homepage CTA hierarchy — audit `page.tsx` and reduce to one primary CTA per section
- [ ] Mobile tap target audit — scan components for elements below 44×44px and output fix list

### 🛠️ Manual
- [ ] Run `supabase/seed-press-mentions.sql` and `supabase/seed-categories.sql`
- [ ] Implement full accessibility audit pass (use `ACCESSIBILITY_CHECKLIST.md` as guide)
- [ ] Add real product review rows to Supabase `reviews` table
- [ ] Add real press mention rows with correct article URLs and logos

---

## 🔭 Backlog

> Lower priority. Revisit after Sprint 2.

- [ ] Explore image zoom/texture media gallery on PDP with real product photography
- [ ] Consider `search/` page improvements (autocomplete, fuzzy match)
- [ ] Evaluate `stockists/` and `routines/` pages for content population
- [ ] Review `journal/` page — add initial editorial entries
- [ ] Careers page — add open roles or hide from nav if not active
