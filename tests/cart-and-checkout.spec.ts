import { test, expect } from "@playwright/test";
import { addFirstCatalogProductToCart } from "./helpers";

test.describe("cart and checkout flows", () => {
  test("adds a product from the PDP and shows it in the cart", async ({ page }) => {
    await addFirstCatalogProductToCart(page);

    await expect(page.locator("main article").getByRole("heading", { level: 2 }).first()).toBeVisible();
    await expect(page.getByText("Line total:")).toContainText("$");
    await expect(page.getByRole("link", { name: "Checkout" })).toBeVisible();
  });

  test("updates quantity and subtotal in cart", async ({ page }) => {
    await addFirstCatalogProductToCart(page);

    await page.locator('input[name="quantity"]').fill("2");
    await page.getByRole("button", { name: "Update" }).click();

    await expect(page.locator('input[name="quantity"]')).toHaveValue("2");
    await expect(page.getByText("Items").locator("..")).toContainText("2");
    // don't assert an exact subtotal (product price may differ in test DB)
    await expect(page.getByText("Subtotal").locator("..")).toContainText("$");
  });

  test("removes a cart item and returns to the empty state", async ({ page }) => {
    await addFirstCatalogProductToCart(page);

    await page.getByRole("button", { name: "Remove" }).click();

    await expect(page.getByText("Your cart is empty. Begin with the newest Mystique rituals.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Continue shopping" })).toBeVisible();
  });

  test("shows a validation message when applying an empty promo code", async ({ page }) => {
    await addFirstCatalogProductToCart(page);

    await page.getByRole("button", { name: "Apply code" }).click();

    await expect(page.getByText("Enter a promo code before applying it.")).toBeVisible();
  });

  test("shows promo removal state from query string", async ({ page }) => {
    await addFirstCatalogProductToCart(page);
    await page.goto("/cart?promo-status=removed");

    await expect(page.getByText("Promo code removed from your cart.")).toBeVisible();
  });

  test("shows promo unavailable state from query string", async ({ page }) => {
    await addFirstCatalogProductToCart(page);
    await page.goto("/cart?promo-status=unavailable");

    await expect(
      page.getByText("Promo codes are not configured right now. Please try again later."),
    ).toBeVisible();
  });

  test("validates empty checkout when cart has no items", async ({ page }) => {
    await page.goto("/checkout");

    await expect(page.getByRole("heading", { level: 1, name: "Checkout" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Order summary" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign in to checkout" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Create account" })).toBeVisible();
    await expect(
      page.getByText("Sign in first so checkout can load your authenticated Supabase cart."),
    ).toBeVisible();
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
    await addFirstCatalogProductToCart(page);
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

  test("protects order detail page for signed-out visitors", async ({ page }) => {
    await page.goto("/account/orders/test-order-id");

    await expect(page).toHaveURL(/\/account\/login$/);
    await expect(page.getByRole("heading", { level: 1, name: "Sign in to Mystique" })).toBeVisible();
  });

  test("shows cancelled checkout state", async ({ page }) => {
    await page.goto("/checkout?status=cancelled");

    await expect(
      page.getByText("Stripe checkout was cancelled. Your cart is still here, and you can try again whenever you are ready."),
    ).toBeVisible();
  });

  test("shows order creation error state", async ({ page }) => {
    await page.goto("/checkout?status=order-error");

    await expect(
      page.getByText("We could not create your order right now. Please try again in a moment."),
    ).toBeVisible();
  });

  test("shows Stripe startup error state", async ({ page }) => {
    await page.goto("/checkout?status=stripe-error");

    await expect(
      page.getByText("We could not start secure checkout right now. Please try again in a moment."),
    ).toBeVisible();
  });

  test("shows contact form missing-fields error state", async ({ page }) => {
    await page.goto("/contact?status=missing");

    await expect(page.getByText("Please complete all fields before submitting.")).toBeVisible();
  });

  test("shows contact form email configuration error state", async ({ page }) => {
    await page.goto("/contact?status=email-error");

    await expect(page.getByText("We could not send your message right now.")).toBeVisible();
  });

  test("shows contact form sent state", async ({ page }) => {
    await page.goto("/contact?status=sent");

    await expect(
      page.getByText("Thank you for reaching out. Our team will get back to you within"),
    ).toBeVisible();
  });
});
