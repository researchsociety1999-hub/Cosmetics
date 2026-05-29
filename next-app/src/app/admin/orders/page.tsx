import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "../components/AdminShell";
import { OrdersFilters } from "../components/OrdersFilters";
import { StatusChip } from "../components/StatusChip";
import {
  getOrdersForAdminFiltered,
  parseOrderFiltersFromSearchParams,
  type OrderListFilters,
  type OrderSortKey,
  type SortDir,
} from "../lib/ordersQuery";
import { requireAdminSession } from "../lib/session";
import { formatMoney } from "../../lib/format";

export const metadata: Metadata = {
  title: "Orders",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface AdminOrdersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/**
 * Builds the query string for a sortable column header. Clicking a column
 * toggles its direction if already active, otherwise sorts by that column
 * with a sensible default direction (descending for numeric/date, asc for text).
 */
function sortHref(
  filters: OrderListFilters,
  column: OrderSortKey,
  defaultDir: SortDir,
): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.status) params.set("status", filters.status);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  params.set("sortBy", column);
  if (filters.sortBy === column) {
    params.set("sortDir", filters.sortDir === "asc" ? "desc" : "asc");
  } else {
    params.set("sortDir", defaultDir);
  }
  return `/admin/orders?${params.toString()}`;
}

interface SortableThProps {
  label: string;
  column: OrderSortKey;
  defaultDir: SortDir;
  filters: OrderListFilters;
  align?: "left" | "right";
}

function SortableTh({
  label,
  column,
  defaultDir,
  filters,
  align = "left",
}: SortableThProps) {
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

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  await requireAdminSession("/admin/orders");
  const params = await searchParams;
  const filters = parseOrderFiltersFromSearchParams(params);
  const rows = await getOrdersForAdminFiltered(filters);

  return (
    <AdminShell pageEyebrow="Mystique admin" pageTitle="Orders">
      <p className="mb-6 max-w-2xl text-sm text-[#b8ab95]">
        Newest orders from Supabase, fed by the Stripe webhook. Search across
        email, order number, and Stripe IDs. Click a row to open the full
        order detail.
      </p>

      <OrdersFilters initial={filters} resultCount={rows.length} />

      {rows.length === 0 ? (
        <div className="rounded-[16px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)] p-8 text-center text-sm text-[#b8ab95]">
          <p className="text-[#d8c6aa]">No orders match these filters.</p>
          <p className="mt-2 text-[#7a7265]">
            Try clearing the search or widening the date range.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[16px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)]">
          <table className="w-full min-w-[840px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[rgba(214,168,95,0.12)] text-[0.62rem] uppercase tracking-[0.2em]">
                <SortableTh
                  label="When"
                  column="created_at"
                  defaultDir="desc"
                  filters={filters}
                />
                <th scope="col" className="px-4 py-3 font-medium text-[#9a8f7a]">
                  Order #
                </th>
                <SortableTh
                  label="Customer"
                  column="email"
                  defaultDir="asc"
                  filters={filters}
                />
                <SortableTh
                  label="Status"
                  column="status"
                  defaultDir="asc"
                  filters={filters}
                />
                <SortableTh
                  label="Total"
                  column="total"
                  defaultDir="desc"
                  filters={filters}
                  align="right"
                />
                <th scope="col" className="px-4 py-3 font-medium text-[#9a8f7a]">
                  Items
                </th>
              </tr>
            </thead>
            <tbody className="text-[#d8c6aa]">
              {rows.map((row) => {
                const items = row.order_items ?? [];
                const itemSummary = items
                  .slice(0, 3)
                  .map((i) => `${i.quantity}×#${i.product_id}`)
                  .join(", ");
                const more =
                  items.length > 3 ? ` +${items.length - 3} more` : "";
                return (
                  <tr
                    key={row.id}
                    className="border-b border-[rgba(214,168,95,0.08)] transition-colors duration-150 last:border-0 hover:bg-[rgba(214,168,95,0.04)] focus-within:bg-[rgba(214,168,95,0.06)]"
                  >
                    <td className="whitespace-nowrap px-4 py-3 align-top text-[#b8ab95]">
                      {formatDateTime(row.paid_at ?? row.created_at)}
                    </td>
                    <td className="px-4 py-3 align-top font-mono text-[0.78rem] text-[#e8dcc4]">
                      <Link
                        href={`/admin/orders/${row.id}`}
                        className="underline-offset-4 outline-none focus-visible:underline hover:underline"
                      >
                        {row.order_number}
                      </Link>
                    </td>
                    <td className="max-w-[220px] px-4 py-3 align-top">
                      <Link
                        href={`/admin/orders/${row.id}`}
                        className="block outline-none focus-visible:underline"
                      >
                        <div
                          className="truncate text-[#f5eee3]"
                          title={row.email}
                        >
                          {row.email}
                        </div>
                        <div className="truncate text-xs text-[#7a7265]">
                          {row.full_name}
                          {row.user_id ? (
                            <span className="ml-1 text-[#5c7a5c]">
                              (account)
                            </span>
                          ) : (
                            <span className="ml-1 text-[#7a6b5c]">(guest)</span>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 align-top">
                      <StatusChip status={row.status} size="compact" />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 align-top text-right tabular-nums text-[#f5eee3]">
                      {formatMoney(row.total_amount)}
                    </td>
                    <td className="max-w-[200px] px-4 py-3 align-top text-xs leading-snug text-[#9a8f7a]">
                      {itemSummary}
                      {more}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
