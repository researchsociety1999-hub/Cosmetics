"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearCartItemsCookie, getCartSummary } from "../lib/cart";
import {
  escapeHtml,
  getOrderNotificationEmail,
  isEmailConfigured,
  renderEmailLayout,
  sendEmail,
} from "../lib/email";
import { formatMoney } from "../lib/format";
import { createStripeCheckoutSession, isStripeConfigured } from "../lib/stripe";

interface ShippingDetails {
  fullName: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

function getField(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function getShippingDetails(formData: FormData): ShippingDetails {
  return {
    fullName: getField(formData, "full_name"),
    email: getField(formData, "email"),
    addressLine1: getField(formData, "address_line1"),
    addressLine2: getField(formData, "address_line2"),
    city: getField(formData, "city"),
    state: getField(formData, "state"),
    postalCode: getField(formData, "postal_code"),
    country: getField(formData, "country"),
  };
}

function hasRequiredShippingFields(details: ShippingDetails): boolean {
  return Boolean(
    details.fullName &&
      details.email &&
      details.addressLine1 &&
      details.city &&
      details.state &&
      details.postalCode &&
      details.country,
  );
}

function buildOrderNumber(): string {
  const now = new Date();
  const datePart = [
    now.getUTCFullYear(),
    String(now.getUTCMonth() + 1).padStart(2, "0"),
    String(now.getUTCDate()).padStart(2, "0"),
  ].join("");
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `MYS-${datePart}-${randomPart}`;
}

function renderOrderLines(
  lines: Awaited<ReturnType<typeof getCartSummary>>["lines"],
): string {
  return lines
    .map(
      (line) =>
        `<li style="margin:0 0 10px;">${escapeHtml(line.product.name)} x ${line.quantity} <strong>${escapeHtml(formatMoney(line.lineTotalCents))}</strong></li>`,
    )
    .join("");
}

function buildAddress(details: ShippingDetails): string[] {
  return [
    details.fullName,
    details.addressLine1,
    details.addressLine2,
    `${details.city}, ${details.state} ${details.postalCode}`,
    details.country,
  ].filter(Boolean);
}

export async function submitOrderAction(formData: FormData): Promise<void> {
  const shippingDetails = getShippingDetails(formData);

  if (!hasRequiredShippingFields(shippingDetails)) {
    redirect("/checkout?status=missing");
  }

  const cart = await getCartSummary();

  if (cart.lines.length === 0) {
    redirect("/checkout?status=empty");
  }

  if (!isEmailConfigured()) {
    console.error("Order email skipped because Resend is not configured.");
    redirect("/checkout?status=email-error");
  }

  const orderNumber = buildOrderNumber();
  const formattedAddress = buildAddress(shippingDetails)
    .map((line) => escapeHtml(line))
    .join("<br />");
  const lineItemsHtml = renderOrderLines(cart.lines);
  const lineItemsText = cart.lines
    .map((line) => `${line.product.name} x ${line.quantity} - ${formatMoney(line.lineTotalCents)}`)
    .join("\n");
  let stripeCheckoutUrl: string | null = null;

  if (isStripeConfigured()) {
    try {
      stripeCheckoutUrl = await createStripeCheckoutSession({
        orderNumber,
        customerEmail: shippingDetails.email,
        fullName: shippingDetails.fullName,
        addressLine1: shippingDetails.addressLine1,
        addressLine2: shippingDetails.addressLine2,
        city: shippingDetails.city,
        state: shippingDetails.state,
        postalCode: shippingDetails.postalCode,
        country: shippingDetails.country,
        cart,
      });
    } catch (error) {
      console.error("Stripe checkout session error", error);
      redirect("/checkout?status=stripe-error");
    }
  }

  try {
    await Promise.all([
      sendEmail({
        to: getOrderNotificationEmail(),
        subject: `New Mystique order ${orderNumber}`,
        replyTo: shippingDetails.email,
        html: renderEmailLayout({
          preview: `New order ${orderNumber} from ${shippingDetails.fullName}`,
          title: `New order ${orderNumber}`,
          body: `
            <p style="margin:0 0 16px;">A new order has been submitted from the site.</p>
            <p style="margin:0 0 16px;"><strong>Customer:</strong> ${escapeHtml(shippingDetails.fullName)}<br /><strong>Email:</strong> ${escapeHtml(shippingDetails.email)}</p>
            <p style="margin:0 0 16px;"><strong>Shipping address:</strong><br />${formattedAddress}</p>
            <p style="margin:0 0 8px;"><strong>Items:</strong></p>
            <ul style="padding-left:20px;margin:0 0 16px;">${lineItemsHtml}</ul>
            <p style="margin:0;"><strong>Subtotal:</strong> ${escapeHtml(formatMoney(cart.subtotalCents))}</p>
          `,
        }),
        text: [
          `New order ${orderNumber}`,
          "",
          `Customer: ${shippingDetails.fullName}`,
          `Email: ${shippingDetails.email}`,
          "",
          "Shipping address:",
          ...buildAddress(shippingDetails),
          "",
          "Items:",
          lineItemsText,
          "",
          `Subtotal: ${formatMoney(cart.subtotalCents)}`,
        ].join("\n"),
      }),
      sendEmail({
        to: shippingDetails.email,
        subject: `We received your Mystique order ${orderNumber}`,
        html: renderEmailLayout({
          preview: `Your Mystique order ${orderNumber} is in review`,
          title: "Order received",
          body: `
            <p style="margin:0 0 16px;">Thank you for your order, ${escapeHtml(shippingDetails.fullName)}.</p>
            <p style="margin:0 0 16px;">We have received your order request and will follow up with payment and fulfillment details soon.</p>
            <p style="margin:0 0 8px;"><strong>Order number:</strong> ${escapeHtml(orderNumber)}</p>
            <p style="margin:0 0 8px;"><strong>Items:</strong></p>
            <ul style="padding-left:20px;margin:0 0 16px;">${lineItemsHtml}</ul>
            <p style="margin:0;"><strong>Subtotal:</strong> ${escapeHtml(formatMoney(cart.subtotalCents))}</p>
          `,
        }),
        text: [
          `Thank you for your order, ${shippingDetails.fullName}.`,
          "",
          `Order number: ${orderNumber}`,
          "",
          "Items:",
          lineItemsText,
          "",
          `Subtotal: ${formatMoney(cart.subtotalCents)}`,
        ].join("\n"),
      }),
    ]);
  } catch (error) {
    console.error("submitOrderAction error", error);
    redirect("/checkout?status=email-error");
  }

  if (stripeCheckoutUrl) {
    redirect(stripeCheckoutUrl);
  }

  await clearCartItemsCookie();
  revalidatePath("/");
  revalidatePath("/cart");
  revalidatePath("/checkout");
  redirect(`/checkout?status=placed&order=${encodeURIComponent(orderNumber)}`);
}
