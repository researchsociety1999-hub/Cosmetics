import { expect, test } from "@playwright/test";
import { gotoAndWait } from "./helpers";

/**
 * M4 — Auth error message sanitisation (manual env breakage required)
 *
 * This file is intentionally skipped by default. The intent is to verify
 * that when Supabase rejects auth requests with a leaky internal error
 * (e.g. a malformed JWT or PGRST-prefixed PostgREST message), the UI strips
 * those internals before showing the user.
 *
 * ── To run manually ─────────────────────────────────────────────────────────
 *
 *   1. Edit `next-app/.env.local` and set:
 *
 *        NEXT_PUBLIC_SUPABASE_ANON_KEY=invalid
 *
 *   2. Restart the dev / preview server so the env change is picked up
 *      (the Playwright webServer rebuilds via `npm --prefix next-app run
 *      build && npm --prefix next-app run start`).
 *
 *   3. Run only this file with the M4 grep and unskip it temporarily, e.g.:
 *
 *        npx playwright test tests/auth-error-sanitisation.spec.ts \
 *          --grep M4 --headed
 *
 *   4. Restore `.env.local` and rebuild after the manual check.
 *
 * NOTE: The actual login page in this repo lives at `/account/login`
 * (there is no `/auth/login` page — `/auth/` only hosts callback / confirm
 * routes). The test goes to `/account/login` accordingly.
 */
test.describe("M4 — auth error sanitisation (manual)", () => {
  test.skip(
    true,
    "M4 requires manually setting NEXT_PUBLIC_SUPABASE_ANON_KEY=invalid in next-app/.env.local and restarting the server. See file header for instructions.",
  );

  test("M4: invalid Supabase credentials → user-facing error contains no internals", async ({
    page,
  }) => {
    await gotoAndWait(page, "/account/login");

    await page.getByTestId("login-email-input").fill("legit-user@example.com");
    await page.getByRole("button", { name: /send magic link/i }).click();
    await page.waitForLoadState("load");

    const visibleText = (await page.locator("body").innerText()).toLowerCase();
    const leakyTokens = ["pgrst", "jwt", "supabase", "at ", "stack", "node_modules"];
    for (const token of leakyTokens) {
      expect(
        visibleText.includes(token),
        `Sanitised error must not leak "${token}". Got: ${visibleText.slice(0, 300)}`,
      ).toBe(false);
    }
  });
});
