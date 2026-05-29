/**
 * Fulfillment + refund triage helpers.
 *
 * The orders table has a single `status` enum and a few shipping fields
 * (`tracking_number`, `estimated_delivery`, `paid_at`). There is no dedicated
 * `fulfilled_at`, `refund_reason`, or `exception_state` column. Everything in
 * this module is derived from those real fields — anywhere a rule is a
 * heuristic rather than a hard data point, the rule object below carries an
 * `explanation` string that the UI surfaces verbatim, so operators always see
 * *why* a row was flagged.
 */
import type { Order } from "../../lib/types";

/** Coarse bucket used by the queue toolbar + KPIs. */
export type FulfillmentBucket =
  | "awaiting_payment"
  | "ready_to_ship"
  | "in_transit"
  | "delivered"
  | "refunded"
  | "cancelled"
  | "failed";

export const FULFILLMENT_BUCKET_LABELS: Record<FulfillmentBucket, string> = {
  awaiting_payment: "Awaiting payment",
  ready_to_ship: "Ready to ship",
  in_transit: "In transit",
  delivered: "Delivered",
  refunded: "Refunded",
  cancelled: "Cancelled",
  failed: "Failed",
};

export const FULFILLMENT_BUCKET_VALUES: ReadonlyArray<FulfillmentBucket> = [
  "awaiting_payment",
  "ready_to_ship",
  "in_transit",
  "delivered",
  "refunded",
  "cancelled",
  "failed",
];

/**
 * Maps the order `status` enum to a fulfillment bucket. `processing` and `paid`
 * both collapse to "ready_to_ship" because they describe a paid order that has
 * not been handed to a carrier yet.
 */
export function getFulfillmentBucket(order: Pick<Order, "status">): FulfillmentBucket {
  switch (order.status) {
    case "pending":
      return "awaiting_payment";
    case "paid":
    case "processing":
      return "ready_to_ship";
    case "shipped":
      return "in_transit";
    case "delivered":
      return "delivered";
    case "refunded":
      return "refunded";
    case "cancelled":
      return "cancelled";
    case "failed":
      return "failed";
    default:
      return "failed";
  }
}

/** Stable list of triage rule ids — keep in sync with `EVALUATORS` below. */
export type AttentionReasonId =
  | "shipped_without_tracking"
  | "paid_stale_no_shipment"
  | "refund_missing_payment_intent"
  | "shipped_no_eta"
  | "failed_with_total";

export interface AttentionReason {
  id: AttentionReasonId;
  /** Short label used by the chip popover / tooltip. */
  label: string;
  /**
   * Operator-facing explanation of WHY the row was flagged. Surfaced verbatim
   * by the UI so triage rules stay transparent.
   */
  explanation: string;
}

/** Order considered "stale paid" after this many days without a shipment signal. */
export const STALE_PAYMENT_DAYS = 3;
/** Order considered "missing ETA" after this many days in `shipped` without `estimated_delivery`. */
export const SHIPPED_NO_ETA_DAYS = 5;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function ageInDays(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const ts = new Date(iso).getTime();
  if (!Number.isFinite(ts)) return null;
  return (Date.now() - ts) / MS_PER_DAY;
}

interface AttentionRule {
  id: AttentionReasonId;
  evaluate: (order: Order) => AttentionReason | null;
}

/**
 * Heuristic rules — each returns a populated `AttentionReason` when triggered.
 *
 * Why heuristics: the schema has no explicit `needs_attention` or
 * `exception_state` column, so we derive triage state from the columns that
 * DO exist. The `explanation` strings are operator-facing copy.
 */
