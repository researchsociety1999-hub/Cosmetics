import { expect, test } from "@playwright/test";
import { addProductToCart, gotoAndWait, SAMPLE_CHECKOUT_SHIPPING } from "./helpers";

/**
 * M8 — Checkout error sanitisation (skipped by default)
 *
 * Verifies that when the Stripe checkout session creation fails, the error
 * shown to the user is a clean, human-readable message — not a raw Stripe
 * API error, stack trace, or internal exception detail.
 *
 * HOW TO ENABLE
 * Set the environment variable BREAK_CHECKOUT_ERRORS=1 before running:
 *
 *   BREAK_CHECKOUT_ERRORS=1 npx playwright test tests/checkout-error-sanitisation.spec.ts
 *
 * Without that flag the test is always skipped.
 */

const ENABLED = process.env.BREAK_CHECKOUT_ERRORS === "1";

test.describe("M8 — checkout error sanitisation", () => {
  test.skip(!ENABLED, "Set BREAK_CHECKOUT_ERRORS=1 to run this destructive probe");

  test("M8: a Stripe failure shows a sanitised error message", async ({ page }) => {
    // Add a product so we reach the checkout form.
    await addProductToCart(page);
    await gotoAndWait(page, "/cart");

    // Fill the shipping form.
    await page.getByLabel(/full name/i).fill(SAMPLE_CHECKOUT_SHIPPING.fullName);
    await page.getByLabel(/email/i).fill(SAMPLE_CHECKOUT_SHIPPING.email);
    await page.getByLabel(/address line 1/i).fill(SAMPLE_CHECKOUT_SHIPPING.addressLine1);
    await page.getByLabel(/city/i).fill(SAMPLE_CHECKOUT_SHIPPING.city);
    await page.getByLabel(/state/i).fill(SAMPLE_CHECKOUT_SHIPPING.state);
    await page.getByLabel(/postal|zip/i).fill(SAMPLE_CHECKOUT_SHIPPING.postalCode);

    // Submit and trigger the Stripe error path.
    const submitButton = page.getByRole("button", { name: /checkout|pay|place order/i });
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // Wait for the error feedback region.
    const errorRegion = page
      .getByRole("alert")
      .or(page.locator("[aria-live]"))
      .first();
    await expect(errorRegion).toBeVisible({ timeout: 20_000 });

    const errorText = await errorRegion.innerText();

    // Must NOT contain raw Stripe / internal error details.
    const forbidden = [
      /stripe/i,
      /sk_/i,
      /pk_/i,
      /api key/i,
      /stack trace/i,
      /at Object\./i,
      /internal server error/i,
    ];
    for (const pattern of forbidden) {
      expect(
        errorText,
        `Checkout error UI must not expose: ${pattern}`,
      ).not.toMatch(pattern);
    }

    // Must show a human-friendly message.
    expect(errorText.trim().length).toBeGreaterThan(0);
  });
});
