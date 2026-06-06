# Changelog

All notable changes to the Mystique storefront are documented here.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/).
This file was seeded during the production-readiness audit (2026-06-06); entries
before that date are reconstructed from git history and are not exhaustive.

## [Unreleased]
### Added
- Repository hygiene from production-readiness audit: CI workflow for lint/typecheck/Vitest (`.github/workflows/ci.yml`), PR + issue templates, this changelog, and `docs/RUNBOOK.md`.
- `noindex/nofollow` enforced across the entire `/admin` subtree at the layout level.
- Audit deliverables under `cursor-audit-output/`.

### Fixed
- Removed duplicate `test:integration` script key in root `package.json`.

### Changed
- Pinned Node `>=20` via `engines` in root `package.json` (matches CI).

## [Prior — from git history]
### Added
- Vitest unit + integration testing alongside the Playwright E2E suite.
- Vercel Analytics + Speed Insights, Supabase preconnect, deferred client components.
- Admin overview KPIs, inventory metrics, order detail with fulfillment insights, chatbot diagnostics workspace.
- Chat logs persistence (`chat_logs`) and admin chatbot navigation.

### Changed
- CSS loading split into per-component files; package-import optimization in `next.config.js`.
- Homepage component structure deferred for improved loading performance.

### Fixed
- Production console-noise suppression in `queries.ts`; improved user-facing messaging in purchase/contact flows.
- Button accessibility/layout consistency (min-height, flex).
