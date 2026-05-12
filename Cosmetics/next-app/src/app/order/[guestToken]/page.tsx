import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteChrome } from "../../components/SiteChrome";
import { getOrderDetailsByGuestToken } from "../../lib/checkoutOrders";
import { formatMoney } from "../../lib/format";

export const metadata: Metadata = {
  title: "Order status",
  description: "View the status of your Mystique order.",
  // Prevent search engines from indexing order status pages.
  robots: { index: false, follow: false },
};

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending: { label: "Awaiting payment", color: "#b8ab95" },
  processing: { label: "Confirmed — processing", color: "#6daa45" },
  shipped: { label: "Shipped", color: "#4f98a3" },
  delivered: { label: "Delivered", color: "#4f98a3" },
  cancelled: { label: "Cancelled", color: "#a12c7b" },
  failed: { label: "Payment failed", color: "#a12c7b" },
  refunded: { label: "Refunded", color: "#bb653b" },
};

type PageParams = Promise<{ guestToken: string }>;

export default async function GuestOrderStatusPage({
  params,
}: {
  params: PageParams;
}) {
  const { guestToken } = await params;

  const result = await getOrderDetailsByGuestToken(guestToken);

  if (!result) {
    notFound();
  }

  const { order, items } = result;
  const status = STATUS_LABEL[order.status] ?? { label: order.status, color: "#b8ab95" };

  return (
    <SiteChrome>
      <main className="w-full px-4 pb-20 md:px-6 lg:px-10 xl:px-14">
        <div className="mystic-card p-8 md:p-10">
          {/* Header */}
          <p className="text-[0.72rem] uppercase tracking-[0.28em] text-[#d6a85f]">
            Order status
          </p>
          <h1 className="mt-4 font-literata text-4xl tracking-[0.12em] md:text-5xl">
            {order.order_number}
          </h1>
          <p className="mt-3 text-sm text-[#b8ab95]">
            Placed for{" "}
            <span className="text-[#f5eee3]">{order.full_name}</span>
          </p>

          {/* Status badge */}
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[rgba(214,168,95,0.2)] px-4 py-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: status.color }}
              aria-hidden="true"
            />
            <span className="text-xs uppercase tracking-[0.2em]" style={{ color: status.color }}>
              {status.label}
            </span>
          </div>

          {/* Shipping address */}
          <div className="mt-8 rounded-[18px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)] p-5">
            <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#d6a85f]">
              Shipping to
            </p>
            <address className="mt-3 text-sm not-italic leading-relaxed text-[#b8ab95]">
              <span className="block text-[#f5eee3]">{order.full_name}</span>
              <span className="block">{order.address_line1}</span>
              {order.address_line2 ? (
                <span className="block">{order.address_line2}</span>
              ) : null}
              <span className="block">
                {order.city}, {order.state} {order.postal_code}
              </span>
              <span className="block">{order.country}</span>
            </address>
          </div>

          {/* Order items */}
          {items.length > 0 ? (
            <div className="mt-8 rounded-[18px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)] p-5">
              <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#d6a85f]">
                Items
              </p>
              <ul className="mt-4 divide-y divide-[rgba(214,168,95,0.08)]">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between py-3 text-sm"
                  >
                    <span className="text-[#b8ab95]">
                      {/* Product name not stored on item row — show product_id as fallback.
                          In a future iteration, join order_items → products on the query. */}
                      Item{" "}
                      <span className="font-mono text-xs text-[#b8ab95]/60">
                        ×{item.quantity}
                      </span>
                    </span>
                    <span className="text-[#f5eee3]">
                      {formatMoney(item.price_cents_at_time * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Totals */}
          <div className="mt-8 rounded-[18px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)] p-5">
            <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#d6a85f]">
              Order summary
            </p>
            <div className="mt-4 space-y-2 text-sm text-[#b8ab95]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatMoney(order.subtotal_cents)}</span>
              </div>
              {order.discount_cents > 0 ? (
                <div className="flex justify-between text-[#6daa45]">
                  <span>Discount{order.promo_code ? ` (${order.promo_code})` : ""}</span>
                  <span>−{formatMoney(order.discount_cents)}</span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {order.shipping_cents === 0 ? "Free" : formatMoney(order.shipping_cents)}
                </span>
              </div>
              <div className="flex justify-between border-t border-[rgba(214,168,95,0.12)] pt-3 text-[#f5eee3]">
                <span className="uppercase tracking-[0.12em]">Total</span>
                <span>{formatMoney(order.total_cents)}</span>
              </div>
            </div>
          </div>

          {/* Bookmark reminder */}
          <div className="mt-8 rounded-[18px] border border-[rgba(214,168,95,0.1)] bg-[rgba(214,168,95,0.03)] p-4">
            <p className="text-xs leading-relaxed text-[#b8ab95]">
              <span className="text-[#d6a85f]">Bookmark this page</span> — this is the
              only way to view your order status without creating an account. The URL
              contains your unique order token.
            </p>
          </div>

          {/* Actions */}
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
