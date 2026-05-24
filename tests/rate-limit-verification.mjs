#!/usr/bin/env node
// @ts-check
/**
 * M7 — Rate-limit verification script (pure Node.js ESM, no Playwright).
 *
 * Hits three rate-limited endpoints on a running server (default
 * http://localhost:3001) and asserts the first request past the configured
 * threshold returns HTTP 429.
 *
 *   M7a  POST /api/newsletter                 — limit 5 per 10 min (6th = 429)
 *   M7b  POST /contact (server action)        — limit 5 per 10 min (6th = 429 or redirect to rate-limited)
 *   M7c  POST /api/create-checkout-session    — limit 10 per 5 min  (11th = 429)
 *
 * Notes:
 *  - All requests are sent SEQUENTIALLY so the rate-limiter window advances
 *    cleanly. The limiter buckets are keyed by client IP, which is "unknown"
 *    in localhost requests when no x-forwarded-for is set.
 *  - SAMPLE_CHECKOUT_SHIPPING is inlined here because helpers.ts is a
 *    TypeScript file and this script cannot import .ts modules without a
 *    transpiler. The fields are kept in sync with tests/helpers.ts.
 *  - Exit code: 0 if every sub-test passes, 1 otherwise.
 */

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
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

/** Inlined from tests/helpers.ts → SAMPLE_CHECKOUT_SHIPPING. Keep in sync. */
const SAMPLE_CHECKOUT_SHIPPING = {
  fullName: "Mystique Test User",
  email: "checkout-e2e@example.com",
  addressLine1: "1200 Market Street",
  addressLine2: "",
  city: "Austin",
  state: "TX",
  postalCode: "78701",
  country: "United States",
};

/** @type {Array<{ id: string; ok: boolean; detail: string }>} */
const results = [];

function logPass(id, detail) {
  console.log(`${ANSI.green}✅ ${ANSI.bold}${id}${ANSI.reset}${ANSI.green} — ${detail}${ANSI.reset}`);
  results.push({ id, ok: true, detail });
}

function logFail(id, detail) {
  console.log(`${ANSI.red}❌ ${ANSI.bold}${id}${ANSI.reset}${ANSI.red} — ${detail}${ANSI.reset}`);
  results.push({ id, ok: false, detail });
}

function logInfo(line) {
  console.log(`${ANSI.dim}   ${line}${ANSI.reset}`);
}

async function safeJson(response) {
  try {
    return await response.clone().json();
  } catch {
    return null;
  }
}

async function safeText(response) {
  try {
    return await response.clone().text();
  } catch {
    return "";
  }
}

// ── M7a: /api/newsletter ────────────────────────────────────────────────────

async function runNewsletterTest() {
  const id = "M7a";
  const url = `${BASE_URL}/api/newsletter`;
  console.log(`\n${ANSI.cyan}${ANSI.bold}[${id}]${ANSI.reset} ${ANSI.cyan}POST /api/newsletter ×6 → expecting 6th = 429${ANSI.reset}`);

  /** @type {Response[]} */
  const responses = [];
  for (let i = 0; i < 6; i++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "ratelimit-test@example.com" }),
      });
      responses.push(res);
      logInfo(`request #${i + 1} → ${res.status}`);
    } catch (err) {
      logFail(id, `request #${i + 1} threw: ${err instanceof Error ? err.message : String(err)}`);
      return;
    }
  }

  const sixth = responses[5];
  if (sixth.status !== 429) {
    const text = (await safeText(sixth)).slice(0, 200);
    logFail(id, `6th request returned ${sixth.status}, expected 429. body: ${text}`);
    return;
  }

  const body = await safeJson(sixth);
  const hasErrorField =
    body && typeof body === "object" && (
      typeof body.error === "string" ||
      typeof body.message === "string"
    );
  if (!hasErrorField) {
    logFail(id, `6th response is 429 but body has no "error" or "message" field. body=${JSON.stringify(body)}`);
    return;
  }

  logPass(id, `6th request = 429 with ${body.error ? "error" : "message"} field`);
}

// ── M7b: /contact (server action) ───────────────────────────────────────────

/**
 * Server actions in Next.js progressive-enhancement mode encode the action
 * id as a hidden `$ACTION_ID_<hash>` input inside the form. Without this id
 * (or the equivalent `Next-Action` header on JSON requests) the runtime
 * rejects the POST with "Failed to find Server Action" before the action
 * function — and therefore the rate limiter — ever runs. We scrape the id
 * from a single GET before the loop so the 6 POSTs actually invoke the
 * action and exercise checkContactRateLimit.
 *
 * @param {string} pageUrl
 * @returns {Promise<string | null>}
 */
