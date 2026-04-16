import type { Metadata } from "next";
import { CheckoutClient } from "./CheckoutClient";
import { PurchaseTrustFootnote } from "../components/PurchaseTrustFootnote";
import { SiteChrome } from "../components/SiteChrome";
import { getCartSummary } from "../lib/cart";
import { getOrderTotals } from "../lib/checkout";
import { formatMoney } from "../lib/format";
import { getAppliedPromoFromStoredCode } from "../lib/promo";
import { isStripeConfigured } from "../lib/stripe";

export const metadata: Metadata = {
  title: "Checkout",
  description:
    "Secure checkout—review your bag, shipping details, and order total before payment.",
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ status?: string; order?: string; orderId?: string; message?: string }>;

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const cart = await getCartSummary();
  const params = await searchParams;
  const stripeReady = isStripeConfigured();
  const { appliedPromo, invalidMessage } = await getAppliedPromoFromStoredCode(
    cart.subtotalCents,
  );
  const totals = getOrderTotals(cart, appliedPromo?.discountCents ?? 0);

  return (
    <SiteChrome>
      <main className="w-full px-4 py-14 md:px-6 lg:px-10 xl:px-14">
        <header className="mb-10 space-y-4">
          <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
            Checkout
          </p>
          <h1 className="font-literata text-4xl tracking-[0.12em] md:text-5xl">Checkout</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-[#b8ab95]">
            Complete your shipping details and review your order before the next
            step.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <CheckoutClient
              defaultEmail=""
              stripeReady={stripeReady}
            />
            {params.status === "cancelled" ? (
              <p className="text-sm text-[#d6a85f]">
                Secure checkout was cancelled. Your bag is still here, and you can
                try again whenever you are ready.
              </p>
            ) : null}
            {params.status === "validation" ? (
              <p className="text-sm text-[#d6a85f]">
                {params.message ?? "Please review your shipping details and try again."}
              </p>
            ) : null}
            {params.status === "empty" ? (
              <p className="text-sm text-[#d6a85f]">
                Your bag is empty. Add products before placing an order.
              </p>
            ) : null}
            {params.status === "order-error" ? (
              <p className="text-sm text-[#d6a85f]">
                We could not create your order right now. Please try again in a moment.
              </p>
            ) : null}
            {params.status === "stripe-error" ? (
              <p className="text-sm text-[#d6a85f]">
                We could not start secure checkout right now. Please try again
                in a moment.
              </p>
            ) : null}
            {invalidMessage ? (
              <p className="text-sm text-[#d6a85f]">
                Your previous promo code could not be applied at checkout: {invalidMessage}
              </p>
            ) : null}
          </div>

          <aside className="mystic-card h-fit p-6">
            <h2 className="font-literata text-3xl tracking-[0.1em] text-[#f5eee3]">
              Order summary
            </h2>
            <div className="mt-5 space-y-4">
              {cart.lines.map((line) => (
                <div key={line.product.id} className="flex justify-between gap-4 text-sm text-[#b8ab95]">
                  <span>
                    {line.product.name} x {line.quantity}
                  </span>
                  <span>{formatMoney(line.lineTotalCents)}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 border-t border-[rgba(214,168,95,0.12)] pt-4 text-sm text-[#b8ab95]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatMoney(cart.subtotalCents)}</span>
              </div>
              {appliedPromo ? (
                <div className="mt-3 flex justify-between text-[#d6a85f]">
                  <span>Promo ({appliedPromo.promo.code})</span>
                  <span>-{formatMoney(appliedPromo.discountCents)}</span>
                </div>
              ) : null}
              <div className="mt-3 flex justify-between">
                <span>Shipping</span>
                <span>{totals.shippingAmount === 0 ? "Free" : formatMoney(totals.shippingAmount)}</span>
              </div>
              <div className="mt-3 flex justify-between">
                <span>Estimated tax</span>
                <span>{formatMoney(totals.taxAmount)}</span>
              </div>
              <div className="mt-3 flex justify-between font-semibold text-[#f5eee3]">
                <span>Total</span>
                <span>{formatMoney(totals.totalAmount)}</span>
              </div>
            </div>
            <div className="mt-6">
              <PurchaseTrustFootnote dense />
            </div>
          </aside>
        </div>
      </main>
    </SiteChrome>
  );
}
