import { test, expect } from "@playwright/test";
import { expectMainNav } from "./helpers";

const primaryRoutes = [
  { path: "/", heading: "Where Beauty Transcends", title: /Mystique/i },
  { path: "/shop", heading: "Build your ritual by texture, need, and mood.", title: /Shop/i },
  { path: "/ingredients", heading: "Ingredients with intention.", title: /Ingredients/i },
  { path: "/routines", heading: "Not sure where to start?", title: /Routines/i },
  { path: "/journal", heading: "Rituals, guides, and glow notes.", title: /Journal/i },
  { path: "/about", heading: "Luxury ritual, reimagined.", title: /About/i },
  { path: "/faq", heading: "Questions, answered softly.", title: /FAQ/i },
  { path: "/contact", heading: "Reach the Mystique team.", title: /Contact/i },
  { path: "/press", heading: "Featured In", title: /Press/i },
  { path: "/privacy", heading: "Privacy Policy", title: /Privacy/i },
  { path: "/terms", heading: "Terms of Service", title: /Terms/i },
  { path: "/cookies", heading: "Cookie Policy", title: /Cookie/i },
];

test.describe("storefront smoke coverage", () => {
  for (const route of primaryRoutes) {
    test(`renders ${route.path}`, async ({ page }) => {
      await page.goto(route.path);
      await expect(page).toHaveTitle(route.title);
      await expect(page.getByRole("heading", { level: 1, name: route.heading })).toBeVisible();
      await expectMainNav(page);
      await expect(page.getByRole("link", { name: "Privacy Policy" })).toBeVisible();
    });
  }

  test("supports desktop navigation to key destinations", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header").first();

    await header.getByRole("link", { name: "Shop", exact: true }).click();
    await expect(page).toHaveURL(/\/shop$/);

    await page.locator("header").first().getByRole("link", { name: "Ingredients", exact: true }).click();
    await expect(page).toHaveURL(/\/ingredients$/);

    await page.locator("header").first().getByRole("link", { name: "Journal", exact: true }).click();
    await expect(page).toHaveURL(/\/journal$/);
  });

  test("supports mobile menu navigation", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await page.getByText("Menu").click();
    await page.getByRole("link", { name: "Cart (0)" }).click();

    await expect(page).toHaveURL(/\/cart$/);
    await expect(page.getByRole("heading", { level: 1, name: "Your ritual bag" })).toBeVisible();
  });

  test("renders journal and article detail pages", async ({ page }) => {
    await page.goto("/journal");
    await page.getByRole("link", { name: "Read entry" }).first().click();

    await expect(page).toHaveURL(/\/journal\/.+/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2 }).first()).toBeVisible();
  });
});
