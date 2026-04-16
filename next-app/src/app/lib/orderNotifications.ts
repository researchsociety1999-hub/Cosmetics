import {
  escapeHtml,
  getOrderNotificationEmail,
  isEmailConfigured,
  renderEmailLayout,
  sendEmail,
} from "./email";
import { formatMoney } from "./format";
import { getProductsByIds } from "./queries";
import type { Order, OrderItem } from "./types";

function buildAddressLines(order: Order): string[] {
  return [
    order.full_name,
    order.address_line1,
    order.address_line2 ?? "",
    `${order.city}, ${order.state} ${order.postal_code}`,
    order.country,
  ].filter(Boolean);
}

async function buildLineItems(
  items: OrderItem[],
): Promise<Array<{ name: string; quantity: number; lineTotal: number }>> {
  const products = await getProductsByIds(items.map((item) => item.product_id));
  const productsById = new Map(products.map((product) => [product.id, product]));

  return items.map((item) => ({
    name: productsById.get(item.product_id)?.name ?? `Product #${item.product_id}`,
    quantity: item.quantity,
    lineTotal: item.price_cents_at_time * item.quantity,
  }));
}

function orderKindLabel(order: Order): string {
  return order.user_id ? "Signed-in customer" : "Guest checkout";
}

/**
 * Sends branded customer confirmation + detailed admin notification via Resend
 * after payment is confirmed (webhook → finalizePaidOrderFromStripe).
 */
