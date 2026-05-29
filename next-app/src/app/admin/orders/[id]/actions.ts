"use server";

// AUDIT-HOOK: replace console.log with DB write when audit table exists.
//
// Today, mutations are traced through Vercel function logs only — sufficient
// for short-term traceability. When an `order_audit_log` table is added,
// search for `console.log("[order action]"` calls in this file and replace
// them with row inserts: { actor: adminId, action, order_id, payload, at }.

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  getAdminCookieName,
  isAdminConfigured,
  verifyAdminSessionToken,
} from "../../../lib/adminSession";
import { supabaseAdmin } from "../../../lib/supabaseClient";
import type { ActionResult } from "../../lib/orderActionResult";
import { ALLOWED_TRANSITIONS, isAllowedTransition } from "../../lib/orderTransitions";

const TRACKING_MAX_LENGTH = 120;
const ADMIN_ACTOR = "admin"; // single-tenant admin — no per-user id today.

/**
 * Re-verifies the admin session at action-invocation time. The admin pages
 * already gate on `requireAdminSession`, but server actions are reachable
 * via direct HTTP POST, so we re-check here defensively.
 */
async function verifyAdminSession(): Promise<boolean> {
  if (!isAdminConfigured()) return false;
  const cookieStore = await cookies();
  const token = cookieStore.get(getAdminCookieName())?.value;
  return verifyAdminSessionToken(token);
}

function refreshAdminViews(orderId: string): void {
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin/fulfillment");
}

function isUuidLike(value: string): boolean {
  return /^[0-9a-fA-F-]{32,}$/.test(value);
}

/**
 * Update an order's tracking number.
 *
 * Validation:
 *   - `trackingNumber` must be a non-empty string up to 120 chars after trim.
 *   - `orderId` must look like a UUID.
 *
 * Side effects on success:
 *   - Writes `tracking_number` + `updated_at = now()`.
 *   - Revalidates the order detail, list, and fulfillment queue.
 *   - Emits a structured audit line.
 */
export async function updateTrackingAction(
  orderId: string,
  trackingNumber: string,
): Promise<ActionResult> {
  if (!(await verifyAdminSession())) {
    return { ok: false, error: "Unauthorized" };
  }
  if (!supabaseAdmin) {
    return {
      ok: false,
      error: "Supabase service role isn't configured — cannot write to orders.",
    };
  }

  const id = (orderId ?? "").trim();
  if (!id || !isUuidLike(id)) {
    return { ok: false, error: "Invalid order id." };
  }

  const value = (trackingNumber ?? "").trim();
  if (value.length === 0) {
    return { ok: false, error: "Tracking number is required." };
  }
  if (value.length > TRACKING_MAX_LENGTH) {
    return {
      ok: false,
      error: `Tracking number can be at most ${TRACKING_MAX_LENGTH} characters.`,
    };
  }

  const { error } = await supabaseAdmin
    .from("orders")
    .update({ tracking_number: value, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { ok: false, error: `Update failed: ${error.message}` };
  }

  console.log("[order action]", {
    action: "update_tracking",
    orderId: id,
    tracking_number: value,
    adminId: ADMIN_ACTOR,
  });
  refreshAdminViews(id);

  return { ok: true, message: "Tracking number saved." };
}

/**
 * Set the estimated delivery date on an order.
 *
 * Validation:
 *   - `eta` must be an ISO date string parseable by `Date`.
 *   - Date must not be in the past (today is accepted).
 *   - `orderId` must look like a UUID.
 *
 * Side effects on success:
 *   - Writes `estimated_delivery` + `updated_at = now()`.
 *   - Revalidates admin views and emits an audit line.
 */
export async function updateEtaAction(
  orderId: string,
  eta: string,
): Promise<ActionResult> {
  if (!(await verifyAdminSession())) {
    return { ok: false, error: "Unauthorized" };
  }
  if (!supabaseAdmin) {
    return {
      ok: false,
      error: "Supabase service role isn't configured — cannot write to orders.",
    };
  }

  const id = (orderId ?? "").trim();
  if (!id || !isUuidLike(id)) {
    return { ok: false, error: "Invalid order id." };
  }

  const raw = (eta ?? "").trim();
  if (!raw) {
    return { ok: false, error: "Estimated delivery date is required." };
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return { ok: false, error: "Estimated delivery is not a valid date." };
  }

  // Compare against start-of-today (local time) so picking "today" is fine,
  // but anything strictly before is rejected.
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  if (parsed.getTime() < startOfToday.getTime()) {
    return { ok: false, error: "Estimated delivery cannot be in the past." };
  }

  const isoValue = parsed.toISOString();

  const { error } = await supabaseAdmin
    .from("orders")
    .update({ estimated_delivery: isoValue, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { ok: false, error: `Update failed: ${error.message}` };
  }

  console.log("[order action]", {
    action: "update_eta",
    orderId: id,
    estimated_delivery: isoValue,
    adminId: ADMIN_ACTOR,
  });
  refreshAdminViews(id);

  return { ok: true, message: "Estimated delivery saved." };
}

/**
 * Promote an order along an allowed forward status path
 * (see `ALLOWED_TRANSITIONS`).
 *
 * Reads the current status from the DB before validating, so a stale or
 * tampered client-side `from` value can't bypass the transition table.
 * Writes only `status` + `updated_at`. Never touches `paid_at`, `shipped_at`,
 * or any other timestamp column — those are owned by Stripe / shipping
 * integrations.
 */
export async function promoteOrderStatusAction(
  orderId: string,
  toStatus: string,
): Promise<ActionResult> {
  if (!(await verifyAdminSession())) {
    return { ok: false, error: "Unauthorized" };
  }
  if (!supabaseAdmin) {
    return {
      ok: false,
      error: "Supabase service role isn't configured — cannot write to orders.",
    };
  }

  const id = (orderId ?? "").trim();
  if (!id || !isUuidLike(id)) {
    return { ok: false, error: "Invalid order id." };
  }

  const next = (toStatus ?? "").trim();
  if (!next) {
    return { ok: false, error: "Target status is required." };
  }

  const { data: current, error: readError } = await supabaseAdmin
    .from("orders")
    .select("status")
    .eq("id", id)
    .maybeSingle();

  if (readError) {
    return { ok: false, error: `Order lookup failed: ${readError.message}` };
  }
  if (!current) {
    return { ok: false, error: "Order not found." };
  }

  const currentStatus = String(current.status);

  if (currentStatus === next) {
    return { ok: false, error: `Order is already ${currentStatus}.` };
  }

  if (!isAllowedTransition(currentStatus, next)) {
    const allowed = ALLOWED_TRANSITIONS[currentStatus] ?? [];
    const allowedHint =
      allowed.length > 0 ? ` Allowed: ${allowed.join(", ")}.` : "";
    return {
      ok: false,
      error: `Transition ${currentStatus} → ${next} isn't a safe forward step.${allowedHint}`,
    };
  }

  const { error } = await supabaseAdmin
    .from("orders")
    .update({ status: next, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { ok: false, error: `Status update failed: ${error.message}` };
  }

  console.log("[order action]", {
    action: "promote_status",
    orderId: id,
    from: currentStatus,
    to: next,
    adminId: ADMIN_ACTOR,
  });
  refreshAdminViews(id);

  return { ok: true, message: `Status moved ${currentStatus} → ${next}.` };
}
