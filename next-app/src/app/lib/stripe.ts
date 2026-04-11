import Stripe from "stripe";
import { CHECKOUT_CURRENCY, getShippingAmountCents } from "./checkout";
import { getConfiguredSiteUrl } from "./siteUrl";
import type { AppliedPromo, CartSummary, Order } from "./types";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

let stripeClient: Stripe | null = null;

function getStripeSecretKey(): string {
  if (!stripeSecretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  return stripeSecretKey;
}

export function getStripeServerClient() {
  if (!stripeClient) {
    stripeClient = new Stripe(getStripeSecretKey());
  }

  return stripeClient;
}

export function getStripePublishableKey() {
  if (!stripePublishableKey) {
    throw new Error("Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
  }

  return stripePublishableKey;
}

export function isStripeConfigured(): boolean {
  return Boolean(stripeSecretKey && stripePublishableKey);
}

export function isStripeServerConfigured(): boolean {
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
  order,
  cart,
  origin,
  appliedPromo = null,
}: {
  order: Order;
  cart: CartSummary;
  origin?: string;
  appliedPromo?: AppliedPromo | null;
}) {
  const stripe = getStripeServerClient();
  const baseUrl = (origin ?? getConfiguredSiteUrl()).replace(/\/$/, "");
  const shippingAmountCents = order.shipping_cents ?? getShippingAmountCents(cart.subtotalCents);
  const discounts =
    appliedPromo && order.discount_cents > 0
      ? [
          {
            coupon: (
              await stripe.coupons.create(
                {
                  duration: "once",
                  amount_off: order.discount_cents,
                  currency: CHECKOUT_CURRENCY,
                  name: appliedPromo.promo.code,
                },
              )
            ).id,
          },
        ]
      : undefined;

  return stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: order.email,
    client_reference_id: order.id,
    success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/checkout/cancel?order_id=${encodeURIComponent(order.id)}`,
    payment_method_types: ["card"],
    currency: CHECKOUT_CURRENCY,
    metadata: {
      order_id: order.id,
      order_number: order.order_number,
      user_id: order.user_id ?? "",
      promo_code: appliedPromo?.promo.code ?? "",
    },
    discounts,
    shipping_address_collection: {
      allowed_countries: ["US"],
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount: shippingAmountCents,
            currency: CHECKOUT_CURRENCY,
          },
          display_name:
            shippingAmountCents === 0 ? "Free shipping" : "Standard shipping",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 3 },
            maximum: { unit: "business_day", value: 5 },
          },
        },
      },
    ],
    line_items: cart.lines.map((line) => ({
      quantity: line.quantity,
      price_data: {
        currency: CHECKOUT_CURRENCY,
        unit_amount: line.unitPriceCents,
        product_data: {
          name: line.variant
            ? `${line.product.name} - ${line.variant.variant_name}`
            : line.product.name,
          description: `Mystique order ${order.order_number}`,
        },
      },
    })),
  });
}

export async function retrieveStripeCheckoutSession(sessionId: string) {
  const stripe = getStripeServerClient();

  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent"],
  });
}
