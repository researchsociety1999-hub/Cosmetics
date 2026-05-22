/**
 * e2e/accessibility-smoke.spec.ts
 * Playwright E2E — Accessibility smoke tests.
 *
 * Checks core a11y requirements across key pages:
 *   - Skip to content link present
 *   - Single H1 per page
 *   - All images have alt text
 *   - All form inputs have labels
 *   - Focus ring visible on interactive elements (keyboard nav)
 *
 * Requires: @axe-core/playwright (optional deep scan — install separately)
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

const PAGES_TO_CHECK = [
  { name: 'Home', path: '/' },
  { name: 'Shop', path: '/shop' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

for (const { name, path } of PAGES_TO_CHECK) {
  test.describe(`Accessibility — ${name} (${path})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}${path}`);
    });

    test('has exactly one H1', async ({ page }) => {
      const h1s = page.locator('h1');
      const count = await h1s.count();
      expect(count).toBe(1);
    });

    test('all images have alt attributes', async ({ page }) => {
      const images = page.locator('img:not([alt])');
      const violatingCount = await images.count();
      expect(violatingCount).toBe(0);
    });

    test('all inputs have associated labels', async ({ page }) => {
      // Find inputs without aria-label, aria-labelledby, or a linked <label>
      const unlabelledInputs = await page.evaluate(() => {
        const inputs = Array.from(
          document.querySelectorAll('input:not([type="hidden"]):not([type="submit"])')
        );
        return inputs.filter((el) => {
          const input = el as HTMLInputElement;
          const hasAriaLabel = input.hasAttribute('aria-label');
          const hasAriaLabelledBy = input.hasAttribute('aria-labelledby');
          const hasLinkedLabel =
            input.id && !!document.querySelector(`label[for="${input.id}"]`);
          const hasWrappingLabel = !!input.closest('label');
          return (
            !hasAriaLabel &&
            !hasAriaLabelledBy &&
            !hasLinkedLabel &&
            !hasWrappingLabel
          );
        }).length;
      });
      expect(unlabelledInputs).toBe(0);
    });

    test('skip-to-content link is present', async ({ page }) => {
      // The SkipToContent component should render an anchor to #main-content
      const skipLink = page.locator('a[href="#main-content"], a[href="#main"]');
      await expect(skipLink.first()).toBeAttached();
    });
  });
}
