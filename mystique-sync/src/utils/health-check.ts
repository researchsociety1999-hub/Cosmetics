/**
 * Lightweight liveness probes for each external service.
 * Each check has a hard 6-second timeout so a hung credential never wedges
 * the whole pipeline.
 */
import { getSupabase } from "../modules/supabase/client.js";
import { getNotion } from "../modules/notion/client.js";
import { getDrive } from "../modules/drive/client.js";
import { loadEnv } from "../config/env.js";
import type { HealthCheckResult, ServiceName } from "../config/types.js";

const TIMEOUT_MS = 6_000;

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`${label} timed out after ${ms}ms`)),
      ms,
    );
    p.then((v) => { clearTimeout(timer); resolve(v); })
     .catch((e) => { clearTimeout(timer); reject(e); });
  });
}

async function timed<T>(label: string, fn: () => Promise<T>): Promise<{ value: T; latencyMs: number }> {
  const t0 = Date.now();
  const value = await withTimeout(fn(), TIMEOUT_MS, label);
  return { value, latencyMs: Date.now() - t0 };
}

function fail(service: ServiceName, latencyMs: number, err: unknown): HealthCheckResult {
  const message = err instanceof Error ? err.message : String(err);
  return { service, ok: false, message, latencyMs };
}

async function checkSupabase(): Promise<HealthCheckResult> {
  const t0 = Date.now();
  try {
    const supabase = getSupabase();
    const { value } = await timed("supabase", async () =>
      supabase.from("products").select("id", { count: "exact", head: true }),
    );
    if (value.error) throw value.error;
    return {
      service: "supabase",
      ok: true,
      message: `products reachable (count=${value.count ?? "?"})`,
      latencyMs: Date.now() - t0,
    };
  } catch (err) {
    return fail("supabase", Date.now() - t0, err);
  }
}

async function checkNotion(): Promise<HealthCheckResult> {
  const t0 = Date.now();
  try {
    const notion = getNotion();
    const me = await withTimeout(notion.users.me({}), TIMEOUT_MS, "notion");
    return {
      service: "notion",
      ok: true,
      message: `authenticated as ${me.name ?? me.id}`,
      latencyMs: Date.now() - t0,
    };
  } catch (err) {
    return fail("notion", Date.now() - t0, err);
  }
}

async function checkDrive(): Promise<HealthCheckResult> {
  const t0 = Date.now();
  try {
    const drive = getDrive();
    const root = loadEnv().driveRootFolderId ?? "root";
    const res = await withTimeout(
      drive.listFiles({
        q: `'${root}' in parents and trashed = false and mimeType = 'application/vnd.google-apps.folder'`,
        pageSize: 5,
      }),
      TIMEOUT_MS,
      "drive",
    );
    return {
      service: "drive",
      ok: true,
      message: `service-account reached Drive (sample folders=${res.length})`,
      latencyMs: Date.now() - t0,
    };
  } catch (err) {
    return fail("drive", Date.now() - t0, err);
  }
}

export async function runHealthChecks(): Promise<HealthCheckResult[]> {
  return Promise.all([checkSupabase(), checkNotion(), checkDrive()]);
}
