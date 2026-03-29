import type { Metadata } from "next";
import Link from "next/link";
import { SiteChrome } from "../../components/SiteChrome";
import { clearCartItemsCookie } from "../../lib/cart";
import { getOrderById } from "../../lib/queries";

export const metadata: Metadata = {
  title: "Checkout status",
  description: "Check the payment status of your Mystique order.",
};

type SearchParams = Promise<{ order?: string; orderId?: string }>;

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const order = params.orderId ? await getOrderById(params.orderId) : null;
  const isPaid = order?.status === "paid";

  if (isPaid) {
    await clearCartItemsCookie();
  }

  return (
    <SiteChrome>
      <main className="mx-auto max-w-3xl px-4 py-20 text-center md:px-6">
        <div className="mystic-card p-8 md:p-10">
          <p className="text-[0.72rem] uppercase tracking-[0.28em] text-[#d6a85f]">
            {isPaid ? "Payment complete" : "Payment confirmation"}
          </p>
          <h1 className="mt-4 font-cormorant text-4xl tracking-[0.12em] md:text-5xl">
            {isPaid ? "Your order is confirmed." : "We’re confirming your payment."}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-[#b8ab95]">
            {isPaid
              ? "Your payment has been verified and the Mystique team has everything needed to begin preparing your order."
              : "Stripe has redirected you back successfully, and we’re now checking the payment result. If your payment was completed, your confirmation email will arrive shortly."}
          </p>
          {(order?.order_number ?? params.order) ? (
            <p className="mt-6 text-sm uppercase tracking-[0.18em] text-[#f5eee3]">
              Order reference: {order?.order_number ?? params.order}
            </p>
          ) : null}
          <div className="mt-8 grid gap-4 text-left md:grid-cols-3">
            <div className="rounded-[18px] border border-[rgba(214,168,95,0.14)] bg-[rgba(255,255,255,0.02)] p-4">
              <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#d6a85f]">
                Status
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#b8ab95]">
                {isPaid
                  ? "Paid and confirmed."
                  : "Pending confirmation from the secure payment webhook."}
              </p>
            </div>
            <div className="rounded-[18px] border border-[rgba(214,168,95,0.14)] bg-[rgba(255,255,255,0.02)] p-4">
              <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#d6a85f]">
                Email
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#b8ab95]">
                {isPaid
                  ? "A confirmation email has been sent to your checkout email address."
                  : "We’ll send your order email after payment is fully verified."}
              </p>
            </div>
            <div className="rounded-[18px] border border-[rgba(214,168,95,0.14)] bg-[rgba(255,255,255,0.02)] p-4">
              <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#d6a85f]">
                Cart
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#b8ab95]">
                {isPaid
                  ? "Your cart has been cleared."
                  : "Your cart will stay intact until payment is confirmed."}
              </p>
            </div>
          </div>
          <div className="mt-6 rounded-[18px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)] p-5 text-left text-sm leading-relaxed text-[#b8ab95]">
            <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#d6a85f]">
              Need support?
            </p>
            <p className="mt-2">
              If you need to update your shipping details or ask about your order,
              contact the team and include your order reference for faster support.
            </p>
          </div>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
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
