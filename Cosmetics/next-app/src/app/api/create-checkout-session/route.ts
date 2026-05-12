import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getCartSummary } from "../../lib/cart";
import { validateShippingDetails } from "../../lib/checkout";
import {
  attachStripeCheckoutSessionToOrder,
  createPendingOrderFromCart,
  markOrderFailedForCheckout,
} from "../../lib/checkoutOrders";
import { clearStoredPromoCode, getAppliedPromoFromStoredCode } from "../../lib/promo";
import { getConfiguredSiteUrl } from "../../lib/siteUrl";
import { hasSupabasePublicEnv } from "../../lib/supabaseClient";
import Stripe from "stripe";
import { createStripeCheckoutSession, isStripeConfigured } from "../../lib/stripe";
import type { ShippingDetails } from "../../lib/types";

export const runtime = "nodejs";

function errorDetail(error: unknown): string {
  if (error instanceof Stripe.errors.StripeError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

function orderCreateErrorCode(error: unknown): string | null {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string"
  ) {
    return (error as { code: string }).code;
  }
  return null;
}

function orderCreateFailureResponse(orderError: unknown) {
  const errorMessage =
    orderError instanceof Error ? orderError.message : String(orderError);
  const errorCode = orderCreateErrorCode(orderError);
  const detail = [errorMessage, errorCode && `code: ${errorCode}`]
    .filter(Boolean)
    .join(" | ");

  return NextResponse.json(
    {
      error:
        "We couldn't prepare your order for payment. Please refresh and try again.",
      code: "order_create_failed",
      detail,
      errorMessage,
      errorCode,
    },
    { status: 500 },
  );
}

function normalizeField(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function buildOrigin(forwardedOrigin: string | null, host: string | null) {
  if (forwardedOrigin) {
    return forwardedOrigin.replace(/\/$/, "");
  }

  if (host) {
    const protocol = host.includes("localhost") ? "http" : "https";
    return `${protocol}://${host}`;
  }

  return getConfiguredSiteUrl();
}

export async function POST(request: Request) {
  console.error("[checkout] route hit");
  try {
    if (!hasSupabasePublicEnv) {
      return NextResponse.json(
        {
          error:
            "Checkout is temporarily unavailable. Please try again in a few minutes.",
          code: "store_unavailable",
        },
        { status: 503 },
      );
    }

    if (!isStripeConfigured()) {
      const missing: string[] = [];
      if (!process.env.STRIPE_SECRET_KEY?.trim()) {
        missing.push("STRIPE_SECRET_KEY");
      }
      if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim()) {
        missing.push("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
      }
      console.error(
        "create-checkout-session: Stripe not configured. Missing env:",
        missing.length ? missing.join(", ") : "(unknown — keys empty?)",
      );
      return NextResponse.json(
        {
          error:
            "Secure payment is not enabled on this storefront yet. Please try again later.",
          code: "stripe_unavailable",
        },
        { status: 503 },
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const shippingDetails: ShippingDetails = {
      fullName: normalizeField(body.fullName),
      email: normalizeField(body.email),
      addressLine1: normalizeField(body.addressLine1),
      addressLine2: normalizeField(body.addressLine2),
      city: normalizeField(body.city),
      state: normalizeField(body.state),
      postalCode: normalizeField(body.postalCode),
      country: normalizeField(body.country) || "United States",
    };

    const validationError = validateShippingDetails(shippingDetails);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const cart = await getCartSummary();
    const { storedCode, appliedPromo, invalidMessage } = await getAppliedPromoFromStoredCode(
      cart.subtotalCents,
    );

    if (!cart.lines.length) {
      return NextResponse.json(
        { error: "Your bag is empty. Add products before checking out." },
        { status: 400 },
      );
    }

    if (invalidMessage) {
      if (storedCode) {
        await clearStoredPromoCode();
      }
      return NextResponse.json(
        { error: `Your promo code could not be applied: ${invalidMessage}` },
        { status: 400 },
      );
    }

    let order;
    let guestToken: string | null = null;
    try {
      const created = await createPendingOrderFromCart({
        userId: cart.userId,
        shippingDetails,
        cart,
        appliedPromo,
      });
      order = created.order;
      guestToken = created.guestToken;
    } catch (orderError) {
      console.error(orderError);
      return orderCreateFailureResponse(orderError);
    }

    try {
      const headerStore = await headers();
      const origin = buildOrigin(
        headerStore.get("origin"),
        headerStore.get("host"),
      );
      const session = await createStripeCheckoutSession({
        order,
        cart,
        origin,
        appliedPromo,
        guestToken,
      });

      await attachStripeCheckoutSessionToOrder(order.id, session.id);

      return NextResponse.json({
        sessionId: session.id,
        orderId: order.id,
        orderNumber: order.order_number,
        guestToken,
      });
    } catch (error) {
      await markOrderFailedForCheckout(order.id);
      console.error(error);
      return NextResponse.json(
        {
          error:
            "We couldn't open the secure payment window. Your bag is unchanged—please try again shortly.",
          code: "stripe_session_failed",
          detail: errorDetail(error),
        },
        { status: 500 },
      );
    }
  } catch (unexpectedError) {
    console.error("[checkout] unexpected top-level error", unexpectedError);
    return orderCreateFailureResponse(unexpectedError);
  }
}
