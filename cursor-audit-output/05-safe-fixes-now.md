# 05 — Safe Fixes Applied Now

Only low-risk, additive, evidence-backed changes. No business logic, schema, payment, auth, routing, or styling changes. Each is reversible.

| # | Change | File(s) | Why | Expected outcome |
|---|---|---|---|---|
| 1 | Remove duplicate `test:integration` script key | `package.json` | Lines 11–12 defined the same key twice (`package.json:11-12`) | Single canonical script; no JSON key shadowing |
| 2 | Add `engines.node` pin | `package.json` | CI uses Node 20 (`playwright.yml:18-19`); root had no pin | Local/CI Node alignment, clearer onboarding |
| 3 | Add unit/integration + lint/typecheck CI workflow | `.github/workflows/ci.yml` (new) | Vitest never ran in CI (`playwright.yml:37` runs E2E only) | Cart/checkout/webhook unit + integration regressions blocked at PR |
| 4 | Add PR template | `.github/PULL_REQUEST_TEMPLATE.md` (new) | None existed | Consistent review checklist (tests, migrations, risk) |
| 5 | Add issue templates | `.github/ISSUE_TEMPLATE/bug_report.md`, `feature_request.md` (new) | None existed | Structured bug/feature intake |
| 6 | Add CHANGELOG | `CHANGELOG.md` (new) | None existed | Release-note discipline starting point |
| 7 | Add operations runbook | `docs/RUNBOOK.md` (new) | No deploy/rollback/incident doc | Faster, safer incident + rollback response |
| 8 | Enforce `noindex` on all admin routes at layout level | `next-app/src/app/admin/layout.tsx` | `robots:{index:false}` was per-page only; a future admin page could leak into the index | Admin tree never indexed regardless of per-page metadata |

## Explicitly NOT done in this pass (require review — see `06-high-risk-items.md`)
- KPI revenue status filter (`B01`) — changes reported financials.
- Funnel analytics events (`B02`) — additive but touches multiple client components; recommended next, kept out of the unattended pass to keep this diff minimal and purely hygienic.
- Audit-log table, product CRUD, rate-limit backend, error monitoring, admin roles, migration consolidation, UTM capture, tax.

## Verification commands
```bash
npm run lint
npm run test:unit
npm run test:integration
npm run build
```
