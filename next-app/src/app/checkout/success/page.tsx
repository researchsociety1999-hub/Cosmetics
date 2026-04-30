import type { Metadata } from "next";
import Link from "next/link";
import { SiteChrome } from "../../components/SiteChrome";
import { getOrderNumberByStripeSessionIdForDisplay } from "../../lib/checkoutOrders";
import { formatMoney } from "../../lib/format";
import {
  isStripeServerConfigured,
  retrieveStripeCheckoutSession,
} from "../../lib/stripe";

export const metadata: Metadata = {
  title: "Order confirmation",
  description:
    "Confirm your Mystique order status, see your reference number, and find next steps after checkout.",
};

type SearchParams = Promise<{ session_id?: string }>;

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const sessionId = params.session_id ?? "";
  const orderNumber = sessionId
    ? await getOrderNumberByStripeSessionIdForDisplay(sessionId)
    : null;

  if (
    sessionId &&
    !orderNumber &&
    isStripeServerConfigured()
  ) {
    try {
      await retrieveStripeCheckoutSession(sessionId);

      // Read-only reconciliation: display status hints only.
      // The Stripe webhook is the single writer responsible for finalizing orders + sending email.
    } catch (error) {
      console.error("checkout success reconciliation error", error);
    }
  }

  // Best-effort status hint (do not finalize here).
  let stripeStatus: { isPaid: boolean; amountCents: number | null } = {
    isPaid: false,
    amountCents: null,
  };
  if (sessionId && isStripeServerConfigured()) {
    try {
      const session = await retrieveStripeCheckoutSession(sessionId);
      stripeStatus = {
        isPaid:
          session.payment_status === "paid" ||
          session.payment_status === "no_payment_required",
        amountCents: session.amount_total ?? null,
      };
    } catch (error) {
      console.error("checkout success stripe session lookup failed", error);
    }
  }
  const isConfirmed = Boolean(orderNumber);

  return (
    <SiteChrome>
      <main className="w-full px-4 py-20 md:px-6 lg:px-10 xl:px-14">
        <div className="mystic-card p-8 md:p-10">
          <p className="text-[0.72rem] uppercase tracking-[0.28em] text-[#d6a85f]">
            {isConfirmed ? "Payment complete" : "Payment confirmation"}
          </p>
          <h1 className="mt-4 font-literata text-4xl tracking-[0.12em] md:text-5xl">
            {isConfirmed ? "Your order is confirmed." : "We're confirming your payment."}
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-[#b8ab95]">
            {isConfirmed
              ? "Your payment has been verified and the Mystique team has everything needed to begin preparing your order."
              : "You returned from secure checkout. If confirmation is still pending, refresh this page in a moment or check your email once the order is marked complete."}
          </p>
          {orderNumber ? (
            <p className="mt-6 text-sm uppercase tracking-[0.18em] text-[#f5eee3]">
              Order reference: {orderNumber}
            </p>
          ) : null}

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <InfoCard
              title="Status"
              body={
                isConfirmed
                  ? "Payment confirmed. Your order is now processing."
                  : stripeStatus.isPaid
                    ? "Payment received. We’re confirming your order."
                    : "Waiting for payment confirmation."
              }
            />
            <InfoCard
              title="Email"
              body={
                isConfirmed
                  ? "A confirmation email will arrive shortly."
                  : "We'll send the order confirmation email once payment is fully verified."
              }
            />
            <InfoCard
              title="Bag"
              body={
                isConfirmed
                  ? "Your signed-in bag has been cleared."
                  : "Your bag stays as you left it until payment is confirmed."
              }
            />
          </div>

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

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[18px] border border-[rgba(214,168,95,0.14)] bg-[rgba(255,255,255,0.02)] p-4">
      <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#d6a85f]">
        {title}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-[#b8ab95]">{body}</p>
    </div>
  );
}
