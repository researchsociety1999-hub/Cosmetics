import { supabaseAdmin } from "../../lib/supabaseClient";
import type { OrderStatus } from "../../lib/types";
import type { AdminOrderRow } from "../../lib/adminOrders";
import { ORDER_STATUS_VALUES } from "./orderStatus";
import {
  FULFILLMENT_BUCKET_VALUES,
  getAttentionReasons,
  getFulfillmentBucket,
  type AttentionReason,
  type FulfillmentBucket,
} from "./fulfillmentStatus";

export type FulfillmentSortKey = "created_at" | "total" | "status";
export type SortDir = "asc" | "desc";

export interface FulfillmentListFilters {
  q?: string;
  /** Concrete `orders.status` enum value, not a derived bucket. */
  status?: OrderStatus;
  bucket?: FulfillmentBucket;
  dateFrom?: string;
  dateTo?: string;
  /** When true, restrict to rows that trip one of the attention rules. */
  attentionOnly?: boolean;
  sortBy?: FulfillmentSortKey;
  sortDir?: SortDir;
  limit?: number;
}

/** Enriched row: raw order + derived bucket + attention reasons. */
export interface FulfillmentRow {
  order: AdminOrderRow;
  bucket: FulfillmentBucket;
  attentionReasons: AttentionReason[];
}

export interface FulfillmentStats {
  totalOrders: number;
  /** Counts by derived bucket — sum equals totalOrders. */
  byBucket: Record<FulfillmentBucket, number>;
  attentionCount: number;
  refundedCount: number;
  refundedTotalCents: number;
  /** Refunded ÷ orders that ever reached a "fulfillable" state (paid or later). */
  refundRate: number | null;
  /** Average ms between created_at and paid_at over orders with both timestamps. */
  averageCheckoutCycleMs: number | null;
  /**
   * Average ms between paid_at and the most recent `updated_at` for orders
   * that reached the `shipped`/`delivered` bucket. Approximation — see UI copy.
   */
  averageFulfillmentCycleMs: number | null;
}

const DEFAULT_LIMIT = 250;
const MAX_LIMIT = 500;
const MAX_SEARCH_LENGTH = 200;

function sanitizeSearch(value: string): string {
  return value.replace(/[,()%*]/g, "").trim().slice(0, MAX_SEARCH_LENGTH);
}

function startOfDayIso(dateOnly: string): string {
  const d = new Date(`${dateOnly}T00:00:00.000`);
  if (Number.isNaN(d.getTime())) return dateOnly;
  return d.toISOString();
}

function endOfDayIso(dateOnly: string): string {
  const d = new Date(`${dateOnly}T23:59:59.999`);
  if (Number.isNaN(d.getTime())) return dateOnly;
  return d.toISOString();
}

function isFulfillmentSortKey(value: string | undefined): value is FulfillmentSortKey {
  return value === "created_at" || value === "total" || value === "status";
}

function isFulfillmentBucket(value: string | undefined): value is FulfillmentBucket {
  if (!value) return false;
  return (FULFILLMENT_BUCKET_VALUES as ReadonlyArray<string>).includes(value);
}

export function parseFulfillmentFiltersFromSearchParams(
  raw: Record<string, string | string[] | undefined>,
): FulfillmentListFilters {
  function single(key: string): string | undefined {
    const v = raw[key];
    if (Array.isArray(v)) return v[0]?.trim() || undefined;
    return typeof v === "string" ? v.trim() || undefined : undefined;
  }

  const status = single("status");
  const bucket = single("bucket");
  const sortBy = single("sortBy");
  const sortDir = single("sortDir");
  const attention = single("attention");

  return {
    q: single("q")?.slice(0, MAX_SEARCH_LENGTH),
    status:
      status && (ORDER_STATUS_VALUES as ReadonlyArray<string>).includes(status)
        ? (status as OrderStatus)
        : undefined,
    bucket: isFulfillmentBucket(bucket) ? bucket : undefined,
    dateFrom: single("dateFrom"),
    dateTo: single("dateTo"),
    attentionOnly: attention === "1" || attention === "true",
    sortBy: isFulfillmentSortKey(sortBy) ? sortBy : "created_at",
    sortDir: sortDir === "asc" ? "asc" : "desc",
  };
}

function sortColumn(key: FulfillmentSortKey): string {
  switch (key) {
    case "total":
      return "total_amount";
    case "status":
      return "status";
    case "created_at":
    default:
      return "created_at";
  }
}

/**
 * Returns the filtered, sorted fulfillment queue. Bucket and attention filters
 * run in-memory because they're derived (no SQL column to filter on directly).
 *
 * Uses service-role so refunded / cancelled rows are visible regardless of RLS.
 */
