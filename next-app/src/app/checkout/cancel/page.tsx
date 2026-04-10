import type { Metadata } from "next";
import Link from "next/link";
import { SiteChrome } from "../../components/SiteChrome";

export const metadata: Metadata = {
  title: "Checkout cancelled",
  description: "Return to checkout after cancelling a Stripe payment.",
};

type SearchParams = Promise<{ order_id?: string }>;

export default async function CheckoutCancelPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  return (
    <SiteChrome>
      <main className="mx-auto max-w-3xl px-4 py-20 text-center md:px-6">
        <div className="mystic-card p-8 md:p-10">
          <p className="text-[0.72rem] uppercase tracking-[0.28em] text-[#d6a85f]">
            Checkout cancelled
          </p>
          <h1 className="mt-4 font-literata text-4xl tracking-[0.12em] md:text-5xl">
            Your cart is still waiting.
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-[#b8ab95]">
            Stripe checkout was cancelled before payment completed. You can return
            to checkout any time and try again.
          </p>
          {params.order_id ? (
            <p className="mt-6 text-sm uppercase tracking-[0.18em] text-[#f5eee3]">
              Order reference: {params.order_id}
            </p>
          ) : null}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/checkout"
              className="mystic-button-primary inline-flex min-h-[48px] items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em]"
            >
              Return to checkout
            </Link>
            <Link
              href="/cart"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-[rgba(214,168,95,0.28)] px-8 py-3 text-xs uppercase tracking-[0.22em] text-[#f5eee3]"
            >
              Review cart
            </Link>
          </div>
        </div>
      </main>
    </SiteChrome>
  );
}
