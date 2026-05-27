import type { Metadata } from "next";
import { AdminShell } from "../components/AdminShell";
import { CandidateFaqPanel } from "../components/CandidateFaqPanel";
import { ChatbotTestConsole } from "../components/ChatbotTestConsole";
import { ChatLogFiltersBar } from "../components/ChatLogFilters";
import { ChatLogTable } from "../components/ChatLogTable";
import { ChatRangeNav } from "../components/ChatRangeNav";
import { ChatThemePanel } from "../components/ChatThemePanel";
import { KnowledgeGapPanel } from "../components/KnowledgeGapPanel";
import { KpiCard } from "../components/KpiCard";
import { countChatLogs } from "../lib/chatLogStore";
import {
  CHAT_LOG_RANGE_LABELS,
  detectCandidateFaqTopics,
  detectKnowledgeGaps,
  filterChatLog,
  getChatLogs,
  getChatLogsLast24h,
  getChatLogsLast30d,
  getChatLogsLast7d,
  getInMemoryBufferState,
  getOutcomeBreakdown,
  getSourceBreakdown,
  parseChatLogFiltersFromSearchParams,
  summarizeRange,
  type ChatLogFilters,
  type ChatLogRange,
} from "../lib/chatLogQuery";
import type { ChatLogEntry } from "../lib/chatLog";
import type { ChatTheme } from "../lib/chatThemes";
import { requireAdminSession } from "../lib/session";

export const metadata: Metadata = {
  title: "Chatbot admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface ChatbotConfigView {
  modelLabel: string;
  apiKeyConfigured: boolean;
  modelConfigured: boolean;
  siteUrl: string;
}

function getChatbotConfigView(): ChatbotConfigView {
  const apiKeyConfigured = Boolean(process.env.OPENROUTER_API_KEY?.trim());
  const modelRaw = process.env.OPENROUTER_MODEL?.trim() ?? "";
  return {
    modelLabel: modelRaw || "Not set",
    apiKeyConfigured,
    modelConfigured: Boolean(modelRaw),
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL?.trim() || "(default)",
  };
}

