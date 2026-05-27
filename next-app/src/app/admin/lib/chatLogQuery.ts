/**
 * Filters, sorts, slices, and analytics for the chatbot diagnostics workspace.
 *
 * Read path:
 *   1. `getChatLogs(...)` tries `fetchChatLogs(...)` from the durable store.
 *   2. If the DB returned rows, they are converted to the in-memory
 *      `ChatLogEntry` shape used by the existing UI table / panels.
 *   3. If the DB returned nothing (empty or unavailable), we transparently
 *      fall back to the in-process ring buffer. `fromDb` exposes which path
 *      was taken so the page can show the durable-mode banner.
 *
 * Slice helpers (`getChatLogsLast24h`, `…Last7d`, `…Last30d`) call the same
 * DB-first pipeline with an appropriate `since:` bound.
 */
import {
  getChatLogCapacity,
  getChatLogEntries,
  getChatLogSize,
  type ChatLogEntry,
  type ChatOutcome,
  type ChatSource,
} from "./chatLog";
import {
  fetchChatLogs,
  type ChatLogRow,
  type FetchChatLogsOptions,
} from "./chatLogStore";
import {
  CHAT_THEME_LABELS,
  CHAT_THEME_VALUES,
  type ChatTheme,
} from "./chatThemes";

const CHAT_OUTCOMES = ["success", "fallback", "blocked", "error"] as const;
export const CHAT_OUTCOME_VALUES: ReadonlyArray<ChatOutcome> = CHAT_OUTCOMES;

export type ChatLogSortKey = "newest" | "latency" | "outcome";
export type SortDir = "asc" | "desc";

export type ChatLogRange = "24h" | "7d" | "30d" | "all";
export const CHAT_LOG_RANGE_VALUES: ReadonlyArray<ChatLogRange> = [
  "24h",
  "7d",
  "30d",
  "all",
];
export const CHAT_LOG_RANGE_LABELS: Record<ChatLogRange, string> = {
  "24h": "Last 24h",
  "7d": "Last 7d",
  "30d": "Last 30d",
  all: "All time",
};

export interface ChatLogFilters {
  q?: string;
  source?: ChatSource;
  outcome?: ChatOutcome;
  theme?: ChatTheme;
  dateFrom?: string;
  dateTo?: string;
  range?: ChatLogRange;
  sortBy?: ChatLogSortKey;
  sortDir?: SortDir;
}

export interface ChatLogQueryResult {
  logs: ChatLogEntry[];
  /** True when rows came from the durable store; false → in-memory fallback. */
  fromDb: boolean;
}

export interface SourceBreakdown {
  admin: number;
  storefront: number;
  unknown: number;
}

export interface OutcomeBreakdown {
  success: number;
  fallback: number;
  blocked: number;
  error: number;
}

export interface KnowledgeGapSignal {
  topic: string;
  count: number;
  lastEntry: ChatLogEntry;
  weakAnswerOnly: boolean;
  reasons: string[];
}

const MAX_SEARCH_LENGTH = 200;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function sanitizeSearch(value: string): string {
  return value.replace(/[%]/g, "").trim().slice(0, MAX_SEARCH_LENGTH).toLowerCase();
}

function isOutcome(value: string | undefined): value is ChatOutcome {
  if (!value) return false;
  return (CHAT_OUTCOMES as ReadonlyArray<string>).includes(value);
}

function isTheme(value: string | undefined): value is ChatTheme {
  if (!value) return false;
  return (CHAT_THEME_VALUES as ReadonlyArray<string>).includes(value);
}

function isSource(value: string | undefined): value is ChatSource {
  if (!value) return false;
  return value === "admin" || value === "storefront" || value === "unknown";
}

function isChatLogSortKey(value: string | undefined): value is ChatLogSortKey {
  return value === "newest" || value === "latency" || value === "outcome";
}

