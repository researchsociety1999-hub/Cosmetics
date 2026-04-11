#!/usr/bin/env node
/**
 * Calls GET /api/health/integrations on a running Next server.
 * Usage: from next-app: `npm run test:integrations`
 * Or: `node scripts/test-integrations.mjs http://localhost:3001`
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "..", ".env.local");

if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

const base = (process.argv[2] || process.env.INTEGRATION_BASE_URL || "http://localhost:3000").replace(
  /\/$/,
  "",
);
const url = `${base}/api/health/integrations`;

const res = await fetch(url);

if (!res.ok) {
  console.error(`HTTP ${res.status} from ${url}`);
  if (res.status === 404) {
    console.error(
      "In production, set ENABLE_INTEGRATION_HEALTH=1 or run against dev (NODE_ENV=development).",
    );
  }
  process.exit(1);
}

const data = await res.json();
console.log(JSON.stringify(data, null, 2));

const issues = [];

const cat = data.probes?.supabaseCatalog;
if (cat && !cat.ok) {
  issues.push(`Supabase catalog: ${cat.error}`);
}

const st = data.probes?.stripe;
if (st && !st.skipped && !st.ok) {
  issues.push(`Stripe API: ${st.error}`);
}

const rs = data.probes?.resend;
if (rs && !rs.skipped && !rs.ok) {
  issues.push(`Resend API: ${rs.error}`);
}

if (issues.length) {
  console.error("\n--- failures ---\n" + issues.join("\n"));
  process.exit(1);
}

console.error("\nAll executed probes passed (skipped counts as N/A).");
