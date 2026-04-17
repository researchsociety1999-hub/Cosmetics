import { expect, test } from "@playwright/test";

/** Representative widths: small phone → large desktop */
const VIEWPORTS = [
  { width: 320, height: 568, label: "320-phone" },
  { width: 360, height: 780, label: "360-android" },
  { width: 390, height: 844, label: "390-iphone" },
  { width: 428, height: 926, label: "428-large-phone" },
  { width: 768, height: 1024, label: "768-tablet" },
  { width: 900, height: 700, label: "900-narrow-desktop" },
  { width: 1024, height: 768, label: "1024-laptop" },
  { width: 1280, height: 800, label: "1280-desktop" },
  { width: 1536, height: 864, label: "1536-wide" },
] as const;

const ROUTES = ["/", "/shop", "/about", "/ingredients", "/contact"] as const;

for (const vp of VIEWPORTS) {
  test.describe(`viewport ${vp.label} (${vp.width}×${vp.height})`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    for (const route of ROUTES) {
      test(`header visible; no horizontal page overflow — ${route}`, async ({
        page,
      }) => {
        await page.goto(route, { waitUntil: "domcontentloaded" });
        await expect(
          page.getByRole("navigation", { name: "Primary" }),
        ).toBeVisible();

        const delta = await page.evaluate(() => {
          const d = document.documentElement;
          return d.scrollWidth - d.clientWidth;
        });
        expect(
          delta,
          `scrollWidth overflow on ${route} at ${vp.width}px`,
        ).toBeLessThanOrEqual(2);
      });
    }
  });
}
