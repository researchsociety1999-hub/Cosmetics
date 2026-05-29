import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer } from "../../components/PageContainer";
import { SiteChrome } from "../../components/SiteChrome";
import { PurchaseEvent } from "../../components/PurchaseEvent";
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

type SearchParams = Promise<{ session_id?: string; guest_token?: string }>;

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const sessionId = params.session_id ?? "";
  const guestToken = params.guest_token ?? "";
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

  // Validate guest_token is UUID-shaped before using it in a URL.
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const safeGuestToken = uuidRegex.test(guestToken) ? guestToken : "";

  return (
    <SiteChrome>
      <PageContainer as="main" variant="wide">
        <div className="mystic-card p-8 md:p-10">
          <p className="text-[0.72rem] uppercase tracking-[0.28em] text-[#d6a85f]">
            {isConfirmed ? "Payment complete" : "Payment confirmation"}
          </p>
          <h1 className="mt-4 font-literata text-4xl tracking-[0.12em] md:text-5xl">
            {isConfirmed ? "Your order is confirmed." : "We\u2019re confirming your payment."}
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
                    ? "Payment received. We\u2019re confirming your order."
                    : "Waiting for payment confirmation."
              }
            />
            <InfoCard
              title="Email"
              body={
                isConfirmed
                  ? "A confirmation email will arrive shortly."
                  : "We\u2019ll send the order confirmation email once payment is fully verified."
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

          {/* Guest order tracking link — only shown for unauthenticated checkouts */}
          {safeGuestToken ? (
            <div className="mt-8 rounded-[18px] border border-[rgba(214,168,95,0.22)] bg-[rgba(214,168,95,0.04)] p-5">
              <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[#d6a85f]">
                Guest order tracking
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#b8ab95]">
                Bookmark the link below to check your order status at any time.
                This is the only way to view your order without an account.
              </p>
              <Link
                href={`/order/${safeGuestToken}`}
                className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[rgba(214,168,95,0.3)] px-6 py-2.5 text-xs uppercase tracking-[0.2em] text-[#d6a85f] transition-colors hover:border-[rgba(214,168,95,0.6)] hover:text-[#f5eee3]"
              >
                View order status
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
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
      </PageContainer>

      {/*
        GA4 purchase event — fires once on mount when:
          1. orderNumber exists (payment confirmed by webhook)
          2. Cookie consent === "accepted"
        Guarded by sessionStorage so page refreshes don't double-count.
      */}
      <PurchaseEvent
        transactionId={orderNumber}
        valueCents={stripeStatus.amountCents}
        currency="USD"
      />
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
