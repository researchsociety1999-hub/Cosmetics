<div align="center">

# ✨ Cosmetics — K-Beauty E-Commerce Platform

**A modern, full-stack K-beauty shopping experience built with Next.js & Supabase**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-cosmetics--wjwz.vercel.app-pink?style=for-the-badge&logo=vercel)](https://cosmetics-wjwz.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/dashboard/projects)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.x-38BDF8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Playwright](https://img.shields.io/badge/Tested%20with-Playwright-2EAD33?style=for-the-badge&logo=playwright)](https://playwright.dev/)
[![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](LICENSE)

</div>

---

## 🌸 Overview

**Cosmetics** is a premium K-beauty e-commerce platform delivering a seamless, luxurious shopping experience. Inspired by top-tier beauty brands, it features a curated product catalog, smooth checkout flow, transactional email notifications, and a robust backend powered by Supabase.

Whether you're browsing the latest skincare essentials or completing a purchase, every interaction is designed to feel effortless and elegant.

> 🔗 **Live Site:** [cosmetics-wjwz.vercel.app](https://cosmetics-wjwz.vercel.app)

---

## 🚀 Features

- 🛍️ **Product Catalog** — Beautifully presented K-beauty product listings with filtering and search
- 🛒 **Shopping Cart** — Persistent cart with real-time quantity updates
- 💳 **Checkout Flow** — Streamlined, multi-step checkout with order confirmation
- 📧 **Transactional Emails** — Order confirmation and notification emails via Resend
- 🗄️ **Supabase Backend** — Fully managed PostgreSQL database with Row Level Security
- 🎨 **Responsive Design** — Mobile-first UI built with Tailwind CSS
- ⚡ **Performance Optimized** — Static generation and server-side rendering with Next.js App Router
- 🧪 **End-to-End Testing** — Automated test coverage with Playwright
- 🔄 **CI/CD** — Automated deployments via GitHub Actions & Vercel

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| 🖥️ Frontend | Next.js 16 (App Router), React, TypeScript |
| 🎨 Styling | Tailwind CSS v4 |
| 🗄️ Database | Supabase (PostgreSQL) |
| 🔐 Auth | Supabase Auth |
| 📧 Email | Resend |
| 🧪 Testing | Playwright |
| 🚀 Deployment | Vercel |
| ⚙️ CI/CD | GitHub Actions |

---

## 📁 Project Structure

```
Cosmetics/
├── .github/
│   └── workflows/        # CI/CD GitHub Actions pipelines
├── .vscode/              # Editor configuration & debug settings
├── TSx/                  # Shared TypeScript types and interfaces
├── next-app/             # Main Next.js application
│   ├── app/              # App Router pages & layouts
│   ├── components/       # Reusable UI components
│   ├── lib/              # Supabase client, utilities
│   └── public/           # Static assets
├── tests/                # Playwright end-to-end test suites
├── SUPABASE_SETUP.md     # Database setup & migration guide
├── package.json          # Workspace scripts & dependencies
├── playwright.config.ts  # Playwright test configuration
└── styles.css            # Global styles
```

---

## 🏁 Getting Started

### Prerequisites

- Node.js `v18+`
- npm `v9+`
- A [Supabase](https://supabase.com/dashboard/projects) project
- A [Resend](https://resend.com) account for emails

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/researchsociety1999-hub/Cosmetics.git
cd Cosmetics
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Configure Environment Variables

Create a `.env.local` file inside the `next-app/` directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Resend (Email)
RESEND_API_KEY=your_resend_api_key
```

> 📖 See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed database schema setup and migration instructions.

### 4️⃣ Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. 🎉

---

## 📦 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint across the project |
| `npm run install` | Install all workspace dependencies |
| `npm test` | Run Playwright end-to-end tests (`tests/`) |

---

## 🧪 Running Tests

This project uses [Playwright](https://playwright.dev/) for end-to-end testing.

```bash
# Run all tests (from repo root; builds next-app and serves on :3001)
npm test

# Same as above
npx playwright test

# Run one file
npx playwright test tests/account-page.spec.ts

# Run tests with UI mode
npx playwright test --ui

# View the test report
npx playwright show-report
```

---

## 🌐 Deployment

The app is deployed on **Vercel** with automatic deployments on every push to `main`.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/researchsociety1999-hub/Cosmetics)

For manual deployment:

```bash
npm run build
```

Then deploy the `next-app/.next` output to your hosting provider of choice.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 💖

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with 💕 by [researchsociety1999-hub](https://github.com/researchsociety1999-hub)

⭐ If you find this project helpful, please consider giving it a star!

</div>
