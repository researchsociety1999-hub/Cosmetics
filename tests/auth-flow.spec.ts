import { expect, test } from "@playwright/test";
import { expectHeading, gotoAndWait } from "./helpers";

/**
 * Auth flow tests
 *
 * Run against the mock-catalog build (ALLOW_MOCK_CATALOG=1, port 3001).
 * Real Supabase OTP calls are NOT made — we verify UI surfaces,
 * routing, and server-side guard behaviour only.
 */
test.describe("auth flow", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  // ── Sign-in page ──────────────────────────────────────────────────────────

  test("sign-in page renders email form and account creation link", async ({ page }) => {
    await gotoAndWait(page, "/account/login");

    await expectHeading(page, "Sign in");
    await expect(page.getByRole("textbox", { name: /email/i })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /send magic link|sign in/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /create account/i })).toBeVisible();
  });

  test("sign-in shows 'check your email' confirmation after a valid email is submitted", async ({
    page,
  }) => {
    await gotoAndWait(page, "/account/login");

    await page.getByRole("textbox", { name: /email/i }).fill("e2e-test@example.com");
    await page.getByRole("button", { name: /send magic link|sign in/i }).click();

    // UI transitions to confirmation state — no real OTP sent in mock mode.
    await expect(
      page.getByText(/check your email|magic link sent|link on its way/i),
    ).toBeVisible({ timeout: 20_000 });
  });

  test("sign-in shows an error or blocks submission for an invalid email", async ({ page }) => {
    await gotoAndWait(page, "/account/login");

    await page.getByRole("textbox", { name: /email/i }).fill("not-an-email");
    await page.getByRole("button", { name: /send magic link|sign in/i }).click();

    const emailInput = page.getByRole("textbox", { name: /email/i });
    const nativeValid = await emailInput.evaluate(
      (el) => (el as HTMLInputElement).validity.valid,
    );

    if (!nativeValid) {
      expect(nativeValid).toBe(false);
    } else {
      await expect(
        page.getByText(/invalid email|enter a valid email|please check your email/i),
      ).toBeVisible({ timeout: 10_000 });
    }
  });

  // ── Create account page ───────────────────────────────────────────────────

  test("create-account page renders and links back to sign-in", async ({ page }) => {
    await gotoAndWait(page, "/account/signup");

    await expectHeading(page, "Create account");
    await expect(page.getByRole("textbox", { name: /email/i })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /create account|send magic link/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible();
  });

  // ── /auth/confirm guards ──────────────────────────────────────────────────

  test("/auth/confirm with no token redirects or shows an error — does not crash", async ({
    page,
  }) => {
    await page.goto("/auth/confirm", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("load");

    const url = page.url();
    const isRedirectedToLogin = /\/account(\/login)?/.test(url);
    const hasErrorText = await page
      .getByText(/invalid|expired|link.*not valid|something went wrong/i)
      .isVisible()
      .catch(() => false);

    expect(isRedirectedToLogin || hasErrorText).toBe(true);
  });

  test("/auth/confirm with a malformed token shows an error or redirects safely", async ({
    page,
  }) => {
    await page.goto("/auth/confirm?token_hash=totally-fake-token&type=magiclink", {
      waitUntil: "domcontentloaded",
    });
    await page.waitForLoadState("load");

    const url = page.url();
    const isRedirectedToLogin = /\/account(\/login)?/.test(url);
    const hasErrorText = await page
      .getByText(/invalid|expired|link.*not valid|something went wrong/i)
      .isVisible()
      .catch(() => false);

    expect(isRedirectedToLogin || hasErrorText).toBe(true);
  });

  // ── Unauthenticated account guard ─────────────────────────────────────────

  test("guest /account shows sign-in CTA, not a signed-in dashboard", async ({ page }) => {
    await gotoAndWait(page, "/account");

    await expectHeading(page, "Sign in to your Mystique account");
    await expect(page.getByRole("button", { name: /sign out|log out/i })).toHaveCount(0);
    await expect(page.getByText(/order history/i)).toHaveCount(0);
  });
});
