/**
 * Allowed forward order-status transitions for the admin UI.
 *
 * Intentionally narrow:
 *   - Only forward moves operators commonly drive by hand.
 *   - No backward transitions (e.g. shipped → paid) — those are mistakes,
 *     not workflows.
 *   - No refund/cancel transitions — those belong to Stripe/webhook flows.
 *
 * The map is the single source of truth; the panel reads it to render the
 * dropdown, the server action reads it to validate the request.
 */
export const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  paid: ["processing", "shipped"],
  processing: ["shipped"],
  shipped: ["delivered"],
};

/** Returns `true` iff `from → to` is in `ALLOWED_TRANSITIONS`. */
export function isAllowedTransition(from: string, to: string): boolean {
  const candidates = ALLOWED_TRANSITIONS[from];
  if (!candidates) return false;
  return candidates.includes(to);
}
