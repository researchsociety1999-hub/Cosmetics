import { formatMoney } from "./format";
import type { CartSummary } from "./types";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.SITE_URL ??
  "http://localhost:3000";

export interface StripeCheckoutInput {
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

export async function createStripeCheckoutSession({
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
}: StripeCheckoutInput): Promise<string> {
  const params = new URLSearchParams();

  params.set("mode", "payment");
  params.set("success_url", `${getSiteUrl()}/checkout/success?order=${encodeURIComponent(orderNumber)}`);
  params.set("cancel_url", `${getSiteUrl()}/checkout?status=cancelled&order=${encodeURIComponent(orderNumber)}`);
  params.set("customer_email", customerEmail);
  params.set("metadata[order_number]", orderNumber);
  params.set("metadata[full_name]", fullName);
  params.set("metadata[address_line1]", addressLine1);
  params.set("metadata[address_line2]", addressLine2);
  params.set("metadata[city]", city);
  params.set("metadata[state]", state);
  params.set("metadata[postal_code]", postalCode);
  params.set("metadata[country]", country);
  params.set("metadata[subtotal]", formatMoney(cart.subtotalCents));
  params.set("shipping_address_collection[allowed_countries][0]", "US");

  cart.lines.forEach((line, index) => {
    params.set(`line_items[${index}][price_data][currency]`, "usd");
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

  const data = (await response.json()) as { url?: string };

  if (!data.url) {
    throw new Error("Stripe session creation did not return a checkout URL");
  }

  return data.url;
}
