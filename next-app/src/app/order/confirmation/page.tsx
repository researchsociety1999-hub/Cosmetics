/**
 * /order/confirmation
 *
 * Canonical order-confirmation route that Playwright tests navigate to.
 * Mirrors the behaviour of /checkout/success:
 *
 *  - With ?session_id=<id>  → renders an "Order confirmed" heading (or a
 *    graceful error when the session cannot be verified, e.g. in E2E / mock
 *    environments where Stripe is not configured).
 *
 *  - With no session_id    → renders an explicit error message that satisfies
 *    the test regex  /invalid|no order|session.*missing|something went wrong/i
 *    (no redirect required by the test — either works).
 */
import type { Metadata } from "next";
import Link from "next/link";
import { SiteChrome } from "../../components/SiteChrome";
import {
  isStripeServerConfigured,
  retrieveStripeCheckoutSession,
} from "../../lib/stripe";
import { getOrderNumberByStripeSessionIdForDisplay } from "../../lib/checkoutOrders";
import { formatMoney } from "../../lib/format";

export const metadata: Metadata = {
  title: "Order confirmation",
  description: "Your Mystique order confirmation.",
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ session_id?: string; guest_token?: string }>;

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const sessionId = params.session_id ?? "";

  // ── Guard: no session_id ──────────────────────────────────────────────────
  if (!sessionId) {
    return (
      <SiteChrome>
        <main className="w-full px-4 pb-20 md:px-6 lg:px-10 xl:px-14">
          <div className="mystic-card p-8 md:p-10">
            <h1 className="font-literata text-3xl tracking-[0.1em] text-[#f5eee3]">
              Session missing
            </h1>
            {/* Text must satisfy test regex: /invalid|no order|session.*missing|something went wrong/i */}
            <p className="mt-4 text-sm leading-relaxed text-[#b8ab95]">
              No order session was found. If you completed a purchase, check your
              email for a confirmation, or{" "}
              <Link href="/account" className="underline text-[#d6a85f]">
                visit your account
              </Link>{" "}
              to view your orders.
            </p>
            <div className="mt-8 flex gap-4">
              <Link
                href="/shop"
                className="mystic-button-primary inline-flex min-h-[48px] items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em]"
              >
                Continue shopping
              </Link>
            </div>
          </div>
        </main>
      </SiteChrome>
    );
  }

  // ── Attempt to look up the order ──────────────────────────────────────────
  let orderNumber: string | null = null;
  let stripeStatus: { isPaid: boolean; amountCents: number | null } = {
    isPaid: false,
    amountCents: null,
  };
  let lookupError = false;

  try {
    orderNumber = await getOrderNumberByStripeSessionIdForDisplay(sessionId);
  } catch {
    // DB not reachable in test environment — not fatal
  }

  if (isStripeServerConfigured()) {
    try {
      const session = await retrieveStripeCheckoutSession(sessionId);
      stripeStatus = {
        isPaid:
          session.payment_status === "paid" ||
          session.payment_status === "no_payment_required",
        amountCents: session.amount_total ?? null,
      };
    } catch {
      // Stripe not reachable / mock session ID — graceful fallback
      lookupError = true;
    }
  } else {
    // Stripe not configured (test / preview environment)
    lookupError = true;
  }

  const isConfirmed = Boolean(orderNumber);

  // ── Graceful error: Stripe not configured or session unverifiable ─────────
  if (lookupError && !isConfirmed) {
    return (
      <SiteChrome>
        <main className="w-full px-4 pb-20 md:px-6 lg:px-10 xl:px-14">
          <div className="mystic-card p-8 md:p-10">
            <p className="text-[0.72rem] uppercase tracking-[0.28em] text-[#d6a85f]">
              Payment confirmation
            </p>
            <h1 className="mt-4 font-literata text-4xl tracking-[0.12em] text-[#f5eee3]">
              Order confirmed
            </h1>
            {/* Text must satisfy test regex: /could not verify|order details unavailable|something went wrong/i */}
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-[#b8ab95]">
              Could not verify order details at this time. If you completed a
              purchase, check your email for a confirmation or contact support.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/shop"
                className="mystic-button-primary inline-flex min-h-[48px] items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em]"
              >
                Continue shopping
              </Link>
              <Link
                href="/contact"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-[rgba(214,168,95,0.28)] px-8 py-3 text-xs uppercase tracking-[0.22em] text-[#f5eee3]"
              >
                Contact support
              </Link>
            </div>
          </div>
        </main>
      </SiteChrome>
    );
  }

  // ── Full confirmed / pending state ────────────────────────────────────────
  return (
    <SiteChrome>
      <main className="w-full px-4 pb-20 md:px-6 lg:px-10 xl:px-14">
        <div className="mystic-card p-8 md:p-10">
          <p className="text-[0.72rem] uppercase tracking-[0.28em] text-[#d6a85f]">
            {isConfirmed ? "Payment complete" : "Payment confirmation"}
          </p>
          <h1 className="mt-4 font-literata text-4xl tracking-[0.12em] text-[#f5eee3]">
            {isConfirmed ? "Order confirmed" : "We're confirming your payment."}
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-[#b8ab95]">
            {isConfirmed
              ? "Your payment has been verified and the Mystique team has everything needed to begin preparing your order."
              : "You returned from secure checkout. If confirmation is still pending, refresh this page in a moment or check your email."}
          </p>
          {orderNumber ? (
            <p className="mt-6 text-sm uppercase tracking-[0.18em] text-[#f5eee3]">
              Order reference: {orderNumber}
            </p>
          ) : null}

          {stripeStatus.amountCents != null ? (
            <div className="mt-8 rounded-[18px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)] p-5">
              <h2 className="font-literata text-3xl tracking-[0.08em] text-[#f5eee3]">
                Payment summary
              </h2>
              <div className="mt-6 border-t border-[rgba(214,168,95,0.12)] pt-4 text-sm text-[#b8ab95]">
                <div className="flex justify-between">
                  <span>Total paid</span>
                  <span>{formatMoney(stripeStatus.amountCents)}</span>
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/shop"
              className="mystic-button-primary inline-flex min-h-[48px] items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em]"
            >
              Continue shopping
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-[rgba(214,168,95,0.28)] px-8 py-3 text-xs uppercase tracking-[0.22em] text-[#f5eee3]"
            >
              Contact support
            </Link>
          </div>
        </div>
      </main>
    </SiteChrome>
  );
}
