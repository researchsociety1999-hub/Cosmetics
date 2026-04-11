import type { Metadata } from "next";
import Link from "next/link";
import { SiteChrome } from "../../components/SiteChrome";
import { getOrderNumberByIdForDisplay } from "../../lib/checkoutOrders";

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
  const orderNumber = params.order_id
    ? await getOrderNumberByIdForDisplay(params.order_id)
    : null;

  return (
    <SiteChrome>
      <main className="w-full px-4 py-20 text-center md:px-6 lg:px-10 xl:px-14">
        <div className="mx-auto max-w-3xl">
        <div className="mystic-card p-8 md:p-10">
          <p className="text-[0.72rem] uppercase tracking-[0.28em] text-[#d6a85f]">
            Checkout cancelled
          </p>
          <h1 className="mt-4 font-literata text-4xl tracking-[0.12em] md:text-5xl">
            Your bag is still waiting.
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-[#b8ab95]">
            Secure checkout closed before payment completed. Your ritual bag is
            unchanged—you can return whenever you are ready.
          </p>
          {orderNumber ? (
            <p className="mt-6 text-sm uppercase tracking-[0.18em] text-[#f5eee3]">
              Order reference: {orderNumber}
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
        </div>
      </main>
    </SiteChrome>
  );
}
