import { expect, test } from "@playwright/test";
import { expectHeading, gotoAndWait } from "./helpers";

test.describe("account hub and header account entry", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test("header account icon links to account page", async ({ page }) => {
    await gotoAndWait(page, "/");

    const account = page.getByRole("banner").getByRole("link", { name: "Account" });
    await expect(account).toBeVisible();
    await expect(account).toHaveAttribute("href", "/account");

    await account.click();
    await page.waitForURL(/\/account$/);
    await expectHeading(page, "Sign in to your Mystique account");
  });

  test("guest account page shows auth CTAs and policy strip without FAQ link", async ({
    page,
  }) => {
    await gotoAndWait(page, "/account");

    await expectHeading(page, "Sign in to your Mystique account");
    await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Create account" })).toBeVisible();

    const policies = page.getByRole("navigation", { name: "Account policies" });
    await expect(policies.getByRole("link", { name: /shipping/i })).toHaveAttribute(
      "href",
      "/faq",
    );
    await expect(policies.getByRole("link", { name: /terms of service/i })).toHaveAttribute(
      "href",
      "/terms",
    );
    await expect(policies.getByRole("link", { name: /privacy policy/i })).toHaveAttribute(
      "href",
      "/privacy",
    );
    await expect(policies.getByRole("link", { name: /^faq$/i })).toHaveCount(0);
    await expect(policies.getByRole("link", { name: /^contact$/i })).toHaveCount(0);
  });

  test("guest account page footer mentions FAQ and Contact in site footer copy", async ({
    page,
  }) => {
    await gotoAndWait(page, "/account");

    await expect(
      page.getByText(/FAQ and Contact live in the site footer/i),
    ).toBeVisible();
  });
});
