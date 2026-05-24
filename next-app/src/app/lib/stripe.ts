import Stripe from "stripe";
import { CHECKOUT_CURRENCY, getShippingAmountCents } from "./checkout";
import { getConfiguredSiteUrl } from "./siteUrl";
import type { AppliedPromo, CartSummary, Order } from "./types";

/** Stripe v22: Checkout param types live on the sessions.create signature, not Stripe.Checkout. */
type CheckoutSessionCreateParams = NonNullable<
  Parameters<Stripe["checkout"]["sessions"]["create"]>[0]
>;
type CheckoutAllowedCountry = NonNullable<
  NonNullable<CheckoutSessionCreateParams["shipping_address_collection"]>["allowed_countries"]
>[number];

const stripeCurrency = CHECKOUT_CURRENCY.toLowerCase();

/**
 * Ensures Checkout Session line_items match Stripe's requirements before calling the API.
 */
export function assertValidStripeCheckoutLineItems(cart: CartSummary): void {
  if (!cart.lines.length) {
    throw new Error("Stripe checkout requires at least one line item.");
  }

  for (let i = 0; i < cart.lines.length; i += 1) {
    const line = cart.lines[i];
    const qty = Math.floor(Number(line.quantity));
    if (!Number.isFinite(qty) || qty < 1) {
      throw new Error(
        `Invalid line item quantity at index ${i}: expected integer ≥ 1, got ${String(line.quantity)}`,
      );
    }

    const unit = Math.round(Number(line.unitPriceCents));
    if (!Number.isFinite(unit) || unit < 1) {
      throw new Error(
        `Invalid unit_amount at index ${i}: expected integer ≥ 1 (cents), got ${String(line.unitPriceCents)}`,
      );
    }

    const name = line.product?.name?.trim();
    if (!name) {
      throw new Error(`Missing product name for line item at index ${i}.`);
    }
  }
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

/**
 * Configurable allowed shipping countries via env var.
 * Format: comma-separated ISO 3166-1 alpha-2 codes, e.g. "US,CA,GB"
 * Defaults to "US" if not set.
 */
function getAllowedShippingCountries(): CheckoutAllowedCountry[] {
  const raw = process.env.NEXT_PUBLIC_STRIPE_ALLOWED_COUNTRIES?.trim();
  if (!raw) {
    return ["US"];
  }
  return raw
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean) as CheckoutAllowedCountry[];
}

let stripeClient: Stripe | null = null;

function getStripeSecretKey(): string {
  if (!stripeSecretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  return stripeSecretKey;
}

export function getStripeServerClient() {
  if (!stripeClient) {
    stripeClient = new Stripe(getStripeSecretKey(), {
      // Pinned for production; SDK types target dahlia while the account uses basil.
      apiVersion: "2025-04-30.basil",
    } as unknown as NonNullable<ConstructorParameters<typeof Stripe>[1]>);
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
  guestToken = null,
}: {
  order: Order;
  cart: CartSummary;
  origin?: string;
  appliedPromo?: AppliedPromo | null;
  /** Random UUID for guest orders — appended to success_url so the guest lands
   *  on their persistent /order/[token] status page. Null for authenticated orders. */
  guestToken?: string | null;
}) {
  const stripe = getStripeServerClient();
  const baseUrl = (origin ?? getConfiguredSiteUrl()).replace(/\/$/, "");
  const netSubtotal = Math.max(0, cart.subtotalCents - (order.discount_cents ?? 0));
  const shippingAmountCents =
    order.shipping_cents ?? getShippingAmountCents(netSubtotal);
  let discounts: CheckoutSessionCreateParams["discounts"];
  if (appliedPromo && order.discount_cents > 0) {
    try {
      const coupon = await stripe.coupons.create(
        {
          duration: "once",
          amount_off: order.discount_cents,
          currency: stripeCurrency,
          name: appliedPromo.promo.code,
        },
        {
          idempotencyKey: `coupon-${order.id}-${appliedPromo.promo.code}`,
        },
      );
      discounts = [{ coupon: coupon.id }];
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  assertValidStripeCheckoutLineItems(cart);

  const shippingRounded = Math.max(0, Math.round(Number(shippingAmountCents)));
  if (!Number.isFinite(shippingRounded)) {
    throw new Error(`Invalid shipping amount cents: ${String(shippingAmountCents)}`);
  }

  // Append guest_token to success_url so guests can bookmark /order/[token] later.
  const successUrl = guestToken
    ? `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&guest_token=${encodeURIComponent(guestToken)}`
    : `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;

  const sessionParams: CheckoutSessionCreateParams = {
    mode: "payment",
    customer_email: order.email,
    client_reference_id: order.id,
    success_url: successUrl,
    cancel_url: `${baseUrl}/checkout/cancel?order_id=${encodeURIComponent(order.id)}`,
    // payment_method_types intentionally omitted — Stripe auto-enables all methods
    // configured in the Dashboard (Apple Pay, Google Pay, Klarna, Afterpay, etc.).
    // The webhook already handles checkout.session.async_payment_succeeded for
    // async methods (SEPA, ACH, Klarna, Afterpay) so those can now actually fire.
    currency: stripeCurrency,
    metadata: {
      order_id: order.id,
      order_number: order.order_number,
      user_id: order.user_id ?? "",
      promo_code: appliedPromo?.promo.code ?? "",
      guest_token: guestToken ?? "",
    },
    discounts,
    shipping_address_collection: {
      // Configurable via NEXT_PUBLIC_STRIPE_ALLOWED_COUNTRIES (comma-separated ISO codes).
      // Defaults to ["US"]. Set e.g. "US,CA,GB" in your env to enable international shipping.
      allowed_countries: getAllowedShippingCountries(),
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount: shippingRounded,
            currency: stripeCurrency,
          },
          display_name:
            shippingRounded === 0 ? "Free shipping" : "Standard shipping",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 3 },
            maximum: { unit: "business_day", value: 5 },
          },
        },
      },
    ],
    line_items: cart.lines.map((line) => {
      const quantity = Math.max(1, Math.floor(Number(line.quantity)));
      const unit_amount = Math.round(Number(line.unitPriceCents));
      return {
        quantity,
        price_data: {
          currency: stripeCurrency,
          unit_amount,
          product_data: {
            name: line.variant
              ? `${line.product.name} - ${line.variant.variant_name}`
              : line.product.name,
            description: `Mystique order ${order.order_number}`,
          },
        },
      };
    }),
  };

  try {
    return await stripe.checkout.sessions.create(sessionParams);
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function retrieveStripeCheckoutSession(sessionId: string) {
  const stripe = getStripeServerClient();

  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent"],
  });
}
