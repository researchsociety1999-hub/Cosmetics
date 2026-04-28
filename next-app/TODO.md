# Mystique — Next.js App Tasks

This file tracks active development tasks. Completed items are removed.
For full project context see `/README.md` and `/SUPABASE_SETUP.md`.

## Active

- [ ] Audit all product `is_published` flags in Supabase
- [ ] Replace "Coming soon" products with shoppable in-stock SKUs on homepage
- [ ] Implement accessibility audit pass (keyboard nav, alt text, focus rings)
- [ ] Add product review rows to Supabase `reviews` table
- [ ] Verify Stripe webhook is registered and functional in production
- [ ] Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL` in Vercel env for order emails
- [ ] Confirm `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel (server-only, never client)

## Backlog

- [ ] Add `press_mentions` rows in Supabase for Press page
- [ ] Add `categories` rows for shop filter population
- [ ] Implement `volume_size_label` column on products for PDP display
- [ ] Improve PDP with zoom/texture media gallery
- [ ] Tighten homepage CTA hierarchy (one primary action)
- [ ] Mobile: audit tap targets (44×44px minimum)
