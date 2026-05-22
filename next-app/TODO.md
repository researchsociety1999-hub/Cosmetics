# Mystique — Next.js App Tasks

This file tracks active development tasks. Completed items are removed.
For full project context see `/README.md` and `/SUPABASE_SETUP.md`.

---

## 🚀 Sprint 1 — Production Readiness (Current)

> Focus: Unblock live orders, env config, and core commerce flow.

### 🤖 AI-Assisted (can be done now)
- [ ] Generate SQL seed script to set `is_published = true` for in-stock SKUs in Supabase `products` table
- [ ] Write Playwright E2E test for Stripe checkout happy path (cart → checkout → success page)
- [ ] Write Playwright E2E test for `/shop` filter by category (unblocks `categories` row seeding)
- [ ] Scaffold `reviews` table insert script with sample review rows for Supabase
- [ ] Add `volume_size_label` column migration SQL to `next-app/supabase/`
- [ ] Audit `globals.css` for missing `alt` text patterns and generate an accessibility checklist

### 🛠️ Manual / Config
- [ ] Replace "Coming soon" products with shoppable in-stock SKUs on homepage
- [ ] Verify Stripe webhook is registered and functional in production (Stripe Dashboard → Webhooks)
- [ ] Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL` in Vercel env for order confirmation emails
- [ ] Confirm `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel (server-only, never exposed to client)

---

## 🗂️ Sprint 2 — Content & UX Polish

> Focus: Fill in content gaps, improve mobile experience, and PDP quality.

### 🤖 AI-Assisted
- [ ] Generate `press_mentions` seed rows (name, publication, quote, date) for Press page
- [ ] Generate `categories` seed rows for shop filter population
- [ ] Build `volume_size_label` display component on PDP (reads new column)
- [ ] Improve PDP media gallery — add zoom/texture lightbox using Framer Motion
- [ ] Tighten homepage CTA hierarchy — audit `page.tsx` and reduce to one primary CTA per section
- [ ] Mobile tap target audit — scan components for elements below 44×44px and output fix list

### 🛠️ Manual
- [ ] Implement full accessibility audit pass (keyboard nav, focus rings, screen reader labels)
- [ ] Add product review rows to Supabase `reviews` table (real content)
- [ ] Add `press_mentions` rows in Supabase for Press page (real content)

---

## 🔭 Backlog

> Lower priority. Revisit after Sprint 2.

- [ ] Add `categories` rows for shop filter population (real content)
- [ ] Explore image zoom/texture media gallery on PDP with real product photography
- [ ] Consider `search/` page improvements (autocomplete, fuzzy match)
- [ ] Evaluate `stockists/` and `routines/` pages for content population
- [ ] Review `journal/` page — add initial editorial entries
- [ ] Careers page — add open roles or hide from nav if not active