export async function getFulfillmentQueue(
  filters: FulfillmentListFilters,
): Promise<FulfillmentRow[]> {
  if (!supabaseAdmin) return [];

  const limit = Math.min(Math.max(1, filters.limit ?? DEFAULT_LIMIT), MAX_LIMIT);

  let query = supabaseAdmin
    .from("orders")
    .select("*, order_items (*)")
    .limit(limit);

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.dateFrom) {
    query = query.gte("created_at", startOfDayIso(filters.dateFrom));
  }
  if (filters.dateTo) {
    query = query.lte("created_at", endOfDayIso(filters.dateTo));
  }

  if (filters.q) {
    const term = sanitizeSearch(filters.q);
    if (term) {
      const pattern = `%${term}%`;
      query = query.or(
        [
          `email.ilike.${pattern}`,
          `order_number.ilike.${pattern}`,
          `stripe_payment_intent_id.ilike.${pattern}`,
          `stripe_checkout_session_id.ilike.${pattern}`,
          `tracking_number.ilike.${pattern}`,
        ].join(","),
      );
    }
  }

  const col = sortColumn(filters.sortBy ?? "created_at");
  query = query.order(col, { ascending: filters.sortDir === "asc" });
  if (col !== "created_at") {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[admin fulfillment] list fetch failed:", error.message);
    }
    return [];
  }

  const enriched: FulfillmentRow[] = ((data ?? []) as AdminOrderRow[]).map((order) => ({
    order,
    bucket: getFulfillmentBucket(order),
    attentionReasons: getAttentionReasons(order),
  }));

  let rows = enriched;
  if (filters.bucket) {
    rows = rows.filter((row) => row.bucket === filters.bucket);
  }
  if (filters.attentionOnly) {
    rows = rows.filter((row) => row.attentionReasons.length > 0);
  }

  return rows;
}

const FULFILLABLE_STATUSES = new Set<OrderStatus>([
  "paid",
  "processing",
  "shipped",
  "delivered",
  "refunded",
]);

function emptyBucketMap(): Record<FulfillmentBucket, number> {
  const out = {} as Record<FulfillmentBucket, number>;
  for (const b of FULFILLMENT_BUCKET_VALUES) out[b] = 0;
  return out;
}

/**
 * Aggregates KPI counts + averages over a row set. Designed to consume the
 * same `FulfillmentRow[]` the queue page already fetched — no extra round-trip.
 */
export function computeFulfillmentStats(rows: FulfillmentRow[]): FulfillmentStats {
  const stats: FulfillmentStats = {
    totalOrders: rows.length,
    byBucket: emptyBucketMap(),
    attentionCount: 0,
    refundedCount: 0,
    refundedTotalCents: 0,
    refundRate: null,
    averageCheckoutCycleMs: null,
    averageFulfillmentCycleMs: null,
  };

  let fulfillableCount = 0;
  let checkoutCycleSum = 0;
  let checkoutCycleN = 0;
  let fulfillmentCycleSum = 0;
  let fulfillmentCycleN = 0;

  for (const row of rows) {
    stats.byBucket[row.bucket] += 1;
    if (row.attentionReasons.length > 0) stats.attentionCount += 1;

    if (row.order.status === "refunded") {
      stats.refundedCount += 1;
      stats.refundedTotalCents += row.order.total_cents ?? 0;
    }
    if (FULFILLABLE_STATUSES.has(row.order.status)) fulfillableCount += 1;

    const createdAt = new Date(row.order.created_at).getTime();
    if (Number.isFinite(createdAt) && row.order.paid_at) {
      const paidAt = new Date(row.order.paid_at).getTime();
      if (Number.isFinite(paidAt) && paidAt >= createdAt) {
        checkoutCycleSum += paidAt - createdAt;
        checkoutCycleN += 1;
      }
    }

    if (
      (row.bucket === "in_transit" || row.bucket === "delivered") &&
      row.order.paid_at &&
      row.order.updated_at
    ) {
      const paidAt = new Date(row.order.paid_at).getTime();
      const updatedAt = new Date(row.order.updated_at).getTime();
      if (
        Number.isFinite(paidAt) &&
        Number.isFinite(updatedAt) &&
        updatedAt >= paidAt
      ) {
        fulfillmentCycleSum += updatedAt - paidAt;
        fulfillmentCycleN += 1;
      }
    }
  }

  if (fulfillableCount > 0) {
    stats.refundRate = stats.refundedCount / fulfillableCount;
  }
  if (checkoutCycleN > 0) {
    stats.averageCheckoutCycleMs = checkoutCycleSum / checkoutCycleN;
  }
  if (fulfillmentCycleN > 0) {
    stats.averageFulfillmentCycleMs = fulfillmentCycleSum / fulfillmentCycleN;
  }

  return stats;
}

/** Overview-only fetch: same query, but trimmed to a reasonable look-back. */
export async function getFulfillmentStatsForOverview(): Promise<FulfillmentStats> {
  const rows = await getFulfillmentQueue({
    sortBy: "created_at",
    sortDir: "desc",
  });
  return computeFulfillmentStats(rows);
}

/**
 * Re-export of the lower-level helper so pages can compute attention state
 * for single orders (e.g. on /admin/orders/[id]) without re-importing two libs.
 */
export { getAttentionReasons, needsAttention } from "./fulfillmentStatus";