const EVALUATORS: ReadonlyArray<AttentionRule> = [
  {
    id: "shipped_without_tracking",
    evaluate(order) {
      if (
        (order.status === "shipped" || order.status === "delivered") &&
        !order.tracking_number?.trim()
      ) {
        return {
          id: "shipped_without_tracking",
          label: "No tracking number",
          explanation:
            "Status was advanced to shipped/delivered but no tracking number was attached. Customer can't see in-transit status.",
        };
      }
      return null;
    },
  },
  {
    id: "paid_stale_no_shipment",
    evaluate(order) {
      if (order.status !== "paid" && order.status !== "processing") return null;
      const age = ageInDays(order.paid_at ?? order.created_at);
      if (age === null || age < STALE_PAYMENT_DAYS) return null;
      return {
        id: "paid_stale_no_shipment",
        label: `Stalled ${Math.floor(age)}d`,
        explanation: `Paid order is older than ${STALE_PAYMENT_DAYS} days and still not handed off to a carrier. Verify pick & pack queue.`,
      };
    },
  },
  {
    id: "refund_missing_payment_intent",
    evaluate(order) {
      if (order.status !== "refunded") return null;
      if (order.stripe_payment_intent_id || order.payment_intent_id) return null;
      return {
        id: "refund_missing_payment_intent",
        label: "Refund without PI",
        explanation:
          "Order is marked refunded but no Stripe payment intent is on file. Reconcile against Stripe — the refund may not be linked to a real charge.",
      };
    },
  },
  {
    id: "shipped_no_eta",
    evaluate(order) {
      if (order.status !== "shipped") return null;
      const age = ageInDays(order.paid_at ?? order.created_at);
      if (age === null || age < SHIPPED_NO_ETA_DAYS) return null;
      if (order.estimated_delivery?.trim()) return null;
      return {
        id: "shipped_no_eta",
        label: "No ETA",
        explanation: `In transit for over ${SHIPPED_NO_ETA_DAYS} days with no estimated delivery. Confirm carrier ETA or notify customer.`,
      };
    },
  },
  {
    id: "failed_with_total",
    evaluate(order) {
      if (order.status !== "failed") return null;
      if (!order.total_cents || order.total_cents <= 0) return null;
      return {
        id: "failed_with_total",
        label: "Failed w/ amount",
        explanation:
          "Order is marked failed but has a non-zero total. Confirm there is no orphaned authorisation or partial capture in Stripe.",
      };
    },
  },
];

export function getAttentionReasons(order: Order): AttentionReason[] {
  const out: AttentionReason[] = [];
  for (const rule of EVALUATORS) {
    const reason = rule.evaluate(order);
    if (reason) out.push(reason);
  }
  return out;
}

/** Convenience for filtering / counting — true iff any rule fires. */
export function needsAttention(order: Order): boolean {
  return getAttentionReasons(order).length > 0;
}

/** Tone palette for the bucket badge in the queue table. */
export function getFulfillmentBucketTone(bucket: FulfillmentBucket): {
  bg: string;
  text: string;
} {
  switch (bucket) {
    case "ready_to_ship":
      return {
        bg: "bg-amber-500/15 ring-1 ring-inset ring-amber-500/30",
        text: "text-amber-200",
      };
    case "in_transit":
      return {
        bg: "bg-sky-500/15 ring-1 ring-inset ring-sky-500/30",
        text: "text-sky-300",
      };
    case "delivered":
      return {
        bg: "bg-emerald-500/15 ring-1 ring-inset ring-emerald-500/30",
        text: "text-emerald-300",
      };
    case "refunded":
      return {
        bg: "bg-amber-500/20 ring-1 ring-inset ring-amber-500/35",
        text: "text-amber-300",
      };
    case "awaiting_payment":
      return {
        bg: "bg-zinc-500/15 ring-1 ring-inset ring-zinc-500/30",
        text: "text-zinc-300",
      };
    case "cancelled":
      return {
        bg: "bg-zinc-500/15 ring-1 ring-inset ring-zinc-500/30",
        text: "text-zinc-400",
      };
    case "failed":
    default:
      return {
        bg: "bg-rose-500/15 ring-1 ring-inset ring-rose-500/30",
        text: "text-rose-300",
      };
  }
}
