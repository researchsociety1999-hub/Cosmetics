import { expect, test } from "@playwright/test";
import { SAMPLE_CHECKOUT_SHIPPING, gotoAndWait } from "./helpers";

/**
 * M8 — Checkout / payment error sanitisation
 *
 * SECURITY PROPERTY
 * Payment/checkout errors shown to the user must never leak Stripe internals or
 * server details — no "sk_" keys, "webhook" wording, stack traces, raw JSON
 * blobs, or internal API/file paths. Users only ever see friendly copy.
 *
 * WHAT THIS SPEC ASSERTS (against the real checkout implementation):
 *   1. The payment-initiation endpoint (/api/create-checkout-session) returns a
 *      sanitised, user-facing `error` for failure modes (store/stripe
 *      unavailable, validation, empty bag) — never Stripe/internal detail.
 *   2. /checkout?status=stripe-error renders a safe notice and the page stays
 *      functional (shipping form still present).
 *   3. Submitting the real checkout form into a failing state renders a safe
 *      `role="alert"` message and the page does not crash.
 *
 * DEVIATION FROM THE BRIEF (Stripe test card 4000 0000 0000 0002):
 * This app uses Stripe-hosted Checkout (a redirect via `redirectToCheckout`),
 * so card entry / declines happen on Stripe's domain — they are not part of
 * this app's UI and can't be driven here, and a *successful* submit would
 * navigate off-site. We therefore exercise the actual in-app error boundary
 * and force any UI submission to fail at server validation (country = Canada,
 * which the API rejects as US-only) so it never redirects off-site. This makes
 * the spec deterministic and CI-safe whether or not Stripe/Supabase are
 * configured — no env flags or live payment needed.
 */

/** Tokens that must never appear in a user-facing checkout error message. */
const FORBIDDEN: Array<[string, RegExp]> = [
  ["stripe", /stripe/i],
  ["secret key (sk_)", /sk_/i],
  ["webhook", /webhook/i],
  ["stack", /stack/i],
  ["Error: (capital E)", /Error:/],
  ["raw JSON blob", /[{}]/],
  ["internal path", /\/api\/|node_modules|\/var\/|file:\/\//i],
];

function assertNoLeak(text: string) {
  for (const [label, pattern] of FORBIDDEN) {
    expect(text, `checkout error UI must not expose: ${label}`).not.toMatch(pattern);
  }
}

test.describe("M8 — checkout error sanitisation", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test("M8a: create-checkout-session returns a sanitised user-facing error", async ({
    request,
  }) => {
    const response = await request.post("/api/create-checkout-session", {
      data: { ...SAMPLE_CHECKOUT_SHIPPING },
    });

    // Some failure mode is expected for a guest with no cart / no live backend.
    expect(response.status(), await response.text()).toBeGreaterThanOrEqual(400);

    const body = (await response.json()) as { error?: string; code?: string };
    const userMessage = String(body.error ?? "");

    // There must be a human-facing message, and it must not leak internals.
    // (We assert on `error` — the copy shown to the user — not the machine `code`.)
    expect(userMessage.length).toBeGreaterThan(0);
    assertNoLeak(userMessage);
  });

  test("M8b: /checkout?status=stripe-error shows a safe notice and stays functional", async ({
    page,
  }) => {
    await gotoAndWait(page, "/checkout?status=stripe-error");

    // Page renders / remains functional.
    await expect(page.getByRole("heading", { name: "Checkout", level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Shipping address" })).toBeVisible();

    const notice = page.getByText(/could not start secure checkout/i);
    await expect(notice).toBeVisible();
    assertNoLeak(await notice.innerText());
  });

  test("M8c: a failing checkout submission renders a sanitised error, no crash", async ({
    page,
  }) => {
    await gotoAndWait(page, "/checkout");
    await expect(page.getByRole("heading", { name: "Checkout", level: 1 })).toBeVisible();

    const submit = page.getByRole("button", {
      name: /continue to payment|payment unavailable/i,
    });
    await expect(submit).toBeVisible();

    if (await submit.isEnabled()) {
      // Stripe is configured (button live). Fill the form but force a server-side
      // validation failure (non-US country) so we exercise the error UI WITHOUT
      // ever creating a session / redirecting to Stripe's hosted checkout.
      await page.getByLabel("Full name", { exact: true }).fill(SAMPLE_CHECKOUT_SHIPPING.fullName);
      await page.getByLabel("Email", { exact: true }).fill(SAMPLE_CHECKOUT_SHIPPING.email);
      await page
        .getByLabel("Address line 1", { exact: true })
        .fill(SAMPLE_CHECKOUT_SHIPPING.addressLine1);
      await page.getByLabel("City", { exact: true }).fill(SAMPLE_CHECKOUT_SHIPPING.city);
      await page.getByLabel("State", { exact: true }).fill(SAMPLE_CHECKOUT_SHIPPING.state);
      await page
        .getByLabel("Postal code", { exact: true })
        .fill(SAMPLE_CHECKOUT_SHIPPING.postalCode);
      await page.getByLabel("Country", { exact: true }).fill("Canada");

      await submit.click();

      const alert = page.locator('form p[role="alert"]');
      await expect(alert).toBeVisible({ timeout: 20_000 });
      assertNoLeak(await alert.innerText());

      // Still on checkout (no off-site redirect) and functional.
      expect(new URL(page.url()).pathname).toBe("/checkout");
    } else {
      // Stripe not configured: the button is the disabled "Payment unavailable"
      // state, so no submission (and therefore no error) can be triggered. The
      // page must simply stay functional with no leaked error alert. (Benign
      // helper copy that names the payment provider is not an error surface, so
      // it is intentionally not scanned here.)
      await expect(submit).toBeDisabled();
      await expect(page.locator('form p[role="alert"]')).toHaveCount(0);
    }

    // Page remains functional after the error state in both branches.
    await expect(page.getByRole("heading", { name: "Shipping address" })).toBeVisible();
  });
});
