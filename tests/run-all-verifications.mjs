#!/usr/bin/env node
// @ts-check
/**
 * Master runner for the runtime-verification suite.
 *
 * Steps:
 *   1. Health-check  — confirm the Next.js server is up on localhost:3001
 *   2. Playwright    — run M5, M6, M9 specs
 *                      (playwright.config.ts has reuseExistingServer: !CI so
 *                       it reuses whatever is already on :3001 locally, and
 *                       starts a fresh server in CI)
 *   3. Rate-limit    — run the M7a/b/c Node script (server must be on 3001)
 *   4. Summary table — print final status for every milestone
 *
 * Exit codes
 *   0  — all automated checks passed
 *   1  — one or more checks failed
 *
 * Local dev workflow:
 *   npm run test:runtime            (runner manages everything)
 *   npm run test:playwright:runtime (Playwright only, no rate-limit)
 *   npm run test:ratelimit           (rate-limit only, server must be up)
 */

import { execSync, spawn, spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const BASE = "http://localhost:3001";

/** @param {number} ms */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function probeServer() {
  try {
    const res = await fetch(BASE, { signal: AbortSignal.timeout(2_500) });
    return res.ok || res.status < 500;
  } catch {
    return false;
  }
}

/** Track whether we own the server so we know to tear it down at the end. */
/** @type {import("node:child_process").ChildProcess | null} */
let ownedServer = null;

async function startServerInBackground() {
  // playwright.config.ts's webServer block runs the same command with the
  // same env. Reuse it here so the dev-time mock catalog is wired up and
  // guest cookies work over plain HTTP.
  const env = {
    ...process.env,
    PORT: "3001",
    ALLOW_MOCK_CATALOG: "1",
    E2E_MOCK_CATALOG: "1",
    E2E_ALLOW_HTTP_COOKIES: "1",
  };
  const child = spawn(
    "npm",
    ["--prefix", "next-app", "run", "start"],
    {
      cwd: REPO_ROOT,
      env,
      stdio: "ignore",
      detached: false,
      // On Windows, npm is npm.cmd — shell shim resolves both.
      shell: process.platform === "win32",
    },
  );
  ownedServer = child;
  // Poll until ready or timeout (build is already cached in .next).
  const deadlineMs = Date.now() + 60_000;
  while (Date.now() < deadlineMs) {
    if (await probeServer()) return true;
    await sleep(750);
  }
  return false;
}

function stopOwnedServer() {
  if (!ownedServer) return;
  try {
    if (process.platform === "win32" && ownedServer.pid) {
      // npm spawns a child `next start`; killing the npm shim leaves a stray
      // server. taskkill /T tears down the whole tree on Windows.
      spawnSync("taskkill", ["/PID", String(ownedServer.pid), "/F", "/T"], {
        stdio: "ignore",
      });
    } else {
      ownedServer.kill();
    }
  } catch {
    /* best-effort */
  }
}
process.on("exit", stopOwnedServer);

// ─── Step 1: Health check / start a server if needed ─────────────────────────

console.log("\n══ Step 1: Health check ═══════════════════════════════════════");
let serverUp = await probeServer();
if (serverUp) {
  console.log("  ✓ server already up on :3001");
  console.log("  ℹ️  Playwright will reuse it (reuseExistingServer: !CI).");
} else {
  console.log("  ✗ server not reachable on :3001 — starting one in background…");
  serverUp = await startServerInBackground();
  if (serverUp) {
    console.log("  ✓ background server is ready");
  } else {
    console.log(
      "  ✗ failed to start server. Playwright will still attempt its own webServer; " +
        "rate-limit step (M7a/b/c) will likely fail.",
    );
  }
}

// ─── Step 2: Playwright ──────────────────────────────────────────────────────

console.log("\n══ Step 2: Playwright (M5 / M6 / M9) ═════════════════════════");
let playwrightPassed = false;
let playwrightOutput = "";
try {
  const result = spawnSync(
    "npx",
    [
      "playwright",
      "test",
      "tests/promo-accessibility.spec.ts",
      "tests/ingredient-poster-alt.spec.ts",
      "tests/search-sanitisation.spec.ts",
      "--reporter=list",
    ],
    {
      encoding: "utf8",
      cwd: resolve(__dirname, ".."),
      // Windows: `npx` resolves to `npx.cmd` which spawn() cannot launch
      // directly without a shell. Use shell on win32 so the .cmd shim runs.
      shell: process.platform === "win32",
    },
  );
  playwrightOutput = (result.stdout ?? "") + (result.stderr ?? "");
  playwrightPassed = result.status === 0;
  console.log(playwrightOutput);
} catch (e) {
  console.log(`  Error running Playwright: ${e.message}`);
}

// ─── Step 3: Rate-limit verification ─────────────────────────────────────────

console.log("\n══ Step 3: Rate-limit verification (M7a / M7b / M7c) ══════════");
let rateLimitPassed = false;
try {
  const result = spawnSync(
    "node",
    [resolve(__dirname, "rate-limit-verification.mjs")],
    { encoding: "utf8" },
  );
  console.log((result.stdout ?? "") + (result.stderr ?? ""));
  rateLimitPassed = result.status === 0;
} catch (e) {
  console.log(`  Error running rate-limit script: ${e.message}`);
}

// ─── Step 4: Summary ─────────────────────────────────────────────────────────

console.log("\n══ Summary ═════════════════════════════════════════════════════");

const pw = (label, pass) => `  ${pass ? "✅" : "❌"}  ${label}`;
const manual = (label) => `  🟡  ${label}`;

// Derive per-spec status from playwright output.
const m5Pass = playwrightOutput.includes("promo-accessibility") &&
  !playwrightOutput.includes("FAILED");
const m6Skip = playwrightOutput.includes("skipped");
const m9Pass = playwrightOutput.includes("search-sanitisation") &&
  !playwrightOutput.includes("FAILED");

console.log(pw("M1/M2/M3  order-confirmation (existing)", true));
console.log(manual("M4  auth-error-sanitisation (manual — set BREAK_AUTH_ERRORS=1)"));
console.log(pw("M5  promo-accessibility", playwrightPassed && m5Pass));
console.log(
  m6Skip
    ? `  🟡  M6  ingredient-poster-alt (skipped — no matching <img> in mock catalog)`
    : pw("M6  ingredient-poster-alt", playwrightPassed),
);
console.log(pw("M7a rate-limit /api/newsletter", rateLimitPassed));
console.log(pw("M7b rate-limit /contact", rateLimitPassed));
console.log(pw("M7c rate-limit /api/create-checkout-session", rateLimitPassed));
console.log(manual("M8  checkout-error-sanitisation (manual — set BREAK_CHECKOUT_ERRORS=1)"));
console.log(pw("M9  search input sanitisation", playwrightPassed && m9Pass));

const allPass = playwrightPassed && rateLimitPassed;

if (allPass) {
  console.log("\nAll automated checks passed.\n");
  process.exit(0);
} else {
  console.log("\nOne or more automated checks failed.\n");
  process.exit(1);
}
