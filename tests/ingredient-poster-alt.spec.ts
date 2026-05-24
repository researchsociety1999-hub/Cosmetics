import { expect, test } from "@playwright/test";
import { gotoAndWait } from "./helpers";

/**
 * M6 — Ingredient / poster / hero image alt text in /shop
 *
 * The shop page renders an ingredient poster banner only when the user
 * filters by `?ingredient=<id>` (see ShopIngredientFilterBanner). On the
 * plain /shop URL the only "poster" candidates are the product card images
 * inside <section> blocks. We try a broad selector first and fall back to
 * any <img> inside a <section>. If absolutely no candidate is found we
 * skip — per the task: "do NOT fail hard on missing test data".
 */
test.describe("M6 — ingredient / poster image alt text", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test("M6: poster / ingredient / hero <img> on /shop has a non-empty alt", async ({
    page,
  }) => {
    await gotoAndWait(page, "/shop");

    const posterCandidates = page.locator(
      [
        'img[data-testid*="ingredient"]',
        'img[data-testid*="poster"]',
        'img[data-testid*="hero"]',
        'section[aria-labelledby*="ingredient"] img',
        "section img",
      ].join(", "),
    );

    const count = await posterCandidates.count();
    if (count === 0) {
      test.skip(
        true,
        "M6: no poster/ingredient/hero image found on /shop — likely no ingredient filter active and no product cards rendered. Re-run with ?ingredient=<id> or with a non-empty catalog.",
      );
      return;
    }

    const first = posterCandidates.first();
    await expect(first).toBeVisible({ timeout: 15_000 });
    const alt = await first.getAttribute("alt");
    expect(alt, "<img> must have an alt attribute (any string)").not.toBeNull();
    expect(
      (alt ?? "").trim().length,
      `<img> alt was empty or whitespace-only (alt=${JSON.stringify(alt)})`,
    ).toBeGreaterThan(0);
  });
});
