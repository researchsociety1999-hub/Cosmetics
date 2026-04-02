import { test, expect } from "@playwright/test";
import { getFirstCatalogProduct, mockProduct } from "./helpers";

test.describe("catalog and discovery flows", () => {
  test("shop search narrows the catalog", async ({ page }) => {
    await page.goto("/shop");
    const firstProduct = await getFirstCatalogProduct(page);

    await page.getByLabel("Search products").fill(firstProduct.name);
    await page.getByLabel("Search products").press("Enter");

    await expect
      .poll(() => new URL(page.url()).searchParams.get("search"))
      .toBe(firstProduct.name);
    await expect(
      page.locator("main").getByRole("link", { name: firstProduct.name, exact: true }),
    ).toBeVisible();
  });

  test("shop category chips filter products", async ({ page }) => {
    await page.goto("/shop");
    const categoryLink = page.locator('main a[href*="/shop?category="]').first();
    const categoryHref = await categoryLink.getAttribute("href");

    if (!categoryHref) {
      throw new Error("Expected at least one category chip link on the shop page.");
    }

    await categoryLink.click();

    await expect(page).toHaveURL(new RegExp(categoryHref.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    await expect(page.locator("main article").first()).toBeVisible();
  });

  test("search page performs live API-backed search", async ({ page }) => {
    await page.goto("/shop");
    const firstProduct = await getFirstCatalogProduct(page);
    await page.goto("/search");

    await page.getByLabel("Search query").fill(firstProduct.name);
    await expect
      .poll(() => new URL(page.url()).searchParams.get("q"))
      .toBe(firstProduct.name);
    await expect(
      page.locator("main").getByRole("link", { name: firstProduct.name, exact: true }),
    ).toBeVisible();
  });

  test("product detail page shows pricing, reviews, and related products", async ({ page }) => {
    await page.goto(`/products/${mockProduct.slug}`);

    await expect(page.getByRole("heading", { level: 1, name: mockProduct.name })).toBeVisible();
    await expect(page.getByText(mockProduct.price)).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Early product notes" })).toBeVisible();
    await expect(page.getByText("Velvety, glowy, and surprisingly elegant on combination skin.")).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Continue the ritual" })).toBeVisible();
  });

  test("unknown product route shows the not found state", async ({ page }) => {
    await page.goto("/products/not-a-real-product");

    await expect(page.getByRole("heading", { level: 1, name: "We couldn't find that ritual." })).toBeVisible();
    await expect(page.getByRole("link", { name: "Shop the collection" })).toBeVisible();
  });

  test("newsletter form accepts a valid email", async ({ page }) => {
    await page.goto("/");

    await page.getByLabel("Email address").fill("tester@example.com");
    await page.getByRole("button", { name: "Join the list" }).click();

    await expect(page.getByText("You're on the list.")).toBeVisible();
  });
});
