import { expect, test } from "@playwright/test";

/**
 * M4 — Auth error sanitisation
 *
 * SECURITY PROPERTY
 * Error messages shown to the user during authentication must never leak
 * internal details — raw Supabase/Postgres errors, stack traces, exception
 * text, or internal file/URL paths — and must not enable user enumeration.
 *
 * WHAT THIS SPEC ASSERTS (against the real magic-link auth flow):
 *   1. /auth/error rendered with a hostile `message` param (stuffed with
 *      "supabase", "postgres", stack-trace-like text, internal paths) collapses
 *      to a safe, generic message — the raw input is never echoed.
 *   2. A deliberately bad/malformed magic-link token (/auth/confirm) redirects
 *      to /account/login with a safe status message (link-invalid / auth-error /
 *      not-configured depending on backend config) — never a raw backend error.
 *   3. The pages still render (no unhandled crash) in every case.
 *
 * Runs in CI with NO opt-in flag (the previous BREAK_AUTH_ERRORS gate is gone).
 * Deterministic whether or not Supabase is configured in the test environment.
 */

/** Tokens that must never appear in a user-facing auth error message. */
const FORBIDDEN: Array<[string, RegExp]> = [
  ["supabase", /supabase/i],
  ["postgres", /postgres/i],
  ["sql", /\bsql\b/i],
  ["exception", /exception/i],
  ["stack", /stack/i],
  ["Error: (capital E)", /Error:/],
  ["internal path", /node_modules|\/var\/|webpack-internal|file:\/\//i],
];

function assertNoLeak(text: string) {
  for (const [label, pattern] of FORBIDDEN) {
    expect(text, `auth error UI must not expose: ${label}`).not.toMatch(pattern);
  }
}

test.describe("M4 — auth error sanitisation", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test("M4a: /auth/error never echoes raw backend detail in its message", async ({ page }) => {
    const hostile =
      'Error: relation "auth.users" does not exist — supabase postgres sql exception ' +
      "stack trace at /var/task/node_modules/@supabase/gotrue-js/dist/index.js";

    await page.goto(`/auth/error?message=${encodeURIComponent(hostile)}`, {
      waitUntil: "domcontentloaded",
    });

    // Page renders (no crash).
    await expect(
      page.getByRole("heading", { name: /could ?n.t complete sign-in/i }),
    ).toBeVisible();

    // The visible error message is the safe generic copy, not the hostile input.
    const mainText = await page.locator("main").first().innerText();
    assertNoLeak(mainText);
    await expect(
      page.getByText(/request a fresh magic link|could ?n.t verify that sign-in link/i),
    ).toBeVisible();
  });

  test("M4b: a malformed magic-link token shows a safe generic error", async ({ page }) => {
    // A bogus token_hash exercises the real verification path in /auth/confirm.
    await page.goto("/auth/confirm?token_hash=deadbeef-not-a-real-token&type=magiclink", {
      waitUntil: "domcontentloaded",
    });

    // The backend bounces the bad token back to the login page with a status.
    await page.waitForURL(/\/account\/login/, { timeout: 30_000 });
    await expect(page.getByRole("heading", { name: /sign in to mystique/i })).toBeVisible();

    const status = new URL(page.url()).searchParams.get("status");
    expect(["link-invalid", "auth-error", "not-configured"]).toContain(status);

    // A safe, generic status message is shown — and nothing internal leaks.
    const mainText = await page.locator("main").first().innerText();
    assertNoLeak(mainText);
    await expect(
      page.getByText(
        /expired|already used|no longer valid|could ?n.t verify|is ?n.t available|new magic link/i,
      ).first(),
    ).toBeVisible();
  });

  test("M4c: /auth/callback with a bogus code does not leak and stays safe", async ({ page }) => {
    await page.goto("/auth/callback?code=bogus-oauth-code-12345&next=/account", {
      waitUntil: "domcontentloaded",
    });

    await page.waitForURL(/\/account\/login/, { timeout: 30_000 });
    await expect(page.getByRole("heading", { name: /sign in to mystique/i })).toBeVisible();

    const status = new URL(page.url()).searchParams.get("status");
    expect(["auth-error", "not-configured"]).toContain(status);

    const mainText = await page.locator("main").first().innerText();
    assertNoLeak(mainText);
  });
});
