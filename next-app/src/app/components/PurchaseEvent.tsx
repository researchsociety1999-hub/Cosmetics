"use client";

/**
 * PurchaseEvent — fires a GA4 `purchase` event exactly once per order.
 *
 * Strategy:
 *  - Runs on mount (client component, server-rendered shell above it).
 *  - Checks cookie consent — no-op if not "accepted".
 *  - Guards against double-fire (page refresh, StrictMode double-invoke)
 *    using sessionStorage keyed on transaction_id.
 *  - Receives all data from the parent server component — no client-side
 *    API call needed.
 *
 * Usage in checkout/success/page.tsx (server component):
 *
 *   <PurchaseEvent
 *     transactionId={orderNumber}
 *     valueCents={stripeStatus.amountCents}
 *     currency="USD"
 *   />
 */

import { useEffect } from "react";
import { hasAnalyticsConsent } from "./GoogleAnalytics";

const SESSION_KEY_PREFIX = "mystique_ga_purchase_fired_";

interface PurchaseEventProps {
  /** Order reference number — used as GA4 transaction_id */
  transactionId: string | null;
  /** Total in cents (Stripe amount_total) */
  valueCents: number | null;
  /** ISO 4217 currency code, e.g. "USD" */
  currency?: string;
}

export function PurchaseEvent({
  transactionId,
  valueCents,
  currency = "USD",
}: PurchaseEventProps) {
  useEffect(() => {
    // Must have a real transaction ID to avoid firing on the "pending" state.
    if (!transactionId) return;
    if (!hasAnalyticsConsent()) return;

    // Guard: only fire once per session per transaction ID.
    const guardKey = `${SESSION_KEY_PREFIX}${transactionId}`;
    try {
      if (sessionStorage.getItem(guardKey)) return;
      sessionStorage.setItem(guardKey, "1");
    } catch {
      // sessionStorage unavailable (private browsing, etc.) — still fire once
      // per mount; StrictMode may double-invoke but that's dev-only.
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    if (typeof w.gtag !== "function") return;

    const value = valueCents != null ? valueCents / 100 : undefined;

    w.gtag("event", "purchase", {
      transaction_id: transactionId,
      value,
      currency,
      // items array is optional for basic revenue attribution.
      // Add individual line items here in v2 once cart data is plumbed through.
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount only

  return null;
}
