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

  const addToCartButton = page.getByRole("button", { name: "Add to cart" }).first();
  await expect(addToCartButton).toBeVisible();
  await addToCartButton.click();
}
