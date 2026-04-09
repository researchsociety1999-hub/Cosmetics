import { expect, test } from "@playwright/test";
import { expectHeading, gotoAndWait } from "./helpers";

test.describe("catalog and discovery", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test("search page returns matching products for bloom skin", async ({ page }) => {
    await gotoAndWait(page, "/search?q=bloom%20skin");

    await expectHeading(page, "Find a ritual");
    await expect(page.getByDisplayValue("bloom skin")).toBeVisible();
    await expect(page.getByText("No results for")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Celestial Glow Serum" })).toBeVisible();
  });

  test("shop search narrows the catalog", async ({ page }) => {
    await gotoAndWait(page, "/shop");

    const searchInput = page.locator("#shop-search");
    await searchInput.fill("serum");
    await searchInput.press("Enter");

    await expect(page).toHaveURL(/search=serum/);
    await expect(page.getByRole("link", { name: "Celestial Glow Serum" })).toBeVisible();
  });

  test("product details page renders a real product", async ({ page }) => {
    await gotoAndWait(page, "/products/celestial-glow-serum");

    await expectHeading(page, "Celestial Glow Serum");
    await expect(page.getByText("Treat step")).toBeVisible();
    await expect(page.getByRole("button", { name: "Add to cart" })).toBeVisible();
  });
});
