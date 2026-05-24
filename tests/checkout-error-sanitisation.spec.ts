import { expect, test } from "@playwright/test";
import { addProductToCart, gotoAndWait, SAMPLE_CHECKOUT_SHIPPING } from "./helpers";

/**
 * M8 — Checkout error message sanitisation (manual env breakage required)
 *
 * This file is intentionally skipped by default. The intent is to verify
 * that when Stripe rejects a `create-checkout-session` call (e.g. because
 * STRIPE_SECRET_KEY is malformed), the UI strips any raw keys / URLs /
 * stack traces before showing the user.
 *
 * ── To run manually ─────────────────────────────────────────────────────────
 *
 *   1. Edit `next-app/.env.local` and set:
 *
 *        STRIPE_SECRET_KEY=sk_test_invalid
 *
 *   2. Restart the server so the env change is picked up (the Playwright
 *      webServer rebuilds via `npm --prefix next-app run build &&
 *      npm --prefix next-app run start`).
 *
 *   3. Run only this file with the M8 grep and unskip it temporarily, e.g.:
 *
 *        npx playwright test tests/checkout-error-sanitisation.spec.ts \
 *          --grep M8 --headed
 *
 *   4. Restore `.env.local` and rebuild after the manual check.
 */
test.describe("M8 — checkout error sanitisation (manual)", () => {
  test.skip(
    true,
    "M8 requires manually setting STRIPE_SECRET_KEY=sk_test_invalid in next-app/.env.local and restarting the server. See file header for instructions.",
  );

  test("M8: invalid Stripe key → user-facing error has no Stripe internals", async ({
    page,
  }) => {
    await addProductToCart(page);

    await gotoAndWait(page, "/checkout");

    await page.locator("#checkout-full-name, [name='fullName']").first().fill(SAMPLE_CHECKOUT_SHIPPING.fullName);
    await page.locator("#checkout-email, [name='email']").first().fill(SAMPLE_CHECKOUT_SHIPPING.email);
    await page.locator("#checkout-address-line1, [name='addressLine1']").first().fill(SAMPLE_CHECKOUT_SHIPPING.addressLine1);
    await page.locator("#checkout-city, [name='city']").first().fill(SAMPLE_CHECKOUT_SHIPPING.city);
    await page.locator("#checkout-state, [name='state']").first().fill(SAMPLE_CHECKOUT_SHIPPING.state);
    await page.locator("#checkout-postal-code, [name='postalCode']").first().fill(SAMPLE_CHECKOUT_SHIPPING.postalCode);

    await page
      .getByRole("button", { name: /continue to payment|pay now|payment unavailable/i })
      .click();

    await page.waitForLoadState("load");

    const visibleText = (await page.locator("body").innerText()).toLowerCase();
    const leakyTokens = ["sk_test", "sk_live", "stripe.com", "at ", "stack", "node_modules"];
    for (const token of leakyTokens) {
      expect(
        visibleText.includes(token),
        `Sanitised checkout error must not leak "${token}". Got: ${visibleText.slice(0, 300)}`,
      ).toBe(false);
    }
  });
});
