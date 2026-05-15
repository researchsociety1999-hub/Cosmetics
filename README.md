# ✦ Mystique — Where Beauty Transcends

> *Skincare rooted in ritual. Formulated with intention.*

🌐 **Shop now:** [cosmetics-wjwz.vercel.app](https://cosmetics-wjwz.vercel.app)

---

## Welcome to Mystique

Mystique is a premium skincare brand built on a single belief — that your daily ritual should feel as transformative as the results it delivers. Every product is carefully formulated with clean, high-performance ingredients, designed for people who treat skincare as self-care, not an afterthought.

We believe transparency matters. You'll always know exactly what's in your products and why each ingredient is there.

---

## Our Collections

| Collection | What It Does |
|---|---|
| **Cleansers** | Gentle, effective cleansing that respects your skin barrier |
| **Toners** | Rebalance and prep your skin for the next step in your ritual |
| **Serums** | Targeted, high-concentration actives for visible results |
| **Face Treatments** | Masks, exfoliants, and treatments for your skin's deeper needs |
| **Polish** | Radiance-first formulas that reveal your skin's natural luminosity |

---

## How to Shop

1. **Browse the collection** — head to [/shop](https://cosmetics-wjwz.vercel.app/shop) to explore every product
2. **Read the ingredients** — every product page lists exactly what's inside and what it does
3. **Build your ritual** — visit [/routines](https://cosmetics-wjwz.vercel.app/routines) for curated morning and evening sequences
4. **Add to your bag** — no account needed to browse or add items to your cart
5. **Check out securely** — powered by Stripe; your payment details are never stored on our servers

---

## Your Account

Creating a Mystique account takes one step — just your email. We use **secure magic links** (no passwords to remember or lose). Once signed in you get:

- 📦 Full order history with tracking
- 🛍️ Your bag saved across devices
- ⚡ Faster checkout pre-filled with your details

[Create your account →](https://cosmetics-wjwz.vercel.app/account/signup)

---

## Our Promise

- **Clean formulations** — no parabens, sulphates, or synthetic fragrances
- **Transparent ingredients** — every ingredient explained, no hidden fillers
- **Sustainable packaging** — recycled and recyclable materials across our range
- **No minimum order** — free to explore, mix, and build your own ritual

---

## Need Help?

| | |
|---|---|
| 📖 **FAQ** | [cosmetics-wjwz.vercel.app/faq](https://cosmetics-wjwz.vercel.app/faq) — shipping, returns, and product questions |
| 📬 **Contact** | [cosmetics-wjwz.vercel.app/contact](https://cosmetics-wjwz.vercel.app/contact) — we respond within 24 hours |
| 📰 **Journal** | [cosmetics-wjwz.vercel.app/journal](https://cosmetics-wjwz.vercel.app/journal) — skincare guides, ingredient deep-dives, and rituals |

---

---

# Developer Documentation

> Everything below is for contributors and developers working on the Mystique codebase.

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
