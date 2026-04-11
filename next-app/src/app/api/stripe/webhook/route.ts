import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  finalizePaidOrderFromStripe,
  getOrderWithItemsByStripeSessionId,
  markOrderFailedForCheckout,
} from "../../../lib/checkoutOrders";
import {
  getStripeServerClient,
  getStripeWebhookSecret,
  isStripeWebhookConfigured,
} from "../../../lib/stripe";

export const runtime = "nodejs";

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  eventCreated: number,
) {
  await finalizePaidOrderFromStripe({
    sessionId: session.id,
    paymentIntentId:
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? null,
    amountCents: session.amount_total ?? 0,
    paymentMethod: session.payment_method_types?.join(", ") ?? "card",
    paidAt: new Date(eventCreated * 1000).toISOString(),
  });
}

async function handleCheckoutFailed(session: Stripe.Checkout.Session) {
  const order = await getOrderWithItemsByStripeSessionId(session.id);

  if (order?.order.id) {
    await markOrderFailedForCheckout(order.order.id);
  }
}

export async function POST(request: Request) {
  if (!isStripeWebhookConfigured()) {
    return NextResponse.json(
      { success: false, error: "Stripe webhook is not configured." },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { success: false, error: "Missing Stripe signature header." },
      { status: 400 },
    );
  }

  const payload = await request.text();

  try {
    const stripe = getStripeServerClient();
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      getStripeWebhookSecret(),
    );

    if (event.type === "checkout.session.completed") {
      await handleCheckoutCompleted(
        event.data.object as Stripe.Checkout.Session,
        event.created,
      );
    } else if (
      event.type === "checkout.session.expired" ||
      event.type === "checkout.session.async_payment_failed"
    ) {
      await handleCheckoutFailed(event.data.object as Stripe.Checkout.Session);
    } else {
      console.log("Unhandled Stripe webhook event", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error", error);
    return NextResponse.json(
      { success: false, error: "Invalid webhook request." },
      { status: 400 },
    );
  }
}
