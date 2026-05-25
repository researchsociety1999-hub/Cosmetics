/**
 * Centralised environment loader.
 *
 * - Reads `.env` once via dotenv.
 * - Validates every required key up-front and throws a single readable error
 *   listing *all* missing keys (so contributors don't fix them one at a time).
 * - Normalises `DRIVE_PRIVATE_KEY`: env stores it with literal "\n" sequences;
 *   we rewrite them to real newlines before handing to google.auth.JWT.
 */
import "dotenv/config";
import type { LogLevel } from "./types.js";

const LOG_LEVELS: readonly LogLevel[] = ["debug", "info", "warn", "error"];

function read(key: string): string | undefined {
  const raw = process.env[key];
  if (raw === undefined) return undefined;
  const trimmed = raw.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}

function readRequired(key: string, missing: string[]): string {
  const v = read(key);
  if (!v) {
    missing.push(key);
    return "";
  }
  return v;
}

function parseLogLevel(raw: string | undefined, fallback: LogLevel): LogLevel {
  if (!raw) return fallback;
  const lc = raw.toLowerCase() as LogLevel;
  return LOG_LEVELS.includes(lc) ? lc : fallback;
}

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/**
 * Service-account private keys are stored single-line in .env with "\n"
 * sequences. Rewrite them to real newlines so PEM parsing succeeds.
 *
 * Also tolerates the value being wrapped in surrounding quotes (the format
 * Google's UI hands out when you "copy private key").
 */
function normalisePrivateKey(raw: string): string {
  let s = raw;
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1);
  }
  return s.replace(/\\n/g, "\n");
}

export interface AppEnv {
  supabaseUrl: string;
  supabaseKey: string;
  notionKey: string;
  notionHeroProductDbId: string | null;
  driveClientEmail: string;
  driveClientId: string;
  drivePrivateKey: string;
  /** Optional — when set, hero folder lookups scope under this folder ID. */
  driveRootFolderId: string | null;
  logLevel: LogLevel;
  syncConcurrency: number;
}

let cached: AppEnv | null = null;

/**
 * Load + validate the runtime env. Throws on first call if anything is
 * missing; subsequent calls return the cached copy.
 */
export function loadEnv(): AppEnv {
  if (cached) return cached;

  const missing: string[] = [];

  const supabaseUrl        = readRequired("SUPABASE_URL", missing);
  const supabaseKey        = readRequired("SUPABASE_KEY", missing);
  const notionKey          = readRequired("NOTION_KEY", missing);
  const driveClientEmail   = readRequired("DRIVE_CLIENT_EMAIL", missing);
  const driveClientId      = readRequired("DRIVE_CLIENT_ID", missing);
  const drivePrivateKeyRaw = readRequired("DRIVE_PRIVATE_KEY", missing);

  if (missing.length > 0) {
    throw new Error(
      "Missing required environment variable(s): " +
        missing.join(", ") +
        ". Copy `.env.example` to `.env` and fill in the blanks.",
    );
  }

  cached = {
    supabaseUrl,
    supabaseKey,
    notionKey,
    notionHeroProductDbId: read("NOTION_HERO_PRODUCT_DB_ID") ?? null,
    driveClientEmail,
    driveClientId,
    drivePrivateKey: normalisePrivateKey(drivePrivateKeyRaw),
    driveRootFolderId: read("DRIVE_ROOT_FOLDER_ID") ?? null,
    logLevel: parseLogLevel(read("LOG_LEVEL"), "info"),
    syncConcurrency: parsePositiveInt(read("SYNC_CONCURRENCY"), 3),
  };
  return cached;
}

/** Used by tests / debug commands. Forces the next `loadEnv()` to re-read. */
export function resetEnvForTests(): void {
  cached = null;
}
