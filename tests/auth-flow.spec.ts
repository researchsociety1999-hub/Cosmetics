import { expect, test } from "@playwright/test";
import { expectHeading, gotoAndWait } from "./helpers";

/**
 * Auth flow tests
 *
 * Uses data-testid selectors on the email inputs to avoid strict-mode
 * violations caused by the footer NewsletterForm rendering a second
 * email textbox on every page.
 */
test.describe("auth flow", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  // ── Login page renders ────────────────────────────────────────────────────

  test("login page renders email input and submit button", async ({ page }) => {
    await gotoAndWait(page, "/account/login");
    await expectHeading(page, "Sign in to Mystique");
    await expect(page.getByTestId("login-email-input")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /send magic link/i }),
    ).toBeVisible();
  });

  // ── Signup page renders ───────────────────────────────────────────────────

  test("signup page renders email input and submit button", async ({ page }) => {
    await gotoAndWait(page, "/account/signup");
    await expectHeading(page, "Create your Mystique account");
    await expect(page.getByTestId("signup-email-input")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /create account/i }),
    ).toBeVisible();
  });

  // ── Create account flow ───────────────────────────────────────────────────

  test("create account: submitting a valid email shows check-email status", async ({ page }) => {
    await gotoAndWait(page, "/account/signup");
    await page.getByTestId("signup-email-input").fill("e2e-test@example.com");
    await page.getByRole("button", { name: /create account/i }).click();
    // After form submission the page should reload with ?status=check-email
    // or remain on the page with a status message — either is valid.
    await page.waitForLoadState("load");
    const url = page.url();
    const hasStatusParam = url.includes("status=");
    const hasStatusMessage = await page
      .getByText(/check.*email|magic link|sent/i)
      .isVisible()
      .catch(() => false);
    expect(hasStatusParam || hasStatusMessage).toBe(true);
  });

  // ── Login flow ────────────────────────────────────────────────────────────

  test("login: submitting a valid email shows check-email status", async ({ page }) => {
    await gotoAndWait(page, "/account/login");
    await page.getByTestId("login-email-input").fill("e2e-test@example.com");
    await page.getByRole("button", { name: /send magic link/i }).click();
    await page.waitForLoadState("load");
    const url = page.url();
    const hasStatusParam = url.includes("status=");
    const hasStatusMessage = await page
      .getByText(/check.*email|magic link|sent/i)
      .isVisible()
      .catch(() => false);
    expect(hasStatusParam || hasStatusMessage).toBe(true);
  });

  // ── Guest /account access ─────────────────────────────────────────────────

  test("unauthenticated /account redirects to login", async ({ page }) => {
    await page.goto("/account", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("load");
    // Should either redirect to /account/login or render the login page inline
    const url = page.url();
    const onLoginPage = url.includes("/account/login") || url.includes("/account/signup");
    const hasLoginHeading = await page
      .getByRole("heading", { name: /sign in|create.*account/i })
      .isVisible()
      .catch(() => false);
    expect(onLoginPage || hasLoginHeading).toBe(true);
  });
});
