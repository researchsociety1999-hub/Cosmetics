import { expect, test } from "@playwright/test";
import { gotoAndWait } from "./helpers";

/**
 * M6 — Ingredient / poster image alt-text guard
 *
 * Navigates to /shop?ingredient=hyaluronic-acid so that ShopIngredientFilterBanner
 * (in next-app/src/app/shop/ShopCatalogBody.tsx) renders. The banner is a
 * <section aria-labelledby="shop-ingredient-<id>-heading"> wrapping a Next.js
 * <Image> whose alt is set to row.name when imagePresentation === "poster"
 * (every canonical ingredient in MYSTIQUE_CANONICAL_INGREDIENTS is "poster").
 *
 * Slug source: next-app/src/app/lib/data.ts → MYSTIQUE_CANONICAL_INGREDIENTS,
 * which is the embedded catalog used in mock mode (ALLOW_MOCK_CATALOG=1 /
 * E2E_MOCK_CATALOG=1) — hyaluronic-acid is the second entry and has
 * imagePresentation: "poster" + imageSrc: "/ingredients/hyaluronic-acid.png".
 */
test.describe("M6 — ingredient / poster image alt text", () => {
  test("M6: ingredient banner <img> has a non-empty alt attribute", async ({
    page,
  }) => {
    await gotoAndWait(page, "/shop?ingredient=hyaluronic-acid");

    const candidates = [
      'img[data-testid*="ingredient"]',
      'img[data-testid*="poster"]',
      'img[data-testid*="hero"]',
      'section[aria-labelledby*="ingredient"] img',
      '[class*="ingredient"] img',
      '[class*="banner"] img',
      "section img",
    ];

    let img = null;
    let matchedSelector = "";
    for (const selector of candidates) {
      const locator = page.locator(selector).first();
      if ((await locator.count()) > 0) {
        img = locator;
        matchedSelector = selector;
        break;
      }
    }

    expect(
      img,
      `M6: none of the candidate selectors matched on /shop?ingredient=hyaluronic-acid. ` +
        `Tried: ${candidates.join(" | ")}`,
    ).not.toBeNull();

    const alt = await img!.getAttribute("alt");
    expect(
      alt,
      `M6: <img> matched by selector "${matchedSelector}" must have an alt attribute (any string)`,
    ).not.toBeNull();
    expect(
      (alt ?? "").trim().length,
      `M6: <img> matched by selector "${matchedSelector}" has empty / whitespace-only alt (alt=${JSON.stringify(alt)})`,
    ).toBeGreaterThan(0);
  });
});
