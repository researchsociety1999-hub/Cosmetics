import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { sendOrderPaidEmails } from "../../../lib/orderNotifications";
import {
  getOrderById,
  getOrderByStripeCheckoutSessionId,
  getOrderItems,
  markOrderFailed,
  markOrderPaid,
} from "../../../lib/queries";
import { getStripeWebhookSecret, isStripeWebhookConfigured } from "../../../lib/stripe";

const WEBHOOK_TOLERANCE_SECONDS = 300;
export const runtime = "nodejs";

interface StripeEvent<T = unknown> {
  id: string;
  type: string;
  data: {
    object: T;
  };
}

interface StripeCheckoutSessionPayload {
  id: string;
  client_reference_id?: string | null;
  payment_intent?: string | null;
}

function parseStripeSignature(header: string): {
  timestamp: string;
  signatures: string[];
} {
  const parts = header.split(",").map((part) => part.trim());
  const timestamp = parts.find((part) => part.startsWith("t="))?.slice(2);
  const signatures = parts
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.slice(3))
    .filter(Boolean);

  if (!timestamp || signatures.length === 0) {
    throw new Error("Invalid Stripe signature header.");
  }

  return { timestamp, signatures };
}

function verifyStripeSignature(payload: string, signatureHeader: string): void {
  const { timestamp, signatures } = parseStripeSignature(signatureHeader);
  const ageInSeconds = Math.floor(Date.now() / 1000) - Number(timestamp);

  if (!Number.isFinite(ageInSeconds) || ageInSeconds > WEBHOOK_TOLERANCE_SECONDS) {
    throw new Error("Stripe webhook signature has expired.");
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expectedSignature = crypto
    .createHmac("sha256", getStripeWebhookSecret())
    .update(signedPayload, "utf8")
    .digest("hex");

  const isMatch = signatures.some((signature) => {
    const a = Buffer.from(signature, "hex");
    const b = Buffer.from(expectedSignature, "hex");

    return a.length === b.length && crypto.timingSafeEqual(a, b);
  });

  if (!isMatch) {
    throw new Error("Stripe webhook signature verification failed.");
  }
}

async function handleCheckoutSessionCompleted(
  session: StripeCheckoutSessionPayload,
): Promise<void> {
  const order =
    (session.client_reference_id
      ? await getOrderById(session.client_reference_id)
      : null) ?? (await getOrderByStripeCheckoutSessionId(session.id));

  if (!order) {
    throw new Error(`No order found for Stripe session ${session.id}.`);
  }

  if (order.status === "paid") {
    return;
  }

  const paidOrder = await markOrderPaid({
    orderId: order.id,
    stripeCheckoutSessionId: session.id,
    stripePaymentIntentId: session.payment_intent ?? null,
  });
  const items = await getOrderItems(order.id);

  await sendOrderPaidEmails({
    order: paidOrder,
    items,
  });
}

async function handleCheckoutSessionFailed(
  session: StripeCheckoutSessionPayload,
): Promise<void> {
  const order =
    (session.client_reference_id
      ? await getOrderById(session.client_reference_id)
      : null) ?? (await getOrderByStripeCheckoutSessionId(session.id));

  if (!order || order.status === "paid") {
    return;
  }

  await markOrderFailed(order.id);
}

export async function POST(request: Request) {
  if (!isStripeWebhookConfigured()) {
    return NextResponse.json(
      { success: false, error: "Stripe webhook is not configured." },
      { status: 500 },
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
    verifyStripeSignature(payload, signature);

    const event = JSON.parse(payload) as StripeEvent<StripeCheckoutSessionPayload>;

    if (event.type === "checkout.session.completed") {
      await handleCheckoutSessionCompleted(event.data.object);
    } else if (
      event.type === "checkout.session.expired" ||
      event.type === "checkout.session.async_payment_failed"
    ) {
      await handleCheckoutSessionFailed(event.data.object);
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
