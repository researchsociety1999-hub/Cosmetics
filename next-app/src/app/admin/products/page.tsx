import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "../components/AdminShell";
import { InventoryBadge } from "../components/InventoryBadge";
import { KpiCard } from "../components/KpiCard";
import { ProductStatusChip } from "../components/ProductStatusChip";
import { ProductsFilters } from "../components/ProductsFilters";
import { formatMoney } from "../../lib/format";
import {
  computeInventoryStats,
  getProductsForAdminFiltered,
  parseProductFiltersFromSearchParams,
  type ProductListFilters,
  type ProductSortKey,
  type SortDir,
} from "../lib/productsQuery";
import { requireAdminSession } from "../lib/session";

export const metadata: Metadata = {
  title: "Products",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface AdminProductsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function sortHref(
  filters: ProductListFilters,
  column: ProductSortKey,
  defaultDir: SortDir,
): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.status) params.set("status", filters.status);
  if (filters.lowStock) params.set("lowStock", "1");
  params.set("sortBy", column);
  if (filters.sortBy === column) {
    params.set("sortDir", filters.sortDir === "asc" ? "desc" : "asc");
  } else {
    params.set("sortDir", defaultDir);
  }
  return `/admin/products?${params.toString()}`;
}

interface SortableThProps {
  label: string;
  column: ProductSortKey;
  defaultDir: SortDir;
  filters: ProductListFilters;
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

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  await requireAdminSession("/admin/products");
  const params = await searchParams;
  const filters = parseProductFiltersFromSearchParams(params);

  // One query covers both the table AND the summary cards (we run a second
  // unfiltered query only to know how many products exist overall — kept tiny
  // by the same DEFAULT_LIMIT cap as the list).
  const [rows, allRowsForStats] = await Promise.all([
    getProductsForAdminFiltered(filters),
    getProductsForAdminFiltered({ sortBy: "updated_at", sortDir: "desc" }),
  ]);
  const stats = computeInventoryStats(allRowsForStats);

  return (
    <AdminShell pageEyebrow="Mystique admin" pageTitle="Products">
      <p className="mb-6 max-w-2xl text-sm text-[#b8ab95]">
        Live catalog from Supabase — including drafts and coming-soon entries.
        Search by name, slug, SKU, or numeric id, then filter by status or
        flag low-stock rows.
      </p>

      <section
        aria-label="Inventory summary"
        className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <KpiCard
          label="Active products"
          value={stats.activeProducts.toLocaleString("en-US")}
          hint={`${stats.totalProducts.toLocaleString("en-US")} total in catalog`}
        />
        <KpiCard
          label="Low stock (active)"
          value={stats.lowStockActive.toLocaleString("en-US")}
          hint="≤ 10 units across variants"
          emphasis={stats.lowStockActive > 0 ? "alert" : "default"}
        />
        <KpiCard
          label="Out of stock (active)"
          value={stats.outOfStockActive.toLocaleString("en-US")}
          hint="Sellable now but zero inventory"
          emphasis={stats.outOfStockActive > 0 ? "alert" : "default"}
        />
        <KpiCard
          label="Updated this week"
          value={stats.recentlyUpdated.toLocaleString("en-US")}
          hint="Within last 7 days"
        />
      </section>

      <ProductsFilters
        initial={filters}
        resultCount={rows.length}
        totalCount={stats.totalProducts}
      />

      {rows.length === 0 ? (
        <div className="rounded-[16px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)] p-8 text-center text-sm text-[#b8ab95]">
          <p className="text-[#d8c6aa]">
            {stats.totalProducts === 0
              ? "No products yet — add one in Supabase and it will appear here."
              : "No products match these filters."}
          </p>
          {stats.totalProducts > 0 ? (
            <p className="mt-2 text-[#7a7265]">
              Try clearing the search or switching the status filter.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[16px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)]">
          <table className="w-full min-w-[860px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[rgba(214,168,95,0.12)] text-[0.62rem] uppercase tracking-[0.2em]">
                <SortableTh
                  label="Product"
                  column="name"
                  defaultDir="asc"
                  filters={filters}
                />
                <th scope="col" className="px-4 py-3 font-medium text-[#9a8f7a]">
                  Status
                </th>
                <SortableTh
                  label="Price"
                  column="price"
                  defaultDir="asc"
                  filters={filters}
                  align="right"
                />
                <th scope="col" className="px-4 py-3 font-medium text-[#9a8f7a]">
                  Category
                </th>
                <SortableTh
                  label="Stock"
                  column="stock"
                  defaultDir="asc"
                  filters={filters}
                />
                <SortableTh
                  label="Updated"
                  column="updated_at"
                  defaultDir="desc"
                  filters={filters}
                />
              </tr>
            </thead>
            <tbody className="text-[#d8c6aa]">
              {rows.map((row) => (
                <tr
                  key={row.product.id}
                  className="border-b border-[rgba(214,168,95,0.08)] transition-colors duration-150 last:border-0 hover:bg-[rgba(214,168,95,0.04)] focus-within:bg-[rgba(214,168,95,0.06)]"
                >
                  <td className="max-w-[320px] px-4 py-3 align-top">
                    <Link
                      href={`/admin/products/${row.product.id}`}
                      className="block outline-none focus-visible:underline"
                    >
                      <div
                        className="truncate font-medium text-[#f5eee3]"
                        title={row.product.name}
                      >
                        {row.product.name}
                      </div>
                      <div className="truncate text-xs text-[#7a7265]">
                        <span className="font-mono">{row.product.slug}</span>
                        {row.product.sku ? (
                          <span className="ml-2 text-[#5c5c54]">
                            · SKU {row.product.sku}
                          </span>
                        ) : null}
                      </div>
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 align-top">
                    <ProductStatusChip status={row.status} size="compact" />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 align-top text-right tabular-nums text-[#f5eee3]">
                    {formatMoney(
                      row.product.sale_price_cents ?? row.product.price_cents,
                    )}
                    {row.product.sale_price_cents != null &&
                    row.product.sale_price_cents !== row.product.price_cents ? (
                      <div className="text-[0.65rem] text-[#7a7265] line-through">
                        {formatMoney(row.product.price_cents)}
                      </div>
                    ) : null}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 align-top text-[#b8ab95]">
                    {row.categoryName ?? <span className="text-[#5c5c54]">—</span>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 align-top">
                    <InventoryBadge
                      stockTotal={row.stockTotal}
                      variantCount={row.variantCount}
                      isOutOfStock={row.isOutOfStock}
                      isLowStock={row.isLowStock}
                      isUnknown={row.isUnknownStock}
                      size="compact"
                    />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 align-top text-[#b8ab95]">
                    {formatDate(row.product.updated_at ?? row.product.created_at)}
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
