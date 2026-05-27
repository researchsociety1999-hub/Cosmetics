import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "../components/AdminShell";
import { AttentionChip } from "../components/AttentionChip";
import { FulfillmentFilters } from "../components/FulfillmentFilters";
import { KpiCard } from "../components/KpiCard";
import { StatusChip } from "../components/StatusChip";
import { formatMoney } from "../../lib/format";
import {
  computeFulfillmentStats,
  getFulfillmentQueue,
  parseFulfillmentFiltersFromSearchParams,
  type FulfillmentListFilters,
  type FulfillmentRow,
  type FulfillmentSortKey,
  type SortDir,
} from "../lib/fulfillmentQuery";
import {
  FULFILLMENT_BUCKET_LABELS,
  getFulfillmentBucketTone,
  type FulfillmentBucket,
} from "../lib/fulfillmentStatus";
import { ALLOWED_TRANSITIONS } from "../lib/orderTransitions";
import { requireAdminSession } from "../lib/session";

export const metadata: Metadata = {
  title: "Fulfillment",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface AdminFulfillmentPageProps {
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

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
      new Date(iso),
    );
  } catch {
    return iso;
  }
}

function formatDurationMs(ms: number | null): string {
  if (ms === null || !Number.isFinite(ms) || ms <= 0) return "—";
  const hours = ms / (1000 * 60 * 60);
  if (hours < 1) return `${Math.round(ms / 60000)} min`;
  if (hours < 24) return `${hours.toFixed(1)} hr`;
  return `${(hours / 24).toFixed(1)} d`;
}

function formatRate(rate: number | null): string {
  if (rate === null || !Number.isFinite(rate)) return "—";
  return `${(rate * 100).toFixed(1)}%`;
}

function sortHref(
  filters: FulfillmentListFilters,
  column: FulfillmentSortKey,
  defaultDir: SortDir,
): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.status) params.set("status", filters.status);
  if (filters.bucket) params.set("bucket", filters.bucket);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (filters.attentionOnly) params.set("attention", "1");
  params.set("sortBy", column);
  if (filters.sortBy === column) {
    params.set("sortDir", filters.sortDir === "asc" ? "desc" : "asc");
  } else {
    params.set("sortDir", defaultDir);
  }
  return `/admin/fulfillment?${params.toString()}`;
}

