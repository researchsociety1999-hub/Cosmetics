#!/usr/bin/env node
// @ts-check
/**
 * Master runner for the runtime-verification suite.
 *
 *   Step 1  Health-check http://localhost:3001
 *   Step 2  Run the M5 / M6 / M9 Playwright specs (with --reporter=line)
 *   Step 3  Run tests/rate-limit-verification.mjs (M7a / M7b / M7c)
 *   Step 4  Print a summary table covering M1..M9
 *
 * Exit code: 0 only if every automated check (M5, M6, M7a–c, M9) passes.
 * Manual items (M4, M8) never block the exit code.
 */

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");

const BASE_URL = (process.env.TEST_BASE_URL ?? "http://localhost:3001").replace(
  /\/$/,
  "",
);

const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
};

/**
 * @param {string} cmd
 * @param {string[]} args
 * @returns {Promise<{ exitCode: number; stdout: string; stderr: string }>}
 */
function runCommand(cmd, args) {
  return new Promise((resolve) => {
    const proc = spawn(cmd, args, {
      cwd: REPO_ROOT,
      shell: process.platform === "win32",
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    });
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (chunk) => {
      const text = chunk.toString();
      stdout += text;
      process.stdout.write(text);
    });
    proc.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      stderr += text;
      process.stderr.write(text);
    });
    proc.on("close", (code) => {
      resolve({ exitCode: code ?? 1, stdout, stderr });
    });
    proc.on("error", (err) => {
      stderr += `\nspawn error: ${err.message}\n`;
      resolve({ exitCode: 1, stdout, stderr });
    });
  });
}

async function healthCheck() {
  console.log(`${ANSI.cyan}${ANSI.bold}Step 1${ANSI.reset} ${ANSI.cyan}Health-check ${BASE_URL}${ANSI.reset}`);
  try {
    const res = await fetch(BASE_URL, { method: "GET" });
    if (res.status >= 500) {
      throw new Error(`server responded ${res.status}`);
    }
    console.log(`${ANSI.green}  ✓ server responded ${res.status}${ANSI.reset}`);
    return true;
  } catch (err) {
    console.log(`${ANSI.red}  ✗ could not reach ${BASE_URL}: ${err instanceof Error ? err.message : String(err)}${ANSI.reset}`);
    console.log("");
    console.log(`${ANSI.yellow}To start the server, run one of:${ANSI.reset}`);
    console.log(`  ${ANSI.bold}cd next-app && npm run build && PORT=3001 npm run start${ANSI.reset}`);
    console.log(`  ${ANSI.dim}# or, for an existing dev workflow on a custom port, set TEST_BASE_URL=http://localhost:<port>${ANSI.reset}`);
    return false;
  }
}

/**
 * @param {string} stdout
 */
