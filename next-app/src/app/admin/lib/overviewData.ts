import { supabaseAdmin } from "../../lib/supabaseClient";
import { getOrdersForAdmin, type AdminOrderRow } from "../../lib/adminOrders";

export interface AdminKpis {
  ordersToday: number;
  revenueTodayCents: number;
  productsPublished: number;
  lowStockAlerts: number;
}

export interface AdminOverviewData {
  kpis: AdminKpis;
  recentOrders: AdminOrderRow[];
}

const EMPTY_KPIS: AdminKpis = {
  ordersToday: 0,
  revenueTodayCents: 0,
  productsPublished: 0,
  lowStockAlerts: 0,
};

const LOW_STOCK_THRESHOLD = 5;
const RECENT_ORDERS_LIMIT = 5;

function startOfTodayIso(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return start.toISOString();
}

/**
 * One-shot fetch for the admin overview page.
 *
 * All five queries run in parallel against the Supabase service-role client.
 * Returns empty values when service credentials are missing rather than throwing,
 * matching the existing `getOrdersForAdmin` contract.
 */
export async function getAdminOverview(): Promise<AdminOverviewData> {
  if (!supabaseAdmin) {
    return { kpis: EMPTY_KPIS, recentOrders: [] };
  }

  const todayIso = startOfTodayIso();

  const [
    ordersTodayResult,
    revenueTodayResult,
    productsPublishedResult,
    lowStockResult,
    recentOrders,
  ] = await Promise.all([
    supabaseAdmin
      .from("orders")
      .select("id", { count: "exact", head: true })
      .gte("created_at", todayIso),
    supabaseAdmin
      .from("orders")
      .select("total_cents")
      .gte("created_at", todayIso),
    supabaseAdmin
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true),
    supabaseAdmin
      .from("products")
      .select("id", { count: "exact", head: true })
      .lt("stock", LOW_STOCK_THRESHOLD)
      .eq("in_stock", true),
    getOrdersForAdmin(RECENT_ORDERS_LIMIT),
  ]);

  const revenueRows =
    (revenueTodayResult.data as Array<{ total_cents: number | null }> | null) ??
    [];
  const revenueTodayCents = revenueRows.reduce((sum, row) => {
    const value = row.total_cents;
    return sum + (typeof value === "number" ? value : 0);
  }, 0);

  return {
    kpis: {
      ordersToday: ordersTodayResult.count ?? 0,
      revenueTodayCents,
      productsPublished: productsPublishedResult.count ?? 0,
      lowStockAlerts: lowStockResult.count ?? 0,
    },
    recentOrders,
  };
}
