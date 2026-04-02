import { test, expect } from "@playwright/test";
import { addMockProductToCart, mockProduct } from "./helpers";

test.describe("cart and checkout flows", () => {
  test("adds a product from the PDP and shows it in the cart", async ({ page }) => {
    await addMockProductToCart(page);

    await expect(page.getByRole("heading", { level: 2, name: mockProduct.name })).toBeVisible();
    await expect(page.getByText("Line total:")).toContainText(mockProduct.price);
    await expect(page.getByRole("link", { name: "Checkout" })).toBeVisible();
  });

  test("updates quantity and subtotal in cart", async ({ page }) => {
    await addMockProductToCart(page);

    await page.locator('input[name="quantity"]').fill("2");
    await page.getByRole("button", { name: "Update" }).click();

    await expect(page.locator('input[name="quantity"]')).toHaveValue("2");
    await expect(page.getByText("Items").locator("..")).toContainText("2");
    await expect(page.getByText("Subtotal").locator("..")).toContainText("$116.00");
  });

  test("removes a cart item and returns to the empty state", async ({ page }) => {
    await addMockProductToCart(page);

    await page.getByRole("button", { name: "Remove" }).click();

    await expect(page.getByText("Your cart is empty. Begin with the newest Mystique rituals.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Continue shopping" })).toBeVisible();
  });

  test("validates empty checkout when cart has no items", async ({ page }) => {
    await page.goto("/checkout");

    await expect(page.getByRole("heading", { level: 2, name: "Order summary" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Stripe unavailable" })).toBeDisabled();
  });

  test("shows stripe unavailable when stripe is not configured", async ({ page }) => {
    await addMockProductToCart(page);
    await page.goto("/checkout");

    await expect(page.getByRole("button", { name: "Stripe unavailable" })).toBeDisabled();
    await expect(page.getByText("Stripe checkout is not configured yet.")).toBeVisible();
  });

  test("shows validation errors returned by checkout state", async ({ page }) => {
    await page.goto("/checkout?status=validation&message=Postal%20code%20is%20required.");

    await expect(page.getByText("Postal code is required.")).toBeVisible();
  });

  test("shows contact form missing-fields error state", async ({ page }) => {
    await page.goto("/contact?status=missing");

    await expect(page.getByText("Please complete all fields before submitting.")).toBeVisible();
  });

  test("shows contact form email configuration error state", async ({ page }) => {
    await page.goto("/contact?status=email-error");

    await expect(page.getByText("We could not send your message right now.")).toBeVisible();
  });
});
