# Mystique — Skincare Storefront

> *Where Beauty Transcends*

A production-grade skincare e-commerce storefront built with **Next.js 16**, **Supabase**, **Stripe**, and **Resend**. Deployed on Vercel.

🌐 **Live site:** [cosmetics-wjwz.vercel.app](https://cosmetics-wjwz.vercel.app)

---

## Repository Structure

```
/
├── next-app/          ← Production Next.js app (source of truth)
│   ├── src/           ← App source code (pages, components, lib)
│   ├── public/        ← Static assets served by Next.js
│   ├── scripts/       ← Utility / seed scripts
│   ├── supabase/      ← (if present) local Supabase config
│   └── .env.example   ← Copy to .env.local and fill in your keys
├── supabase/          ← Supabase migrations and config
├── tests/             ← Playwright E2E tests (run from root)
├── scripts/           ← Root-level utility scripts
├── legacy/            ← Original static prototype (not deployed, reference only)
├── playwright.config.ts
├── package.json       ← Root workspace (delegates to next-app)
├── SUPABASE_SETUP.md  ← Supabase integration guide
└── .github/workflows/ ← CI (Playwright E2E on push/PR to main)
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install          # installs root (Playwright) + next-app deps
```

### 2. Set up environment variables

```bash
cp next-app/.env.example next-app/.env.local
# Fill in your Supabase, Stripe, and Resend keys
```

See [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) for full integration details.

### 3. Run in development

```bash
npm run dev          # starts Next.js dev server on http://localhost:3000
```

### 4. Run E2E tests

```bash
npm run test         # runs Playwright against localhost:3001 with mock catalog
```

---

## Environment Variables

Copy `next-app/.env.example` to `next-app/.env.local`. Required variables:

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public anon key (safe for browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | Prod | Server-only; required for Stripe checkout |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Prod | For Stripe webhook verification |
| `RESEND_API_KEY` | Prod | For order confirmation emails |
| `RESEND_FROM_EMAIL` | Prod | Sender address for transactional emails |

⚠️ **Never commit `.env.local` or any file containing real keys.** Use Vercel's environment variable dashboard for production secrets.

---

## Deployment

The app auto-deploys to Vercel on every push to `main`. See [`next-app/DEPLOYMENT.md`](./next-app/DEPLOYMENT.md) for manual deployment steps and Vercel config.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (magic links) |
| Payments | Stripe Checkout |
| Email | Resend |
| Testing | Playwright E2E |
| Deployment | Vercel |
| Language | TypeScript |
