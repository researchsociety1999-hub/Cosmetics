/**
 * Diagnostics log for the Ritual Companion.
 *
 * Durable storage:
 *   - Primary store is the Supabase `chat_logs` table (see
 *     `supabase/migrations/20260526_chat_logs.sql` and
 *     `./chatLogStore.ts`). Writes are fire-and-forget so /api/chat
 *     latency is unaffected and logging failures never break the chat path.
 *
 * In-process ring buffer:
 *   - Retained as a fallback when `supabaseAdmin` is unavailable (e.g. local
 *     dev without a service-role key) and as a read-through cache for the
 *     most recent turns. Capped at `MAX_ENTRIES`.
 *
 * Visibility:
 *   - When the durable store is configured, /admin/chatbot reads from the DB,
 *     so the workspace survives Vercel instance recycles and shows a real
 *     24h/7d/30d view.
 *   - When the durable store is NOT configured, the workspace falls back to
 *     this in-memory buffer and labels itself "limited visibility" — same
 *     behaviour shipped in Admin v3.
 */
import type { ChatTheme } from "./chatThemes";
import { classifyChatTheme } from "./chatThemes";
import { insertChatLog } from "./chatLogStore";

export type ChatOutcome = "success" | "fallback" | "blocked" | "error";
export type ChatSource = "storefront" | "admin" | "unknown";

export interface ChatLogEntry {
  /** Monotonic id assigned by the logger (incrementing integer). */
  id: number;
  /** Unix ms timestamp captured when the response was finalised. */
  ts: number;
  source: ChatSource;
  pathname: string | null;
  userMessage: string;
  assistantMessage: string | null;
  /** Round-trip latency for the upstream call, when measurable. */
  latencyMs: number | null;
  outcome: ChatOutcome;
  /** Lightweight theme classification — see `chatThemes.ts`. */
  theme: ChatTheme;
  /** HTTP status returned to the client (helps disambiguate blocked vs. error). */
  status: number;
  /** Optional error code string from the JSON body (`error` field) when present. */
  errorCode: string | null;
}

interface ChatLogInput {
  source: ChatSource;
  pathname?: string | null;
  userMessage: string;
  assistantMessage?: string | null;
  latencyMs?: number | null;
  outcome: ChatOutcome;
  status?: number;
  errorCode?: string | null;
}

const MAX_ENTRIES = 500;
const PREVIEW_LIMIT = 280;

/**
 * Use `globalThis` so a hot-reload / multiple module instantiations in the
 * Next dev server share one ring buffer. The Symbol is module-scoped so it
 * can't collide with anything else on global.
 */
const STORE_KEY = Symbol.for("@mystique/admin/chatLogStore.v1");

interface ChatLogStore {
  entries: ChatLogEntry[];
  nextId: number;
}

function getStore(): ChatLogStore {
  const g = globalThis as unknown as Record<symbol, ChatLogStore | undefined>;
  let store = g[STORE_KEY];
  if (!store) {
    store = { entries: [], nextId: 1 };
    g[STORE_KEY] = store;
  }
  return store;
}

function trimPreview(value: string | null | undefined): string {
  if (!value) return "";
  const trimmed = value.trim();
  if (trimmed.length <= PREVIEW_LIMIT) return trimmed;
  return `${trimmed.slice(0, PREVIEW_LIMIT - 1).trim()}…`;
}

/** Detect known fallback / refusal phrases emitted by `/api/chat`. */
const FALLBACK_PHRASES = [
  "i couldn’t quite gather",
  "i couldn't quite gather",
  "ritual companion is resting",
  "the message limit",
  "interrupted our connection",
];

/** The injection-refusal copy hard-coded into `/api/chat` (substring match). */
const BLOCKED_PHRASE = "here to help with mystique skincare rituals";

export function detectOutcome(
  status: number,
  assistantMessage: string | null | undefined,
  errorCode: string | null | undefined,
): ChatOutcome {
  // 4xx that isn't a refusal is a client / rate-limit / payload error.
  if (status === 429) return "error";
  if (status >= 500) return "error";
  if (status >= 400 && !assistantMessage) return "error";

  const text = (assistantMessage ?? "").toLowerCase();
  if (text.includes(BLOCKED_PHRASE)) return "blocked";
  if (errorCode === "empty_response" || errorCode === "upstream_error") {
    return "error";
  }
  if (errorCode === "misconfigured" || errorCode === "rate_limited") {
    return "error";
  }
  for (const phrase of FALLBACK_PHRASES) {
    if (text.includes(phrase)) return "fallback";
  }
  if (!text) return "error";
  return "success";
}

export function detectSourceFromPathname(
  pathname: string | null | undefined,
): ChatSource {
  if (!pathname) return "unknown";
  if (pathname.startsWith("/admin")) return "admin";
  return "storefront";
}

/**
 * Append a log entry. Never throws — chat reliability comes first.
 *
 * Writes go to two places:
 *   1. The in-process ring buffer (cheap, immediate, used as a fallback).
 *   2. The Supabase `chat_logs` table (durable, queried by /admin/chatbot).
 *      The persist call is fire-and-forget: we kick off the Promise but do
 *      not await it, so /api/chat returns at full speed and any DB error is
 *      swallowed.
 */
export function recordChatExchange(input: ChatLogInput): void {
  try {
    const store = getStore();
    const userMessage = trimPreview(input.userMessage);
    if (!userMessage) return;

    const assistantMessage = trimPreview(input.assistantMessage);

    const entry: ChatLogEntry = {
      id: store.nextId++,
      ts: Date.now(),
      source: input.source,
      pathname: input.pathname ?? null,
      userMessage,
      assistantMessage: assistantMessage || null,
      latencyMs:
        typeof input.latencyMs === "number" && Number.isFinite(input.latencyMs)
          ? Math.round(input.latencyMs)
          : null,
      outcome: input.outcome,
      theme: classifyChatTheme(userMessage),
      status: typeof input.status === "number" ? input.status : 200,
      errorCode: input.errorCode ?? null,
    };

    store.entries.push(entry);
    if (store.entries.length > MAX_ENTRIES) {
      store.entries.splice(0, store.entries.length - MAX_ENTRIES);
    }

    // Fire-and-forget durable persist. `insertChatLog` is internally
    // try/catch-wrapped; the extra `.catch` here is belt-and-braces so an
    // unexpected sync throw can never propagate up the chat path.
    void insertChatLog({
      source: input.source,
      pathname: input.pathname ?? null,
      user_message: userMessage,
      assistant_message: assistantMessage || null,
      latency_ms: entry.latencyMs,
      outcome: input.outcome,
      theme: entry.theme,
      status: entry.status,
      error_code: input.errorCode ?? null,
    }).catch(() => {
      /* swallowed */
    });
  } catch {
    // Diagnostics must never break the chat path.
  }
}

/** Snapshot of all entries, newest first. Safe to mutate by the caller. */
export function getChatLogEntries(): ChatLogEntry[] {
  return getStore().entries.slice().reverse();
}

/** Number of entries currently retained. */
export function getChatLogSize(): number {
  return getStore().entries.length;
}

export function getChatLogCapacity(): number {
  return MAX_ENTRIES;
}