function isRange(value: string | undefined): value is ChatLogRange {
  if (!value) return false;
  return (CHAT_LOG_RANGE_VALUES as ReadonlyArray<string>).includes(value);
}

export function parseChatLogFiltersFromSearchParams(
  raw: Record<string, string | string[] | undefined>,
): ChatLogFilters {
  function single(key: string): string | undefined {
    const v = raw[key];
    if (Array.isArray(v)) return v[0]?.trim() || undefined;
    return typeof v === "string" ? v.trim() || undefined : undefined;
  }

  const outcome = single("outcome");
  const theme = single("theme");
  const source = single("source");
  const sortBy = single("sortBy");
  const sortDir = single("sortDir");
  const range = single("range");

  return {
    q: single("q")?.slice(0, MAX_SEARCH_LENGTH),
    source: isSource(source) ? source : undefined,
    outcome: isOutcome(outcome) ? outcome : undefined,
    theme: isTheme(theme) ? theme : undefined,
    dateFrom: single("dateFrom"),
    dateTo: single("dateTo"),
    range: isRange(range) ? range : "30d",
    sortBy: isChatLogSortKey(sortBy) ? sortBy : "newest",
    sortDir: sortDir === "asc" ? "asc" : "desc",
  };
}

function rangeToMs(range: ChatLogRange | undefined): number | null {
  switch (range) {
    case "24h":
      return 1 * MS_PER_DAY;
    case "7d":
      return 7 * MS_PER_DAY;
    case "30d":
      return 30 * MS_PER_DAY;
    case "all":
    default:
      return null;
  }
}

/** Coerce a single DB row into the in-memory `ChatLogEntry` shape. */
function rowToEntry(row: ChatLogRow): ChatLogEntry {
  const ts = new Date(row.created_at).getTime();
  return {
    id: row.id,
    ts: Number.isFinite(ts) ? ts : Date.now(),
    source: row.source,
    pathname: row.pathname,
    userMessage: row.user_message,
    assistantMessage: row.assistant_message,
    latencyMs: typeof row.latency_ms === "number" ? row.latency_ms : null,
    outcome: row.outcome,
    theme: row.theme,
    status: typeof row.status === "number" ? row.status : 200,
    errorCode: row.error_code,
  };
}

/**
 * DB-first read. Tries the durable store, falls back to the in-memory buffer
 * if the DB returned no rows (empty or unavailable). The `fromDb` flag tells
 * the caller which source was used so the UI can label visibility honestly.
 */
export async function getChatLogs(
  opts: FetchChatLogsOptions = {},
): Promise<ChatLogQueryResult> {
  const rows = await fetchChatLogs(opts);
  if (rows.length > 0) {
    return { logs: rows.map(rowToEntry), fromDb: true };
  }

  // Empty DB result → fall back to ring buffer so the workspace still works
  // in fallback mode. The page surfaces a banner when fromDb === false.
  return { logs: getChatLogEntries(), fromDb: false };
}

export function getChatLogsLast24h(): Promise<ChatLogQueryResult> {
  return getChatLogs({ since: new Date(Date.now() - 1 * MS_PER_DAY) });
}

export function getChatLogsLast7d(): Promise<ChatLogQueryResult> {
  return getChatLogs({ since: new Date(Date.now() - 7 * MS_PER_DAY) });
}

export function getChatLogsLast30d(): Promise<ChatLogQueryResult> {
  return getChatLogs({ since: new Date(Date.now() - 30 * MS_PER_DAY) });
}

