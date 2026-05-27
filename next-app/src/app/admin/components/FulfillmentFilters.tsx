import Link from "next/link";
import { ORDER_STATUS_VALUES, getStatusTone } from "../lib/orderStatus";
import {
  FULFILLMENT_BUCKET_LABELS,
  FULFILLMENT_BUCKET_VALUES,
} from "../lib/fulfillmentStatus";
import type { FulfillmentListFilters } from "../lib/fulfillmentQuery";

interface FulfillmentFiltersProps {
  initial: FulfillmentListFilters;
  resultCount: number;
}

/**
 * GET-based filter form. Server reads the resulting query string, refetches,
 * and re-renders — keeping the page fully server-rendered. Mirrors the orders
 * page styling so operators see one toolbar pattern across the admin.
 */
export function FulfillmentFilters({ initial, resultCount }: FulfillmentFiltersProps) {
  return (
    <form
      method="GET"
      action="/admin/fulfillment"
      className="sticky top-0 z-10 -mx-2 mb-6 rounded-[16px] border border-[rgba(214,168,95,0.12)] bg-[rgba(8,9,14,0.92)] px-4 py-4 backdrop-blur"
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-[1.6fr_1fr_1fr]">
        <label className="block lg:col-span-3">
          <span className="mb-1.5 block text-[0.6rem] uppercase tracking-[0.22em] text-[#9a8f7a]">
            Search
          </span>
          <input
            type="search"
            name="q"
            defaultValue={initial.q ?? ""}
            placeholder="Email, order #, PI, tracking…"
            className="mystic-input w-full text-sm"
            maxLength={200}
            autoComplete="off"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[0.6rem] uppercase tracking-[0.22em] text-[#9a8f7a]">
            Bucket
          </span>
          <select
            name="bucket"
            defaultValue={initial.bucket ?? ""}
            className="mystic-select mystic-input w-full text-sm"
          >
            <option value="">All buckets</option>
            {FULFILLMENT_BUCKET_VALUES.map((value) => (
              <option key={value} value={value}>
                {FULFILLMENT_BUCKET_LABELS[value]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[0.6rem] uppercase tracking-[0.22em] text-[#9a8f7a]">
            Status
          </span>
          <select
            name="status"
            defaultValue={initial.status ?? ""}
            className="mystic-select mystic-input w-full text-sm"
          >
            <option value="">All statuses</option>
            {ORDER_STATUS_VALUES.map((value) => (
              <option key={value} value={value}>
                {getStatusTone(value).label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end gap-2">
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

        <label className="inline-flex items-end gap-2 pb-2 text-[0.65rem] uppercase tracking-[0.2em] text-[#b8ab95] lg:col-span-2 lg:justify-self-start">
          <input
            type="checkbox"
            name="attention"
            value="1"
            defaultChecked={initial.attentionOnly === true}
            className="h-4 w-4 cursor-pointer accent-[#d6a85f]"
          />
          Needs attention only
        </label>

        <div className="flex items-end gap-2 lg:col-span-3 lg:justify-end">
          <input
            type="hidden"
            name="sortBy"
            value={initial.sortBy ?? "created_at"}
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
            href="/admin/fulfillment"
            className="mystic-button-secondary inline-flex min-h-[42px] items-center justify-center px-3 text-[0.65rem] uppercase tracking-[0.2em]"
            aria-label="Clear all filters"
          >
            Reset
          </Link>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-[0.7rem] text-[#7a7265]">
        <span>
          {resultCount === 0
            ? "No matches"
            : `${resultCount.toLocaleString("en-US")} order${
                resultCount === 1 ? "" : "s"
              }`}
        </span>
        {resultCount >= 250 ? (
          <span aria-live="polite" className="text-[#d6a85f]">
            Showing first 250 — refine filters to narrow.
          </span>
        ) : null}
      </div>
    </form>
  );
}