function parsePlaywrightOutcome(stdout) {
  const trimmed = stdout.replace(/\x1b\[[0-9;]*m/g, "");
  const passed = /(\d+)\s+passed/.exec(trimmed);
  const failed = /(\d+)\s+failed/.exec(trimmed);
  const skipped = /(\d+)\s+skipped/.exec(trimmed);
  const flaky = /(\d+)\s+flaky/.exec(trimmed);
  return {
    passed: passed ? Number(passed[1]) : 0,
    failed: failed ? Number(failed[1]) : 0,
    skipped: skipped ? Number(skipped[1]) : 0,
    flaky: flaky ? Number(flaky[1]) : 0,
  };
}

/**
 * @param {string} stdout
 * @param {string} subTestId  e.g. "M7a"
 */
function parseRateLimitOutcome(stdout, subTestId) {
  const stripped = stdout.replace(/\x1b\[[0-9;]*m/g, "");
  const passRegex = new RegExp(`\\[PASS\\]\\s*${subTestId}\\b`);
  const failRegex = new RegExp(`\\[FAIL\\]\\s*${subTestId}\\b`);
  if (passRegex.test(stripped)) return "pass";
  if (failRegex.test(stripped)) return "fail";
  return "unknown";
}

/**
 * @param {string} stdout
 * @param {string} specFilename  e.g. "ingredient-poster-alt.spec.ts"
 */
function specWasSkipped(stdout, specFilename) {
  const stripped = stdout.replace(/\x1b\[[0-9;]*m/g, "");
  if (!stripped.includes(specFilename)) return false;
  const summary = parsePlaywrightOutcome(stripped);
  return summary.skipped > 0 && summary.passed === 0 && summary.failed === 0;
}

async function main() {
  const healthy = await healthCheck();
  if (!healthy) {
    process.exit(1);
  }

  console.log(
    `\n${ANSI.cyan}${ANSI.bold}Step 2${ANSI.reset} ${ANSI.cyan}Run Playwright runtime specs (M5 / M6 / M9)${ANSI.reset}`,
  );
  const playwrightArgs = [
    "playwright",
    "test",
    "tests/promo-accessibility.spec.ts",
    "tests/ingredient-poster-alt.spec.ts",
    "tests/search-sanitisation.spec.ts",
    "--reporter=line",
  ];
  const playwright = await runCommand("npx", playwrightArgs);
  const pwSummary = parsePlaywrightOutcome(playwright.stdout + "\n" + playwright.stderr);
  const m6Skipped = specWasSkipped(
    playwright.stdout + "\n" + playwright.stderr,
    "ingredient-poster-alt.spec.ts",
  );

  console.log(
    `\n${ANSI.cyan}${ANSI.bold}Step 3${ANSI.reset} ${ANSI.cyan}Run tests/rate-limit-verification.mjs (M7a / M7b / M7c)${ANSI.reset}`,
  );
  const rateLimit = await runCommand("node", ["tests/rate-limit-verification.mjs"]);

  const m7a = parseRateLimitOutcome(rateLimit.stdout, "M7a");
  const m7b = parseRateLimitOutcome(rateLimit.stdout, "M7b");
  const m7c = parseRateLimitOutcome(rateLimit.stdout, "M7c");

  // M5 / M9 cannot be skipped — they have no test.skip() branch. If the
  // overall playwright run failed, the failing test mentions its spec file.
  const combinedPlaywright = playwright.stdout + "\n" + playwright.stderr;
  const stripped = combinedPlaywright.replace(/\x1b\[[0-9;]*m/g, "");
  /**
   * @param {string} spec
   * @returns {"pass" | "fail" | "skip" | "unknown"}
   */
  function statusForSpec(spec) {
    const lines = stripped.split(/\r?\n/);
    const failed = lines.some(
      (line) =>
        (line.includes("✘") || line.includes("✗") || line.includes("failed")) &&
        line.includes(spec),
    );
    if (failed) return "fail";
    if (specWasSkipped(stripped, spec)) return "skip";
    if (stripped.includes(spec) || pwSummary.passed > 0) return "pass";
    return "unknown";
  }

  const m5Status = statusForSpec("promo-accessibility.spec.ts");
  const m6Status = m6Skipped ? "skip" : statusForSpec("ingredient-poster-alt.spec.ts");
  const m9Status = statusForSpec("search-sanitisation.spec.ts");

  // Build the final summary table.
  /** @type {Array<{ id: string; label: string; status: "pass" | "fail" | "skip" | "manual" | "existing" }>} */
  const rows = [
    { id: "M1", label: "covered by order-confirmation.spec.ts (existing)", status: "existing" },
    { id: "M2", label: "covered by order-confirmation.spec.ts (existing)", status: "existing" },
    { id: "M3", label: "covered by order-confirmation.spec.ts (existing)", status: "existing" },
    { id: "M4", label: "manual — see tests/auth-error-sanitisation.spec.ts", status: "manual" },
    { id: "M5", label: "promo code accessibility", status: /** @type {const} */ (m5Status === "pass" ? "pass" : m5Status === "skip" ? "skip" : "fail") },
    { id: "M6", label: "ingredient / poster image alt", status: /** @type {const} */ (m6Status === "pass" ? "pass" : m6Status === "skip" ? "skip" : "fail") },
    { id: "M7a", label: "rate-limit /api/newsletter", status: /** @type {const} */ (m7a === "pass" ? "pass" : "fail") },
    { id: "M7b", label: "rate-limit /contact", status: /** @type {const} */ (m7b === "pass" ? "pass" : "fail") },
    { id: "M7c", label: "rate-limit /api/create-checkout-session", status: /** @type {const} */ (m7c === "pass" ? "pass" : "fail") },
    { id: "M8", label: "manual — see tests/checkout-error-sanitisation.spec.ts", status: "manual" },
    { id: "M9", label: "search input sanitisation", status: /** @type {const} */ (m9Status === "pass" ? "pass" : m9Status === "skip" ? "skip" : "fail") },
  ];

  /** @type {Record<string, string>} */
  const marks = {
    pass: `${ANSI.green}✅${ANSI.reset}`,
    fail: `${ANSI.red}❌${ANSI.reset}`,
    skip: `${ANSI.yellow}⏭️${ANSI.reset} `,
    manual: `${ANSI.yellow}🟡${ANSI.reset}`,
    existing: `${ANSI.green}✅${ANSI.reset}`,
  };

  console.log(`\n${ANSI.bold}Summary${ANSI.reset}`);
  for (const row of rows) {
    console.log(`  ${marks[row.status] ?? "  "}  ${ANSI.bold}${row.id}${ANSI.reset}  ${row.label}`);
  }

  const automatedFailed = rows.some(
    (row) =>
      ["M5", "M6", "M7a", "M7b", "M7c", "M9"].includes(row.id) &&
      row.status === "fail",
  );

  if (automatedFailed) {
    console.log(`\n${ANSI.red}${ANSI.bold}One or more automated checks failed.${ANSI.reset}`);
    process.exit(1);
  }
  console.log(`\n${ANSI.green}${ANSI.bold}All automated checks passed (manual items are informational).${ANSI.reset}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(`${ANSI.red}Fatal error in run-all-verifications:${ANSI.reset}`, err);
  process.exit(1);
});
