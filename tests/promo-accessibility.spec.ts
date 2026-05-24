import { expect, test } from "@playwright/test";
import { addProductToCart } from "./helpers";

/**
 * M5 — Promo code accessibility
 *
 * Verifies that the promo-code form in the cart page has a visible <label>
 * correctly associated with its <input> via matching `for` / `id` attributes.
 *
 * The promo form only renders when the cart has at least one line item, so
 * we add a product first via the shared addProductToCart helper.
 */

test.describe("M5 — promo code accessibility", () => {
  test("M5: cart promo code label and input are visible and properly associated", async ({
    page,
  }) => {
    // Add a product so the promo-code block is rendered.
    await addProductToCart(page);

    // Wait for cart page to settle.
    await expect(page).toHaveURL(/\/cart/);
    await page.waitForLoadState("load");

    // The label and input must both be present.
    const label = page.locator("label[for='cart-promo-code']");
    const input = page.locator("input#cart-promo-code");

    await expect(label).toBeVisible({ timeout: 15_000 });
    await expect(input).toBeVisible({ timeout: 15_000 });

    // Confirm the association is correct (for === id).
    const forAttr = await label.getAttribute("for");
    const idAttr = await input.getAttribute("id");
    expect(forAttr).toBe("cart-promo-code");
    expect(idAttr).toBe("cart-promo-code");

    // Input must be editable.
    await expect(input).toBeEditable();
  });
});
