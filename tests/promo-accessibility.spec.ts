import { expect, test } from "@playwright/test";
import { addProductToCart } from "./helpers";

/**
 * M5 — Promo code accessibility in /cart
 *
 * The cart's promo-code form only renders when the bag has at least one line
 * item (the empty-bag branch shows a copy block instead). We add a product
 * with the existing helper, which redirects to /cart, and then verify that the
 * promo <label for="cart-promo-code"> is properly associated with the matching
 * <input id="cart-promo-code">.
 *
 * No axe / @axe-core/playwright is used here — the dependency is not
 * installed in this repo and the constraint is "do not add new packages".
 */
test.describe("M5 — promo code accessibility", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test("M5: cart promo code label and input are visible and properly associated", async ({
    page,
  }) => {
    await addProductToCart(page);

    const promoLabel = page.locator('label[for="cart-promo-code"]');
    const promoInput = page.locator("#cart-promo-code");

    await expect(promoLabel).toBeVisible();
    await expect(promoInput).toBeVisible();

    const labelFor = await promoLabel.getAttribute("for");
    const inputId = await promoInput.getAttribute("id");
    expect(labelFor).toBe("cart-promo-code");
    expect(inputId).toBe("cart-promo-code");
    expect(labelFor).toBe(inputId);

    const labelText = (await promoLabel.textContent())?.trim() ?? "";
    expect(labelText.length).toBeGreaterThan(0);
    expect(labelText).toMatch(/promo|code/i);

    await expect(promoInput).toBeEditable();
  });
});
