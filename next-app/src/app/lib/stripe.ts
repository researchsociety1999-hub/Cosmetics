import {
  CHECKOUT_CURRENCY,
  FLAT_SHIPPING_CENTS,
  FREE_SHIPPING_THRESHOLD_CENTS,
  getShippingAmountCents,
  toStripeCountryCode,
} from "./checkout";
import { formatMoney } from "./format";
import type { CartSummary } from "./types";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.SITE_URL ??
  "http://localhost:3000";

export interface StripeCheckoutInput {
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  cart: CartSummary;
}

export interface StripeCheckoutSession {
  id: string;
  url: string;
}

function getStripeSecretKey(): string {
  if (!stripeSecretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  return stripeSecretKey;
}

function getSiteUrl(): string {
  return siteUrl.replace(/\/$/, "");
}

export function isStripeConfigured(): boolean {
  return Boolean(stripeSecretKey);
}

export function isStripeWebhookConfigured(): boolean {
  return Boolean(stripeSecretKey && stripeWebhookSecret);
}

export function getStripeWebhookSecret(): string {
  if (!stripeWebhookSecret) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET");
  }

  return stripeWebhookSecret;
}

export async function createStripeCheckoutSession({
  orderId,
  orderNumber,
  customerEmail,
  fullName,
  addressLine1,
  addressLine2,
  city,
  state,
  postalCode,
  country,
  cart,
}: StripeCheckoutInput): Promise<StripeCheckoutSession> {
  const params = new URLSearchParams();
  const shippingAmountCents = getShippingAmountCents(cart.subtotalCents);
  const normalizedCountry = toStripeCountryCode(country);

  params.set("mode", "payment");
  params.set(
    "success_url",
    `${getSiteUrl()}/checkout/success?order=${encodeURIComponent(orderNumber)}&orderId=${encodeURIComponent(orderId)}`,
  );
  params.set(
    "cancel_url",
    `${getSiteUrl()}/checkout?status=cancelled&order=${encodeURIComponent(orderNumber)}&orderId=${encodeURIComponent(orderId)}`,
  );
  params.set("customer_email", customerEmail);
  params.set("client_reference_id", orderId);
  params.set("metadata[order_number]", orderNumber);
  params.set("metadata[order_id]", orderId);
  params.set("metadata[full_name]", fullName);
  params.set("metadata[address_line1]", addressLine1);
  params.set("metadata[address_line2]", addressLine2);
  params.set("metadata[city]", city);
  params.set("metadata[state]", state);
  params.set("metadata[postal_code]", postalCode);
  params.set("metadata[country]", normalizedCountry);
  params.set("metadata[subtotal]", formatMoney(cart.subtotalCents));
  params.set("metadata[shipping_amount]", formatMoney(shippingAmountCents));
  params.set("metadata[tax_amount]", formatMoney(0));
  params.set("shipping_address_collection[allowed_countries][0]", "US");
  params.set("shipping_options[0][shipping_rate_data][type]", "fixed_amount");
  params.set(
    "shipping_options[0][shipping_rate_data][fixed_amount][amount]",
    String(shippingAmountCents),
  );
  params.set(
    "shipping_options[0][shipping_rate_data][fixed_amount][currency]",
    CHECKOUT_CURRENCY,
  );
  params.set(
    "shipping_options[0][shipping_rate_data][display_name]",
    shippingAmountCents === 0 ? "Free shipping" : "Standard shipping",
  );
  params.set(
    "shipping_options[0][shipping_rate_data][delivery_estimate][minimum][unit]",
    "business_day",
  );
  params.set(
    "shipping_options[0][shipping_rate_data][delivery_estimate][minimum][value]",
    "3",
  );
  params.set(
    "shipping_options[0][shipping_rate_data][delivery_estimate][maximum][unit]",
    "business_day",
  );
  params.set(
    "shipping_options[0][shipping_rate_data][delivery_estimate][maximum][value]",
    "5",
  );

  cart.lines.forEach((line, index) => {
    params.set(`line_items[${index}][price_data][currency]`, CHECKOUT_CURRENCY);
    params.set(
      `line_items[${index}][price_data][product_data][name]`,
      line.product.name,
    );
    params.set(
      `line_items[${index}][price_data][product_data][description]`,
      `Mystique order ${orderNumber}`,
    );
    params.set(
      `line_items[${index}][price_data][unit_amount]`,
      String(line.unitPriceCents),
    );
    params.set(`line_items[${index}][quantity]`, String(line.quantity));
  });

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getStripeSecretKey()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Stripe session creation failed: ${errorText}`);
  }

  const data = (await response.json()) as { id?: string; url?: string };

  if (!data.id || !data.url) {
    throw new Error("Stripe session creation did not return a valid checkout session");
  }

  return {
    id: data.id,
    url: data.url,
  };
}

export function getStripeShippingLabel(subtotalCents: number): string {
  return subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS
    ? "Free shipping"
    : `Standard shipping (${formatMoney(FLAT_SHIPPING_CENTS)})`;
}
