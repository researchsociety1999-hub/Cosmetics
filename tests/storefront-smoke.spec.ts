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
  { path: "/account/login", heading: "Sign in to Mystique" },
  { path: "/account/signup", heading: "Create your Mystique account" },
  { path: "/press", heading: "Featured In", title: /Press/i },
  { path: "/privacy", heading: "Privacy Policy", title: /Privacy/i },
  { path: "/terms", heading: "Terms of Service", title: /Terms/i },
  { path: "/cookies", heading: "Cookie Policy", title: /Cookie/i },
];

test.describe("storefront smoke coverage", () => {
  for (const route of primaryRoutes) {
    test(`renders ${route.path}`, async ({ page }) => {
      await page.goto(route.path);
      if (route.title) {
        await expect(page).toHaveTitle(route.title);
      }
      await expect(page.getByRole("heading", { level: 1, name: route.heading })).toBeVisible();
      await expectMainNav(page);
      await expect(page.getByRole("link", { name: "Privacy Policy" })).toBeVisible();
    });
  }

  test("supports desktop navigation to key destinations", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header").first();

    await Promise.all([
      page.waitForURL(/\/shop$/),
      header.getByRole("link", { name: "Shop", exact: true }).click(),
    ]);
    await expect(page).toHaveURL(/\/shop$/);

    await Promise.all([
      page.waitForURL(/\/ingredients$/),
      page.locator("header").first().getByRole("link", { name: "Ingredients", exact: true }).click(),
    ]);
    await expect(page).toHaveURL(/\/ingredients$/);

    await Promise.all([
      page.waitForURL(/\/journal$/),
      page.locator("header").first().getByRole("link", { name: "Journal", exact: true }).click(),
    ]);
    await expect(page).toHaveURL(/\/journal$/);
  });

  test("supports mobile menu navigation", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await page.getByText("Menu").click();
    await Promise.all([
      page.waitForURL(/\/cart$/),
      page.getByRole("link", { name: "Cart (0)" }).click(),
    ]);

    await expect(page).toHaveURL(/\/cart$/);
    await expect(page.getByRole("heading", { level: 1, name: "Your ritual bag" })).toBeVisible();
  });

  test("renders journal and article detail pages", async ({ page }) => {
    await page.goto("/journal");
    const entryHref = await page.getByRole("link", { name: "Read entry" }).first().getAttribute("href");

    if (!entryHref) {
      throw new Error("Expected the first journal entry to have a detail href.");
    }

    await page.goto(entryHref);

    await expect(page).toHaveURL(/\/journal\/.+/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2 }).first()).toBeVisible();
  });

  test("renders account status states and auth error page", async ({ page }) => {
    await page.goto("/account/login?status=confirmed");
    await expect(
      page.getByText("Your email is confirmed. You can now sign in to your Mystique account."),
    ).toBeVisible();

    await page.goto("/account/login?status=auth-error");
    await expect(
      page.getByText("We couldn't verify that sign-in link. Request a fresh magic link and try again."),
    ).toBeVisible();

    await page.goto("/account/signup?status=check-email&email=tester%40example.com");
    await expect(
      page.getByText("Check tester@example.com for your Mystique link."),
    ).toBeVisible();

    await page.goto("/auth/error?message=Expired%20link");
    await expect(page.getByRole("heading", { level: 1, name: "We couldn't complete sign-in." })).toBeVisible();
    await expect(page.getByText("Expired link")).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to login" })).toBeVisible();
  });
});
