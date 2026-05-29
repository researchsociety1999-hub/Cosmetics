import { supabaseAdmin } from "../../lib/supabaseClient";

export interface AdminCustomerRow {
  email: string;
  /** Newest full_name observed across this customer's orders. */
  latestName: string | null;
  ordersCount: number;
  totalSpendCents: number;
  firstOrderAt: string | null;
  latestOrderAt: string | null;
  /** True if any order has a non-null user_id (i.e. customer signed in at least once). */
  hasAccount: boolean;
}

export type CustomerSortKey =
  | "email"
  | "ordersCount"
  | "totalSpendCents"
  | "latestOrderAt"
  | "firstOrderAt";

export interface CustomerListFilters {
  q?: string;
  sortBy?: CustomerSortKey;
  sortDir?: "asc" | "desc";
}

/**
 * No `customers` table exists in this codebase — customers are derived from
 * orders aggregated by `email`. This is the lightweight, DB-migration-free
 * version the brief asks for. When a real customers table lands later, this
 * helper can be swapped out behind the same interface.
 */
interface OrderAggregateRow {
  email: string | null;
  full_name: string | null;
  user_id: string | null;
  total_amount: number | null;
  created_at: string;
}

const MAX_ORDER_SAMPLE = 1000;
const MAX_SEARCH_LENGTH = 200;

function sanitizeSearch(value: string): string {
  return value.replace(/[,()%*]/g, "").trim().slice(0, MAX_SEARCH_LENGTH).toLowerCase();
}

export function parseCustomerFiltersFromSearchParams(
  raw: Record<string, string | string[] | undefined>,
): CustomerListFilters {
  function single(key: string): string | undefined {
    const v = raw[key];
    if (Array.isArray(v)) return v[0]?.trim() || undefined;
    return typeof v === "string" ? v.trim() || undefined : undefined;
  }

  const sortBy = single("sortBy");
  const sortDir = single("sortDir");

  const allowedSorts: ReadonlyArray<CustomerSortKey> = [
    "email",
    "ordersCount",
    "totalSpendCents",
    "latestOrderAt",
    "firstOrderAt",
  ];

  return {
    q: single("q")?.slice(0, MAX_SEARCH_LENGTH),
    sortBy:
      sortBy && (allowedSorts as ReadonlyArray<string>).includes(sortBy)
        ? (sortBy as CustomerSortKey)
        : "latestOrderAt",
    sortDir: sortDir === "asc" ? "asc" : "desc",
  };
}

function compareCustomers(
  a: AdminCustomerRow,
  b: AdminCustomerRow,
  sortBy: CustomerSortKey,
  sortDir: "asc" | "desc",
): number {
  const mult = sortDir === "asc" ? 1 : -1;
  switch (sortBy) {
    case "email":
      return a.email.localeCompare(b.email) * mult;
    case "ordersCount":
      return (a.ordersCount - b.ordersCount) * mult;
    case "totalSpendCents":
      return (a.totalSpendCents - b.totalSpendCents) * mult;
    case "firstOrderAt":
      return (
        (new Date(a.firstOrderAt ?? 0).getTime() -
          new Date(b.firstOrderAt ?? 0).getTime()) *
        mult
      );
    case "latestOrderAt":
    default:
      return (
        (new Date(a.latestOrderAt ?? 0).getTime() -
          new Date(b.latestOrderAt ?? 0).getTime()) *
        mult
      );
  }
}

export async function getCustomersForAdmin(
  filters: CustomerListFilters = {},
): Promise<AdminCustomerRow[]> {
  if (!supabaseAdmin) {
    return [];
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("email, full_name, user_id, total_amount, created_at")
    .order("created_at", { ascending: false })
    .limit(MAX_ORDER_SAMPLE);

  if (error) {
    console.error("[admin customers] aggregate fetch failed:", error.message);
    return [];
  }

  const aggregates = new Map<string, AdminCustomerRow>();
  for (const row of (data ?? []) as OrderAggregateRow[]) {
    const emailRaw = row.email?.trim();
    if (!emailRaw) continue;
    const email = emailRaw.toLowerCase();
    const total =
      typeof row.total_amount === "number" && Number.isFinite(row.total_amount)
        ? row.total_amount
        : 0;

    const existing = aggregates.get(email);
    if (!existing) {
      aggregates.set(email, {
        email,
        latestName: row.full_name?.trim() || null,
        ordersCount: 1,
        totalSpendCents: total,
        firstOrderAt: row.created_at,
        latestOrderAt: row.created_at,
        hasAccount: Boolean(row.user_id),
      });
      continue;
    }

    existing.ordersCount += 1;
    existing.totalSpendCents += total;
    if (
      row.created_at &&
      (!existing.latestOrderAt || row.created_at > existing.latestOrderAt)
    ) {
      existing.latestOrderAt = row.created_at;
      // The newest order's full_name is the most recent ground-truth.
      if (row.full_name?.trim()) {
        existing.latestName = row.full_name.trim();
      }
    }
    if (
      row.created_at &&
      (!existing.firstOrderAt || row.created_at < existing.firstOrderAt)
    ) {
      existing.firstOrderAt = row.created_at;
    }
    if (row.user_id) {
      existing.hasAccount = true;
    }
  }

  let rows = Array.from(aggregates.values());

  const searchTerm = filters.q ? sanitizeSearch(filters.q) : "";
  if (searchTerm) {
    rows = rows.filter(
      (row) =>
        row.email.includes(searchTerm) ||
        (row.latestName ?? "").toLowerCase().includes(searchTerm),
    );
  }

  rows.sort((a, b) =>
    compareCustomers(
      a,
      b,
      filters.sortBy ?? "latestOrderAt",
      filters.sortDir ?? "desc",
    ),
  );

  return rows;
}
