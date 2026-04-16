import { NextResponse } from "next/server";
import type Stripe from "stripe";
import {
  applyStripeCheckoutSessionToOrder,
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

function paymentIntentIdFromSession(session: Stripe.Checkout.Session): string | null {
  const pi = session.payment_intent;
  if (typeof pi === "string") {
    return pi;
  }
  return pi?.id ?? null;
}

/**
 * checkout.session.completed: merge Stripe shipping + finalize payment in Supabase, send emails.
 * Order + line items already exist (created before redirect); webhook marks paid and notifies.
 */
async function handleCheckoutCompleted(
  event: Stripe.Event,
  sessionIn: Stripe.Checkout.Session,
) {
  const stripe = getStripeServerClient();
  const session = await stripe.checkout.sessions.retrieve(sessionIn.id, {
    expand: ["payment_intent", "line_items"],
  });

  console.log("[stripe webhook] checkout.session.completed", {
    eventId: event.id,
    sessionId: session.id,
    paymentStatus: session.payment_status,
    amountTotal: session.amount_total,
    orderId: session.client_reference_id ?? session.metadata?.order_id,
  });

  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
    console.warn("[stripe webhook] Unexpected payment_status; skipping finalize", {
      sessionId: session.id,
      payment_status: session.payment_status,
    });
    return;
  }

  const existing = await getOrderWithItemsByStripeSessionId(session.id);
  if (!existing) {
    // Permanent data mismatch — do not throw (avoids useless Stripe retries).
    console.error("[stripe webhook] No order row for session — cannot finalize", {
      sessionId: session.id,
      clientReferenceId: session.client_reference_id,
    });
    return;
  }

  try {
    await applyStripeCheckoutSessionToOrder(session);
  } catch (e) {
    console.error("[stripe webhook] applyStripeCheckoutSessionToOrder failed", {
      sessionId: session.id,
      error: e instanceof Error ? e.message : String(e),
    });
    throw e;
  }

  await finalizePaidOrderFromStripe({
    sessionId: session.id,
    paymentIntentId: paymentIntentIdFromSession(session),
    amountCents: session.amount_total ?? 0,
    paymentMethod: session.payment_method_types?.join(", ") ?? "card",
    paidAt: new Date(event.created * 1000).toISOString(),
  });
}

async function handleCheckoutFailed(session: Stripe.Checkout.Session, event: Stripe.Event) {
  console.log("[stripe webhook] session failed/expired", {
    eventId: event.id,
    type: event.type,
    sessionId: session.id,
  });
  const order = await getOrderWithItemsByStripeSessionId(session.id);

  if (order?.order.id) {
    await markOrderFailedForCheckout(order.order.id);
  }
}

export async function POST(request: Request) {
  if (!isStripeWebhookConfigured()) {
    console.error("[stripe webhook] STRIPE_WEBHOOK_SECRET or STRIPE_SECRET_KEY missing");
    return NextResponse.json(
      { success: false, error: "Stripe webhook is not configured." },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    console.warn("[stripe webhook] Missing stripe-signature header");
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
        event,
        event.data.object as Stripe.Checkout.Session,
      );
    } else if (
      event.type === "checkout.session.expired" ||
      event.type === "checkout.session.async_payment_failed"
    ) {
      await handleCheckoutFailed(
        event.data.object as Stripe.Checkout.Session,
        event,
      );
    } else {
      console.log("[stripe webhook] Ignored event type", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[stripe webhook] Handler error", {
      message,
      name: error instanceof Error ? error.name : undefined,
    });
    return NextResponse.json(
      { success: false, error: "Webhook handler failed." },
      { status: 400 },
    );
  }
}
