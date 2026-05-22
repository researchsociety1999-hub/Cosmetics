/**
 * e2e/checkout-stripe.spec.ts
 * Playwright E2E — Stripe checkout happy path.
 *
 * Prerequisites:
 *   - PLAYWRIGHT_BASE_URL set in your .env.test (default: http://localhost:3000)
 *   - At least one published, in-stock product
 *   - Stripe test mode active
 *   - Use Stripe test card: 4242 4242 4242 4242
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

test.describe('Stripe Checkout — Happy Path', () => {
  test('adds product to cart and proceeds to Stripe checkout', async ({ page }) => {
    // 1. Visit the shop
    await page.goto(`${BASE_URL}/shop`);
    await expect(page).toHaveURL(/\/shop/);

    // 2. Click the first visible product card
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await expect(firstProduct).toBeVisible();
    await firstProduct.click();

    // 3. We should be on a product detail page
    await expect(page).toHaveURL(/\/products\//);

    // 4. Click Add to Cart
    const addToCart = page.getByRole('button', { name: /add to cart/i });
    await expect(addToCart).toBeVisible();
    await addToCart.click();

    // 5. Navigate to cart
    await page.goto(`${BASE_URL}/cart`);
    await expect(page).toHaveURL(/\/cart/);

    // 6. Cart should have at least one item
    const cartItem = page.locator('[data-testid="cart-item"]').first();
    await expect(cartItem).toBeVisible();

    // 7. Click checkout button
    const checkoutBtn = page.getByRole('button', { name: /checkout/i });
    await expect(checkoutBtn).toBeVisible();
    await checkoutBtn.click();

    // 8. Should redirect to Stripe (stripe.com) or checkout success
    // Stripe hosted checkout redirects to stripe.com — wait for navigation
    await page.waitForURL(/stripe\.com|checkout\.stripe\.com|\/checkout/, {
      timeout: 15_000,
    });

    // If on Stripe hosted checkout, verify the page loaded
    const url = page.url();
    const onStripe =
      url.includes('stripe.com') || url.includes('checkout.stripe.com');
    const onLocalCheckout = url.includes('/checkout');

    expect(onStripe || onLocalCheckout).toBe(true);
  });

  test('checkout success page renders order confirmation', async ({ page }) => {
    // Simulate returning from a Stripe-success redirect
    // In test mode, Stripe appends ?session_id=cs_test_...
    // This test visits the success URL directly with a mock session param
    await page.goto(
      `${BASE_URL}/checkout?success=true&session_id=cs_test_mock_session`
    );

    // Expect some confirmation signal — adjust selector to match your actual page
    const confirmation = page
      .getByText(/order confirmed|thank you|your order/i)
      .first();
    await expect(confirmation).toBeVisible({ timeout: 10_000 });
  });
});
