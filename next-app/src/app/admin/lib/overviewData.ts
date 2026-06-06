import { supabaseAdmin } from "../../lib/supabaseClient";
import { getOrdersForAdmin, type AdminOrderRow } from "../../lib/adminOrders";
import {
  getInventoryStatsForOverview,
  type ProductInventoryStats,
} from "./productsQuery";

export interface AdminKpis {
  totalOrders: number;
  totalRevenueCents: number;
  ordersToday: number;
  revenueTodayCents: number;
  /** Lifetime average order value, in cents. Zero when no orders exist. */
  averageOrderValueCents: number;
}

export interface AdminOverviewData {
  kpis: AdminKpis;
  recentOrders: AdminOrderRow[];
  inventory: ProductInventoryStats;
}

const EMPTY_KPIS: AdminKpis = {
  totalOrders: 0,
  totalRevenueCents: 0,
  ordersToday: 0,
  revenueTodayCents: 0,
  averageOrderValueCents: 0,
};

const EMPTY_INVENTORY: ProductInventoryStats = {
  totalProducts: 0,
  activeProducts: 0,
  draftProducts: 0,
  comingSoonProducts: 0,
  lowStockActive: 0,
  outOfStockActive: 0,
  recentlyUpdated: 0,
};

const RECENT_ORDERS_LIMIT = 5;

/**
 * Only statuses that represent real, realised revenue.
 * pending / failed / cancelled are intentionally excluded so
 * the admin KPI cards reflect actual money, not intent.
 */
const REVENUE_STATUSES = [
  "paid",
  "processing",
  "fulfilled",
  "shipped",
  "delivered",
] as const;

function startOfTodayIso(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return start.toISOString();
}

function sumTotals(
  rows: ReadonlyArray<{ total_cents: number | null }> | null | undefined,
): number {
  if (!rows?.length) return 0;
  return rows.reduce((sum, row) => {
    const value = row.total_cents;
    return sum + (typeof value === "number" ? value : 0);
  }, 0);
}

/**
 * One-shot fetch for the admin overview page.
 *
 * Five parallel queries against the Supabase service-role client:
 *   - lifetime order count  (head + count, realised statuses only)
 *   - lifetime revenue      (sum reduced client-side, realised statuses only)
 *   - today's order count   (realised statuses only)
 *   - today's revenue       (realised statuses only)
 *   - recent orders list    (via the existing frozen helper)
 *
 * Returns empty values (no throw) when service env is missing — same contract
 * as the rest of the admin data layer.
 */
export async function getAdminOverview(): Promise<AdminOverviewData> {
  if (!supabaseAdmin) {
    return { kpis: EMPTY_KPIS, recentOrders: [], inventory: EMPTY_INVENTORY };
  }

  const todayIso = startOfTodayIso();

  const [
    totalOrdersResult,
    lifetimeRevenueResult,
    ordersTodayResult,
    revenueTodayResult,
    recentOrders,
    inventory,
  ] = await Promise.all([
    // B01 fix — filter to realised statuses on all four KPI queries
    supabaseAdmin
      .from("orders")
      .select("id", { count: "exact", head: true })
      .in("status", REVENUE_STATUSES),
    supabaseAdmin
      .from("orders")
      .select("total_cents")
      .in("status", REVENUE_STATUSES),
    supabaseAdmin
      .from("orders")
      .select("id", { count: "exact", head: true })
      .gte("created_at", todayIso)
      .in("status", REVENUE_STATUSES),
    supabaseAdmin
      .from("orders")
      .select("total_cents")
      .gte("created_at", todayIso)
      .in("status", REVENUE_STATUSES),
    getOrdersForAdmin(RECENT_ORDERS_LIMIT),
    getInventoryStatsForOverview(),
  ]);

  const totalOrders = totalOrdersResult.count ?? 0;
  const totalRevenueCents = sumTotals(
    lifetimeRevenueResult.data as Array<{ total_cents: number | null }> | null,
  );
  const ordersToday = ordersTodayResult.count ?? 0;
  const revenueTodayCents = sumTotals(
    revenueTodayResult.data as Array<{ total_cents: number | null }> | null,
  );
  const averageOrderValueCents =
    totalOrders > 0 ? Math.round(totalRevenueCents / totalOrders) : 0;

  return {
    kpis: {
      totalOrders,
      totalRevenueCents,
      ordersToday,
      revenueTodayCents,
      averageOrderValueCents,
    },
    recentOrders,
    inventory,
  };
}
