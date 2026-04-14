import { expect, type Page } from "@playwright/test";

function isShopPath(path: string) {
  const pathname = path.split("?")[0]?.replace(/\/$/, "") ?? "";
  return pathname === "/shop";
}

export async function gotoAndWait(page: Page, path: string) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("load");
  if (isShopPath(path)) {
    const search = page.getByRole("searchbox", { name: /search shop/i });
    await expect(search).toBeVisible({ timeout: 60_000 });
    await expect(search).toBeEnabled({ timeout: 60_000 });
  }
}

export async function expectHeading(
  page: Page,
  name: string,
  options?: { level?: 1 | 2 | 3 | 4 | 5 | 6 },
) {
  await expect(
    page.getByRole("heading", {
      name,
      ...(options?.level != null ? { level: options.level } : {}),
    }),
  ).toBeVisible();
}

export async function addFirstVisibleProductToCart(page: Page) {
  await gotoAndWait(page, "/shop");
  await expectHeading(page, "Shop", { level: 1 });

  const addToCartButton = page.getByRole("button", { name: /add to (cart|bag)/i }).first();
  await expect(addToCartButton).toBeVisible();
  await addToCartButton.click();
}

/** Valid US shipping payload for `/api/create-checkout-session` integration tests. */
export const SAMPLE_CHECKOUT_SHIPPING = {
  fullName: "Mystique Test User",
  email: "checkout-e2e@example.com",
  addressLine1: "1200 Market Street",
  addressLine2: "",
  city: "Austin",
  state: "TX",
  postalCode: "78701",
  country: "United States",
} as const;

export async function addProductToCart(
  page: Page,
  slug = "celestial-glow-serum",
  quantity = 1,
) {
  await gotoAndWait(page, `/products/${slug}`);
  const purchase = page.locator("#product-purchase-block");
  await expect(purchase).toBeVisible({ timeout: 30_000 });

  if (quantity > 1) {
    const quantityInput = purchase.locator('input[type="number"]').first();
    await expect(quantityInput).toBeVisible();
    await quantityInput.fill(String(quantity));
  }

  const addButton = purchase.getByRole("button", { name: /^add to bag$/i });
  await expect(addButton).toBeEnabled({ timeout: 20_000 });
  await Promise.all([
    page.waitForURL(/\/cart$/, { timeout: 30_000 }),
    addButton.click(),
  ]);
  await page.waitForLoadState("load");
}
