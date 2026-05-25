import { expect, test } from "@playwright/test";
import { gotoAndWait } from "./helpers";

/**
 * M9 — Search input sanitisation
 *
 * Verifies that a malicious search payload (XSS + Supabase REST injection)
 * does not:
 *   1. Leak draft / unpublished product cards into the DOM.
 *   2. Cause a Supabase REST request that includes the raw injection string
 *      (would indicate the query was not sanitised before being forwarded).
 *
 * With E2E_MOCK_CATALOG=1 (the default in playwright.config.ts) the app uses
 * a static fixture, so no Supabase network requests fire — the network
 * assertion is annotated as "not applicable" in that mode.
 */

const MALICIOUS_PAYLOAD =
  "<script>alert(1)</script>,is_published.eq.false";

test.describe("M9 — search input sanitisation", () => {
  test(
    "M9: malicious search payload does not leak into Supabase REST or render drafts",
    async ({ page }) => {
      // Collect all Supabase REST requests fired during the test.
      const supabaseRequests: string[] = [];
      page.on("request", (req) => {
        const url = req.url();
        if (url.includes("/rest/v1/") && url.includes("supabase")) {
          supabaseRequests.push(url);
        }
      });

      await gotoAndWait(page, `/shop?q=${encodeURIComponent(MALICIOUS_PAYLOAD)}`);

      // ── DOM check ───────────────────────────────────────────────────────
      // No product card or copy should contain the literal words
      // "draft" or "unpublished" (case-insensitive).
      const draftMarkers = page.locator(
        ":text-matches('draft|unpublished', 'i')",
      );
      const draftCount = await draftMarkers.count();
      expect(
        draftCount,
        "DOM must not expose draft/unpublished product content",
      ).toBe(0);

      // ── Network check ───────────────────────────────────────────────────
      if (supabaseRequests.length === 0) {
        // E2E_MOCK_CATALOG=1 — no live Supabase calls, which is fine.
        test.info().annotations.push({
          type: "info",
          description:
            "Network assertion skipped: no Supabase REST requests observed " +
            "(E2E_MOCK_CATALOG=1 uses static fixtures).",
        });
      } else {
        // Live mode: confirm the raw injection string never reached Supabase.
        for (const url of supabaseRequests) {
          expect(
            url,
            "Supabase REST URL must not contain raw injection payload",
          ).not.toContain("is_published.eq.false");
          expect(
            url,
            "Supabase REST URL must not contain raw <script> tag",
          ).not.toContain("<script>");
        }
      }
    },
  );
});
