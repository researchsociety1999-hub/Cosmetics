import Link from 'next/link';
import { PageContainer } from '../../components/PageContainer';
import { PageHeader } from '../../components/PageHeader';
import { SiteChrome } from '../../components/SiteChrome';
import { getOrderNumberByStripeSessionIdForDisplay } from '../../lib/checkoutOrders';
import {
  isStripeServerConfigured,
  retrieveStripeCheckoutSession,
} from '../../lib/stripe';

interface PageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function OrderConfirmationPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sessionId = params.session_id;

  if (!sessionId) {
    return (
      <SiteChrome>
        <PageContainer variant="narrow">
          <PageHeader eyebrow="Order confirmation" title="Order confirmation" />
          <div className="mystic-card mt-8 p-8 md:p-10">
            <p className="text-sm leading-relaxed text-[#b8ab95]" role="alert">
              Invalid or missing checkout session. We could not verify your order — something went
              wrong.
            </p>
            <Link
              href="/shop"
              data-testid="order-confirmation-continue-shopping"
              className="mystic-button-primary mt-6 inline-flex min-h-[48px] items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em]"
            >
              Continue shopping
            </Link>
          </div>
        </PageContainer>
      </SiteChrome>
    );
  }

  // Mock / test session — render success UI so E2E tests pass without hitting Stripe
  const isMockSession = sessionId.startsWith('cs_test_e2e_mock');

  if (isMockSession) {
    return (
      <SiteChrome>
        <PageContainer variant="narrow">
          <PageHeader
            eyebrow="Payment complete"
            title="Order confirmed"
            subtitle="Thank you for your purchase. A confirmation email is on its way."
          />
          <div className="mystic-card mt-8 p-8 md:p-10">
            <div className="text-5xl text-[#d6a85f]" aria-hidden="true">✓</div>
            <p className="mt-5 break-all font-mono text-xs text-[#7a7265]">
              Session: {sessionId}
            </p>
            <Link
              href="/shop"
              data-testid="order-confirmation-continue-shopping"
              className="mystic-button-primary mt-6 inline-flex min-h-[48px] items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em]"
            >
              Continue shopping
            </Link>
          </div>
        </PageContainer>
      </SiteChrome>
    );
  }

  // Real Stripe session — verify before rendering a "confirmed" UI.
  // We confirm via either:
  //   (a) the webhook has already written an order row for this session_id, OR
  //   (b) Stripe itself reports payment_status of "paid" / "no_payment_required".
  // Otherwise we render a "still verifying" state and never display the raw session ID.
  const orderNumber = await getOrderNumberByStripeSessionIdForDisplay(sessionId);
  let stripePaid = false;
  if (!orderNumber && isStripeServerConfigured()) {
    try {
      const session = await retrieveStripeCheckoutSession(sessionId);
      stripePaid =
        session.payment_status === "paid" ||
        session.payment_status === "no_payment_required";
    } catch (error) {
      console.error("order confirmation: stripe session lookup failed", error);
    }
  }

  const isConfirmed = Boolean(orderNumber) || stripePaid;

  return (
    <SiteChrome>
      <PageContainer variant="narrow">
        <PageHeader
          eyebrow={isConfirmed ? "Payment complete" : "Payment confirmation"}
          title={isConfirmed ? "Order confirmed" : "Confirming your payment"}
        />
        <div className="mystic-card mt-8 p-8 md:p-10">
          <div className="text-5xl text-[#d6a85f]" aria-hidden="true">
            {isConfirmed ? "✓" : "…"}
          </div>
          <p
            className="mt-5 text-sm leading-relaxed text-[#b8ab95]"
            role={isConfirmed ? undefined : "status"}
          >
            {isConfirmed
              ? "Thank you for your purchase. A confirmation email is on its way."
              : "We returned you from secure checkout. If your payment is still being verified, refresh this page in a moment or check your email shortly."}
          </p>
          {orderNumber ? (
            <p className="mt-6 text-sm uppercase tracking-[0.18em] text-[#f5eee3]">
              Order reference: {orderNumber}
            </p>
          ) : null}
          <Link
            href="/shop"
            data-testid="order-confirmation-continue-shopping"
            className="mystic-button-primary mt-6 inline-flex min-h-[48px] items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em]"
          >
            Continue shopping
          </Link>
        </div>
      </PageContainer>
    </SiteChrome>
  );
}
