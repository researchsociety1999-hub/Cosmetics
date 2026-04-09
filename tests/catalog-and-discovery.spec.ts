import { expect, test } from "@playwright/test";
import { expectHeading, gotoAndWait } from "./helpers";

test.describe("catalog and discovery", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test("search page returns matching products for bloom skin", async ({ page }) => {
    await gotoAndWait(page, "/search?q=bloom%20skin");

    await expectHeading(page, "Find a ritual");
    await expect(page.locator("#search-query")).toHaveValue("bloom skin");
    await expect(page.getByText("No results for")).toHaveCount(0);
    await expect(page.locator('a[href^="/products/"]').first()).toBeVisible();
  });

  test("shop search narrows the catalog", async ({ page }) => {
    await gotoAndWait(page, "/shop");

    const searchInput = page.locator("#shop-search");
    await searchInput.fill("serum");
    await searchInput.press("Enter");

    await expect(page).toHaveURL(/search=serum/);
    await expect(page.locator('a[href^="/products/"]').first()).toBeVisible();
  });

  test("product details page renders a real product", async ({ page }) => {
    await gotoAndWait(page, "/products/celestial-glow-serum");

    await expectHeading(page, "Celestial Glow Serum");
    await expect(page.getByText("Treat step", { exact: true })).toBeVisible();
    const addToCartForm = page
      .locator("form")
      .filter({ has: page.locator('input[name="redirectTo"][value="cart"]') });
    await expect(addToCartForm.getByRole("button", { name: "Add to cart" })).toBeVisible();
  });

  test("search page shows an empty state for an unknown term", async ({ page }) => {
    await gotoAndWait(page, "/search?q=ultra-rare-ritual");

    await expectHeading(page, "Find a ritual");
    await expect(page.locator("#search-query")).toHaveValue("ultra-rare-ritual");
    await expect(page.getByText(/No results for/i)).toBeVisible();
  });
});
