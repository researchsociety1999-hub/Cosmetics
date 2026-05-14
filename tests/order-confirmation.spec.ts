import { expect, test } from "@playwright/test";
import { expectHeading, gotoAndWait } from "./helpers";

/**
 * Order confirmation page tests
 *
 * The confirmation page renders after Stripe redirects back with
 * ?session_id=<id>. Stripe cannot be called in mock/E2E mode, so we test
 * what the UI does under each realistic condition:
 *
 *  success  — ?session_id=<plausible-id>  → success heading or graceful error
 *  no id    — /order/confirmation          → redirect or error
 *  cancel   — ?status=cancelled            → cancellation message
 *  junk id  — ?session_id=JUNK             → no unhandled JS error
 */
test.describe("order confirmation", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  // ── Success state ─────────────────────────────────────────────────────────

  test("confirmation with session_id renders success heading or graceful error", async ({
    page,
  }) => {
    await page.goto("/order/confirmation?session_id=cs_test_e2e_mock_session_id", {
      waitUntil: "domcontentloaded",
    });
    await page.waitForLoadState("load");

    const hasSuccessHeading = await page
      .getByRole("heading", { name: /order confirmed|thank you|order placed/i })
      .isVisible()
      .catch(() => false);

    const hasGracefulError = await page
      .getByText(/could not verify|order details unavailable|something went wrong/i)
      .isVisible()
      .catch(() => false);

    expect(hasSuccessHeading || hasGracefulError).toBe(true);
  });

  test("confirmed order page shows a continue shopping CTA", async ({ page }) => {
    await page.goto("/order/confirmation?session_id=cs_test_e2e_mock_session_id", {
      waitUntil: "domcontentloaded",
    });
    await page.waitForLoadState("load");

    const hasSuccessHeading = await page
      .getByRole("heading", { name: /order confirmed|thank you|order placed/i })
      .isVisible()
      .catch(() => false);

    if (hasSuccessHeading) {
      await expect(
        page.getByRole("link", { name: /continue shopping|shop|back to home/i }),
      ).toBeVisible();
    }
  });

  // ── Missing session_id guard ──────────────────────────────────────────────

  test("/order/confirmation with no session_id redirects or shows an error", async ({
    page,
  }) => {
    await page.goto("/order/confirmation", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("load");

    const url = page.url();
    const isRedirected = !url.includes("/order/confirmation");
    const hasErrorText = await page
      .getByText(/invalid|no order|session.*missing|something went wrong/i)
      .isVisible()
      .catch(() => false);

    expect(isRedirected || hasErrorText).toBe(true);
  });

  // ── Cancelled payment state ───────────────────────────────────────────────

  test("/checkout?status=cancelled shows a cancellation message", async ({ page }) => {
    await gotoAndWait(page, "/checkout?status=cancelled");

    await expectHeading(page, "Checkout");
    await expect(
      page.getByText(/cancelled|payment was cancelled|try again/i),
    ).toBeVisible({ timeout: 15_000 });
  });

  // ── No-crash on bad params ────────────────────────────────────────────────

  test("confirmation with a junk session_id throws no unhandled JS error", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/order/confirmation?session_id=JUNK_GARBAGE_12345", {
      waitUntil: "domcontentloaded",
    });
    await page.waitForLoadState("load");

    expect(errors).toHaveLength(0);

    // Page must render meaningful content — not a blank screen.
    const bodyText = await page.locator("body").innerText();
    expect(bodyText.trim().length).toBeGreaterThan(10);
  });
});
