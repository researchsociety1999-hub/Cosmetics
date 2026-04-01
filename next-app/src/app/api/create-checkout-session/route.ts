import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getCartSummary } from "../../lib/cart";
import { validateShippingDetails } from "../../lib/checkout";
import {
  attachStripeCheckoutSessionToOrder,
  createPendingOrderFromCart,
  markOrderFailedForCheckout,
} from "../../lib/checkoutOrders";
import { getAuthenticatedUser } from "../../lib/supabaseServer";
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

  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function POST(request: Request) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: "Stripe is not configured." },
        { status: 500 },
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

    if (cart.userId !== user.id || cart.source !== "database" || !cart.lines.length) {
      return NextResponse.json(
        { error: "Your cart is empty or not linked to your account." },
        { status: 400 },
      );
    }

    const { order } = await createPendingOrderFromCart({
      userId: user.id,
      shippingDetails,
      cart,
    });

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
      });

      await attachStripeCheckoutSessionToOrder(order.id, session.id);

      return NextResponse.json({
        sessionId: session.id,
        orderId: order.id,
        orderNumber: order.order_number,
      });
    } catch (error) {
      await markOrderFailedForCheckout(order.id);
      throw error;
    }
  } catch (error) {
    console.error("create-checkout-session error", error);
    return NextResponse.json(
      { error: "We could not start secure checkout right now." },
      { status: 500 },
    );
  }
}
