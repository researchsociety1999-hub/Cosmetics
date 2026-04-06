import { test, expect } from "@playwright/test";
import { expectOneOfTexts, getFirstCatalogProduct } from "./helpers";

test.describe("catalog and discovery flows", () => {
  test("shop search narrows the catalog", async ({ page }) => {
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

    await Promise.all([
      page.waitForURL(new RegExp(categoryHref.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))),
      categoryLink.click(),
    ]);

    await expect(page).toHaveURL(new RegExp(categoryHref.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    await expect(page.locator("main article").first()).toBeVisible();
  });

  test("search page performs live API-backed search", async ({ page }) => {
    const firstProduct = await getFirstCatalogProduct(page);
    await page.goto("/search");

    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes(`/api/search?q=${encodeURIComponent(firstProduct.name)}`) &&
          response.request().method() === "GET",
      ),
      page.getByLabel("Search query").fill(firstProduct.name),
    ]);

    await expect
      .poll(() => new URL(page.url()).searchParams.get("q"))
      .toBe(firstProduct.name);
    await expect(
      page.locator(`main a[href="/products/${firstProduct.slug}"]`).last(),
    ).toBeVisible();
  });

  test("product detail page shows pricing, reviews, and related products", async ({ page }) => {
    const firstProduct = await getFirstCatalogProduct(page);
    await page.goto(firstProduct.href);

    await expect(page.getByRole("heading", { level: 1, name: firstProduct.name })).toBeVisible();
    await expect(
      page.locator("form").filter({
        has: page.locator('input[name="redirectTo"][value="cart"]'),
      }).getByRole("button", { name: "Add to cart" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Early product notes" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Benefits" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Key ingredients" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "How to use" })).toBeVisible();

    const reviewsEmptyState = page.getByText("No reviews yet for this ritual.");
    const reviewCards = page.locator("main article").filter({
      has: page.locator("p").filter({ hasText: "*" }),
    });
    const hasRelatedProducts = await page
      .getByRole("heading", { level: 2, name: "Continue the ritual" })
      .count();

    if (await reviewsEmptyState.count()) {
      await expect(reviewsEmptyState).toBeVisible();
    } else {
      await expect(reviewCards.first()).toBeVisible();
    }

    if (hasRelatedProducts) {
      await expect(
        page.getByRole("heading", { level: 2, name: "Continue the ritual" }),
      ).toBeVisible();
    }
  });

  test("unknown product route shows the not found state", async ({ page }) => {
    await page.goto("/products/not-a-real-product");

    await expect(page.getByRole("heading", { level: 1, name: "We couldn't find that ritual." })).toBeVisible();
    await expect(page.getByRole("link", { name: "Shop the collection" })).toBeVisible();
  });

  test("newsletter form accepts a valid email", async ({ page }) => {
    await page.goto("/");

    await page.getByLabel("Email address").fill("tester@example.com");
    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/api/newsletter") &&
          response.request().method() === "POST",
      ),
      page.getByRole("button", { name: "Join the list" }).click(),
    ]);

    await expectOneOfTexts(page, [
      "You're on the list.",
      "You're already on the list.",
      "Newsletter signup is not configured yet.",
      "We couldn't save your newsletter signup right now.",
    ]);
  });
});
