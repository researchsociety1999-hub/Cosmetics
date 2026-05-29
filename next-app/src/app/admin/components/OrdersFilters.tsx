import Link from "next/link";
import { ORDER_STATUS_VALUES, getStatusTone } from "../lib/orderStatus";
import type { OrderListFilters } from "../lib/ordersQuery";

interface OrdersFiltersProps {
  initial: OrderListFilters;
  /** Total result count to render in the toolbar's right-side hint. */
  resultCount: number;
}

/**
 * GET-based filter form. Server reads the resulting query string, refetches,
 * and re-renders — keeping the page fully server-rendered with no client JS
 * cost. The form is sticky on scroll so operators can keep filtering while
 * scrubbing through a long list.
 */
export function OrdersFilters({ initial, resultCount }: OrdersFiltersProps) {
  return (
    <form
      method="GET"
      action="/admin/orders"
      className="sticky top-0 z-10 -mx-2 mb-6 rounded-[16px] border border-[rgba(214,168,95,0.12)] bg-[rgba(8,9,14,0.92)] px-4 py-4 backdrop-blur"
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.4fr_repeat(3,1fr)_auto]">
        <label className="block">
          <span className="mb-1.5 block text-[0.6rem] uppercase tracking-[0.22em] text-[#9a8f7a]">
            Search
          </span>
          <input
            type="search"
            name="q"
            defaultValue={initial.q ?? ""}
            placeholder="Email, order #, payment intent…"
            className="mystic-input w-full text-sm"
            maxLength={200}
            autoComplete="off"
          />
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

        <label className="block">
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

        <label className="block">
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

        <div className="flex items-end gap-2">
          {/* Preserve sort while filters change. */}
          <input type="hidden" name="sortBy" value={initial.sortBy ?? "created_at"} />
          <input type="hidden" name="sortDir" value={initial.sortDir ?? "desc"} />
          <button
            type="submit"
            className="mystic-button-primary inline-flex min-h-[42px] flex-1 items-center justify-center px-4 text-[0.65rem] uppercase tracking-[0.2em]"
          >
            Apply
          </button>
          <Link
            href="/admin/orders"
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
            : `${resultCount.toLocaleString("en-US")} result${
                resultCount === 1 ? "" : "s"
              }`}
        </span>
        {resultCount >= 200 ? (
          <span aria-live="polite" className="text-[#d6a85f]">
            Showing first 200 — refine filters to narrow.
          </span>
        ) : null}
      </div>
    </form>
  );
}
