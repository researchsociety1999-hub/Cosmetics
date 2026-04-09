import { test, expect } from "@playwright/test";

test("playwright is configured for the workspace", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/localhost:3000/);
});
