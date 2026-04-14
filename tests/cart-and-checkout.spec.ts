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
      page.getByText("Sign in first so we can load your saved bag for checkout."),
    ).toBeVisible();
  });

  test("guest can update cart quantity and totals from the bag", async ({ page }) => {
    await addProductToCart(page);

    const quantityInput = page.locator('input[id^="qty-"]').first();
    await expect(quantityInput).toBeVisible();
    await quantityInput.fill("2");

    const updateButton = page.getByRole("button", { name: "Update" }).first();
    await expect(updateButton).toBeVisible();
    const postUpdate = page.waitForResponse(
      (res) =>
        res.request().method() === "POST" &&
        res.url().includes("/cart") &&
        res.status() < 500,
      { timeout: 60_000 },
    );
    await updateButton.click();
    await postUpdate;
    // Mock Celestial Glow Serum: sale $58 × qty 2 → subtotal/line $116.00 (en-US currency).
    await expect(page.locator("aside")).toContainText("$116.00", { timeout: 30_000 });
    await expect(page.locator('input[id^="qty-"]').first()).toHaveValue("2");
    await expect(page.locator("aside")).toContainText("Items");
    await expect(page.locator("aside")).toContainText("2");
  });

  test("guest can remove an item and return to the empty cart state", async ({ page }) => {
    await addProductToCart(page);

    const removeButton = page.getByRole("button", { name: "Remove" }).first();
    await expect(removeButton).toBeVisible();
    const postRemove = page.waitForResponse(
      (res) =>
        res.request().method() === "POST" &&
        res.url().includes("/cart") &&
        res.status() < 500,
      { timeout: 60_000 },
    );
    await removeButton.click();
    await postRemove;
    await expect(page.getByText(/Your bag is empty/i)).toBeVisible({ timeout: 30_000 });

    await expectHeading(page, "Your ritual bag");
    await expect(page.getByRole("link", { name: "Continue shopping" })).toBeVisible();
  });
});