export async function sendOrderPaidEmails({
  order,
  items,
}: {
  order: Order;
  items: OrderItem[];
}): Promise<void> {
  if (!isEmailConfigured()) {
    console.warn(
      "[order email] Resend not configured; skipping order confirmation emails.",
    );
    return;
  }

  try {
    const lineItems = await buildLineItems(items);
    const lineItemsHtml = lineItems
      .map(
        (item) =>
          `<li style="margin:0 0 10px;">${escapeHtml(item.name)} × ${item.quantity} <strong>${escapeHtml(formatMoney(item.lineTotal))}</strong></li>`,
      )
      .join("");
    const lineItemsText = lineItems
      .map(
        (item) =>
          `${item.name} × ${item.quantity} — ${formatMoney(item.lineTotal)}`,
      )
      .join("\n");
    const addressText = buildAddressLines(order);
    const addressHtml = addressText.map((line) => escapeHtml(line)).join("<br />");

    const summaryRows = `
      <table style="width:100%;border-collapse:collapse;margin:0 0 16px;font-size:15px;color:#d8c6aa;">
        <tr><td style="padding:6px 0;border-bottom:1px solid rgba(214,168,95,0.15);">Subtotal</td><td style="padding:6px 0;text-align:right;border-bottom:1px solid rgba(214,168,95,0.15);">${escapeHtml(formatMoney(order.subtotal_amount))}</td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid rgba(214,168,95,0.15);">Shipping</td><td style="padding:6px 0;text-align:right;border-bottom:1px solid rgba(214,168,95,0.15);">${escapeHtml(formatMoney(order.shipping_amount))}</td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid rgba(214,168,95,0.15);">Estimated tax</td><td style="padding:6px 0;text-align:right;border-bottom:1px solid rgba(214,168,95,0.15);">${escapeHtml(formatMoney(order.tax_amount))}</td></tr>
        <tr><td style="padding:8px 0 0;font-weight:600;color:#f5eee3;">Total paid</td><td style="padding:8px 0 0;text-align:right;font-weight:600;color:#f5eee3;">${escapeHtml(formatMoney(order.total_amount))}</td></tr>
      </table>`;

    const adminExtra = `
      <p style="margin:0 0 12px;padding:12px;border-radius:12px;background:rgba(214,168,95,0.08);font-size:13px;line-height:1.6;color:#c4b89a;">
        <strong>Order ID:</strong> ${escapeHtml(order.id)}<br />
        <strong>Type:</strong> ${escapeHtml(orderKindLabel(order))}<br />
        ${order.stripe_checkout_session_id ? `<strong>Stripe session:</strong> ${escapeHtml(order.stripe_checkout_session_id)}<br />` : ""}
        ${order.stripe_payment_intent_id ? `<strong>Payment intent:</strong> ${escapeHtml(order.stripe_payment_intent_id)}` : ""}
      </p>
      <p style="margin:0 0 16px;"><strong>Customer email:</strong> ${escapeHtml(order.email)}</p>
      <p style="margin:0 0 8px;"><strong>Ship to</strong></p>
      <p style="margin:0 0 16px;">${addressHtml}</p>
      <p style="margin:0 0 8px;"><strong>Line items</strong></p>
      <ul style="padding-left:20px;margin:0 0 16px;">${lineItemsHtml}</ul>
      ${summaryRows}
    `;

    const customerBody = `
      <p style="margin:0 0 16px;">Thank you for your order, ${escapeHtml(order.full_name)}.</p>
      <p style="margin:0 0 16px;">We&apos;ve received your payment and are preparing your shipment.</p>
      <p style="margin:0 0 8px;"><strong>Order number</strong></p>
      <p style="margin:0 0 20px;font-size:20px;letter-spacing:0.12em;color:#f5eee3;">${escapeHtml(order.order_number)}</p>
      <p style="margin:0 0 8px;"><strong>Shipping address</strong></p>
      <p style="margin:0 0 20px;">${addressHtml}</p>
      <p style="margin:0 0 8px;"><strong>Items</strong></p>
      <ul style="padding-left:20px;margin:0 0 20px;">${lineItemsHtml}</ul>
      ${summaryRows}
      <p style="margin:16px 0 0;font-size:13px;color:#9a8f7a;">Questions? Reply to this email or visit our Contact page.</p>
    `;

    await Promise.all([
      sendEmail({
        to: getOrderNotificationEmail(),
        subject: `[Mystique] New order ${order.order_number} — ${formatMoney(order.total_amount)}`,
        replyTo: order.email,
        html: renderEmailLayout({
          preview: `New order ${order.order_number} from ${order.email}`,
          title: `Order ${order.order_number}`,
          body: adminExtra,
        }),
        text: [
          `New Mystique order ${order.order_number}`,
          "",
          `Order ID: ${order.id}`,
          `Type: ${orderKindLabel(order)}`,
          order.stripe_checkout_session_id
            ? `Stripe session: ${order.stripe_checkout_session_id}`
            : "",
          order.stripe_payment_intent_id
            ? `Payment intent: ${order.stripe_payment_intent_id}`
            : "",
          "",
          `Customer: ${order.full_name}`,
          `Email: ${order.email}`,
          "",
          "Shipping address:",
          ...addressText,
          "",
          "Items:",
          lineItemsText,
          "",
          `Subtotal: ${formatMoney(order.subtotal_amount)}`,
          `Shipping: ${formatMoney(order.shipping_amount)}`,
          `Tax: ${formatMoney(order.tax_amount)}`,
          `Total: ${formatMoney(order.total_amount)}`,
        ]
          .filter(Boolean)
          .join("\n"),
      }),
      sendEmail({
        to: order.email,
        subject: `Your Mystique order ${order.order_number} is confirmed`,
        html: renderEmailLayout({
          preview: `Order ${order.order_number} confirmed — ${formatMoney(order.total_amount)}`,
          title: "Thank you — order confirmed",
          body: customerBody,
        }),
        text: [
          `Thank you for your order, ${order.full_name}.`,
          "",
          `Order number: ${order.order_number}`,
          "",
          "Shipping address:",
          ...addressText,
          "",
          "Items:",
          lineItemsText,
          "",
          `Subtotal: ${formatMoney(order.subtotal_amount)}`,
          `Shipping: ${formatMoney(order.shipping_amount)}`,
          `Estimated tax: ${formatMoney(order.tax_amount)}`,
          `Total paid: ${formatMoney(order.total_amount)}`,
          "",
          "We’ll notify you when your order ships.",
        ].join("\n"),
      }),
    ]);
  } catch (error) {
    console.error("[order email] Failed to send order confirmation emails:", error);
  }
}
