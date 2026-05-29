import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "../components/AdminShell";
import {
  getCustomersForAdmin,
  parseCustomerFiltersFromSearchParams,
  type CustomerListFilters,
  type CustomerSortKey,
} from "../lib/getCustomers";
import { requireAdminSession } from "../lib/session";
import { formatMoney } from "../../lib/format";

export const metadata: Metadata = {
  title: "Customers",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface AdminCustomersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
      new Date(iso),
    );
  } catch {
    return iso;
  }
}

function sortHref(
  filters: CustomerListFilters,
  column: CustomerSortKey,
  defaultDir: "asc" | "desc",
): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  params.set("sortBy", column);
  if (filters.sortBy === column) {
    params.set("sortDir", filters.sortDir === "asc" ? "desc" : "asc");
  } else {
    params.set("sortDir", defaultDir);
  }
  return `/admin/customers?${params.toString()}`;
}

interface CustomerSortableThProps {
  label: string;
  column: CustomerSortKey;
  defaultDir: "asc" | "desc";
  filters: CustomerListFilters;
  align?: "left" | "right";
}

function CustomerSortableTh({
  label,
  column,
  defaultDir,
  filters,
  align = "left",
}: CustomerSortableThProps) {
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
        href={sortHref(filters, column, defaultDir)}
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

export default async function AdminCustomersPage({
  searchParams,
}: AdminCustomersPageProps) {
  await requireAdminSession("/admin/customers");
  const params = await searchParams;
  const filters = parseCustomerFiltersFromSearchParams(params);
  const rows = await getCustomersForAdmin(filters);

  return (
    <AdminShell pageEyebrow="Mystique admin" pageTitle="Customers">
      <p className="mb-6 max-w-2xl text-sm text-[#b8ab95]">
        Customers are derived from the most recent 1,000 orders, grouped by
        email. There&apos;s no separate customers table yet — when one lands,
        this page swaps to read from it without any UI changes.
      </p>

      <form
        method="GET"
        action="/admin/customers"
        className="mb-6 rounded-[16px] border border-[rgba(214,168,95,0.12)] bg-[rgba(8,9,14,0.7)] px-4 py-4"
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
          <label className="block">
            <span className="mb-1.5 block text-[0.6rem] uppercase tracking-[0.22em] text-[#9a8f7a]">
              Search
            </span>
            <input
              type="search"
              name="q"
              defaultValue={filters.q ?? ""}
              placeholder="Email or name…"
              className="mystic-input w-full text-sm"
              maxLength={200}
              autoComplete="off"
            />
          </label>
          <div className="flex items-end gap-2">
            <input type="hidden" name="sortBy" value={filters.sortBy ?? "latestOrderAt"} />
            <input type="hidden" name="sortDir" value={filters.sortDir ?? "desc"} />
            <button
              type="submit"
              className="mystic-button-primary inline-flex min-h-[42px] flex-1 items-center justify-center px-4 text-[0.65rem] uppercase tracking-[0.2em]"
            >
              Search
            </button>
            <Link
              href="/admin/customers"
              className="mystic-button-secondary inline-flex min-h-[42px] items-center justify-center px-3 text-[0.65rem] uppercase tracking-[0.2em]"
            >
              Reset
            </Link>
          </div>
        </div>
        <p className="mt-3 text-[0.7rem] text-[#7a7265]">
          {rows.length === 0
            ? "No customers match this search."
            : `${rows.length.toLocaleString("en-US")} unique customer${
                rows.length === 1 ? "" : "s"
              }.`}
        </p>
      </form>

      {rows.length === 0 ? (
        <div className="rounded-[16px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)] p-8 text-center text-sm text-[#b8ab95]">
          <p className="text-[#d8c6aa]">
            {filters.q
              ? "No customers match this search."
              : "No customers yet — they'll appear here as soon as the first order is paid."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[16px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)]">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[rgba(214,168,95,0.12)] text-[0.62rem] uppercase tracking-[0.2em]">
                <CustomerSortableTh
                  label="Email"
                  column="email"
                  defaultDir="asc"
                  filters={filters}
                />
                <CustomerSortableTh
                  label="Orders"
                  column="ordersCount"
                  defaultDir="desc"
                  filters={filters}
                  align="right"
                />
                <CustomerSortableTh
                  label="Total spend"
                  column="totalSpendCents"
                  defaultDir="desc"
                  filters={filters}
                  align="right"
                />
                <CustomerSortableTh
                  label="First order"
                  column="firstOrderAt"
                  defaultDir="asc"
                  filters={filters}
                />
                <CustomerSortableTh
                  label="Latest order"
                  column="latestOrderAt"
                  defaultDir="desc"
                  filters={filters}
                />
              </tr>
            </thead>
            <tbody className="text-[#d8c6aa]">
              {rows.map((row) => (
                <tr
                  key={row.email}
                  className="border-b border-[rgba(214,168,95,0.08)] transition-colors duration-150 last:border-0 hover:bg-[rgba(214,168,95,0.04)]"
                >
                  <td className="max-w-[280px] px-4 py-3 align-top">
                    <div className="truncate text-[#f5eee3]" title={row.email}>
                      {row.email}
                    </div>
                    <div className="truncate text-xs text-[#7a7265]">
                      {row.latestName ?? "—"}
                      {row.hasAccount ? (
                        <span className="ml-1 text-[#5c7a5c]">(account)</span>
                      ) : (
                        <span className="ml-1 text-[#7a6b5c]">(guest)</span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 align-top text-right tabular-nums text-[#f5eee3]">
                    {row.ordersCount.toLocaleString("en-US")}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 align-top text-right tabular-nums text-[#f5eee3]">
                    {formatMoney(row.totalSpendCents)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 align-top text-[#b8ab95]">
                    {formatDate(row.firstOrderAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 align-top text-[#b8ab95]">
                    {formatDate(row.latestOrderAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
