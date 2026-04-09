import { expect, test } from "@playwright/test";
import { addFirstVisibleProductToCart, expectHeading, gotoAndWait } from "./helpers";

test.describe("cart and checkout", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test("guest can add a product to the cart and see it in the bag", async ({ page }) => {
    await addFirstVisibleProductToCart(page);
    await gotoAndWait(page, "/cart");

    await expectHeading(page, "Your ritual bag");
    await expect(page.getByText("Your cart is empty.")).toHaveCount(0);
    await expect(page.getByText("Line total:")).toBeVisible();
    await expect(page.getByRole("link", { name: "Checkout" })).toBeVisible();
  });

  test("guest checkout prompts sign in instead of starting payment", async ({ page }) => {
    await addFirstVisibleProductToCart(page);
    await gotoAndWait(page, "/checkout");

    await expectHeading(page, "Checkout");
    await expect(page.getByRole("link", { name: "Sign in to checkout" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Create account" })).toBeVisible();
    await expect(
      page.getByText("Sign in first so checkout can load your authenticated Supabase cart."),
    ).toBeVisible();
  });

  test("cart quantity update controls are available for added items", async ({ page }) => {
    await addFirstVisibleProductToCart(page);
    await gotoAndWait(page, "/cart");

    const quantityInput = page.locator('input[id^="qty-"]').first();
    await expect(quantityInput).toBeVisible();
    await expect(page.getByRole("button", { name: "Update" }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Remove" }).first()).toBeVisible();
  });
});
