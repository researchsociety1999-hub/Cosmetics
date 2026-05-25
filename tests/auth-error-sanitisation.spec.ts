import { expect, test } from "@playwright/test";
import { gotoAndWait } from "./helpers";

/**
 * M4 — Auth error sanitisation (skipped by default)
 *
 * Verifies that the auth error UI never leaks raw Supabase / internal error
 * messages to the browser (e.g. "relation \"auth.users\" does not exist",
 * Postgres error codes, stack traces).
 *
 * HOW TO ENABLE
 * Set the environment variable BREAK_AUTH_ERRORS=1 before running:
 *
 *   BREAK_AUTH_ERRORS=1 npx playwright test tests/auth-error-sanitisation.spec.ts
 *
 * Without that flag the test is skipped so it never fails in CI unless you
 * deliberately opt-in to the destructive probe.
 */

const ENABLED = process.env.BREAK_AUTH_ERRORS === "1";

test.describe("M4 — auth error sanitisation", () => {
  test.skip(!ENABLED, "Set BREAK_AUTH_ERRORS=1 to run this destructive probe");

  test("M4: login with bad credentials does not expose raw error detail", async ({
    page,
  }) => {
    await gotoAndWait(page, "/account/login");

    // Fill deliberately wrong credentials.
    await page.getByLabel(/email/i).fill("nonexistent@example.invalid");
    await page.getByLabel(/password/i).fill("WRONG_PASSWORD_123!");
    await page.getByRole("button", { name: /sign in|log in/i }).click();

    // Wait for the error feedback to appear.
    const errorRegion = page
      .getByRole("alert")
      .or(page.locator("[aria-live]"))
      .first();
    await expect(errorRegion).toBeVisible({ timeout: 15_000 });

    const errorText = await errorRegion.innerText();

    // Must NOT contain raw Postgres / Supabase internals.
    const forbidden = [
      /relation .* does not exist/i,
      /postgres/i,
      /supabase/i,
      /pg_/i,
      /error code/i,
      /stack trace/i,
      /at Object\./i,
    ];
    for (const pattern of forbidden) {
      expect(
        errorText,
        `Auth error UI must not expose: ${pattern}`,
      ).not.toMatch(pattern);
    }

    // Must show a human-friendly message.
    expect(errorText.trim().length).toBeGreaterThan(0);
  });
});