function StatusBadge({ ok, label }: { ok: boolean; label?: string }) {
  const cls = ok
    ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30"
    : "bg-rose-500/15 text-rose-300 ring-rose-500/30";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.6rem] font-medium uppercase tracking-[0.18em] ring-1 ring-inset ${cls}`}
    >
      {label ?? (ok ? "Configured" : "Missing")}
    </span>
  );
}

interface ChatbotAdminPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function formatLatency(ms: number | null): string {
  if (ms === null || !Number.isFinite(ms)) return "—";
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

function formatRate(rate: number | null): string {
  if (rate === null || !Number.isFinite(rate)) return "—";
  return `${(rate * 100).toFixed(1)}%`;
}

/**
 * Picks the spec-defined slice helper for the active range. Each helper
 * returns `{ logs, fromDb }` where `fromDb` lets the page label visibility
 * honestly (durable Supabase read vs. in-memory ring buffer fallback).
 */
function pickSliceHelper(range: ChatLogRange) {
  switch (range) {
    case "24h":
      return getChatLogsLast24h;
    case "7d":
      return getChatLogsLast7d;
    case "30d":
      return getChatLogsLast30d;
    case "all":
    default:
      // No `since` → DB-first read of the most recent N rows, capped by
      // chatLogStore's DEFAULT_FETCH_LIMIT (500).
      return () => getChatLogs({});
  }
}

/**
 * Group logs by `theme` and convert to the `{ theme, count, percent }` shape
 * `ChatThemePanel` consumes. Lives on the page because it's a one-line
 * post-aggregation specific to this view.
 */
function buildTopThemes(
  logs: ReadonlyArray<ChatLogEntry>,
): Array<{ theme: ChatTheme; count: number; percent: number }> {
  if (logs.length === 0) return [];
  const counts = new Map<ChatTheme, number>();
  for (const log of logs) counts.set(log.theme, (counts.get(log.theme) ?? 0) + 1);
  const total = logs.length;
  return Array.from(counts.entries())
    .map(([theme, count]) => ({ theme, count, percent: count / total }))
    .sort((a, b) => b.count - a.count);
}

type BreakdownTone = "emerald" | "amber" | "indigo" | "rose" | "default";

const BREAKDOWN_TONE_BARS: Record<BreakdownTone, string> = {
  emerald: "bg-emerald-400/70",
  amber: "bg-amber-400/70",
  indigo: "bg-indigo-400/70",
  rose: "bg-rose-400/70",
  default: "bg-[#d6a85f]/70",
};

interface BreakdownRow {
  label: string;
  value: number;
  tone?: BreakdownTone;
}

function BreakdownPanel({
  title,
  rows,
  total,
}: {
  title: string;
  rows: BreakdownRow[];
  total: number;
}) {
  const denominator = total > 0 ? total : 1;
  return (
    <section className="rounded-[16px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)] p-5">
      <h2 className="text-[0.7rem] uppercase tracking-[0.24em] text-[#b8ab95]">
        {title}
      </h2>
      {rows.every((r) => r.value === 0) ? (
        <p className="mt-4 text-xs text-[#9a8f7a]">
          No data in the selected window.
        </p>
      ) : (
        <ul className="mt-4 space-y-3 text-sm">
          {rows.map((row) => {
            const pct = (row.value / denominator) * 100;
            const widthPct = Math.max(2, Math.round(pct));
            const tone = BREAKDOWN_TONE_BARS[row.tone ?? "default"];
            return (
              <li key={row.label}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[#d8c6aa]">{row.label}</span>
                  <span className="text-[0.7rem] text-[#9a8f7a]">
                    {row.value.toLocaleString("en-US")} · {pct.toFixed(0)}%
                  </span>
                </div>
                <div
                  className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[rgba(214,168,95,0.08)]"
                  aria-hidden
                >
                  <div
                    className={`h-full rounded-full ${tone}`}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function pickRangeFromFilters(filters: ChatLogFilters): ChatLogRange {
  return filters.range ?? "30d";
}

export default async function AdminChatbotPage({
  searchParams,
}: ChatbotAdminPageProps) {
  await requireAdminSession("/admin/chatbot");
  const config = getChatbotConfigView();
  const chatReady = config.apiKeyConfigured && config.modelConfigured;

  const params = await searchParams;
  const filters = parseChatLogFiltersFromSearchParams(params);
  const activeRange = pickRangeFromFilters(filters);
  const activeRangeLabel = CHAT_LOG_RANGE_LABELS[activeRange];

  // ── One DB hit for the active range — feeds every panel below. ──
  const sliceHelper = pickSliceHelper(activeRange);
  const { logs, fromDb } = await sliceHelper();

  // Apply UI filters (q / source / outcome / theme / sort) to the table only.
  // Slice cards + breakdowns reflect the *unfiltered* range so totals make
  // sense regardless of which filter chip is active.
  const filteredEntries = filterChatLog(logs, filters);

  const rangeStats = summarizeRange(logs);
  const sourceBreakdown = getSourceBreakdown(logs);
  const outcomeBreakdown = getOutcomeBreakdown(logs);
  const candidates = detectCandidateFaqTopics(logs);
  const gaps = detectKnowledgeGaps(logs);
  const topThemes = buildTopThemes(logs);
  const buffer = getInMemoryBufferState();

  // All-time count is only meaningful when the durable store is reachable.
  // Skip the COUNT(*) round-trip otherwise so we don't pay for a query we
  // know will return 0.
  const durableTotal = fromDb ? await countChatLogs({}) : null;

  const failureCount =
    outcomeBreakdown.fallback + outcomeBreakdown.blocked + outcomeBreakdown.error;

  return (
    <AdminShell pageEyebrow="Mystique admin" pageTitle="Chatbot">
      <p className="mb-6 max-w-3xl text-sm text-[#b8ab95]">
        The Ritual Companion is powered by OpenRouter through the existing{" "}
        <code className="text-[#d8c6aa]">/api/chat</code> route. This workspace
        is for testing prompts, watching live diagnostics, and finding
        knowledge gaps to fill with future FAQ snippets.
      </p>

      <div className="mb-6">
        <ChatRangeNav activeRange={activeRange} />
      </div>

      {!fromDb ? (
        <p
          role="status"
          aria-live="polite"
          className="mb-6 rounded-[12px] border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs leading-relaxed text-amber-100"
        >
          <span className="font-medium uppercase tracking-[0.2em] text-amber-300">
            Limited visibility —
          </span>{" "}
          running in fallback mode (in-memory only). Configure{" "}
          <code className="text-amber-50">SUPABASE_SECRET_KEY</code> to enable
          durable logs.
        </p>
      ) : null}

      <section
        aria-label={`Active-range stats · ${activeRangeLabel}`}
        className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <KpiCard
          label={`Total · ${activeRangeLabel.toLowerCase()}`}
          value={rangeStats.total.toLocaleString("en-US")}
          hint={
            fromDb && durableTotal !== null
              ? `${durableTotal.toLocaleString("en-US")} all-time persisted`
              : `${buffer.size}/${buffer.capacity} in buffer`
          }
        />
        <KpiCard
          label="Success rate"
          value={formatRate(rangeStats.successRate)}
          hint={`${rangeStats.successCount.toLocaleString("en-US")} of ${rangeStats.total.toLocaleString("en-US")} succeeded`}
          emphasis={
            rangeStats.successRate !== null && rangeStats.successRate < 0.9
              ? "alert"
              : "default"
          }
        />
        <KpiCard
          label="Fallback rate"
          value={formatRate(
            rangeStats.total > 0
              ? outcomeBreakdown.fallback / rangeStats.total
              : null,
          )}
          hint={`Fallback: ${outcomeBreakdown.fallback} · Blocked: ${outcomeBreakdown.blocked} · Error: ${outcomeBreakdown.error}`}
          emphasis={failureCount > 0 ? "alert" : "default"}
        />
      </section>

      <section
        aria-label="Chat analytics summary"
        className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <KpiCard
          label="Admin console tests"
          value={sourceBreakdown.admin.toLocaleString("en-US")}
          hint={`Storefront: ${sourceBreakdown.storefront.toLocaleString("en-US")} · Unknown: ${sourceBreakdown.unknown.toLocaleString("en-US")}`}
        />
        <KpiCard
          label="Avg latency"
          value={formatLatency(rangeStats.averageLatencyMs)}
          hint={
            rangeStats.p95LatencyMs !== null
              ? `p95 ${formatLatency(rangeStats.p95LatencyMs)}`
              : "Diagnostic only"
          }
        />
        <KpiCard
          label="Success"
          value={outcomeBreakdown.success.toLocaleString("en-US")}
          hint="Replies that landed cleanly"
        />
        <KpiCard
          label="Failures"
          value={failureCount.toLocaleString("en-US")}
          hint={`Fallback ${outcomeBreakdown.fallback} · Blocked ${outcomeBreakdown.blocked} · Error ${outcomeBreakdown.error}`}
          emphasis={failureCount > 0 ? "alert" : "default"}
        />
      </section>

      <ChatLogFiltersBar
        initial={filters}
        resultCount={filteredEntries.length}
        totalCount={rangeStats.total}
      />

      <ChatLogTable rows={filteredEntries} filters={filters} />

      <section
        aria-label="Source and outcome breakdown"
        className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2"
      >
        <BreakdownPanel
          title="Source breakdown"
          rows={[
            { label: "Storefront", value: sourceBreakdown.storefront },
            { label: "Admin console", value: sourceBreakdown.admin },
            { label: "Unknown", value: sourceBreakdown.unknown },
          ]}
          total={rangeStats.total}
        />
        <BreakdownPanel
          title="Outcome breakdown"
          rows={[
            { label: "Success", value: outcomeBreakdown.success, tone: "emerald" },
            { label: "Fallback", value: outcomeBreakdown.fallback, tone: "amber" },
            { label: "Blocked", value: outcomeBreakdown.blocked, tone: "indigo" },
            { label: "Error", value: outcomeBreakdown.error, tone: "rose" },
          ]}
          total={rangeStats.total}
        />
      </section>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChatThemePanel themes={topThemes} />
        <KnowledgeGapPanel signals={gaps} />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6">
        <CandidateFaqPanel topics={candidates} />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <ChatbotTestConsole chatConfigured={chatReady} />

        <aside className="space-y-6">
          <section
            aria-labelledby="chat-config-heading"
            className="rounded-[16px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)] p-5"
          >
            <h2
              id="chat-config-heading"
              className="text-[0.7rem] uppercase tracking-[0.24em] text-[#b8ab95]"
            >
              Current config
            </h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="text-[0.6rem] uppercase tracking-[0.2em] text-[#7a7265]">
                  Model
                </dt>
                <dd className="mt-1 break-all font-mono text-[0.78rem] text-[#f5eee3]">
                  {config.modelLabel}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[0.6rem] uppercase tracking-[0.2em] text-[#7a7265]">
                  OPENROUTER_API_KEY
                </dt>
                <dd>
                  <StatusBadge ok={config.apiKeyConfigured} />
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[0.6rem] uppercase tracking-[0.2em] text-[#7a7265]">
                  OPENROUTER_MODEL
                </dt>
                <dd>
                  <StatusBadge ok={config.modelConfigured} />
                </dd>
              </div>
              <div>
                <dt className="text-[0.6rem] uppercase tracking-[0.2em] text-[#7a7265]">
                  NEXT_PUBLIC_SITE_URL
                </dt>
                <dd className="mt-1 break-all font-mono text-[0.72rem] text-[#9a8f7a]">
                  {config.siteUrl}
                </dd>
              </div>
            </dl>
            {!chatReady ? (
              <p className="mt-4 rounded-md border border-rose-500/30 bg-rose-500/10 p-3 text-xs leading-relaxed text-rose-200">
                Chatbot is not fully configured. Set both{" "}
                <code className="text-rose-100">OPENROUTER_API_KEY</code> and{" "}
                <code className="text-rose-100">OPENROUTER_MODEL</code> in your
                Vercel environment, then redeploy.
              </p>
            ) : null}
          </section>

          <section
            aria-labelledby="future-knowledge-heading"
            className="rounded-[16px] border border-dashed border-[rgba(214,168,95,0.22)] bg-[rgba(214,168,95,0.04)] p-5"
          >
            <h2
              id="future-knowledge-heading"
              className="text-[0.7rem] uppercase tracking-[0.24em] text-[#d6a85f]"
            >
              Knowledge controls — coming next
            </h2>
            <p className="mt-3 text-xs leading-relaxed text-[#d8c6aa]">
              Today the chat context is assembled from the catalog and a
              hard-coded system prompt. The natural follow-up is operator-editable
              knowledge that doesn&apos;t require code deploys:
            </p>
            <ul className="mt-3 space-y-2 text-xs text-[#d8c6aa]">
              <li className="flex gap-2">
                <span aria-hidden className="text-[#d6a85f]">•</span>
                <span>
                  <span className="text-[#f5eee3]">FAQ snippets</span> —
                  short Q&amp;A pairs surfaced when keywords match.
                </span>
              </li>
              <li className="flex gap-2">
                <span aria-hidden className="text-[#d6a85f]">•</span>
                <span>
                  <span className="text-[#f5eee3]">Product guidance</span> —
                  per-SKU usage notes layered into the prompt for product pages.
                </span>
              </li>
              <li className="flex gap-2">
                <span aria-hidden className="text-[#d6a85f]">•</span>
                <span>
                  <span className="text-[#f5eee3]">Brand tone snippets</span> —
                  example exchanges to anchor voice and refusal patterns.
                </span>
              </li>
              <li className="flex gap-2">
                <span aria-hidden className="text-[#d6a85f]">•</span>
                <span>
                  <span className="text-[#f5eee3]">Banned topics</span> —
                  editable refusal list separate from the static prompt.
                </span>
              </li>
            </ul>
            <p className="mt-3 text-[0.7rem] text-[#9a8f7a]">
              All four would live in a small Supabase table (e.g.{" "}
              <code className="text-[#b8ab95]">chatbot_snippets</code>) and be
              fetched by the existing chat-context helper. No new infrastructure
              required.
            </p>
          </section>
        </aside>
      </div>
    </AdminShell>
  );
}
