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
