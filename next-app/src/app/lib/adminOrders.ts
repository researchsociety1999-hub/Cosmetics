import { supabaseAdmin } from "./supabaseClient";
import type { Order, OrderItem } from "./types";

export type AdminOrderRow = Order & {
  order_items: OrderItem[] | null;
};

/**
 * Recent orders for the admin dashboard (service role; never expose to anon clients).
 */
export async function getOrdersForAdmin(limit = 100): Promise<AdminOrderRow[]> {
  if (!supabaseAdmin) {
    return [];
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(
      `
      *,
      order_items (*)
    `,
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[admin orders] list failed:", error.message);
    return [];
  }

  return (data ?? []) as AdminOrderRow[];
}
