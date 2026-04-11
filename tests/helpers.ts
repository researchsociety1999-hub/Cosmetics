import { expect, type Page } from "@playwright/test";

export async function gotoAndWait(page: Page, path: string) {
  await page.goto(path, { waitUntil: "networkidle" });
}

export async function expectHeading(page: Page, name: string) {
  await expect(page.getByRole("heading", { name })).toBeVisible();
}

export async function addFirstVisibleProductToCart(page: Page) {
  await gotoAndWait(page, "/shop");
  await expectHeading(page, "Build your ritual by texture, need, and mood.");

  const addToCartButton = page.getByRole("button", { name: /add to (cart|bag)/i }).first();
  await expect(addToCartButton).toBeVisible();
  await addToCartButton.click();
}

export async function addProductToCart(
  page: Page,
  slug = "celestial-glow-serum",
  quantity = 1,
) {
  await gotoAndWait(page, `/products/${slug}`);

  if (quantity > 1) {
    const quantityInput = page.locator('input[name="quantity"]');
    await expect(quantityInput).toBeVisible();
    await quantityInput.fill(String(quantity));
  }

  const addToCartForm = page
    .locator("form")
    .filter({ has: page.locator('input[name="redirectTo"][value="cart"]') });
  await addToCartForm
    .getByRole("button", { name: /add to (cart|bag)/i })
    .click();
  await expect(page).toHaveURL(/\/cart$/);
}
