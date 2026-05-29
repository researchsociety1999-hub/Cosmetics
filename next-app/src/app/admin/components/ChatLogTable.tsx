import Link from "next/link";
import type { ChatLogEntry } from "../lib/chatLog";
import type { ChatLogFilters, ChatLogSortKey, SortDir } from "../lib/chatLogQuery";
import { CHAT_THEME_LABELS } from "../lib/chatThemes";
import { ChatOutcomeChip } from "./ChatOutcomeChip";

interface ChatLogTableProps {
  rows: ChatLogEntry[];
  filters: ChatLogFilters;
}

function formatDateTime(ts: number): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(ts));
  } catch {
    return new Date(ts).toISOString();
  }
}

function formatLatency(ms: number | null): string {
  if (ms === null || !Number.isFinite(ms)) return "—";
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

function buildSortHref(
  filters: ChatLogFilters,
  column: ChatLogSortKey,
  defaultDir: SortDir,
): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.source) params.set("source", filters.source);
  if (filters.outcome) params.set("outcome", filters.outcome);
  if (filters.theme) params.set("theme", filters.theme);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  params.set("sortBy", column);
  if (filters.sortBy === column) {
    params.set("sortDir", filters.sortDir === "asc" ? "desc" : "asc");
  } else {
    params.set("sortDir", defaultDir);
  }
  return `/admin/chatbot?${params.toString()}`;
}

function SortableTh({
  label,
  column,
  defaultDir,
  filters,
  align = "left",
}: {
  label: string;
  column: ChatLogSortKey;
  defaultDir: SortDir;
  filters: ChatLogFilters;
  align?: "left" | "right";
}) {
  const active = filters.sortBy === column;
  const dir = filters.sortDir ?? "desc";
  const arrow = active ? (dir === "asc" ? "▲" : "▼") : "";
  const alignCls = align === "right" ? "text-right" : "text-left";
  return (
    <th
      scope="col"
      className={`px-4 py-3 font-medium ${alignCls}`}
      aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
    >
      <Link
        href={buildSortHref(filters, column, defaultDir)}
        className={`inline-flex items-center gap-1 ${
          active ? "text-[#d6a85f]" : "text-[#9a8f7a] hover:text-[#d8c6aa]"
        }`}
      >
        <span>{label}</span>
        {arrow ? (
          <span aria-hidden className="text-[0.55rem]">
            {arrow}
          </span>
        ) : null}
      </Link>
    </th>
  );
}

export function ChatLogTable({ rows, filters }: ChatLogTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-[16px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)] p-8 text-center text-sm text-[#b8ab95]">
        <p className="text-[#d8c6aa]">
          No chat turns match these filters.
        </p>
        <p className="mt-2 text-[#7a7265]">
          The diagnostics buffer is in-memory and resets on cold start. Send a
          test prompt or interact with the storefront chat to populate it.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[16px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)]">
      <table className="w-full min-w-[960px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[rgba(214,168,95,0.12)] text-[0.62rem] uppercase tracking-[0.2em]">
            <SortableTh
              label="When"
              column="newest"
              defaultDir="desc"
              filters={filters}
            />
            <th scope="col" className="px-4 py-3 font-medium text-[#9a8f7a]">
              Source
            </th>
            <th scope="col" className="px-4 py-3 font-medium text-[#9a8f7a]">
              User message
            </th>
            <th scope="col" className="px-4 py-3 font-medium text-[#9a8f7a]">
              Assistant reply
            </th>
            <th scope="col" className="px-4 py-3 font-medium text-[#9a8f7a]">
              Theme
            </th>
            <SortableTh
              label="Outcome"
              column="outcome"
              defaultDir="asc"
              filters={filters}
            />
            <SortableTh
              label="Latency"
              column="latency"
              defaultDir="desc"
              filters={filters}
              align="right"
            />
          </tr>
        </thead>
        <tbody className="text-[#d8c6aa]">
          {rows.map((entry) => (
            <tr
              key={entry.id}
              className="border-b border-[rgba(214,168,95,0.08)] last:border-0 hover:bg-[rgba(214,168,95,0.04)]"
            >
              <td className="whitespace-nowrap px-4 py-3 align-top text-[#b8ab95]">
                {formatDateTime(entry.ts)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 align-top text-[0.7rem] uppercase tracking-[0.18em] text-[#9a8f7a]">
                {entry.source === "admin"
                  ? "Admin"
                  : entry.source === "storefront"
                    ? "Storefront"
                    : "Unknown"}
                {entry.pathname ? (
                  <div className="mt-0.5 truncate font-mono text-[0.62rem] normal-case tracking-normal text-[#7a7265]">
                    {entry.pathname}
                  </div>
                ) : null}
              </td>
              <td className="max-w-[260px] px-4 py-3 align-top">
                <div
                  className="line-clamp-3 whitespace-pre-wrap text-[#f5eee3]"
                  title={entry.userMessage}
                >
                  {entry.userMessage}
                </div>
              </td>
              <td className="max-w-[300px] px-4 py-3 align-top">
                {entry.assistantMessage ? (
                  <div
                    className="line-clamp-3 whitespace-pre-wrap text-[#d8c6aa]"
                    title={entry.assistantMessage}
                  >
                    {entry.assistantMessage}
                  </div>
                ) : (
                  <span className="text-[#7a7265]">—</span>
                )}
                {entry.errorCode ? (
                  <div className="mt-1 font-mono text-[0.6rem] text-rose-300">
                    {entry.errorCode}
                  </div>
                ) : null}
              </td>
              <td className="whitespace-nowrap px-4 py-3 align-top text-[0.7rem] text-[#b8ab95]">
                {CHAT_THEME_LABELS[entry.theme]}
              </td>
              <td className="whitespace-nowrap px-4 py-3 align-top">
                <ChatOutcomeChip outcome={entry.outcome} size="compact" />
              </td>
              <td className="whitespace-nowrap px-4 py-3 align-top text-right tabular-nums text-[#f5eee3]">
                {formatLatency(entry.latencyMs)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
