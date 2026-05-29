import { supabaseAdmin } from "../../lib/supabaseClient";
import type { OrderItem, OrderStatus } from "../../lib/types";
import type { AdminOrderRow } from "../../lib/adminOrders";
import { ORDER_STATUS_VALUES } from "./orderStatus";

export type OrderSortKey = "created_at" | "total" | "status" | "email";
export type SortDir = "asc" | "desc";

export interface OrderListFilters {
  q?: string;
  status?: OrderStatus;
  /** ISO date string (YYYY-MM-DD) — inclusive lower bound. */
  dateFrom?: string;
  /** ISO date string (YYYY-MM-DD) — inclusive upper bound (end-of-day). */
  dateTo?: string;
  sortBy?: OrderSortKey;
  sortDir?: SortDir;
  limit?: number;
}

const DEFAULT_LIMIT = 200;
const MAX_LIMIT = 500;
const MAX_SEARCH_LENGTH = 200;

/** Sanitize a free-text search for use inside Supabase `.or()` / ILIKE clauses. */
function sanitizeSearch(value: string): string {
  return value.replace(/[,()%*]/g, "").trim().slice(0, MAX_SEARCH_LENGTH);
}

/** Map UI sort key → actual Supabase column. */
function sortColumn(key: OrderSortKey): string {
  switch (key) {
    case "total":
      return "total_amount";
    case "status":
      return "status";
    case "email":
      return "email";
    case "created_at":
    default:
      return "created_at";
  }
}

/**
 * Parses query-string filter input from a Next.js server-component page.
 * Treats unknown / out-of-range values as undefined so the SQL stays clean.
 */
export function parseOrderFiltersFromSearchParams(
  raw: Record<string, string | string[] | undefined>,
): OrderListFilters {
  function single(key: string): string | undefined {
    const v = raw[key];
    if (Array.isArray(v)) return v[0]?.trim() || undefined;
    return typeof v === "string" ? v.trim() || undefined : undefined;
  }

  const status = single("status");
  const sortBy = single("sortBy");
  const sortDir = single("sortDir");

  return {
    q: single("q")?.slice(0, MAX_SEARCH_LENGTH),
    status:
      status && (ORDER_STATUS_VALUES as ReadonlyArray<string>).includes(status)
        ? (status as OrderStatus)
        : undefined,
    dateFrom: single("dateFrom"),
    dateTo: single("dateTo"),
    sortBy:
      sortBy === "total" || sortBy === "status" || sortBy === "email"
        ? sortBy
        : "created_at",
    sortDir: sortDir === "asc" ? "asc" : "desc",
  };
}

function endOfDayIso(dateOnly: string): string {
  // Treat "YYYY-MM-DD" as that calendar day 23:59:59.999 LOCAL — keeps UX intuitive.
  const d = new Date(`${dateOnly}T23:59:59.999`);
  if (Number.isNaN(d.getTime())) return dateOnly;
  return d.toISOString();
}

function startOfDayIso(dateOnly: string): string {
  const d = new Date(`${dateOnly}T00:00:00.000`);
  if (Number.isNaN(d.getTime())) return dateOnly;
  return d.toISOString();
}

/**
 * Returns the filtered, sorted orders list for the admin Orders page.
 *
 * Uses Supabase ILIKE across email / order_number / stripe_payment_intent_id
 * for the free-text search. UUID `id` matches are intentionally not part of
 * the ILIKE OR — pasted UUIDs work via the direct `/admin/orders/[id]` URL.
 */
export async function getOrdersForAdminFiltered(
  filters: OrderListFilters,
): Promise<AdminOrderRow[]> {
  if (!supabaseAdmin) {
    return [];
  }

  const limit = Math.min(
    Math.max(1, filters.limit ?? DEFAULT_LIMIT),
    MAX_LIMIT,
  );

  let query = supabaseAdmin
    .from("orders")
    .select(
      `
      *,
      order_items (*)
    `,
    )
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
        ].join(","),
      );
    }
  }

  const col = sortColumn(filters.sortBy ?? "created_at");
  query = query.order(col, { ascending: filters.sortDir === "asc" });
  // Tie-breaker so identical sort values stay stable across pages.
  if (col !== "created_at") {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) {
    console.error("[admin orders] filtered list failed:", error.message);
    return [];
  }

  return (data ?? []) as AdminOrderRow[];
}

/**
 * Fetches a single order plus its items for the order-detail page.
 */
export async function getOrderForAdminById(
  id: string,
): Promise<AdminOrderRow | null> {
  if (!supabaseAdmin) {
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(
      `
      *,
      order_items (*)
    `,
    )
    .eq("id", id)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[admin orders] detail fetch failed:", error.message);
    return null;
  }

  return (data as AdminOrderRow | null) ?? null;
}

/** Convenience: total line items count, useful in order detail summaries. */
export function sumLineItemQuantities(items: OrderItem[] | null | undefined): number {
  if (!items?.length) return 0;
  return items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
}
