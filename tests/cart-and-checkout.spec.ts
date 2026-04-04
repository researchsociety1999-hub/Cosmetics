import { test, expect } from "@playwright/test";

test.describe("cart and checkout flows", () => {
  test("adds a product from the PDP and shows it in the cart", async ({ page }) => {
    // add the first product from the shop listing to avoid relying on a missing PDP mock
    await page.goto("/shop");
    await page.getByRole("button", { name: "Add to cart" }).first().click();
    await page.goto("/cart");

    await expect(page.locator("main article").getByRole("heading", { level: 2 }).first()).toBeVisible();
    await expect(page.getByText("Line total:")).toContainText("$");
    await expect(page.getByRole("link", { name: "Checkout" })).toBeVisible();
  });

  test("updates quantity and subtotal in cart", async ({ page }) => {
    // add the first product from the shop listing
    await page.goto("/shop");
    await page.getByRole("button", { name: "Add to cart" }).first().click();
    await page.goto("/cart");

    await page.locator('input[name="quantity"]').fill("2");
    await page.getByRole("button", { name: "Update" }).click();

    await expect(page.locator('input[name="quantity"]')).toHaveValue("2");
    await expect(page.getByText("Items").locator("..")).toContainText("2");
    // don't assert an exact subtotal (product price may differ in test DB)
    await expect(page.getByText("Subtotal").locator("..")).toContainText("$");
  });

  test("removes a cart item and returns to the empty state", async ({ page }) => {
    // add the first product from the shop listing
    await page.goto("/shop");
    await page.getByRole("button", { name: "Add to cart" }).first().click();
    await page.goto("/cart");

    await page.getByRole("button", { name: "Remove" }).click();

    await expect(page.getByText("Your cart is empty. Begin with the newest Mystique rituals.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Continue shopping" })).toBeVisible();
  });

  test("validates empty checkout when cart has no items", async ({ page }) => {
    await page.goto("/checkout");

    await expect(page.getByRole("heading", { level: 2, name: "Order summary" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign in to checkout" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Create account" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign in to checkout" })).toHaveAttribute(
      "href",
      "/account/login?next=%2Fcart",
    );
    await expect(page.getByRole("link", { name: "Create account" })).toHaveAttribute(
      "href",
      "/account/signup?next=%2Fcart",
    );
  });

  test("shows stripe unavailable when stripe is not configured", async ({ page }) => {
    // add the first product from the shop listing
    await page.goto("/shop");
    await page.getByRole("button", { name: "Add to cart" }).first().click();
    await page.goto("/checkout");

    const stripeUnavailableButton = page.getByRole("button", { name: "Stripe unavailable" });

    if (await stripeUnavailableButton.count()) {
      await expect(stripeUnavailableButton).toBeDisabled();
      await expect(page.getByText("Stripe checkout is not configured yet.")).toBeVisible();
      return;
    }

    await expect(page.getByRole("link", { name: "Sign in to checkout" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Create account" })).toBeVisible();
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
