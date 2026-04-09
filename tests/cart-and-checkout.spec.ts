import { expect, test } from "@playwright/test";
import { addProductToCart, expectHeading, gotoAndWait } from "./helpers";

test.describe("cart and checkout", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test("guest can add a product to the cart and see it in the bag", async ({ page }) => {
    await addProductToCart(page);

    await expectHeading(page, "Your ritual bag");
    await expect(
      page.getByRole("heading", { name: "Celestial Glow Serum", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Line total:")).toBeVisible();
    await expect(page.getByRole("link", { name: "Checkout" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Update" }).first()).toBeVisible();
  });

  test("guest checkout prompts sign in instead of starting payment", async ({ page }) => {
    await addProductToCart(page);
    await gotoAndWait(page, "/checkout");

    await expectHeading(page, "Checkout");
    await expect(page.getByRole("link", { name: "Sign in to checkout" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Create account" })).toBeVisible();
    await expect(
      page.getByText("Sign in first so checkout can load your authenticated Supabase cart."),
    ).toBeVisible();
  });

  test("guest can update cart quantity and totals from the bag", async ({ page }) => {
    await addProductToCart(page);

    const quantityInput = page.locator('input[id^="qty-"]').first();
    await expect(quantityInput).toBeVisible();
    const lineTotal = page.getByText("Line total:").first();
    const initialLineTotal = await lineTotal.textContent();
    await quantityInput.fill("2");

    const updateButton = page.getByRole("button", { name: "Update" }).first();
    await expect(updateButton).toBeVisible();
    await updateButton.click();

    await expect(quantityInput).toHaveValue("2");
    await expect(lineTotal).not.toHaveText(initialLineTotal ?? "");
    await expect(page.locator("aside")).toContainText("Items");
    await expect(page.locator("aside")).toContainText("2");
  });

  test("guest can remove an item and return to the empty cart state", async ({ page }) => {
    await addProductToCart(page);

    await expect(page.getByRole("button", { name: "Remove" }).first()).toBeVisible();
    await page.getByRole("button", { name: "Remove" }).first().click();

    await expectHeading(page, "Your ritual bag");
    await expect(page.getByText(/Your cart is empty/i)).toBeVisible();
    await expect(page.getByRole("link", { name: "Continue shopping" })).toBeVisible();
  });
});
