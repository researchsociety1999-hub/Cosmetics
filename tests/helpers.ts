import { expect, type Page } from "@playwright/test";

export type CatalogProduct = {
  name: string;
  href: string;
  slug: string;
};

export async function expectMainNav(page: Page) {
  const header = page.locator("header").first();
  await expect(header.getByRole("link", { name: "Shop", exact: true })).toBeVisible();
  await expect(header.getByRole("link", { name: "Journal", exact: true })).toBeVisible();
  await expect(header.getByRole("link", { name: "Contact", exact: true })).toBeVisible();
}

export async function addFirstCatalogProductToCart(page: Page) {
  const product = await getFirstCatalogProduct(page);
  await page.goto(product.href);
  await expect(page.getByRole("heading", { level: 1, name: product.name })).toBeVisible();

  const productForm = page.locator("form").filter({
    has: page.locator('input[name="redirectTo"][value="cart"]'),
  });

  await Promise.all([
    page.waitForURL(/\/cart(?:\?|$)/, { timeout: 8_000 }).catch(() => null),
    productForm.getByRole("button", { name: "Add to cart" }).click(),
  ]);

  if (!/\/cart(?:\?|$)/.test(page.url())) {
    await page.goto("/cart");
  }

  await expect(page.getByRole("heading", { level: 1, name: "Your ritual bag" })).toBeVisible();
}

export async function getFirstCatalogProduct(page: Page): Promise<CatalogProduct> {
  await page.goto("/shop");

  const firstCard = page.locator("main article").first();
  const productLink = firstCard.locator('a[href^="/products/"]').nth(1);
  const name = (await productLink.innerText()).trim();
  const href = await productLink.getAttribute("href");

  if (!href) {
    throw new Error("Expected the first catalog product to have an href.");
  }

  return {
    name,
    href,
    slug: href.replace(/^\/products\//, ""),
  };
}

export function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function expectOneOfTexts(page: Page, texts: string[]) {
  for (const text of texts) {
    const locator = page.getByText(text, { exact: false });
    if (await locator.count()) {
      await expect(locator.first()).toBeVisible();
      return;
    }
  }

  throw new Error(`Expected one of these texts to be visible: ${texts.join(" | ")}`);
}
