/**
 * Supabase persistence layer for chatbot diagnostics.
 *
 * Backed by `public.chat_logs` (see
 * `supabase/migrations/20260526_chat_logs.sql`). All writes use `supabaseAdmin`
 * so the table can stay admin-only by construction — RLS is enabled with no
 * policies, so anon/authenticated roles can't touch it.
 *
 * Three public functions:
 *   - insertChatLog(entry)   — fire-and-forget write
 *   - fetchChatLogs(opts)    — DB-first read with safe fallback to []
 *   - countChatLogs(opts)    — windowed COUNT(*) with safe fallback to 0
 */
import { supabaseAdmin } from "../../lib/supabaseClient";

/**
 * Insert payload — mirrors the table columns minus the DB-assigned `id` and
 * `created_at`. Snake_case matches the column names exactly so we can pass
 * it straight to `supabase.from(...).insert(...)`.
 */
export interface ChatLogEntry {
  source: "admin" | "storefront" | "unknown";
  user_message: string;
  assistant_message: string | null;
  outcome: "success" | "fallback" | "blocked" | "error";
  theme:
    | "product_question"
    | "shipping_tracking"
    | "returns_refund"
    | "recommendation"
    | "ingredients_suitability"
    | "price_promotion"
    | "other";
  latency_ms: number | null;
  status: number;
  error_code: string | null;
  pathname: string | null;
}

/** Full row including the DB-assigned identity + timestamp. */
export interface ChatLogRow extends ChatLogEntry {
  id: number;
  created_at: string;
}

export interface FetchChatLogsOptions {
  since?: Date;
  source?: string;
  outcome?: string;
  limit?: number;
}

export interface CountChatLogsOptions {
  since?: Date;
}

const DEFAULT_FETCH_LIMIT = 500;
const MAX_FETCH_LIMIT = 2000;

/**
 * Persist a chat exchange. Fire-and-forget by contract: errors are swallowed
 * and surfaced only via `console.warn`. Callers should never `await` and
 * never rely on this for correctness — durability is best-effort.
 */
export async function insertChatLog(entry: ChatLogEntry): Promise<void> {
  if (!supabaseAdmin) return;

  try {
    const { error } = await supabaseAdmin.from("chat_logs").insert(entry);
    if (error) {
      console.warn("[chat_logs] insert failed:", error.message);
    }
  } catch (err) {
    console.warn(
      "[chat_logs] insert threw:",
      err instanceof Error ? err.message : String(err),
    );
  }
}

/**
 * Fetch logs from the durable store. Returns `[]` (not throws) on any error
 * so callers can transparently fall back to the in-memory ring buffer.
 */
export async function fetchChatLogs(
  opts: FetchChatLogsOptions = {},
): Promise<ChatLogRow[]> {
  if (!supabaseAdmin) return [];

  const limit = Math.min(
    Math.max(1, opts.limit ?? DEFAULT_FETCH_LIMIT),
    MAX_FETCH_LIMIT,
  );

  try {
    let query = supabaseAdmin
      .from("chat_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (opts.since instanceof Date && !Number.isNaN(opts.since.getTime())) {
      query = query.gte("created_at", opts.since.toISOString());
    }
    if (opts.source) query = query.eq("source", opts.source);
    if (opts.outcome) query = query.eq("outcome", opts.outcome);

    const { data, error } = await query;
    if (error) {
      console.warn("[chat_logs] fetch failed:", error.message);
      return [];
    }
    return (data ?? []) as ChatLogRow[];
  } catch (err) {
    console.warn(
      "[chat_logs] fetch threw:",
      err instanceof Error ? err.message : String(err),
    );
    return [];
  }
}

/** Count rows in the (optional) time window. Returns 0 on error. */
export async function countChatLogs(
  opts: CountChatLogsOptions = {},
): Promise<number> {
  if (!supabaseAdmin) return 0;

  try {
    let query = supabaseAdmin
      .from("chat_logs")
      .select("id", { count: "exact", head: true });

    if (opts.since instanceof Date && !Number.isNaN(opts.since.getTime())) {
      query = query.gte("created_at", opts.since.toISOString());
    }

    const { count, error } = await query;
    if (error) {
      console.warn("[chat_logs] count failed:", error.message);
      return 0;
    }
    return count ?? 0;
  } catch (err) {
    console.warn(
      "[chat_logs] count threw:",
      err instanceof Error ? err.message : String(err),
    );
    return 0;
  }
}
