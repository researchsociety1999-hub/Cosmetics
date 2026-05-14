import { expect, test, devices } from "@playwright/test";
import { gotoAndWait } from "./helpers";

/**
 * Mobile navigation tests
 *
 * Runs at 375px (iPhone SE) and 390px (iPhone 14) viewports.
 * Desktop nav is intentionally NOT tested here — see storefront-smoke.spec.ts.
 *
 * Pattern: each test sets its own viewport so it can run inside the
 * shared chromium project without needing a separate Playwright project.
 */

const MOBILE_VIEWPORTS = [
  { label: "iPhone SE (375px)", width: 375, height: 667 },
  { label: "iPhone 14 (390px)", width: 390, height: 844 },
];

for (const viewport of MOBILE_VIEWPORTS) {
  test.describe(`mobile nav — ${viewport.label}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test.beforeEach(async ({ context }) => {
      await context.clearCookies();
    });

    // ── Hamburger button ────────────────────────────────────────────────────

    test("hamburger button is visible and labelled", async ({ page }) => {
      await gotoAndWait(page, "/");

      const hamburger = page.getByRole("button", { name: /open menu|menu|navigation/i });
      await expect(hamburger).toBeVisible();
      // Must have an accessible label (aria-label or visible text)
      const label = await hamburger.getAttribute("aria-label");
      const text = await hamburger.textContent();
      expect((label ?? text ?? "").trim().length).toBeGreaterThan(0);
    });

    test("hamburger opens the mobile nav drawer", async ({ page }) => {
      await gotoAndWait(page, "/");

      const hamburger = page.getByRole("button", { name: /open menu|menu|navigation/i });
      await hamburger.click();

      // Nav must become visible after open
      const nav = page.getByRole("navigation", { name: /site|main|mobile/i });
      await expect(nav).toBeVisible({ timeout: 5_000 });
    });

    // ── Nav links reachable ─────────────────────────────────────────────────

    test("all primary nav links are reachable after opening the drawer", async ({ page }) => {
      await gotoAndWait(page, "/");

      const hamburger = page.getByRole("button", { name: /open menu|menu|navigation/i });
      await hamburger.click();

      const nav = page.getByRole("navigation", { name: /site|main|mobile/i });
      await expect(nav).toBeVisible({ timeout: 5_000 });

      for (const linkName of ["Shop", "Routines", "Ingredients", "Journal", "About"]) {
        await expect(
          nav.getByRole("link", { name: linkName, exact: true }),
        ).toBeVisible({ timeout: 5_000 });
      }
    });

    // ── Close button ────────────────────────────────────────────────────────

    test("mobile nav has a close button that dismisses the drawer", async ({ page }) => {
      await gotoAndWait(page, "/");

      const hamburger = page.getByRole("button", { name: /open menu|menu|navigation/i });
      await hamburger.click();

      const nav = page.getByRole("navigation", { name: /site|main|mobile/i });
      await expect(nav).toBeVisible({ timeout: 5_000 });

      const closeBtn = page.getByRole("button", { name: /close menu|close|dismiss/i });
      await expect(closeBtn).toBeVisible();
      await closeBtn.click();

      // Drawer should no longer be visible (hidden or removed from DOM)
      await expect(nav).not.toBeVisible({ timeout: 5_000 });
    });

    // ── Escape key ──────────────────────────────────────────────────────────

    test("Escape key closes the mobile nav drawer", async ({ page }) => {
      await gotoAndWait(page, "/");

      const hamburger = page.getByRole("button", { name: /open menu|menu|navigation/i });
      await hamburger.click();

      const nav = page.getByRole("navigation", { name: /site|main|mobile/i });
      await expect(nav).toBeVisible({ timeout: 5_000 });

      await page.keyboard.press("Escape");
      await expect(nav).not.toBeVisible({ timeout: 5_000 });
    });

    // ── Navigation closes on route change ───────────────────────────────────

    test("clicking a nav link navigates and closes the drawer", async ({ page }) => {
      await gotoAndWait(page, "/");

      const hamburger = page.getByRole("button", { name: /open menu|menu|navigation/i });
      await hamburger.click();

      const nav = page.getByRole("navigation", { name: /site|main|mobile/i });
      await expect(nav).toBeVisible({ timeout: 5_000 });

      // Click Shop and confirm navigation happened
      await nav.getByRole("link", { name: "Shop", exact: true }).click();
      await page.waitForURL(/\/shop/, { timeout: 20_000 });

      // Drawer should auto-close after navigation
      await expect(nav).not.toBeVisible({ timeout: 5_000 });
    });

    // ── Touch target size ───────────────────────────────────────────────────

    test("hamburger button meets 44×44px minimum touch target", async ({ page }) => {
      await gotoAndWait(page, "/");

      const hamburger = page.getByRole("button", { name: /open menu|menu|navigation/i });
      const box = await hamburger.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
    });
  });
}
