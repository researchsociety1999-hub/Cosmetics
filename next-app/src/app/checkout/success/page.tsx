import type { Metadata } from "next";
import Link from "next/link";
import { SiteChrome } from "../../components/SiteChrome";
import { getOrderWithItemsByStripeSessionId } from "../../lib/checkoutOrders";
import { formatMoney } from "../../lib/format";
import { getProductsByIds } from "../../lib/queries";
import {
  finalizePaidOrderFromStripe,
} from "../../lib/checkoutOrders";
import {
  isStripeServerConfigured,
  retrieveStripeCheckoutSession,
} from "../../lib/stripe";

export const metadata: Metadata = {
  title: "Checkout status",
  description: "Check the payment status of your Mystique order.",
};

type SearchParams = Promise<{ session_id?: string }>;

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const sessionId = params.session_id ?? "";
  let orderWithItems = sessionId
    ? await getOrderWithItemsByStripeSessionId(sessionId)
    : null;

  if (
    sessionId &&
    orderWithItems &&
    orderWithItems.order.status === "pending" &&
    isStripeServerConfigured()
  ) {
    try {
      const session = await retrieveStripeCheckoutSession(sessionId);

      if (session.payment_status === "paid") {
        await finalizePaidOrderFromStripe({
          sessionId,
          paymentIntentId:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id ?? null,
          amountCents: session.amount_total ?? orderWithItems.order.total_cents,
          paymentMethod:
            session.payment_method_types?.join(", ") ?? "card",
          paidAt: new Date(
            (session.created ?? Math.floor(Date.now() / 1000)) * 1000,
          ).toISOString(),
        });
        orderWithItems = await getOrderWithItemsByStripeSessionId(sessionId);
      }
    } catch (error) {
      console.error("checkout success reconciliation error", error);
    }
  }

  const order = orderWithItems?.order ?? null;
  const items = orderWithItems?.items ?? [];
  const products = await getProductsByIds(items.map((item) => item.product_id));
  const productsById = new Map(products.map((product) => [product.id, product]));
  const isConfirmed = order?.status === "processing";

  return (
    <SiteChrome>
      <main className="mx-auto max-w-4xl px-4 py-20 md:px-6">
        <div className="mystic-card p-8 md:p-10">
          <p className="text-[0.72rem] uppercase tracking-[0.28em] text-[#d6a85f]">
            {isConfirmed ? "Payment complete" : "Payment confirmation"}
          </p>
          <h1 className="mt-4 font-cormorant text-4xl tracking-[0.12em] md:text-5xl">
            {isConfirmed ? "Your order is confirmed." : "We're confirming your payment."}
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-[#b8ab95]">
            {isConfirmed
              ? "Your payment has been verified and the Mystique team has everything needed to begin preparing your order."
              : "Stripe redirected you back successfully. If the webhook is still catching up, this page will update once payment is confirmed."}
          </p>
          {order?.order_number ? (
            <p className="mt-6 text-sm uppercase tracking-[0.18em] text-[#f5eee3]">
              Order reference: {order.order_number}
            </p>
          ) : null}

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <InfoCard
              title="Status"
              body={
                isConfirmed
                  ? "Payment confirmed. Your order is now processing."
                  : "Waiting for payment confirmation from Stripe."
              }
            />
            <InfoCard
              title="Email"
              body={
                isConfirmed
                  ? `Confirmation will be sent to ${order?.email ?? "your checkout email"}.`
                  : "We'll send the order confirmation email once payment is fully verified."
              }
            />
            <InfoCard
              title="Cart"
              body={
                isConfirmed
                  ? "Your authenticated cart has been cleared."
                  : "Your cart stays in place until payment is confirmed."
              }
            />
          </div>

          {order ? (
            <div className="mt-8 rounded-[18px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)] p-5">
              <h2 className="font-cormorant text-3xl tracking-[0.08em] text-[#f5eee3]">
                Order summary
              </h2>
              <div className="mt-5 space-y-3 text-sm text-[#b8ab95]">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-4">
                    <span>
                      {productsById.get(item.product_id)?.name ?? `Product #${item.product_id}`} x {item.quantity}
                    </span>
                    <span>{formatMoney(item.price_cents_at_time * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 border-t border-[rgba(214,168,95,0.12)] pt-4 text-sm text-[#b8ab95]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatMoney(order.subtotal_cents)}</span>
                </div>
                <div className="mt-3 flex justify-between">
                  <span>Shipping</span>
                  <span>{formatMoney(order.shipping_cents)}</span>
                </div>
                <div className="mt-3 flex justify-between">
                  <span>Total</span>
                  <span>{formatMoney(order.total_cents)}</span>
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
