<!-- Keep PRs small and reviewable. See cursor-audit-output/06-high-risk-items.md for changes that require extra scrutiny. -->

## Summary
<!-- What does this PR do and why? 1–3 sentences. -->

## Area
- [ ] Storefront (customer-facing)
- [ ] Admin / business ops
- [ ] Analytics / observability
- [ ] Payments / checkout / webhook
- [ ] Auth / security
- [ ] Supabase schema / migration
- [ ] Tooling / CI / docs

## Risk level
- [ ] Low (hygiene, docs, additive UI, tests)
- [ ] Medium (new feature, new query)
- [ ] High (financial logic, payments, auth model, schema, rate limiting) — **requires reviewer sign-off**

## Changes
<!-- Bullet the concrete changes. -->

## Testing
- [ ] `npm run lint`
- [ ] `npm run test:unit`
- [ ] `npm run test:integration`
- [ ] `npm run test` (Playwright E2E) — if storefront/admin behavior changed
- [ ] `npm run build`

## Database / migrations
- [ ] No schema change
- [ ] Includes migration(s) — applied to staging and documented apply order

## Screenshots / evidence
<!-- For UI changes. -->

## Rollback plan
<!-- How to revert safely if this misbehaves in production. -->
