import { expect, test } from "@playwright/test";

/**
 * Admin area E2E smoke spec.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * HOW ADMIN AUTH ACTUALLY WORKS (deviations from the task brief):
 *
 * • There is NO `middleware.ts`. Each /admin/* server component calls
 *   `requireAdminSession()` (next-app/src/app/admin/lib/session.ts), which:
 *     - redirects to `/admin/login?error=config` when the admin env vars are unset
 *     - redirects to `/admin/login?next=<path>` when there is no valid session cookie
 *   So an unauthenticated request always lands on `/admin/login` (gate cases 1–4).
 *
 * • The login form has a PASSWORD field only — there is NO email/username field.
 *   Auth is a single shared admin password (`MYSTIQUE_ADMIN_PASSWORD`) checked by
 *   the `loginAdminAction` server action. Case 5 is asserted accordingly and the
 *   absence of an email field is verified explicitly.
 *
 * • The form only renders when admin is configured (`MYSTIQUE_ADMIN_PASSWORD` +
 *   `MYSTIQUE_ADMIN_SECRET`). playwright.config.ts sets test-only values in the
 *   webServer env; if they are ever missing, the form/rate-limit cases self-skip.
 *
 * • Rate limiting (adminLoginAttempts.ts) is IN-MEMORY, keyed by client IP from
 *   the `x-forwarded-for` header (MAX_FAILURES = 5, 30-min lockout). It cannot be
 *   reset from an E2E context. To avoid (a) interference between tests and
 *   (b) pollution across re-runs, each mutating test sends a UNIQUE
 *   `x-forwarded-for` token, giving it its own private counter. The limiter key
 *   is treated as an opaque string, so a unique token per test is sufficient.
 * ──────────────────────────────────────────────────────────────────────────
 */

const LOGIN_PATH = "/admin/login";
/** Obviously fake — and different from the configured test password — so login always fails. */
const WRONG_PASSWORD = "wrongpassword-not-real";

/** Unique, opaque per-test IP token to isolate the in-memory per-IP lockout map. */
function freshForwardedFor(): Record<string, string> {
  return {
    "x-forwarded-for": `e2e-admin-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`,
  };
}

function pathnameOf(url: string): string {
  return new URL(url).pathname;
}

/** Whether the admin login form is rendered (i.e. admin env is configured). */
async function adminFormRendered(page: import("@playwright/test").Page): Promise<boolean> {
  await page.goto(LOGIN_PATH, { waitUntil: "domcontentloaded" });
  return (await page.locator('input[name="password"]').count()) > 0;
}

/**
 * Submit the login form once from a clean `/admin/login` (no error param) and
 * return the resulting `error` query value ("1" | "locked" | "config" | null).
 * Starting clean each time lets us detect each redirect unambiguously.
 */
async function submitPasswordOnce(
  page: import("@playwright/test").Page,
  password: string,
): Promise<string | null> {
  await page.goto(LOGIN_PATH, { waitUntil: "domcontentloaded" });
  await page.locator('input[name="password"]').fill(password);
  await Promise.all([
    page.waitForURL(/\/admin\/login\?[^]*error=/, { timeout: 30_000 }),
    page.getByRole("button", { name: /sign in/i }).click(),
  ]);
  return new URL(page.url()).searchParams.get("error");
}

test.describe("admin area", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  // ── 1–4. GATE: unauthenticated admin routes send the user to /admin/login ───
  //
  // DEVIATION FROM THE BRIEF: `requireAdminSession()` calls Next's server
  // `redirect()`, which (for a Server Component) does NOT emit a 3xx — it
  // returns HTTP 200 and renders the login page with a client/RSC redirect that
  // settles the browser URL on /admin/login. A raw GET therefore yields 200, so
  // we assert the security-relevant OUTCOME instead of a 3xx status:
  //   - the request is not a 404 (the route exists and is protected),
  //   - the protected dashboard content is never shown to the guest,
  //   - the login page is rendered and the browser settles on /admin/login.
  for (const path of ["/admin", "/admin/products", "/admin/orders", "/admin/customers"]) {
    test(`gate: unauthenticated ${path} sends the user to /admin/login`, async ({ page }) => {
      const response = await page.goto(path, { waitUntil: "domcontentloaded" });

      // Route exists and is gated — must not be a 404.
      expect(response?.status(), `${path} should not 404`).not.toBe(404);

      // The login page is shown — not the protected dashboard.
      await expect(page.getByRole("heading", { name: /order dashboard/i })).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();

      // Browser settles on the login route (client/RSC redirect).
      await expect.poll(() => pathnameOf(page.url()), { timeout: 15_000 }).toBe(LOGIN_PATH);
    });
  }

  // ── 5. LOGIN FORM renders ───────────────────────────────────────────────────
  test("login form renders with a password field and submit button", async ({ page }) => {
    const rendered = await adminFormRendered(page);
    test.skip(
      !rendered,
      "Admin not configured (MYSTIQUE_ADMIN_PASSWORD/SECRET unset) — login form not rendered.",
    );

    const password = page.locator('input[name="password"]');
    await expect(password).toBeVisible();
    await expect(password).toHaveAttribute("type", "password");
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();

    // DEVIATION: this admin gate is password-only — there is intentionally no
    // email/username field. Assert that to document the real contract.
    await expect(page.locator('input[type="email"]')).toHaveCount(0);
    await expect(page.locator('input[name="email"]')).toHaveCount(0);
  });

  // ── 6. BAD CREDENTIALS show an error ─────────────────────────────────────────
  test("submitting wrong credentials shows an error and does not authenticate", async ({
    page,
  }) => {
    const rendered = await adminFormRendered(page);
    test.skip(!rendered, "Admin not configured — login form not rendered.");

    // Private IP token so this single failure can never trip a lockout from
    // prior runs and never interferes with the rate-limit test.
    await page.setExtraHTTPHeaders(freshForwardedFor());

    const error = await submitPasswordOnce(page, WRONG_PASSWORD);

    // Wrong password is rejected back to the login page (never the dashboard).
    expect(pathnameOf(page.url())).toBe(LOGIN_PATH);
    expect(error).toBe("1");
    // Target the message text — `getByRole("alert")` also matches Next's
    // route announcer (<div id="__next-route-announcer__" role="alert">).
    await expect(page.getByText(/didn't match/i)).toBeVisible();
  });

  // ── 7. RATE LIMIT / lockout after repeated failures ──────────────────────────
  test("repeated bad credentials trigger a lockout message", async ({ page }) => {
    const rendered = await adminFormRendered(page);
    test.skip(!rendered, "Admin not configured — login form not rendered.");

    // Dedicated private IP so this test owns its counter (MAX_FAILURES = 5).
    await page.setExtraHTTPHeaders(freshForwardedFor());

    const seen: Array<string | null> = [];
    let locked = false;

    // 5 recorded failures, then the 6th attempt is blocked → error=locked.
    for (let attempt = 1; attempt <= 7 && !locked; attempt += 1) {
      const error = await submitPasswordOnce(page, WRONG_PASSWORD);
      seen.push(error);
      locked = error === "locked";
    }

    expect(locked, `expected a lockout within 7 attempts, saw: ${seen.join(", ")}`).toBe(true);

    // The lockout copy is surfaced to the user.
    await page.goto(`${LOGIN_PATH}?error=locked`, { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/too many login attempts/i)).toBeVisible();
  });
});
