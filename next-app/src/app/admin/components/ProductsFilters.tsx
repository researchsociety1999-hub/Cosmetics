import Link from "next/link";
import {
  PRODUCT_STATUS_VALUES,
  getProductStatusTone,
} from "../lib/productStatus";
import type { ProductListFilters } from "../lib/productsQuery";

interface ProductsFiltersProps {
  initial: ProductListFilters;
  resultCount: number;
  /** Total product count (pre-filter), used to render "X of Y" hint. */
  totalCount: number;
}

/**
 * GET-based filter form mirroring the orders page: server reads the resulting
 * query string, refetches, and re-renders — no client JS cost. Sticky on
 * scroll so operators can keep filtering while scrolling a long list.
 */
export function ProductsFilters({
  initial,
  resultCount,
  totalCount,
}: ProductsFiltersProps) {
  return (
    <form
      method="GET"
      action="/admin/products"
      className="sticky top-0 z-10 -mx-2 mb-6 rounded-[16px] border border-[rgba(214,168,95,0.12)] bg-[rgba(8,9,14,0.92)] px-4 py-4 backdrop-blur"
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.6fr_1fr_auto_auto]">
        <label className="block">
          <span className="mb-1.5 block text-[0.6rem] uppercase tracking-[0.22em] text-[#9a8f7a]">
            Search
          </span>
          <input
            type="search"
            name="q"
            defaultValue={initial.q ?? ""}
            placeholder="Name, slug, SKU, or numeric id…"
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
            {PRODUCT_STATUS_VALUES.map((value) => (
              <option key={value} value={value}>
                {getProductStatusTone(value).label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-end gap-2 self-end pb-1.5 text-[0.65rem] uppercase tracking-[0.2em] text-[#b8ab95]">
          <input
            type="checkbox"
            name="lowStock"
            value="1"
            defaultChecked={initial.lowStock === true}
            className="h-4 w-4 cursor-pointer accent-[#d6a85f]"
          />
          Low stock only
        </label>

        <div className="flex items-end gap-2">
          <input
            type="hidden"
            name="sortBy"
            value={initial.sortBy ?? "updated_at"}
          />
          <input
            type="hidden"
            name="sortDir"
            value={initial.sortDir ?? "desc"}
          />
          <button
            type="submit"
            className="mystic-button-primary inline-flex min-h-[42px] flex-1 items-center justify-center px-4 text-[0.65rem] uppercase tracking-[0.2em]"
          >
            Apply
          </button>
          <Link
            href="/admin/products"
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
            : resultCount === totalCount
              ? `${resultCount.toLocaleString("en-US")} product${
                  resultCount === 1 ? "" : "s"
                }`
              : `${resultCount.toLocaleString("en-US")} of ${totalCount.toLocaleString(
                  "en-US",
                )} product${totalCount === 1 ? "" : "s"}`}
        </span>
        {totalCount >= 200 ? (
          <span aria-live="polite" className="text-[#d6a85f]">
            Showing first 200 — refine filters to narrow.
          </span>
        ) : null}
      </div>
    </form>
  );
}
