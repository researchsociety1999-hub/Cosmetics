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

export async function sendOrderPaidEmails({
  order,
  items,
}: {
  order: Order;
  items: OrderItem[];
}): Promise<void> {
  if (!isEmailConfigured()) {
    throw new Error("Order email skipped because Resend is not configured.");
  }

  const lineItems = await buildLineItems(items);
  const lineItemsHtml = lineItems
    .map(
      (item) =>
        `<li style="margin:0 0 10px;">${escapeHtml(item.name)} x ${item.quantity} <strong>${escapeHtml(formatMoney(item.lineTotal))}</strong></li>`,
    )
    .join("");
  const lineItemsText = lineItems
    .map((item) => `${item.name} x ${item.quantity} - ${formatMoney(item.lineTotal)}`)
    .join("\n");
  const addressText = buildAddressLines(order);
  const addressHtml = addressText.map((line) => escapeHtml(line)).join("<br />");

  await Promise.all([
    sendEmail({
      to: getOrderNotificationEmail(),
      subject: `New paid Mystique order ${order.order_number}`,
      replyTo: order.email,
      html: renderEmailLayout({
        preview: `Paid order ${order.order_number} from ${order.full_name}`,
        title: `Paid order ${order.order_number}`,
        body: `
          <p style="margin:0 0 16px;">A paid order has been confirmed through Stripe.</p>
          <p style="margin:0 0 16px;"><strong>Customer:</strong> ${escapeHtml(order.full_name)}<br /><strong>Email:</strong> ${escapeHtml(order.email)}</p>
          <p style="margin:0 0 16px;"><strong>Shipping address:</strong><br />${addressHtml}</p>
          <p style="margin:0 0 8px;"><strong>Items:</strong></p>
          <ul style="padding-left:20px;margin:0 0 16px;">${lineItemsHtml}</ul>
          <p style="margin:0 0 8px;"><strong>Subtotal:</strong> ${escapeHtml(formatMoney(order.subtotal_amount))}</p>
          <p style="margin:0 0 8px;"><strong>Shipping:</strong> ${escapeHtml(formatMoney(order.shipping_amount))}</p>
          <p style="margin:0;"><strong>Total paid:</strong> ${escapeHtml(formatMoney(order.total_amount))}</p>
        `,
      }),
      text: [
        `Paid order ${order.order_number}`,
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
        `Total paid: ${formatMoney(order.total_amount)}`,
      ].join("\n"),
    }),
    sendEmail({
      to: order.email,
      subject: `Your Mystique order ${order.order_number} is confirmed`,
      html: renderEmailLayout({
        preview: `Your Mystique payment for ${order.order_number} is confirmed`,
        title: "Order confirmed",
        body: `
          <p style="margin:0 0 16px;">Thank you for your order, ${escapeHtml(order.full_name)}.</p>
          <p style="margin:0 0 16px;">Your payment has been confirmed and the Mystique team is preparing your order.</p>
          <p style="margin:0 0 8px;"><strong>Order number:</strong> ${escapeHtml(order.order_number)}</p>
          <p style="margin:0 0 8px;"><strong>Items:</strong></p>
          <ul style="padding-left:20px;margin:0 0 16px;">${lineItemsHtml}</ul>
          <p style="margin:0 0 8px;"><strong>Subtotal:</strong> ${escapeHtml(formatMoney(order.subtotal_amount))}</p>
          <p style="margin:0 0 8px;"><strong>Shipping:</strong> ${escapeHtml(formatMoney(order.shipping_amount))}</p>
          <p style="margin:0;"><strong>Total paid:</strong> ${escapeHtml(formatMoney(order.total_amount))}</p>
        `,
      }),
      text: [
        `Thank you for your order, ${order.full_name}.`,
        "",
        `Order number: ${order.order_number}`,
        "",
        "Items:",
        lineItemsText,
        "",
        `Subtotal: ${formatMoney(order.subtotal_amount)}`,
        `Shipping: ${formatMoney(order.shipping_amount)}`,
        `Total paid: ${formatMoney(order.total_amount)}`,
      ].join("\n"),
    }),
  ]);
}
