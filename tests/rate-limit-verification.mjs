#!/usr/bin/env node
// @ts-check
/**
 * M7 — Rate-limit verification script (pure Node.js ESM, no Playwright).
 *
 * Hits three rate-limited endpoints and confirms the correct 429 / redirect
 * behaviour fires after the configured threshold.
 *
 * Prerequisites
 *   • The Next.js dev/prod server must be running on http://localhost:3001
 *   • For M7b the /contact page must be reachable (it scrapes the
 *     Next.js server-action id from the rendered HTML before the loop).
 *
 * Usage
 *   node tests/rate-limit-verification.mjs
 *   npm run test:ratelimit
 */

const BASE = "http://localhost:3001";

/** @param {string} url @param {RequestInit} init */
async function fetchNoRedirect(url, init = {}) {
  return fetch(url, { ...init, redirect: "manual" });
}

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * POST to /api/newsletter `limit+1` times and confirm the last response is 429.
 * Limit is 5 per 10 min.  We send 6 requests.
 */
async function testM7a() {
  console.log("\n[M7a] Newsletter rate-limit (/api/newsletter)");
  const LIMIT = 5;
  let lastStatus = 0;
  let lastBody = "";

  for (let i = 1; i <= LIMIT + 1; i++) {
    const res = await fetchNoRedirect(`${BASE}/api/newsletter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: `ratelimit-test-${i}@example.invalid` }),
    });
    lastStatus = res.status;
    lastBody = await res.text();
    process.stdout.write(`  request ${i}: ${res.status}\n`);
    if (res.status === 429) break;
  }

  let parsed = {};
  try { parsed = JSON.parse(lastBody); } catch { /* ignore */ }

  const pass =
    lastStatus === 429 &&
    ("error" in parsed || "message" in parsed || lastBody.includes("rate"));

  if (pass) {
    console.log("  [PASS] M7a — 6th request = 429 with error field");
  } else {
    console.log(
      `  [FAIL] M7a — expected 429 with error field, got status=${lastStatus}, body=${lastBody.slice(0, 200)}`,
    );
  }
  return pass;
}

/**
 * POST to the /contact server-action `limit+1` times using the action-id
 * scraped from the rendered page, and confirm the 6th request 303-redirects
 * to /contact?status=rate-limited.
 * Limit is 5 per 10 min.
 */
async function testM7b() {
  console.log("\n[M7b] Contact form rate-limit (/contact server-action)");

  // Scrape the action id from the rendered page.
  let actionId = "";
  try {
    const html = await fetch(`${BASE}/contact`).then((r) => r.text());
    const match = html.match(
      /name="\$ACTION_ID_([a-f0-9]{30,})"/,
    );
    if (match) {
      actionId = match[1];
      console.log(`  ACTION_ID: ${actionId}`);
    } else {
      // Try the other format: hidden input value equals the hash directly.
      const m2 = html.match(
        /\$ACTION_ID_([a-f0-9]{30,})/,
      );
      if (m2) actionId = m2[1];
    }
  } catch (e) {
    console.log(`  [FAIL] M7b — could not fetch /contact: ${e}`);
    return false;
  }

  if (!actionId) {
    console.log("  [FAIL] M7b — could not scrape $ACTION_ID from /contact");
    return false;
  }

  const LIMIT = 5;
  let lastStatus = 0;
  let lastLocation = "";

  for (let i = 1; i <= LIMIT + 1; i++) {
    const fd = new FormData();
    fd.append(`$ACTION_ID_${actionId}`, "");
    fd.append("name", `Rate Limit Tester ${i}`);
    fd.append("email", `ratelimit-test-${i}@example.invalid`);
    fd.append("message", "This is a rate-limit probe message.");

    const res = await fetchNoRedirect(`${BASE}/contact`, {
      method: "POST",
      body: fd,
    });
    lastStatus = res.status;
    lastLocation = res.headers.get("location") ?? "";
    process.stdout.write(
      `  request ${i}: ${res.status} → ${lastLocation || "(no location)"}\n`,
    );
    if (lastLocation.includes("rate-limited")) break;
  }

  const pass =
    lastStatus === 303 && lastLocation.includes("rate-limited");

  if (pass) {
    console.log(
      "  [PASS] M7b — 6th request resolved as rate-limited (status=303, location=" +
        lastLocation +
        ")",
    );
  } else {
    console.log(
      `  [FAIL] M7b — 6th request did not signal rate-limit. status=${lastStatus}, location=${lastLocation}. ` +
        "If this is Next.js rejecting plain-FormData server-action POSTs " +
        "(no Next-Action header), the rate limiter never runs — verify by " +
        "hitting the form in a browser or scraping the action id first.",
    );
  }
  return pass;
}

/**
 * POST to /api/create-checkout-session `limit+1` times and confirm the
 * response is 429 with { code: "rate_limited" } and Retry-After header.
 * Limit is 10 per 5 min.  We send 11 requests.
 */
async function testM7c() {
  console.log(
    "\n[M7c] Checkout session rate-limit (/api/create-checkout-session)",
  );
  const LIMIT = 10;
  let lastStatus = 0;
  let lastBody = "";
  let retryAfter = "";

  for (let i = 1; i <= LIMIT + 1; i++) {
    const res = await fetchNoRedirect(`${BASE}/api/create-checkout-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cartItems: [{ id: "test-sku", quantity: 1, price: 1000 }],
        shipping: {
          fullName: "Rate Limit Tester",
          email: `ratelimit-test-${i}@example.invalid`,
          addressLine1: "1 Test Street",
          city: "Austin",
          state: "TX",
          postalCode: "78701",
          country: "United States",
        },
      }),
    });
    lastStatus = res.status;
    lastBody = await res.text();
    retryAfter = res.headers.get("Retry-After") ?? "";
    process.stdout.write(`  request ${i}: ${res.status}\n`);
    if (res.status === 429) break;
  }

  let parsed = {};
  try { parsed = JSON.parse(lastBody); } catch { /* ignore */ }

  const pass =
    lastStatus === 429 &&
    (parsed as Record<string, unknown>).code === "rate_limited" &&
    retryAfter !== "";

  if (pass) {
    console.log(
      `  [PASS] M7c — 11th request = 429, code="rate_limited", Retry-After=${retryAfter}`,
    );
  } else {
    console.log(
      `  [FAIL] M7c — expected 429 with rate_limited code and Retry-After header.` +
        ` status=${lastStatus}, body=${lastBody.slice(0, 200)}, Retry-After=${retryAfter}`,
    );
  }
  return pass;
}

// ─── main ───────────────────────────────────────────────────────────────────

(async () => {
  console.log("Rate-limit verification suite");
  console.log(`Target: ${BASE}\n`);

  const [a, b, c] = await Promise.allSettled([
    testM7a(),
    testM7b(),
    testM7c(),
  ]);

  const results = [
    { label: "M7a", pass: a.status === "fulfilled" && a.value },
    { label: "M7b", pass: b.status === "fulfilled" && b.value },
    { label: "M7c", pass: c.status === "fulfilled" && c.value },
  ];

  console.log("\n── Summary ──────────────────────────────────────────────");
  let allPass = true;
  for (const r of results) {
    const icon = r.pass ? "✅" : "❌";
    console.log(`  ${icon}  ${r.label}`);
    if (!r.pass) allPass = false;
  }

  if (allPass) {
    console.log("\nAll rate-limit sub-tests passed.");
    process.exit(0);
  } else {
    const failed = results.filter((r) => !r.pass).map((r) => r.label);
    console.log(`\n${failed.length} of 3 sub-tests failed.`);
    process.exit(1);
  }
})();
