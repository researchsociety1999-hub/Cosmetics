import type { Metadata } from "next";
import Link from "next/link";
import { SiteChrome } from "../../components/SiteChrome";
import { clearCartItemsCookie } from "../../lib/cart";

export const metadata: Metadata = {
  title: "Checkout success",
  description: "Your Mystique order payment was completed successfully.",
};

type SearchParams = Promise<{ order?: string }>;

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await clearCartItemsCookie();
  const params = await searchParams;

  return (
    <SiteChrome>
      <main className="mx-auto max-w-3xl px-4 py-20 text-center md:px-6">
        <div className="mystic-card p-8 md:p-10">
          <p className="text-[0.72rem] uppercase tracking-[0.28em] text-[#d6a85f]">
            Payment complete
          </p>
          <h1 className="mt-4 font-cormorant text-4xl tracking-[0.12em] md:text-5xl">
            Your order is confirmed.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-[#b8ab95]">
            We have your payment and your order details are already in the
            Mystique inbox. A confirmation email has also been sent to the
            customer email address you entered at checkout.
          </p>
          {params.order ? (
            <p className="mt-6 text-sm uppercase tracking-[0.18em] text-[#f5eee3]">
              Order reference: {params.order}
            </p>
          ) : null}
          <div className="mt-8 grid gap-4 text-left md:grid-cols-3">
            <div className="rounded-[18px] border border-[rgba(214,168,95,0.14)] bg-[rgba(255,255,255,0.02)] p-4">
              <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#d6a85f]">
                Confirmation email
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#b8ab95]">
                Check your inbox for your order confirmation and keep your order
                reference handy.
              </p>
            </div>
            <div className="rounded-[18px] border border-[rgba(214,168,95,0.14)] bg-[rgba(255,255,255,0.02)] p-4">
              <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#d6a85f]">
                What happens next
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#b8ab95]">
                The Mystique team will prepare your order and send another email
                once it is on the way.
              </p>
            </div>
            <div className="rounded-[18px] border border-[rgba(214,168,95,0.14)] bg-[rgba(255,255,255,0.02)] p-4">
              <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#d6a85f]">
                Shipping window
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#b8ab95]">
                Most U.S. orders arrive within 3-5 business days after dispatch.
              </p>
            </div>
          </div>
          <div className="mt-6 rounded-[18px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)] p-5 text-left text-sm leading-relaxed text-[#b8ab95]">
            <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#d6a85f]">
              Need support?
            </p>
            <p className="mt-2">
              If you need to update your shipping details or ask about your
              order, contact the team and include your order reference for a
              faster response.
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
