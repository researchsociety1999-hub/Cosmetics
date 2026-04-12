import { expect, test } from "@playwright/test";
import { expectHeading, gotoAndWait } from "./helpers";

test.describe("storefront smoke", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test("home page loads with core navigation", async ({ page }) => {
    await gotoAndWait(page, "/");

    await expectHeading(page, "Where Beauty Transcends");
    const siteHeader = page.getByRole("banner");
    await expect(siteHeader.getByRole("link", { name: "Shop", exact: true })).toBeVisible();
    await expect(
      siteHeader.getByRole("link", { name: "Ingredients", exact: true }),
    ).toBeVisible();
    await expect(siteHeader.getByRole("link", { name: "Search", exact: true })).toBeVisible();
  });

  test("core shopper routes return working pages", async ({ page }) => {
    await gotoAndWait(page, "/shop");
    await expectHeading(page, "Shop", { level: 1 });

    await gotoAndWait(page, "/search?q=bloom%20skin");
    await expectHeading(page, "Find a ritual");

    await gotoAndWait(page, "/cart");
    await expectHeading(page, "Your ritual bag");

    await gotoAndWait(page, "/about");
    await expectHeading(page, "Luxury ritual, reimagined.");
  });
});
