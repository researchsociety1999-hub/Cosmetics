"use client";

import { useActionState, useEffect, useState } from "react";
import {
  promoteOrderStatusAction,
  updateEtaAction,
  updateTrackingAction,
} from "../orders/[id]/actions";
import type { ActionResult } from "../lib/orderActionResult";
import { ALLOWED_TRANSITIONS } from "../lib/orderTransitions";

interface OrderActionsPanelProps {
  orderId: string;
  currentStatus: string;
}

const BANNER_AUTO_CLEAR_MS = 4000;

/**
 * Holds the most recent `ActionResult` for an inline banner that auto-clears
 * after 4s. We track the dismissed reference instead of a separate "visible"
 * state so we never call `setState` synchronously in the effect body — only
 * the 4s timer callback writes to state.
 */
function useAutoClearingResult(result: ActionResult | null): ActionResult | null {
  const [dismissed, setDismissed] = useState<ActionResult | null>(null);

  useEffect(() => {
    if (!result || result === dismissed) return;
    const t = setTimeout(() => setDismissed(result), BANNER_AUTO_CLEAR_MS);
    return () => clearTimeout(t);
  }, [result, dismissed]);

  return result === dismissed ? null : result;
}

function Banner({ result }: { result: ActionResult | null }) {
  if (!result) return null;
  if (result.ok) {
    return (
      <p
        role="status"
        aria-live="polite"
        className="mt-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200"
      >
        {result.message}
      </p>
    );
  }
  return (
    <p
      role="alert"
      aria-live="assertive"
      className="mt-2 rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200"
    >
      {result.error}
    </p>
  );
}

export function OrderActionsPanel({ orderId, currentStatus }: OrderActionsPanelProps) {
  // --- Tracking ---
  const [trackingResult, doTracking, trackingPending] = useActionState<
    ActionResult | null,
    FormData
  >(async (_prev, formData) => {
    const value = String(formData.get("trackingNumber") ?? "");
    return updateTrackingAction(orderId, value);
  }, null);

  // --- Estimated delivery ---
  const [etaResult, doEta, etaPending] = useActionState<
    ActionResult | null,
    FormData
  >(async (_prev, formData) => {
    const value = String(formData.get("eta") ?? "");
    return updateEtaAction(orderId, value);
  }, null);

  // --- Status promotion ---
  const [statusResult, doStatus, statusPending] = useActionState<
    ActionResult | null,
    FormData
  >(async (_prev, formData) => {
    const value = String(formData.get("toStatus") ?? "");
    return promoteOrderStatusAction(orderId, value);
  }, null);

  const visibleTracking = useAutoClearingResult(trackingResult);
  const visibleEta = useAutoClearingResult(etaResult);
  const visibleStatus = useAutoClearingResult(statusResult);

  const allowedNext = ALLOWED_TRANSITIONS[currentStatus] ?? [];

  return (
    <section
      aria-labelledby="order-actions-heading"
      className="mb-8 rounded-[16px] border border-[rgba(214,168,95,0.16)] bg-[rgba(255,255,255,0.02)] p-5"
    >
      <header className="mb-5 flex items-baseline justify-between gap-3">
        <h2
          id="order-actions-heading"
          className="text-sm font-semibold uppercase tracking-[0.22em] text-[#d8c6aa]"
        >
          Operator actions
        </h2>
        <span className="text-[0.7rem] text-[#9a8f7a]">
          Current status: <code className="text-[#d8c6aa]">{currentStatus}</code>
        </span>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Tracking number */}
        <form
          action={doTracking}
          className="space-y-2"
          aria-labelledby="order-action-tracking-label"
        >
          <label
            id="order-action-tracking-label"
            htmlFor="order-action-tracking-input"
            className="text-[0.7rem] uppercase tracking-[0.2em] text-[#b8ab95]"
          >
            Tracking number
          </label>
          <div className="flex gap-2">
            <input
              id="order-action-tracking-input"
              name="trackingNumber"
              type="text"
              maxLength={120}
              placeholder="e.g. 1Z999AA10123456784"
              className="flex-1 rounded-md border border-[rgba(214,168,95,0.25)] bg-[rgba(0,0,0,0.25)] px-3 py-2 text-sm text-[#f5eee3] placeholder:text-[#7a7265] focus:border-[#d6a85f] focus:outline-none"
              disabled={trackingPending}
              required
            />
            <button
              type="submit"
              disabled={trackingPending}
              className="rounded-md bg-[#d6a85f] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#1a1610] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {trackingPending ? "Saving…" : "Save"}
            </button>
          </div>
          <Banner result={visibleTracking} />
        </form>

        {/* Estimated delivery */}
        <form
          action={doEta}
          className="space-y-2"
          aria-labelledby="order-action-eta-label"
        >
          <label
            id="order-action-eta-label"
            htmlFor="order-action-eta-input"
            className="text-[0.7rem] uppercase tracking-[0.2em] text-[#b8ab95]"
          >
            Estimated delivery
          </label>
          <div className="flex gap-2">
            <input
              id="order-action-eta-input"
              name="eta"
              type="date"
              className="flex-1 rounded-md border border-[rgba(214,168,95,0.25)] bg-[rgba(0,0,0,0.25)] px-3 py-2 text-sm text-[#f5eee3] focus:border-[#d6a85f] focus:outline-none"
              disabled={etaPending}
              required
            />
            <button
              type="submit"
              disabled={etaPending}
              className="rounded-md bg-[#d6a85f] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#1a1610] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {etaPending ? "Saving…" : "Save"}
            </button>
          </div>
          <Banner result={visibleEta} />
        </form>

        {/* Status promotion */}
        <div className="space-y-2">
          <p className="text-[0.7rem] uppercase tracking-[0.2em] text-[#b8ab95]">
            Status promotion
          </p>
          {allowedNext.length === 0 ? (
            <p className="text-muted-foreground text-sm text-[#9a8f7a]">
              No transitions available from <code>{currentStatus}</code>.
            </p>
          ) : (
            <form
              action={doStatus}
              className="flex gap-2"
              aria-labelledby="order-action-status-label"
            >
              <label htmlFor="order-action-status-input" className="sr-only">
                Move to status
              </label>
              <select
                id="order-action-status-input"
                name="toStatus"
                disabled={statusPending}
                defaultValue={allowedNext[0]}
                className="flex-1 rounded-md border border-[rgba(214,168,95,0.25)] bg-[rgba(0,0,0,0.25)] px-3 py-2 text-sm text-[#f5eee3] focus:border-[#d6a85f] focus:outline-none"
              >
                {allowedNext.map((value) => (
                  <option key={value} value={value}>
                    Move to {value}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={statusPending}
                className="rounded-md bg-[#d6a85f] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#1a1610] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {statusPending ? "Saving…" : "Promote"}
              </button>
            </form>
          )}
          <Banner result={visibleStatus} />
        </div>
      </div>

      <div className="mt-6 border-t border-[rgba(214,168,95,0.1)] pt-4">
        <p className="text-muted-foreground text-sm text-[#9a8f7a]">
          Admin notes are not yet supported — no notes column exists on orders.
        </p>
      </div>
    </section>
  );
}
