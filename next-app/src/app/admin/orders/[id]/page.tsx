import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "../../components/AdminShell";
import { AttentionChip } from "../../components/AttentionChip";
import { CopyableId } from "../../components/CopyableId";
import { OrderActionsPanel } from "../../components/OrderActionsPanel";
import { StatusChip } from "../../components/StatusChip";
import {
  getOrderForAdminById,
  sumLineItemQuantities,
} from "../../lib/ordersQuery";
import {
  FULFILLMENT_BUCKET_LABELS,
  getAttentionReasons,
  getFulfillmentBucket,
} from "../../lib/fulfillmentStatus";
import { requireAdminSession } from "../../lib/session";
import { formatMoney } from "../../../lib/format";

export const metadata: Metadata = {
  title: "Order detail",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatCurrencyAmount(amountCents: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase() || "USD",
    }).format(amountCents / 100);
  } catch {
    return formatMoney(amountCents);
  }
}

function joinAddressLines(parts: ReadonlyArray<string | null | undefined>): string {
  return parts.filter((p): p is string => Boolean(p?.trim())).join(", ");
}

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const { id } = await params;
  await requireAdminSession(`/admin/orders/${encodeURIComponent(id)}`);
  const order = await getOrderForAdminById(id);

  if (!order) {
    notFound();
  }

  const items = order.order_items ?? [];
  const lineCount = sumLineItemQuantities(items);
  const bucket = getFulfillmentBucket(order);
  const attentionReasons = getAttentionReasons(order);
  const isRefunded = order.status === "refunded";

  return (
    <AdminShell pageEyebrow={`Order ${order.order_number}`} pageTitle="Order detail">
      <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
        <Link
          href="/admin/orders"
          className="text-[0.7rem] uppercase tracking-[0.22em] text-[#d6a85f] underline-offset-4 hover:underline"
        >
          ← Back to orders
        </Link>
        <span className="text-[#7a7265]">·</span>
        <StatusChip status={order.status} />
        <span className="text-[0.6rem] uppercase tracking-[0.18em] text-[#9a8f7a]">
          {FULFILLMENT_BUCKET_LABELS[bucket]}
        </span>
        {attentionReasons.length > 0 ? (
          <AttentionChip reasons={attentionReasons} size="compact" />
        ) : null}
        <span className="ml-auto text-xs text-[#7a7265]">
          Created {formatDateTime(order.created_at)}
        </span>
      </div>

      <OrderActionsPanel orderId={order.id} currentStatus={order.status} />

      {attentionReasons.length > 0 || isRefunded ? (
        <section
          aria-label="Fulfillment triage"
          className="mb-6 rounded-[16px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)] p-5"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-[0.7rem] uppercase tracking-[0.24em] text-[#b8ab95]">
              {isRefunded ? "Refund summary" : "Needs attention"}
            </h2>
            <Link
              href="/admin/fulfillment"
              className="text-[0.65rem] uppercase tracking-[0.2em] text-[#d6a85f] underline-offset-4 hover:underline"
            >
              Open fulfillment queue →
            </Link>
          </div>
          {attentionReasons.length > 0 ? (
            <ul className="mt-4 space-y-2 text-sm">
              {attentionReasons.map((reason) => (
                <li
                  key={reason.id}
                  className="flex gap-2 leading-relaxed text-[#d8c6aa]"
                >
                  <span aria-hidden className="text-rose-300">
                    ⚠
                  </span>
                  <span>
                    <span className="font-medium text-[#f5eee3]">
                      {reason.label}
                    </span>
                    <span className="text-[#9a8f7a]"> — {reason.explanation}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
          {isRefunded ? (
            <p className="mt-4 rounded-[10px] border border-[rgba(214,168,95,0.1)] bg-[rgba(214,168,95,0.04)] px-3 py-2 text-xs leading-relaxed text-[#b8ab95]">
              Order is marked refunded. The order table doesn&apos;t carry a
              refund reason or partial-refund amount —{" "}
              {order.stripe_payment_intent_id ? (
                <>
                  reconcile in Stripe using PI{" "}
                  <span className="font-mono text-[#d8c6aa]">
                    {order.stripe_payment_intent_id}
                  </span>
                  .
                </>
              ) : (
                "no Stripe payment intent is on file — verify the refund link manually."
              )}
            </p>
          ) : null}
        </section>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* ── Customer + shipping ───────────────────────────── */}
        <section
          aria-labelledby="customer-heading"
          className="rounded-[16px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)] p-6"
        >
          <h2
            id="customer-heading"
            className="text-[0.7rem] uppercase tracking-[0.24em] text-[#b8ab95]"
          >
            Customer
          </h2>
          <dl className="mt-4 grid grid-cols-1 gap-y-4 sm:grid-cols-2">
            <div>
              <dt className="text-[0.6rem] uppercase tracking-[0.2em] text-[#7a7265]">
                Name
              </dt>
              <dd className="mt-1 text-[#f5eee3]">{order.full_name || "—"}</dd>
            </div>
            <div>
              <dt className="text-[0.6rem] uppercase tracking-[0.2em] text-[#7a7265]">
                Email
              </dt>
              <dd className="mt-1 break-all text-[#f5eee3]">{order.email}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[0.6rem] uppercase tracking-[0.2em] text-[#7a7265]">
                Account
              </dt>
              <dd className="mt-1 text-[#d8c6aa]">
                {order.user_id ? (
                  <span className="text-emerald-300">Signed-in user</span>
                ) : (
                  <span className="text-[#7a6b5c]">Guest checkout</span>
                )}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[0.6rem] uppercase tracking-[0.2em] text-[#7a7265]">
                Shipping address
              </dt>
              <dd className="mt-1 whitespace-pre-line text-[#d8c6aa]">
                {joinAddressLines([
                  order.address_line1,
                  order.address_line2,
                  joinAddressLines([
                    order.city,
                    `${order.state} ${order.postal_code}`.trim(),
                  ]),
                  order.country,
                ]) || "—"}
              </dd>
            </div>
            {order.tracking_number ? (
              <div className="sm:col-span-2">
                <dt className="text-[0.6rem] uppercase tracking-[0.2em] text-[#7a7265]">
                  Tracking
                </dt>
                <dd className="mt-1 font-mono text-sm text-[#e8dcc4]">
                  {order.tracking_number}
                  {order.estimated_delivery
                    ? ` · ETA ${formatDateTime(order.estimated_delivery)}`
                    : ""}
                </dd>
              </div>
            ) : null}
          </dl>
        </section>

        {/* ── Payment ───────────────────────────── */}
        <section
          aria-labelledby="payment-heading"
          className="rounded-[16px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)] p-6"
        >
          <h2
            id="payment-heading"
            className="text-[0.7rem] uppercase tracking-[0.24em] text-[#b8ab95]"
          >
            Payment
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-[#9a8f7a]">Subtotal</dt>
              <dd className="tabular-nums text-[#d8c6aa]">
                {formatCurrencyAmount(order.subtotal_amount, order.currency)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-[#9a8f7a]">Shipping</dt>
              <dd className="tabular-nums text-[#d8c6aa]">
                {formatCurrencyAmount(order.shipping_amount, order.currency)}
              </dd>
            </div>
            {order.discount_cents > 0 ? (
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-[#9a8f7a]">
                  Discount
                  {order.promo_code ? (
                    <span className="ml-1 text-[0.62rem] uppercase tracking-[0.18em] text-[#d6a85f]">
                      · {order.promo_code}
                    </span>
                  ) : null}
                </dt>
                <dd className="tabular-nums text-[#d6a85f]">
                  −{formatCurrencyAmount(order.discount_cents, order.currency)}
                </dd>
              </div>
            ) : null}
            {order.tax_amount > 0 ? (
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-[#9a8f7a]">Tax</dt>
                <dd className="tabular-nums text-[#d8c6aa]">
                  {formatCurrencyAmount(order.tax_amount, order.currency)}
                </dd>
              </div>
            ) : null}
            <div className="flex items-baseline justify-between gap-4 border-t border-[rgba(214,168,95,0.12)] pt-3">
              <dt className="text-[#b8ab95]">Total</dt>
              <dd className="font-literata text-xl tabular-nums text-[#f5eee3]">
                {formatCurrencyAmount(order.total_amount, order.currency)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 text-[0.7rem]">
              <dt className="text-[#7a7265]">Currency</dt>
              <dd className="uppercase tracking-[0.18em] text-[#9a8f7a]">
                {order.currency}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 text-[0.7rem]">
              <dt className="text-[#7a7265]">Paid at</dt>
              <dd className="text-[#9a8f7a]">{formatDateTime(order.paid_at)}</dd>
            </div>
          </dl>

          <div className="mt-5 flex flex-col gap-2 border-t border-[rgba(214,168,95,0.12)] pt-4">
            <p className="text-[0.6rem] uppercase tracking-[0.22em] text-[#7a7265]">
              Stripe IDs
            </p>
            <CopyableId
              label="Order id"
              value={order.id}
              visible={18}
            />
            {order.stripe_payment_intent_id ? (
              <CopyableId
                label="pi"
                value={order.stripe_payment_intent_id}
                visible={20}
              />
            ) : (
              <p className="text-xs text-[#7a7265]">
                No payment intent ID on file.
              </p>
            )}
            {order.stripe_checkout_session_id ? (
              <CopyableId
                label="cs"
                value={order.stripe_checkout_session_id}
                visible={20}
              />
            ) : null}
          </div>
        </section>
      </div>

      {/* ── Line items ───────────────────────────── */}
      <section
        aria-labelledby="items-heading"
        className="mt-8 rounded-[16px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)]"
      >
        <div className="flex items-baseline justify-between gap-4 border-b border-[rgba(214,168,95,0.12)] px-6 py-4">
          <h2
            id="items-heading"
            className="text-[0.7rem] uppercase tracking-[0.24em] text-[#b8ab95]"
          >
            Line items
          </h2>
          <p className="text-xs text-[#7a7265]">
            {items.length} line{items.length === 1 ? "" : "s"} · {lineCount} unit
            {lineCount === 1 ? "" : "s"}
          </p>
        </div>
        {items.length === 0 ? (
          <p className="px-6 py-6 text-sm text-[#b8ab95]">
            No line items recorded for this order.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[rgba(214,168,95,0.1)] text-[0.6rem] uppercase tracking-[0.2em] text-[#9a8f7a]">
                  <th className="px-6 py-3 font-medium">Product</th>
                  <th className="px-6 py-3 font-medium">Variant</th>
                  <th className="px-6 py-3 font-medium text-right">Qty</th>
                  <th className="px-6 py-3 font-medium text-right">Unit</th>
                  <th className="px-6 py-3 font-medium text-right">Line total</th>
                </tr>
              </thead>
              <tbody className="text-[#d8c6aa]">
                {items.map((item) => {
                  const lineTotal = item.quantity * item.price_cents_at_time;
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-[rgba(214,168,95,0.08)] last:border-0"
                    >
                      <td className="px-6 py-3 align-top font-mono text-[0.78rem] text-[#e8dcc4]">
                        #{item.product_id}
                      </td>
                      <td className="px-6 py-3 align-top text-[#9a8f7a]">
                        {item.variant_id ? `#${item.variant_id}` : "—"}
                      </td>
                      <td className="px-6 py-3 align-top text-right tabular-nums text-[#f5eee3]">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-3 align-top text-right tabular-nums text-[#d8c6aa]">
                        {formatCurrencyAmount(
                          item.price_cents_at_time,
                          order.currency,
                        )}
                      </td>
                      <td className="px-6 py-3 align-top text-right tabular-nums text-[#f5eee3]">
                        {formatCurrencyAmount(lineTotal, order.currency)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="mt-6 text-xs text-[#7a7265]">
        Line items show stored <code className="text-[#9a8f7a]">product_id</code>{" "}
        and <code className="text-[#9a8f7a]">variant_id</code> rather than
        product names — names live on the products table and aren&apos;t denormalized
        onto orders. A product join can be added when admin product editing lands.
      </p>
    </AdminShell>
  );
}
