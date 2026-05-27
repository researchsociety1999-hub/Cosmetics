import Link from "next/link";
import { CHAT_THEME_LABELS, CHAT_THEME_VALUES } from "../lib/chatThemes";
import { CHAT_OUTCOME_VALUES, type ChatLogFilters } from "../lib/chatLogQuery";

interface ChatLogFiltersProps {
  initial: ChatLogFilters;
  resultCount: number;
  totalCount: number;
}

const OUTCOME_LABELS: Record<string, string> = {
  success: "Success",
  fallback: "Fallback",
  blocked: "Blocked",
  error: "Error",
};

export function ChatLogFiltersBar({
  initial,
  resultCount,
  totalCount,
}: ChatLogFiltersProps) {
  return (
    <form
      method="GET"
      action="/admin/chatbot"
      className="mb-6 rounded-[16px] border border-[rgba(214,168,95,0.12)] bg-[rgba(8,9,14,0.7)] px-4 py-4"
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <label className="block">
          <span className="mb-1.5 block text-[0.6rem] uppercase tracking-[0.22em] text-[#9a8f7a]">
            Search
          </span>
          <input
            type="search"
            name="q"
            defaultValue={initial.q ?? ""}
            placeholder="User text or reply text…"
            className="mystic-input w-full text-sm"
            maxLength={200}
            autoComplete="off"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[0.6rem] uppercase tracking-[0.22em] text-[#9a8f7a]">
            Outcome
          </span>
          <select
            name="outcome"
            defaultValue={initial.outcome ?? ""}
            className="mystic-select mystic-input w-full text-sm"
          >
            <option value="">All outcomes</option>
            {CHAT_OUTCOME_VALUES.map((value) => (
              <option key={value} value={value}>
                {OUTCOME_LABELS[value] ?? value}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[0.6rem] uppercase tracking-[0.22em] text-[#9a8f7a]">
            Theme
          </span>
          <select
            name="theme"
            defaultValue={initial.theme ?? ""}
            className="mystic-select mystic-input w-full text-sm"
          >
            <option value="">All themes</option>
            {CHAT_THEME_VALUES.map((value) => (
              <option key={value} value={value}>
                {CHAT_THEME_LABELS[value]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[0.6rem] uppercase tracking-[0.22em] text-[#9a8f7a]">
            Source
          </span>
          <select
            name="source"
            defaultValue={initial.source ?? ""}
            className="mystic-select mystic-input w-full text-sm"
          >
            <option value="">All sources</option>
            <option value="storefront">Storefront</option>
            <option value="admin">Admin console</option>
            <option value="unknown">Unknown</option>
          </select>
        </label>

        <div className="flex items-end gap-2 lg:col-span-2">
          <label className="block flex-1">
            <span className="mb-1.5 block text-[0.6rem] uppercase tracking-[0.22em] text-[#9a8f7a]">
              From
            </span>
            <input
              type="date"
              name="dateFrom"
              defaultValue={initial.dateFrom ?? ""}
              className="mystic-input w-full text-sm"
            />
          </label>
          <label className="block flex-1">
            <span className="mb-1.5 block text-[0.6rem] uppercase tracking-[0.22em] text-[#9a8f7a]">
              To
            </span>
            <input
              type="date"
              name="dateTo"
              defaultValue={initial.dateTo ?? ""}
              className="mystic-input w-full text-sm"
            />
          </label>
        </div>

        <div className="flex items-end gap-2 lg:col-span-2 lg:justify-end">
          <input
            type="hidden"
            name="sortBy"
            value={initial.sortBy ?? "newest"}
          />
          <input
            type="hidden"
            name="sortDir"
            value={initial.sortDir ?? "desc"}
          />
          <button
            type="submit"
            className="mystic-button-primary inline-flex min-h-[42px] flex-1 items-center justify-center px-4 text-[0.65rem] uppercase tracking-[0.2em] lg:flex-none lg:min-w-[140px]"
          >
            Apply
          </button>
          <Link
            href="/admin/chatbot"
            className="mystic-button-secondary inline-flex min-h-[42px] items-center justify-center px-3 text-[0.65rem] uppercase tracking-[0.2em]"
          >
            Reset
          </Link>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-[0.7rem] text-[#7a7265]">
        <span>
          {resultCount === 0
            ? "No matches"
            : resultCount === totalCount
              ? `${resultCount.toLocaleString("en-US")} conversation${
                  resultCount === 1 ? "" : "s"
                }`
              : `${resultCount.toLocaleString("en-US")} of ${totalCount.toLocaleString(
                  "en-US",
                )} conversation${totalCount === 1 ? "" : "s"}`}
        </span>
      </div>
    </form>
  );
}
