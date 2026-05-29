import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/**
 * Vitest config for unit tests (separate from the Playwright E2E suite).
 *
 * - `@/*` mirrors next-app/tsconfig.json (`"@/*": ["./src/*"]`) so unit tests
 *   and `vi.mock(...)` can reference lib modules with the same specifiers the
 *   app uses (e.g. `@/app/lib/promo`, `@/app/lib/supabaseClient`).
 * - `environment: "node"` — these are pure logic tests; no DOM is required.
 * - Only `tests/unit/**` is collected here; Playwright owns the rest of tests/.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./next-app/src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    globals: true,
    include: ["tests/unit/**/*.test.ts"],
    clearMocks: true,
    restoreMocks: true,
  },
});
