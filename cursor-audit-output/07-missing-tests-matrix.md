# 07 — Missing Tests Matrix

Flows × current coverage × missing coverage. Coverage type: U=unit, I=integration, E=E2E.

## Evidence validation (2026-06-06)

Coverage claims re-verified against the test files. Tag: **[C]** Confirmed · **[P]** Partially evidenced · **[N]** Not confirmed.

| Claim | Tag | Evidence |
|---|---|---|
| Unit tests exist (cart/checkout/promo) and pass | C | `tests/unit/*.test.ts`; re-run 2026-06-06: 62 pass + 2 todo |
| Integration test exists (webhook) and passes | C | `tests/integration/stripe-webhook.test.ts`; re-run: 7 pass |
| Vitest not gated in CI (pre-fix) | C | `.github/workflows/playwright.yml:37` ran only `npm run test` (Playwright) |
| E2E suite ~18 specs | C | `tests/*.spec.ts` + `next-app/e2e/*.spec.ts` |
| Admin coverage is gate/login only (no authed mutation tests) | C | `tests/e2e/admin.spec.ts` (gate 87-101, login/lockout 122-166) |
| No admin order-action unit tests | C | no test references `promoteOrderStatusAction`/`updateTrackingAction` |
| No chat-route unit tests | C | no test imports `api/chat/route` |
| No KPI computation unit tests | C | no test imports `overviewData` |
| No magic-link happy-path E2E | C | `tests/auth-flow.spec.ts` covers error paths only |
| Funnel-event tests impossible today (events don't exist) | C | depends on B02 |
| No coverage thresholds | C | `vitest.config.ts` has no `coverage.thresholds` |

---

| Flow | Current coverage | Type | Evidence | Missing / recommended |
|---|---|---|---|---|
| Product catalog browse / shop filter | ✅ | E | `next-app/e2e/shop-filter.spec.ts`, `tests/catalog-and-discovery.spec.ts` | Pagination + out-of-stock hiding assertions |
| Product detail (PDP) render | ✅ | E | `tests/catalog-and-discovery.spec.ts` | Related/companion product logic (`getRelatedProducts`) unit test |
| Search + sanitisation | ✅ | E | `tests/search-sanitisation.spec.ts` | Unit test for `sanitizeUserSearchForIlike` injection (`queries.ts:412`) |
| Cart add/update/remove (guest) | ✅ | U+E | `tests/unit/cart.test.ts`, `tests/cart-and-checkout.spec.ts` | Authed (Supabase) cart path E2E |
| Promo apply / validation | ✅ | U | `tests/unit/promo.test.ts`, `tests/promo-accessibility.spec.ts` | Promo expiry + subtotal-threshold edge cases |
| Checkout totals (shipping/discount) | ✅ | U | `tests/unit/checkout.test.ts` | Free-shipping threshold boundary, discount > subtotal clamp |
| Checkout → Stripe session create | 🟡 | E | `next-app/e2e/checkout-stripe.spec.ts` | Rate-limit (429) + Stripe-unconfigured (503) response paths |
| Checkout error sanitisation | ✅ | E | `tests/checkout-error-sanitisation.spec.ts` | — |
| Stripe webhook finalize/idempotency/signature | ✅ | I | `tests/integration/stripe-webhook.test.ts` | **E2E**: webhook → real Supabase order flip (currently mocked) |
| Order confirmation / guest tracking | 🟡 | E | `tests/order-confirmation.spec.ts` | Guest-token access control (wrong/expired token → no leak) |
| Auth error sanitisation | ✅ | E | `tests/auth-error-sanitisation.spec.ts`, `tests/auth-flow.spec.ts` | **Magic-link happy path** (signed-in session) |
| Account pages / order history | 🟡 | E | `tests/account-page.spec.ts`, `tests/account-legal-and-status.spec.ts` | Authed order-history fetch + RLS isolation |
| Admin gate (unauth → login) | ✅ | E | `tests/e2e/admin.spec.ts:87-101` | — |
| Admin login (wrong pw + lockout) | ✅ | E | `tests/e2e/admin.spec.ts:122-166` | — |
| Admin order mutations (status/tracking/ETA) | ❌ | — | `admin/orders/[id]/actions.ts` | **Authed E2E or action unit**: allowed/blocked transitions (`isAllowedTransition`), unauthorized POST rejection |
| Admin KPI computation | ❌ | — | `admin/lib/overviewData.ts` | Unit: revenue/AOV math + (after B01) status filtering |
| Product inventory stats | ❌ | — | `admin/lib/productsQuery.ts:computeInventoryStats` | Unit: low/out-of-stock/active counts |
| Contact form submit + rate limit | 🟡 | E | `tests/content-and-support.spec.ts` | Missing-field + rate-limited redirect assertions |
| Newsletter signup | ❌ | — | `api/newsletter/route.ts` | Unit/integration: dedupe + email-fallback path |
| Chat API (injection/rate-limit/upstream fail) | ❌ | — | `api/chat/route.ts` | Unit: `containsInjectionAttempt`, `sanitizeMessages`, rate-limit, retry/fallback |
| Image fallback / a11y | ✅ | E | `tests/image-fallback.spec.ts`, `next-app/e2e/accessibility-smoke.spec.ts`, `tests/ingredient-poster-alt.spec.ts` | — |
| Analytics funnel events | ❌ | — | (events don't exist yet, B02) | After B02: assert `add_to_cart`/`begin_checkout` fire with consent |

### Highest-value missing tests (priority order)
1. **Admin order-action unit tests** — transition guard + unauthorized rejection (security + correctness).
2. **Chat route unit tests** — injection guard + sanitisation (security; pure functions, easy).
3. **Admin KPI unit tests** — protects the B01 financial fix.
4. **Magic-link happy-path E2E** — only auth failure paths are covered today.
5. **Guest-token access-control E2E** — confirm no cross-order data leak.

### Infrastructure gap
Vitest is **not** in CI (`.github/workflows/playwright.yml:37`). Even existing unit/integration tests don't gate merges until the added `ci.yml` (safe fix #3) runs them.
