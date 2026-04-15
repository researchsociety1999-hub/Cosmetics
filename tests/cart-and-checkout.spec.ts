import { expect, test } from "@playwright/test";
import {
  addProductToCart,
  expectHeading,
  gotoAndWait,
  SAMPLE_CHECKOUT_SHIPPING,
} from "./helpers";

test.describe("cart and checkout", () => {
  test.describe.configure({ timeout: process.env.CI ? 120_000 : 90_000 });

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

  test("guest checkout shows shipping form, order summary, and sign-in CTAs", async ({
    page,
  }) => {
    await addProductToCart(page);
    await gotoAndWait(page, "/checkout");

    await expectHeading(page, "Checkout");
    await expect(page.getByRole("heading", { name: "Shipping address" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Order summary" })).toBeVisible();
    await expect(page.getByText(/Celestial Glow Serum/i).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign in to checkout" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Create account" })).toBeVisible();
    await expect(
      page.getByText("Sign in first so we can load your saved bag for checkout."),
    ).toBeVisible();
    await expect(
      page.getByText(/Sign in with your Mystique account to load your saved cart/i),
    ).toBeVisible();
  });

  test("checkout surfaces empty-bag and stripe messaging via query params", async ({
    page,
  }) => {
    await gotoAndWait(page, "/checkout?status=empty");
    await expectHeading(page, "Checkout");
    await expect(
      page.getByText(/Your bag is empty\. Add products before placing an order\./),
    ).toBeVisible();

    await gotoAndWait(page, "/checkout?status=stripe-error");
    await expect(
      page.getByText(/We could not start secure checkout right now/i),
    ).toBeVisible();
  });

  test("create-checkout-session rejects guests before Stripe (401 or integration 503)", async ({
    request,
  }) => {
    const response = await request.post("/api/create-checkout-session", {
      data: { ...SAMPLE_CHECKOUT_SHIPPING },
    });

    const status = response.status();
    expect([401, 503]).toContain(status);

    const body = (await response.json()) as {
      error?: string;
      code?: string;
    };

    if (status === 401) {
      expect(body.error ?? "").toMatch(/sign in/i);
    } else {
      expect(["store_unavailable", "stripe_unavailable"]).toContain(body.code);
    }
  });

  test("guest can update cart quantity and totals from the bag", async ({ page }) => {
    await addProductToCart(page);

    const quantityInput = page.locator('input[id^="qty-"]').first();
    await expect(quantityInput).toBeVisible();
    await quantityInput.fill("2");
    await expect(quantityInput).toHaveValue("2");

    const updateButton = page.getByRole("button", { name: "Update" }).first();
    await expect(updateButton).toBeVisible();
    await updateButton.click();
    // Mock Celestial Glow Serum: sale $58 × qty 2 → subtotal $116.00 (CartQuantityUpdateForm is controlled).
    await expect(page.locator("aside")).toContainText("$116.00", { timeout: 60_000 });
    await expect(page.locator('input[id^="qty-"]').first()).toHaveValue("2");
    await expect(page.locator("aside")).toContainText("Items");
    await expect(page.locator("aside")).toContainText("2");
  });

  test("guest can remove an item and return to the empty cart state", async ({ page }) => {
    await addProductToCart(page);

    const removeButton = page.getByRole("button", { name: "Remove" }).first();
    await expect(removeButton).toBeVisible();
    await removeButton.click();
    // Same-URL redirect after server action: wait for RSC to render empty-bag copy (no full navigation).
    await page.waitForFunction(
      () => document.body.innerText.includes("Your bag is empty"),
      null,
      { timeout: 75_000 },
    );
    await expect(page.getByRole("link", { name: "Continue shopping" })).toBeVisible();
    await expectHeading(page, "Your ritual bag");
  });
});