function SortableTh({
  label,
  column,
  defaultDir,
  filters,
  align = "left",
}: {
  label: string;
  column: FulfillmentSortKey;
  defaultDir: SortDir;
  filters: FulfillmentListFilters;
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

function BucketChip({ bucket }: { bucket: FulfillmentBucket }) {
  const tone = getFulfillmentBucketTone(bucket);
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.6rem] font-medium uppercase tracking-[0.18em] ${tone.bg} ${tone.text}`}
    >
      {FULFILLMENT_BUCKET_LABELS[bucket]}
    </span>
  );
}

export default async function AdminFulfillmentPage({
  searchParams,
}: AdminFulfillmentPageProps) {
  await requireAdminSession("/admin/fulfillment");
  const params = await searchParams;
  const filters = parseFulfillmentFiltersFromSearchParams(params);

  // One query feeds both the filtered queue and the KPI cards / refunds block
  // — compute stats from the unfiltered (or just date-filtered) set so totals
  // make sense regardless of which filter is active.
  const [filteredRows, statsRows] = await Promise.all([
    getFulfillmentQueue(filters),
    getFulfillmentQueue({
      sortBy: "created_at",
      sortDir: "desc",
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    }),
  ]);

  const stats = computeFulfillmentStats(statsRows);
  const refundedRows = statsRows.filter((row) => row.bucket === "refunded");

  return (
    <AdminShell pageEyebrow="Mystique admin" pageTitle="Fulfillment">
      <p className="mb-6 max-w-3xl text-sm text-[#b8ab95]">
        Operational view of the order queue — payment, shipping, and refund
        state in one place. All buckets and triage flags are derived from the
        live <code className="text-[#d8c6aa]">orders</code> table and Stripe
        IDs already on file. This workspace is read-only; refund actions still
        happen in the Stripe Dashboard.
      </p>

      <section
        aria-label="Fulfillment summary"
        className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
      >
        <KpiCard
          label="Ready to ship"
          value={stats.byBucket.ready_to_ship.toLocaleString("en-US")}
          hint="Paid, not yet shipped"
          emphasis={stats.byBucket.ready_to_ship > 0 ? "alert" : "default"}
        />
        <KpiCard
          label="In transit"
          value={stats.byBucket.in_transit.toLocaleString("en-US")}
          hint="Carrier handed off"
        />
        <KpiCard
          label="Refunded"
          value={stats.byBucket.refunded.toLocaleString("en-US")}
          hint={`${formatRate(stats.refundRate)} of fulfillable orders`}
        />
        <KpiCard
          label="Needs attention"
          value={stats.attentionCount.toLocaleString("en-US")}
          hint="Heuristic triage flags"
          emphasis={stats.attentionCount > 0 ? "alert" : "default"}
        />
        <KpiCard
          label="Checkout cycle"
          value={formatDurationMs(stats.averageCheckoutCycleMs)}
          hint="created → paid (avg)"
        />
        <KpiCard
          label="Fulfillment cycle"
          value={formatDurationMs(stats.averageFulfillmentCycleMs)}
          hint="paid → shipped/delivered (approx)"
        />
      </section>

      <FulfillmentFilters initial={filters} resultCount={filteredRows.length} />

      {filteredRows.length === 0 ? (
        <div className="rounded-[16px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)] p-8 text-center text-sm text-[#b8ab95]">
          <p className="text-[#d8c6aa]">
            {stats.totalOrders === 0
              ? "No orders in the selected window."
              : "No orders match these filters."}
          </p>
          {stats.totalOrders > 0 ? (
            <p className="mt-2 text-[#7a7265]">
              Try clearing the search, switching the bucket, or untoggling the
              attention filter.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[16px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)]">
          <table className="w-full min-w-[960px] border-collapse text-left text-sm">
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
                <th scope="col" className="px-4 py-3 font-medium text-[#9a8f7a]">
                  Customer
                </th>
                <SortableTh
                  label="Status"
                  column="status"
                  defaultDir="asc"
                  filters={filters}
                />
                <th scope="col" className="px-4 py-3 font-medium text-[#9a8f7a]">
                  Bucket
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-[#9a8f7a]">
                  Tracking
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-[#9a8f7a]">
                  Attention
                </th>
                <SortableTh
                  label="Total"
                  column="total"
                  defaultDir="desc"
                  filters={filters}
                  align="right"
                />
              </tr>
            </thead>
            <tbody className="text-[#d8c6aa]">
              {filteredRows.map((row: FulfillmentRow) => {
                const order = row.order;
                const trackingLabel = order.tracking_number
                  ? order.tracking_number
                  : "—";
                const allowedNext = ALLOWED_TRANSITIONS[order.status] ?? [];
                const actionable =
                  allowedNext.length > 0 ||
                  row.attentionReasons.length > 0;
                return (
                  <tr
                    key={order.id}
                    className="border-b border-[rgba(214,168,95,0.08)] transition-colors duration-150 last:border-0 hover:bg-[rgba(214,168,95,0.04)] focus-within:bg-[rgba(214,168,95,0.06)]"
                  >
                    <td className="whitespace-nowrap px-4 py-3 align-top text-[#b8ab95]">
                      <div>{formatDateTime(order.created_at)}</div>
                      {order.paid_at ? (
                        <div className="mt-0.5 text-[0.65rem] text-[#7a7265]">
                          Paid {formatDateTime(order.paid_at)}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 align-top font-mono text-[0.78rem] text-[#e8dcc4]">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="underline-offset-4 outline-none hover:underline focus-visible:underline"
                      >
                        {order.order_number}
                      </Link>
                      {actionable ? (
                        <Link
                          href={`/admin/orders/${order.id}#order-actions-heading`}
                          className="mt-1 block text-[0.6rem] font-normal uppercase tracking-[0.18em] text-[#d6a85f] underline-offset-4 hover:underline"
                          aria-label={`Take action on order ${order.order_number}`}
                        >
                          Take action →
                        </Link>
                      ) : null}
                    </td>
                    <td className="max-w-[200px] px-4 py-3 align-top">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="block outline-none focus-visible:underline"
                      >
                        <div
                          className="truncate text-[#f5eee3]"
                          title={order.email}
                        >
                          {order.email}
                        </div>
                        <div className="truncate text-xs text-[#7a7265]">
                          {order.full_name}
                        </div>
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 align-top">
                      <StatusChip status={order.status} size="compact" />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 align-top">
                      <BucketChip bucket={row.bucket} />
                    </td>
                    <td className="max-w-[220px] px-4 py-3 align-top">
                      <div
                        className="truncate font-mono text-[0.72rem] text-[#e8dcc4]"
                        title={order.tracking_number ?? undefined}
                      >
                        {trackingLabel}
                      </div>
                      {order.estimated_delivery ? (
                        <div className="mt-0.5 text-[0.65rem] text-[#7a7265]">
                          ETA {formatDate(order.estimated_delivery)}
                        </div>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 align-top">
                      <AttentionChip reasons={row.attentionReasons} size="compact" />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 align-top text-right tabular-nums text-[#f5eee3]">
                      {formatMoney(order.total_amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <section
        aria-labelledby="refunds-heading"
        className="mt-10 rounded-[16px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)] p-6"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2
            id="refunds-heading"
            className="text-[0.78rem] uppercase tracking-[0.24em] text-[#b8ab95]"
          >
            Refunds workspace
          </h2>
          <p className="text-xs text-[#7a7265]">
            Read-only view. Stripe is the source of truth for refunded amounts.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <KpiCard
            label="Refunded (in window)"
            value={stats.refundedCount.toLocaleString("en-US")}
            hint={`${formatRate(stats.refundRate)} of fulfillable orders`}
          />
          <KpiCard
            label="Refunded value"
            value={formatMoney(stats.refundedTotalCents)}
            hint="Sum of order totals marked refunded"
          />
          <KpiCard
            label="Refunds w/o PI"
            value={refundedRows
              .filter(
                (r) =>
                  !r.order.stripe_payment_intent_id &&
                  !r.order.payment_intent_id,
              )
              .length.toLocaleString("en-US")}
            hint="Reconcile against Stripe"
            emphasis={
              refundedRows.some(
                (r) =>
                  !r.order.stripe_payment_intent_id &&
                  !r.order.payment_intent_id,
              )
                ? "alert"
                : "default"
            }
          />
        </div>

        {refundedRows.length === 0 ? (
          <p className="mt-5 rounded-[12px] border border-[rgba(214,168,95,0.08)] bg-[rgba(255,255,255,0.015)] px-4 py-4 text-sm text-[#9a8f7a]">
            No refunded orders in the selected window.
          </p>
        ) : (
          <div className="mt-5 overflow-x-auto rounded-[12px] border border-[rgba(214,168,95,0.08)]">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[rgba(214,168,95,0.1)] text-[0.6rem] uppercase tracking-[0.2em] text-[#9a8f7a]">
                  <th className="px-4 py-3 font-medium">Refunded</th>
                  <th className="px-4 py-3 font-medium">Order #</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium text-right">Total</th>
                  <th className="px-4 py-3 font-medium">Stripe PI</th>
                  <th className="px-4 py-3 font-medium">Attention</th>
                </tr>
              </thead>
              <tbody className="text-[#d8c6aa]">
                {refundedRows.map((row) => {
                  const order = row.order;
                  const pi =
                    order.stripe_payment_intent_id ?? order.payment_intent_id;
                  return (
                    <tr
                      key={order.id}
                      className="border-b border-[rgba(214,168,95,0.06)] last:border-0 hover:bg-[rgba(214,168,95,0.04)]"
                    >
                      <td className="whitespace-nowrap px-4 py-3 align-top text-[#b8ab95]">
                        {formatDateTime(order.updated_at ?? order.created_at)}
                      </td>
                      <td className="px-4 py-3 align-top font-mono text-[0.78rem] text-[#e8dcc4]">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="underline-offset-4 hover:underline"
                        >
                          {order.order_number}
                        </Link>
                      </td>
                      <td className="max-w-[200px] px-4 py-3 align-top">
                        <div
                          className="truncate text-[#f5eee3]"
                          title={order.email}
                        >
                          {order.email}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 align-top text-right tabular-nums text-[#f5eee3]">
                        {formatMoney(order.total_amount)}
                      </td>
                      <td className="max-w-[200px] px-4 py-3 align-top">
                        <div
                          className="truncate font-mono text-[0.72rem] text-[#e8dcc4]"
                          title={pi ?? undefined}
                        >
                          {pi ?? "—"}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 align-top">
                        <AttentionChip
                          reasons={row.attentionReasons}
                          size="compact"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-4 rounded-[12px] border border-[rgba(214,168,95,0.1)] bg-[rgba(214,168,95,0.04)] px-4 py-3 text-xs leading-relaxed text-[#b8ab95]">
          <span className="font-medium uppercase tracking-[0.2em] text-[#d6a85f]">
            Data limitations:
          </span>{" "}
          the orders table does not store refund reasons, refunded amounts, or
          refunded_at separately. The Refunded list shows orders whose status
          is <code className="text-[#d8c6aa]">refunded</code> and uses the order
          total as a stand-in for the refunded amount. For exact refund
          amounts, partial refunds, and reasons, check the linked Stripe
          payment intent.
        </p>
      </section>
    </AdminShell>
  );
}
