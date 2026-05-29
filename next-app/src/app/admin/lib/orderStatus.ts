import type { OrderStatus } from "../../lib/types";

/**
 * Display tone per order status. Dark-theme friendly — uses translucent fills
 * and softened text colors so chips don't out-scream the gold brand accents.
 *
 * Status semantics in this codebase: a single `status` column covers BOTH
 * payment-side states (pending / paid / failed) AND fulfillment-side states
 * (processing / shipped / delivered) — plus wrap-up states (cancelled / refunded).
 */
export interface StatusTone {
  /** Tailwind utility classes for the chip background + ring. */
  bg: string;
  /** Tailwind utility classes for the chip text. */
  text: string;
  /** Short human label (Title Case). */
  label: string;
  /** Loose categorization for grouping/filtering UI. */
  category: "payment" | "fulfillment" | "wrap-up";
}

const TONES: Record<OrderStatus, StatusTone> = {
  pending: {
    bg: "bg-amber-500/15 ring-1 ring-inset ring-amber-500/30",
    text: "text-amber-200",
    label: "Pending",
    category: "payment",
  },
  paid: {
    bg: "bg-emerald-500/15 ring-1 ring-inset ring-emerald-500/30",
    text: "text-emerald-300",
    label: "Paid",
    category: "payment",
  },
  failed: {
    bg: "bg-rose-500/15 ring-1 ring-inset ring-rose-500/30",
    text: "text-rose-300",
    label: "Failed",
    category: "payment",
  },
  processing: {
    bg: "bg-sky-500/15 ring-1 ring-inset ring-sky-500/30",
    text: "text-sky-300",
    label: "Processing",
    category: "fulfillment",
  },
  shipped: {
    bg: "bg-indigo-500/15 ring-1 ring-inset ring-indigo-500/30",
    text: "text-indigo-300",
    label: "Shipped",
    category: "fulfillment",
  },
  delivered: {
    bg: "bg-emerald-500/20 ring-1 ring-inset ring-emerald-500/35",
    text: "text-emerald-200",
    label: "Delivered",
    category: "fulfillment",
  },
  cancelled: {
    bg: "bg-zinc-500/15 ring-1 ring-inset ring-zinc-500/30",
    text: "text-zinc-300",
    label: "Cancelled",
    category: "wrap-up",
  },
  refunded: {
    bg: "bg-amber-500/20 ring-1 ring-inset ring-amber-500/35",
    text: "text-amber-300",
    label: "Refunded",
    category: "wrap-up",
  },
};

const FALLBACK: StatusTone = {
  bg: "bg-zinc-500/15 ring-1 ring-inset ring-zinc-500/30",
  text: "text-zinc-300",
  label: "Unknown",
  category: "wrap-up",
};

export function getStatusTone(status: string | null | undefined): StatusTone {
  if (status && status in TONES) {
    return TONES[status as OrderStatus];
  }
  return FALLBACK;
}

export const ORDER_STATUS_VALUES: ReadonlyArray<OrderStatus> = [
  "pending",
  "paid",
  "failed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];
