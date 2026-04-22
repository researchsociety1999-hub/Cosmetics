import { defineConfig, devices } from '@playwright/test';
import path from "path";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  /** CI runners are slower; shop streams RSC + cart POST/redirect polling needs headroom. */
  timeout: process.env.CI ? 120_000 : 45_000,
  expect: {
    timeout: 10_000,
  },
  /* Full local parallelism can overwhelm the Next dev server and cause navigation timeouts. */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 2,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    /* Dedicated port so E2E does not reuse a manually started dev server without ALLOW_MOCK_CATALOG. */
    baseURL: "http://localhost:3001",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  /* `next dev` holds a project lock — a second dev instance fails. Build + start avoids clashing with a normal dev server on :3000. */
  webServer: {
    cwd: path.join(__dirname, "next-app"),
    command: "npm run build && npm run start",
    url: "http://localhost:3001",
    reuseExistingServer: false,
    timeout: 300_000,
    env: {
      ...process.env,
      PORT: "3001",
      // Deterministic embedded catalog even when `.env.local` has Supabase keys.
      ALLOW_MOCK_CATALOG: "1",
      E2E_MOCK_CATALOG: "1",
      // `next start` uses NODE_ENV=production over http://localhost — allow guest cookies.
      // Force "1": parent `process.env` may set this to "" which would not be replaced by `??`.
      E2E_ALLOW_HTTP_COOKIES: "1",
      // `next start` runs as production; allow integration health checks in tests.
      ENABLE_INTEGRATION_HEALTH: process.env.ENABLE_INTEGRATION_HEALTH ?? "1",
    },
  },
});
