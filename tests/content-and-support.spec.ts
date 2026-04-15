import { expect, test } from "@playwright/test";
import { expectHeading, gotoAndWait } from "./helpers";

test.describe("content and support routes", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test("ingredients page renders the ingredient library", async ({ page }) => {
    await gotoAndWait(page, "/ingredients");

    await expectHeading(page, "Ingredients with intention.");
    await expect(page.getByRole("heading", { name: "Niacinamide", exact: true }).first()).toBeVisible();
    await expect(page.getByText("Hydration-first textures")).toBeVisible();
  });

  test("journal page exposes editorial entries", async ({ page }) => {
    await gotoAndWait(page, "/journal");

    await expectHeading(page, "Skincare reads, written with care.");
    await expect(
      page.getByRole("heading", { name: "Bloom Skin: Luminosity in Measure", exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Read the essay" }).first()).toBeVisible();
  });

  test("faq page expands answers for shoppers", async ({ page }) => {
    await gotoAndWait(page, "/faq");

    await expectHeading(page, "Questions, answered softly.");
    await page.getByText("How long does shipping take?", { exact: true }).click();
    await expect(page.getByText(/three to five business days/i)).toBeVisible();
  });

  test("contact page shows support information", async ({ page }) => {
    await gotoAndWait(page, "/contact");

    await expectHeading(page, "Write the studio.");
    await expect(page.getByRole("button", { name: "Send message" })).toBeVisible();
    await expect(page.getByText("Studio inbox", { exact: true })).toBeVisible();
  });

  test("unknown product slugs show a not found storefront state", async ({ page }) => {
    await gotoAndWait(page, "/products/not-a-real-ritual");

    await expectHeading(page, "We couldn't find that ritual.");
    await expect(page.getByText(/This ritual is not available right now/i)).toBeVisible();
    await expect(page.getByRole("link", { name: "Shop the collection" })).toBeVisible();
  });
});