function applyClientFilters(
  entries: ChatLogEntry[],
  filters: ChatLogFilters,
): ChatLogEntry[] {
  let rows = entries;

  if (filters.source) rows = rows.filter((e) => e.source === filters.source);
  if (filters.outcome) rows = rows.filter((e) => e.outcome === filters.outcome);
  if (filters.theme) rows = rows.filter((e) => e.theme === filters.theme);

  if (filters.dateFrom) {
    const start = new Date(`${filters.dateFrom}T00:00:00.000`).getTime();
    if (Number.isFinite(start)) rows = rows.filter((e) => e.ts >= start);
  }
  if (filters.dateTo) {
    const end = new Date(`${filters.dateTo}T23:59:59.999`).getTime();
    if (Number.isFinite(end)) rows = rows.filter((e) => e.ts <= end);
  }

  const rangeMs = rangeToMs(filters.range);
  if (rangeMs !== null) {
    const cutoff = Date.now() - rangeMs;
    rows = rows.filter((e) => e.ts >= cutoff);
  }

  if (filters.q) {
    const term = sanitizeSearch(filters.q);
    if (term) {
      rows = rows.filter(
        (e) =>
          e.userMessage.toLowerCase().includes(term) ||
          (e.assistantMessage ?? "").toLowerCase().includes(term),
      );
    }
  }

  return rows;
}

function sortEntries(
  entries: ChatLogEntry[],
  filters: ChatLogFilters,
): ChatLogEntry[] {
  const dir = filters.sortDir === "asc" ? 1 : -1;
  const out = entries.slice();
  switch (filters.sortBy) {
    case "latency":
      out.sort((a, b) => ((a.latencyMs ?? 0) - (b.latencyMs ?? 0)) * dir);
      break;
    case "outcome":
      out.sort((a, b) => a.outcome.localeCompare(b.outcome) * dir);
      break;
    case "newest":
    default:
      out.sort((a, b) => (a.ts - b.ts) * dir);
      break;
  }
  return out;
}

/**
 * Convenience wrapper used by the table view: applies the active filter and
 * sort to a pre-fetched dataset.
 */
export function filterChatLog(
  entries: ChatLogEntry[],
  filters: ChatLogFilters,
): ChatLogEntry[] {
  return sortEntries(applyClientFilters(entries, filters), filters);
}

/** Source breakdown (admin / storefront / unknown). */
export function getSourceBreakdown(
  logs: ReadonlyArray<{ source: ChatSource }>,
): SourceBreakdown {
  const out: SourceBreakdown = { admin: 0, storefront: 0, unknown: 0 };
  for (const log of logs) out[log.source] += 1;
  return out;
}

/** Outcome breakdown (success / fallback / blocked / error). */
export function getOutcomeBreakdown(
  logs: ReadonlyArray<{ outcome: ChatOutcome }>,
): OutcomeBreakdown {
  const out: OutcomeBreakdown = {
    success: 0,
    fallback: 0,
    blocked: 0,
    error: 0,
  };
  for (const log of logs) out[log.outcome] += 1;
  return out;
}

function p95(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor(0.95 * sorted.length));
  return Math.round(sorted[idx]!);
}

export interface ChatRangeStats {
  total: number;
  successCount: number;
  failureCount: number;
  successRate: number | null;
  failureRate: number | null;
  averageLatencyMs: number | null;
  p95LatencyMs: number | null;
}

/**
 * Lightweight aggregates for the slice cards at the top of the analytics
 * workspace. Operates on the in-memory `ChatLogEntry` shape.
 */
export function summarizeRange(
  logs: ReadonlyArray<ChatLogEntry>,
): ChatRangeStats {
  let successCount = 0;
  let failureCount = 0;
  const latencies: number[] = [];

  for (const log of logs) {
    if (log.outcome === "success") successCount += 1;
    else failureCount += 1;
    if (typeof log.latencyMs === "number") latencies.push(log.latencyMs);
  }

  const total = logs.length;
  return {
    total,
    successCount,
    failureCount,
    successRate: total > 0 ? successCount / total : null,
    failureRate: total > 0 ? failureCount / total : null,
    averageLatencyMs:
      latencies.length > 0
        ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
        : null,
    p95LatencyMs: p95(latencies),
  };
}

