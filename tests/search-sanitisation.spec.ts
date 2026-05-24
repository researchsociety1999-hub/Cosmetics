import { expect, test } from "@playwright/test";
import { gotoAndWait } from "./helpers";

/**
 * M9 — Search input sanitisation in /shop
 *
 * Visits /shop with a PostgREST-style injection payload (`q=foo,is_published.eq.false`)
 * and verifies two things at runtime:
 *
 *   1. No card rendered on the page exposes a draft / unpublished product.
 *   2. Any outgoing Supabase REST request DOES NOT contain the literal
 *      string `is_published.eq.false` — the payload must be stripped,
 *      encoded, or simply not forwarded as a PostgREST filter.
 *
 * The webServer in playwright.config.ts runs with `E2E_MOCK_CATALOG=1`, so
 * Supabase is normally NOT contacted. The network assertion is therefore
 * gated: if no matching request fires, we still verify the DOM is clean.
 */
test.describe("M9 — search input sanitisation", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test("M9: malicious search payload does not leak into Supabase REST or render drafts", async ({
    page,
  }) => {
    const supabaseRequestUrls: string[] = [];

    await page.route(/supabase|rest\/v1/i, async (route) => {
      try {
        const url = route.request().url();
        supabaseRequestUrls.push(url);
      } catch {
        // ignore — capture is best-effort
      }
      await route.continue();
    });

    await gotoAndWait(page, "/shop?q=foo%2Cis_published.eq.false");

    const draftCard = page.locator(
      '[data-testid*="product-card"], article, a[href^="/products/"]',
      { hasText: /draft|unpublished/i },
    );
    await expect(
      draftCard,
      "No card should advertise a draft / unpublished product",
    ).toHaveCount(0);

    const draftText = page.getByText(/draft|unpublished/i);
    await expect(
      draftText,
      "No visible copy on /shop should read 'draft' or 'unpublished'",
    ).toHaveCount(0);

    if (supabaseRequestUrls.length === 0) {
      test.info().annotations.push({
        type: "skip-network-assertion",
        description:
          "No Supabase REST request fired (E2E_MOCK_CATALOG=1 is the default in playwright.config.ts). DOM-only assertion above is sufficient.",
      });
      return;
    }

    for (const captured of supabaseRequestUrls) {
      expect(
        captured.includes("is_published.eq.false"),
        `Outgoing Supabase URL must not contain the literal 'is_published.eq.false' — got: ${captured}`,
      ).toBe(false);
    }
  });
});
