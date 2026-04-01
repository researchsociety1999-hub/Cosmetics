import { expect, type Page } from "@playwright/test";

export const mockProduct = {
  id: 1,
  name: "Celestial Glow Serum",
  slug: "celestial-glow-serum",
  categorySlug: "serums",
  price: "$58.00",
};

export async function expectMainNav(page: Page) {
  const header = page.locator("header").first();
  await expect(header.getByRole("link", { name: "Shop", exact: true })).toBeVisible();
  await expect(header.getByRole("link", { name: "Journal", exact: true })).toBeVisible();
  await expect(header.getByRole("link", { name: "Contact", exact: true })).toBeVisible();
}

export async function addMockProductToCart(page: Page) {
  await page.goto("/products/celestial-glow-serum");
  await expect(page.getByRole("heading", { level: 1, name: mockProduct.name })).toBeVisible();
  const productForm = page.locator("form").filter({
    has: page.locator('input[name="redirectTo"][value="cart"]'),
  });
  await productForm.getByRole("button", { name: "Add to cart" }).click();
  await page.waitForURL("**/cart");
  await expect(page.getByRole("heading", { level: 1, name: "Your ritual bag" })).toBeVisible();
}

export async function getFirstCatalogProduct(page: Page) {
  const firstCard = page.locator("main article").first();
  const productLink = firstCard.locator('a[href^="/products/"]').nth(1);
  const name = (await productLink.innerText()).trim();
  const href = await productLink.getAttribute("href");

  if (!href) {
    throw new Error("Expected the first catalog product to have an href.");
  }

  return { name, href };
}

export function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