async function fetchContactActionId(pageUrl) {
  try {
    const res = await fetch(pageUrl, { redirect: "follow" });
    if (!res.ok) return null;
    const html = await res.text();
    const match = html.match(/name="\$ACTION_ID_([a-f0-9]+)"/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

async function runContactTest() {
  const id = "M7b";
  const url = `${BASE_URL}/contact`;
  console.log(`\n${ANSI.cyan}${ANSI.bold}[${id}]${ANSI.reset} ${ANSI.cyan}POST /contact ×6 → expecting 6th = 429 or redirect-to-rate-limited${ANSI.reset}`);

  const actionId = await fetchContactActionId(url);
  if (!actionId) {
    logFail(
      id,
      `could not scrape $ACTION_ID_* hidden field from GET ${url}. The contact form is a Next.js server action — without the action id (or a Next-Action header) the POST cannot invoke the rate limiter.`,
    );
    return;
  }
  logInfo(`scraped server-action id: ${actionId.slice(0, 12)}…`);

  /** @type {Array<{ status: number; location: string | null }>} */
  const summaries = [];
  for (let i = 0; i < 6; i++) {
    try {
      const form = new FormData();
      form.set(`$ACTION_ID_${actionId}`, "");
      form.set("name", "Test");
      form.set("email", "test@test.com");
      form.set("message", "x");
      form.set("_honeypot", "");

      const res = await fetch(url, {
        method: "POST",
        body: form,
        redirect: "manual",
      });
      const location = res.headers.get("location");
      summaries.push({ status: res.status, location });
      logInfo(`request #${i + 1} → ${res.status}${location ? ` → ${location}` : ""}`);
    } catch (err) {
      logFail(id, `request #${i + 1} threw: ${err instanceof Error ? err.message : String(err)}`);
      return;
    }
  }

  const sixth = summaries[5];
  const isRateLimitedJson = sixth.status === 429;
  const looksLikeRateLimitRedirect =
    sixth.status >= 300 &&
    sixth.status < 400 &&
    !!sixth.location &&
    /rate-limited|too-many/i.test(sixth.location);
  const looksLikeStatusOnLocation =
    !!sixth.location && /status=rate-limited|status=too-many/i.test(sixth.location);

  if (isRateLimitedJson || looksLikeRateLimitRedirect || looksLikeStatusOnLocation) {
    logPass(id, `6th request resolved as rate-limited (status=${sixth.status}, location=${sixth.location ?? "<none>"})`);
    return;
  }

  logFail(
    id,
    `6th request did not signal rate-limit. status=${sixth.status}, location=${sixth.location ?? "<none>"}. ` +
      "Server action did run (action id was found and posted) — investigate checkContactRateLimit.",
  );
}

// ── M7c: /api/create-checkout-session ───────────────────────────────────────

async function runCheckoutTest() {
  const id = "M7c";
  const url = `${BASE_URL}/api/create-checkout-session`;
  console.log(`\n${ANSI.cyan}${ANSI.bold}[${id}]${ANSI.reset} ${ANSI.cyan}POST /api/create-checkout-session ×11 → expecting 11th = 429 with code "rate_limited"${ANSI.reset}`);

  const payload = {
    items: [{ id: "mock-sku-1", quantity: 1 }],
    shipping: { ...SAMPLE_CHECKOUT_SHIPPING },
  };

  /** @type {Response[]} */
  const responses = [];
  for (let i = 0; i < 11; i++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      responses.push(res);
      logInfo(`request #${i + 1} → ${res.status}`);
    } catch (err) {
      logFail(id, `request #${i + 1} threw: ${err instanceof Error ? err.message : String(err)}`);
      return;
    }
  }

  const eleventh = responses[10];
  if (eleventh.status !== 429) {
    const text = (await safeText(eleventh)).slice(0, 200);
    logFail(id, `11th request returned ${eleventh.status}, expected 429. body: ${text}`);
    return;
  }

  const retryAfter = eleventh.headers.get("retry-after");
  if (!retryAfter) {
    logFail(id, `11th response is 429 but missing Retry-After header.`);
    return;
  }

  const body = await safeJson(eleventh);
  if (!body || typeof body !== "object" || body.code !== "rate_limited") {
    logFail(id, `11th response body is missing { code: "rate_limited" }. body=${JSON.stringify(body)}`);
    return;
  }

  logPass(id, `11th request = 429, code="rate_limited", Retry-After=${retryAfter}`);
}

// ── Runner ──────────────────────────────────────────────────────────────────

async function main() {
  console.log(`${ANSI.bold}M7 — Rate-limit verification${ANSI.reset}  ${ANSI.dim}(BASE_URL=${BASE_URL})${ANSI.reset}`);

  await runNewsletterTest();
  await runContactTest();
  await runCheckoutTest();

  console.log(`\n${ANSI.bold}Summary${ANSI.reset}`);
  for (const r of results) {
    const mark = r.ok ? `${ANSI.green}PASS${ANSI.reset}` : `${ANSI.red}FAIL${ANSI.reset}`;
    console.log(`  [${mark}] ${r.id} — ${r.detail}`);
  }

  const failed = results.filter((r) => !r.ok);
  if (failed.length > 0) {
    console.log(`\n${ANSI.red}${ANSI.bold}${failed.length} of ${results.length} sub-tests failed.${ANSI.reset}`);
    process.exit(1);
  }
  console.log(`\n${ANSI.green}${ANSI.bold}All ${results.length} rate-limit sub-tests passed.${ANSI.reset}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(`${ANSI.red}Fatal error in rate-limit script:${ANSI.reset}`, err);
  process.exit(1);
});
