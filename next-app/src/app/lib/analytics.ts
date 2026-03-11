import { supabase } from "./supabaseClient";

export type MysticEventType =
  | "page_view"
  | "product_viewed"
  | "add_to_cart"
  | "checkout_started"
  | "order_completed"
  | "search";

export async function trackEvent(
  eventType: MysticEventType | string,
  eventData?: Record<string, unknown>,
  userId?: string,
): Promise<void> {
  try {
    const payload = {
      user_id: userId ?? null,
      event_type: eventType,
      event_data: eventData ?? null,
      occurred_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("analytics_events")
      .insert(payload);

    if (error) {
      console.error("trackEvent error", error);
    }
  } catch (err) {
    console.error("trackEvent unexpected error", err);
  }
}