/**
 * Knowledge-gap heuristics. Triggers:
 *   - outcome is fallback/error/blocked
 *   - OR user repeated a near-identical question 2+ times
 *   - OR assistant reply ≤ 60 chars AND not a refusal
 */
const SHORT_REPLY_CHAR_THRESHOLD = 60;
const REPEAT_THRESHOLD = 2;

function normalizeTopic(message: string): string {
  return message
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 90);
}

export function detectKnowledgeGaps(
  entries: ReadonlyArray<ChatLogEntry>,
): KnowledgeGapSignal[] {
  const grouped = new Map<
    string,
    {
      topic: string;
      count: number;
      lastEntry: ChatLogEntry;
      hasFallbackOrError: boolean;
      hasShortReply: boolean;
      hasBlocked: boolean;
    }
  >();

  // entries arrive newest-first; iterate in reverse so "last seen" stays accurate.
  for (let i = entries.length - 1; i >= 0; i -= 1) {
    const entry = entries[i]!;
    const topic = normalizeTopic(entry.userMessage);
    if (!topic) continue;

    const existing = grouped.get(topic);
    const isShortReply =
      entry.outcome === "success" &&
      (entry.assistantMessage?.length ?? 0) <= SHORT_REPLY_CHAR_THRESHOLD;

    if (!existing) {
      grouped.set(topic, {
        topic,
        count: 1,
        lastEntry: entry,
        hasFallbackOrError:
          entry.outcome === "fallback" || entry.outcome === "error",
        hasShortReply: isShortReply,
        hasBlocked: entry.outcome === "blocked",
      });
      continue;
    }

    existing.count += 1;
    if (entry.ts > existing.lastEntry.ts) existing.lastEntry = entry;
    if (entry.outcome === "fallback" || entry.outcome === "error") {
      existing.hasFallbackOrError = true;
    }
    if (entry.outcome === "blocked") existing.hasBlocked = true;
    if (isShortReply) existing.hasShortReply = true;
  }

  const signals: KnowledgeGapSignal[] = [];
  for (const group of grouped.values()) {
    const reasons: string[] = [];
    if (group.hasFallbackOrError) reasons.push("Fell back or errored");
    if (group.hasShortReply) reasons.push("Assistant gave a short generic reply");
    if (group.hasBlocked) reasons.push("Request was blocked by the safety guard");
    if (group.count >= REPEAT_THRESHOLD) reasons.push(`Asked ${group.count}×`);

    if (reasons.length === 0) continue;

    signals.push({
      topic: group.topic,
      count: group.count,
      lastEntry: group.lastEntry,
      weakAnswerOnly: !group.hasFallbackOrError && !group.hasBlocked,
      reasons,
    });
  }

  signals.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return b.lastEntry.ts - a.lastEntry.ts;
  });

  return signals.slice(0, 12);
}

const CANDIDATE_FAQ_MIN_COUNT = 3;

/**
 * Candidate FAQ topics: groups logs by `theme`, keeps themes with count ≥ 3,
 * sorts by count desc. Independent of outcome — even themes where the
 * answer worked are useful for building a canned snippet library.
 */
export function detectCandidateFaqTopics(
  logs: ReadonlyArray<{ theme: ChatTheme }>,
): Array<{ label: string; count: number }> {
  const counts = new Map<ChatTheme, number>();
  for (const log of logs) {
    counts.set(log.theme, (counts.get(log.theme) ?? 0) + 1);
  }

  const out: Array<{ label: string; count: number }> = [];
  for (const [theme, count] of counts.entries()) {
    if (count >= CANDIDATE_FAQ_MIN_COUNT) {
      out.push({ label: CHAT_THEME_LABELS[theme], count });
    }
  }
  out.sort((a, b) => b.count - a.count);
  return out;
}

// Buffer introspection helpers (used by the fallback-banner UI).
export function getInMemoryBufferState(): { size: number; capacity: number } {
  return { size: getChatLogSize(), capacity: getChatLogCapacity() };
}
