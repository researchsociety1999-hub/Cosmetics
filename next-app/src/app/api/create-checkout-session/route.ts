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
import { getAuthenticatedUser } from "../../lib/supabaseServer";
import { getConfiguredSiteUrl } from "../../lib/siteUrl";
import { hasSupabasePublicEnv } from "../../lib/supabaseClient";
import { createStripeCheckoutSession, isStripeConfigured } from "../../lib/stripe";
import type { ShippingDetails } from "../../lib/types";

export const runtime = "nodejs";

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
      return NextResponse.json(
        {
          error:
            "Secure payment is not enabled on this storefront yet. Please try again later.",
          code: "stripe_unavailable",
        },
        { status: 503 },
      );
    }

    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: "Please sign in before checking out." },
        { status: 401 },
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const shippingDetails: ShippingDetails = {
      fullName: normalizeField(body.fullName),
      email: normalizeField(body.email) || user.email || "",
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

    if (cart.userId !== user.id || cart.source !== "database" || !cart.lines.length) {
      return NextResponse.json(
        { error: "Your bag is empty or not linked to your account." },
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
    try {
      const created = await createPendingOrderFromCart({
        userId: user.id,
        shippingDetails,
        cart,
        appliedPromo,
      });
      order = created.order;
    } catch (orderError) {
      console.error("create-checkout-session: order create failed", orderError);
      return NextResponse.json(
        {
          error:
            "We couldn't prepare your order for payment. Please refresh and try again.",
          code: "order_create_failed",
        },
        { status: 500 },
      );
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
      });

      await attachStripeCheckoutSessionToOrder(order.id, session.id);

      return NextResponse.json({
        sessionId: session.id,
        orderId: order.id,
        orderNumber: order.order_number,
      });
    } catch (error) {
      await markOrderFailedForCheckout(order.id);
      console.error("create-checkout-session: Stripe session failed", error);
      return NextResponse.json(
        {
          error:
            "We couldn't open the secure payment window. Your bag is unchanged—please try again shortly.",
          code: "stripe_session_failed",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("create-checkout-session error", error);
    return NextResponse.json(
      {
        error:
          "Something interrupted checkout. Please try again in a moment, or contact Mystique if it continues.",
        code: "checkout_unexpected",
      },
      { status: 500 },
    );
  }
}
