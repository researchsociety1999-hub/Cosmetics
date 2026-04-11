import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SiteChrome } from "../../../components/SiteChrome";
import { formatMoney } from "../../../lib/format";
import {
  getOrderWithItemsForUser,
  getPaymentsForOrder,
  getProductsByIds,
} from "../../../lib/queries";
import { getAuthenticatedUser } from "../../../lib/supabaseServer";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/account/login");
  }

  const { orderId } = await params;
  const orderWithItems = await getOrderWithItemsForUser({
    userId: user.id,
    orderId,
  });

  if (!orderWithItems) {
    notFound();
  }

  const [payments, products] = await Promise.all([
    getPaymentsForOrder(orderWithItems.id),
    getProductsByIds(orderWithItems.items.map((item) => item.product_id)),
  ]);
  const productsById = new Map(products.map((product) => [product.id, product]));
  const latestPayment = payments[0] ?? null;
  const paymentStatus =
    latestPayment?.status ??
    (orderWithItems.paid_at ? "paid" : orderWithItems.status === "failed" ? "failed" : "pending");

  return (
    <SiteChrome>
      <main className="w-full px-4 py-14 md:px-6 lg:px-10 xl:px-14">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
              Order details
            </p>
            <h1 className="mt-4 font-literata text-4xl tracking-[0.12em] text-[#f5eee3] md:text-5xl">
              {orderWithItems.order_number}
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-[#b8ab95]">
              Placed {new Date(orderWithItems.created_at).toLocaleString()}.
            </p>
          </div>
          <Link
            href="/account/orders"
            className="mystic-button-secondary inline-flex min-h-[48px] items-center justify-center px-6 py-3 text-xs uppercase tracking-[0.22em]"
          >
            Back to orders
          </Link>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
          <section className="space-y-6">
            <article className="mystic-card p-6">
              <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[#d6a85f]">
                Status
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <DetailItem label="Order status" value={orderWithItems.status} />
                <DetailItem label="Payment status" value={paymentStatus} />
                <DetailItem label="Order ID" value={orderWithItems.id} />
                <DetailItem
                  label="Payment reference"
                  value={
                    orderWithItems.stripe_payment_intent_id ??
                    orderWithItems.payment_intent_id ??
                    "Not available yet"
                  }
                />
              </div>
            </article>

            <article className="mystic-card p-6">
              <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[#d6a85f]">
                Shipping
              </p>
              <div className="mt-4 space-y-2 text-sm text-[#b8ab95]">
                <p className="text-[#f5eee3]">{orderWithItems.full_name}</p>
                <p>{orderWithItems.address_line1}</p>
                {orderWithItems.address_line2 ? <p>{orderWithItems.address_line2}</p> : null}
                <p>
                  {orderWithItems.city}, {orderWithItems.state} {orderWithItems.postal_code}
                </p>
                <p>{orderWithItems.country}</p>
                <p>{orderWithItems.email}</p>
                {orderWithItems.tracking_number ? (
                  <p>Tracking: {orderWithItems.tracking_number}</p>
                ) : null}
              </div>
            </article>

            <article className="mystic-card p-6">
              <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[#d6a85f]">
                Items
              </p>
              <div className="mt-5 space-y-4">
                {orderWithItems.items.map((item) => {
                  const product = productsById.get(item.product_id);
                  const lineTotal = item.price_cents_at_time * item.quantity;

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col gap-3 border-b border-[rgba(214,168,95,0.12)] pb-4 last:border-b-0 last:pb-0 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="text-sm text-[#f5eee3]">
                          {product?.name ?? `Product #${item.product_id}`}
                        </p>
                        <p className="mt-1 text-sm text-[#b8ab95]">
                          Quantity {item.quantity} x {formatMoney(item.price_cents_at_time)}
                        </p>
                      </div>
                      <p className="text-sm uppercase tracking-[0.18em] text-[#f0d19a]">
                        {formatMoney(lineTotal)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </article>
          </section>

          <aside className="mystic-card h-fit p-6">
            <h2 className="font-literata text-3xl tracking-[0.1em] text-[#f5eee3]">
              Totals
            </h2>
            <div className="mt-5 space-y-3 text-sm text-[#b8ab95]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatMoney(orderWithItems.subtotal_cents)}</span>
              </div>
              {orderWithItems.discount_cents > 0 ? (
                <div className="flex justify-between text-[#d6a85f]">
                  <span>Promo{orderWithItems.promo_code ? ` (${orderWithItems.promo_code})` : ""}</span>
                  <span>-{formatMoney(orderWithItems.discount_cents)}</span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{formatMoney(orderWithItems.shipping_cents)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatMoney(orderWithItems.tax_amount)}</span>
              </div>
              <div className="flex justify-between font-semibold text-[#f5eee3]">
                <span>Total</span>
                <span>{formatMoney(orderWithItems.total_cents)}</span>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </SiteChrome>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)] p-4">
      <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#b8ab95]">{label}</p>
      <p className="mt-2 text-sm text-[#f5eee3]">{value}</p>
    </div>
  );
}
