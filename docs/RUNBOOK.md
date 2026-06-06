# Mystique — Operations Runbook

Operational reference for deploying, recovering, and responding to incidents.
App source of truth: `/next-app`. Hosting: Vercel. Data: Supabase. Payments: Stripe. Email: Resend.

> This runbook documents intended procedures. Steps that depend on production
> dashboards (Vercel/Supabase/Stripe) are *not verifiable from the repo* and
> should be validated by an operator with access.

---

## 1. Deploy

- **Automatic:** push/merge to `main` triggers a Vercel production deploy (see `README.md` Deployment).
- **Pre-merge gates:** `.github/workflows/ci.yml` (lint, typecheck, unit, integration) + `.github/workflows/playwright.yml` (E2E).
- **Local prod-parity build:** `npm run build` then `npm run start` (next-app).
- **Manual:** see `next-app/DEPLOYMENT.md`.

### Pre-deploy checklist
- [ ] CI green (both workflows)
- [ ] Required env present in Vercel Production (see §5)
- [ ] DB migrations applied (see §4)
- [ ] Stripe webhook endpoint registered & live (see §3)

---

## 2. Rollback

1. In Vercel → Deployments, find the last known-good production deployment.
2. **Promote** that deployment (instant rollback of app code).
3. If the bad deploy included a **DB migration**, code rollback is **not** enough — assess whether the migration is backward-compatible. Forward-only migrations (additive columns/policies) are safe to leave; destructive ones require a restore (§6).
4. Post-rollback: re-run smoke checks (`/`, `/shop`, a PDP, `/cart`, `/checkout`) and confirm a test order if Stripe is in test mode.

---

## 3. Stripe webhook recovery

Endpoint: `POST /api/stripe/webhook` (`next-app/src/app/api/stripe/webhook/route.ts`).
Required events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.expired`, `checkout.session.async_payment_failed`.

- **Symptom:** paid orders stuck in `pending`/`processing` mismatch, or no confirmation email.
- **Checks:**
  - Stripe Dashboard → Developers → Webhooks → delivery attempts/response codes.
  - The route returns **400** on bad signature (Stripe will NOT retry) and **5xx** on transient failure (Stripe WILL retry) — see `webhook/route.ts:185-190`.
  - Confirm `STRIPE_WEBHOOK_SECRET` matches the live endpoint.
- **Re-drive:** in Stripe, resend the failed event(s). Finalization is **idempotent** — a duplicate delivery for an already-`processing` order is a no-op (`finalizePaidOrderFromStripe`, verified by `tests/integration/stripe-webhook.test.ts`).

---

## 4. Database migrations

- Migrations currently live in **two** locations (consolidation is backlog item B09):
  - `/supabase/migrations/*`
  - `/next-app/supabase/migrations/*` (+ seeds in `/next-app/supabase`)
- Apply via the Supabase SQL editor or CLI, in date order.
- After applying, verify RLS is intact (admin-only tables `admin_users`, `inventory_logs`, `channel_orders`, `chat_logs`, `order_audit_log` should have **no** anon/authenticated policies).

---

## 5. Environment variables

Source of truth: `next-app/.env.example`. Minimum for production:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_URL` | Supabase project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public/SSR auth (required) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only writes (orders, admin, chat logs) |
| `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Checkout |
| `STRIPE_WEBHOOK_SECRET` | Webhook verification |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Transactional email (verified domain) |
| `MYSTIQUE_ADMIN_PASSWORD`, `MYSTIQUE_ADMIN_SECRET` | Admin gate |
| `OPENROUTER_API_KEY`, `OPENROUTER_MODEL` | Ritual Companion chat |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin (links, return URLs, metadata) |

> ⚠️ Never put a `sb_secret_*` key in `NEXT_PUBLIC_SUPABASE_ANON_KEY` — the app disables the public client if detected (`lib/supabaseClient.ts:25-26`).

### Secret rotation (recommended cadence: quarterly + on suspected exposure)
1. Generate new key in the provider dashboard (Supabase/Stripe/Resend/OpenRouter).
2. Update Vercel Production (and Preview if applicable).
3. Redeploy. Revoke the old key only after confirming the new deploy is healthy.
4. Rotating `MYSTIQUE_ADMIN_SECRET` invalidates all active admin sessions (expected).

---

## 6. Backup / restore

- Supabase provides automated backups (plan-dependent) — **verify retention in the Supabase dashboard** (*not confirmed in code*).
- Before any destructive migration: take a manual snapshot/export of affected tables.
- Restore: use Supabase point-in-time recovery / backup restore, then re-apply any forward-only migrations created after the restore point.

---

## 7. Incident response (quick triage)

| Symptom | First look |
|---|---|
| Checkout fails | Vercel logs for `[checkout]`; Stripe key/config; `hasSupabasePublicEnv` |
| Orders not finalizing | §3 webhook recovery |
| No emails | `RESEND_FROM_EMAIL` must be a verified custom domain (not gmail) |
| Catalog empty | Supabase reachability; `is_published` flags; `ALLOW_MOCK_CATALOG` must be OFF in prod |
| Admin locked out | In-memory lockout resets on redeploy (backlog B06); or rotate `MYSTIQUE_ADMIN_SECRET` |
| Chat down | `OPENROUTER_API_KEY`/`OPENROUTER_MODEL`; route degrades gracefully to a calm retry message |

Health probes (enable via env): `GET /api/health/integrations` (`ENABLE_INTEGRATION_HEALTH=1`), `GET /api/health/inventory` (`ENABLE_INVENTORY_HEALTH=1`).
