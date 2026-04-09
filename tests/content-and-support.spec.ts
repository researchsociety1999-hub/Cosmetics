import { expect, test } from "@playwright/test";
import { expectHeading, gotoAndWait } from "./helpers";

test.describe("content and support routes", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test("ingredients page renders the ingredient library", async ({ page }) => {
    await gotoAndWait(page, "/ingredients");

    await expectHeading(page, "Ingredients with intention.");
    await expect(page.getByRole("heading", { name: "Niacinamide", exact: true })).toBeVisible();
    await expect(page.getByText("Hydration-first textures")).toBeVisible();
  });

  test("journal page exposes editorial entries", async ({ page }) => {
    await gotoAndWait(page, "/journal");

    await expectHeading(page, "Rituals, guides, and glow notes.");
    await expect(page.getByRole("heading", { name: "The Bloom Skin Guide", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Read entry" }).first()).toBeVisible();
  });

  test("faq page expands answers for shoppers", async ({ page }) => {
    await gotoAndWait(page, "/faq");

    await expectHeading(page, "Questions, answered softly.");
    await page.getByText("How quickly will my order arrive?", { exact: true }).click();
    await expect(page.getByText(/3 to 5 business days/i)).toBeVisible();
  });

  test("contact page shows support information", async ({ page }) => {
    await gotoAndWait(page, "/contact");

    await expectHeading(page, "Reach the Mystique team.");
    await expect(page.getByText("Email: hello@mystique.com")).toBeVisible();
    await expect(page.getByRole("button", { name: "Send message" })).toBeVisible();
  });

  test("unknown product slugs show a not found storefront state", async ({ page }) => {
    await gotoAndWait(page, "/products/not-a-real-ritual");

    await expectHeading(page, "We couldn't find that ritual.");
    await expect(page.getByText("Product not found", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Shop the collection" })).toBeVisible();
  });
});
