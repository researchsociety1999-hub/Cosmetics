import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Integration tests for the Stripe webhook route handler:
 *   next-app/src/app/api/stripe/webhook/route.ts  (POST)
 *
 * ──────────────────────────────────────────────────────────────────────────
 * DEVIATIONS FROM THE TASK SPEC (the real implementation differs):
 *
 * 1. There is no `saveOrder()` and no `@/lib/checkoutOrders`. The real module
 *    is `@/app/lib/checkoutOrders`. Orders are CREATED before the Stripe
 *    redirect (`createPendingOrderFromCart`); the webhook only FINALIZES an
 *    already-existing order. The "order is saved/persisted" effect on the
 *    webhook is therefore `finalizePaidOrderFromStripe(...)` (preceded by
 *    `getOrderWithItemsByStripeSessionId` + `applyStripeCheckoutSessionToOrder`).
 *
 * 2. There is no `@/lib/supabaseAdmin`. Supabase access is encapsulated inside
 *    `checkoutOrders` (via `@/app/lib/supabaseClient`), not the route. Because
 *    we mock `checkoutOrders`, no Supabase mock is required at the route layer.
 *
 * 3. The route does not `new Stripe()` directly — it uses the `@/app/lib/stripe`
 *    wrapper (`getStripeServerClient`, `getStripeWebhookSecret`,
 *    `isStripeWebhookConfigured`). We mock that wrapper and expose a fake
 *    `webhooks.constructEvent` and `checkout.sessions.retrieve`.
 *
 * 4. Success responses are HTTP 200 with body `{ received: true }`; failures
 *    are `{ success: false, error }` with status 400 (signature/bad request)
 *    or 500 (transient — tells Stripe to retry).
 *
 * 5. Idempotency is NOT enforced by the route (it delegates on every delivery).
 *    It lives inside `finalizePaidOrderFromStripe` (returns early when the order
 *    status is already "processing") and `insertPaymentRecord` (dedup by
 *    `stripe_payment_id`). Case 5 reproduces that contract at the route boundary.
 *
 * No real Stripe or Supabase endpoints are touched.
 * ──────────────────────────────────────────────────────────────────────────
 */

const stripe = vi.hoisted(() => ({
  constructEvent: vi.fn(),
  retrieve: vi.fn(),
}));

const orders = vi.hoisted(() => ({
  getOrderWithItemsByStripeSessionId: vi.fn(),
  applyStripeCheckoutSessionToOrder: vi.fn(),
  finalizePaidOrderFromStripe: vi.fn(),
  markOrderFailedForCheckout: vi.fn(),
}));

vi.mock("@/app/lib/stripe", () => ({
  isStripeWebhookConfigured: () => true,
  getStripeWebhookSecret: () => "whsec_test_secret",
  getStripeServerClient: () => ({
    webhooks: { constructEvent: stripe.constructEvent },
    checkout: { sessions: { retrieve: stripe.retrieve } },
  }),
}));

vi.mock("@/app/lib/checkoutOrders", () => orders);

import { POST } from "@/app/api/stripe/webhook/route";

const SESSION_ID = "cs_test_session_123";
const WEBHOOK_URL = "http://localhost:3001/api/stripe/webhook";

/** Build a POST Request like Stripe would send it. */
function makeRequest(
  body: string,
  { signature }: { signature?: string | null } = { signature: "t=1,v1=validsig" },
) {
  const headers = new Headers({ "content-type": "application/json" });
  if (signature) {
    headers.set("stripe-signature", signature);
  }
  return new Request(WEBHOOK_URL, { method: "POST", headers, body });
}

/** A minimal Stripe Checkout Session as returned by sessions.retrieve(). */
function makeSession(overrides: Record<string, unknown> = {}) {
  return {
    id: SESSION_ID,
    object: "checkout.session",
    payment_status: "paid",
    amount_total: 5_999,
    payment_method_types: ["card"],
    payment_intent: "pi_test_456",
    client_reference_id: "order_1",
    customer_email: "shopper@example.com",
    metadata: { order_id: "order_1" },
    ...overrides,
  };
}

function makeEvent(type: string, sessionId = SESSION_ID) {
  return {
    id: "evt_test_1",
    type,
    created: 1_700_000_000,
    data: { object: { id: sessionId, object: "checkout.session" } },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  // Silence expected route logging; case 4 re-spies on console.error to assert.
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ── 1. HAPPY PATH ───────────────────────────────────────────────────────────
describe("checkout.session.completed (happy path)", () => {
  it("finalizes the existing order and returns 200", async () => {
    stripe.constructEvent.mockReturnValue(makeEvent("checkout.session.completed"));
    stripe.retrieve.mockResolvedValue(makeSession());
    orders.getOrderWithItemsByStripeSessionId.mockResolvedValue({
      order: { id: "order_1", status: "pending" },
      items: [],
    });
    orders.applyStripeCheckoutSessionToOrder.mockResolvedValue({ updated: true });
    orders.finalizePaidOrderFromStripe.mockResolvedValue({ id: "order_1", status: "processing" });

    const res = await POST(makeRequest("{}"));

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ received: true });

    // Order persistence path ran (the real equivalent of "saveOrder").
    expect(orders.getOrderWithItemsByStripeSessionId).toHaveBeenCalledWith(SESSION_ID);
    expect(orders.applyStripeCheckoutSessionToOrder).toHaveBeenCalledTimes(1);
    expect(orders.finalizePaidOrderFromStripe).toHaveBeenCalledTimes(1);
    expect(orders.finalizePaidOrderFromStripe).toHaveBeenCalledWith({
      sessionId: SESSION_ID,
      paymentIntentId: "pi_test_456",
      amountCents: 5_999,
      paymentMethod: "card",
      paidAt: new Date(1_700_000_000 * 1000).toISOString(),
    });
  });

  it("does not finalize when the session is not paid (returns 200, no order write)", async () => {
    stripe.constructEvent.mockReturnValue(makeEvent("checkout.session.completed"));
    stripe.retrieve.mockResolvedValue(makeSession({ payment_status: "unpaid" }));

    const res = await POST(makeRequest("{}"));

    expect(res.status).toBe(200);
    expect(orders.finalizePaidOrderFromStripe).not.toHaveBeenCalled();
  });
});

// ── 2. INVALID SIGNATURE ──────────────────────────────────────────────────────
describe("invalid signature", () => {
  it("returns 400 when the Stripe-Signature header is missing (no order write)", async () => {
    const res = await POST(makeRequest("{}", { signature: null }));

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toMatchObject({ success: false });
    expect(stripe.constructEvent).not.toHaveBeenCalled();
    expect(orders.finalizePaidOrderFromStripe).not.toHaveBeenCalled();
  });

  it("returns 400 when signature verification throws (no order write)", async () => {
    const sigError = Object.assign(new Error("No signatures found matching the expected signature."), {
      name: "StripeSignatureVerificationError",
    });
    stripe.constructEvent.mockImplementation(() => {
      throw sigError;
    });

    const res = await POST(makeRequest("{}", { signature: "t=1,v1=wrong" }));

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toMatchObject({ error: "Invalid signature." });
    expect(orders.finalizePaidOrderFromStripe).not.toHaveBeenCalled();
  });
});

// ── 3. UNHANDLED EVENT TYPE ───────────────────────────────────────────────────
describe("unhandled event type", () => {
  it("ignores e.g. payment_intent.created and returns 200 without writing an order", async () => {
    stripe.constructEvent.mockReturnValue(makeEvent("payment_intent.created"));

    const res = await POST(makeRequest("{}"));

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ received: true });
    expect(orders.getOrderWithItemsByStripeSessionId).not.toHaveBeenCalled();
    expect(orders.applyStripeCheckoutSessionToOrder).not.toHaveBeenCalled();
    expect(orders.finalizePaidOrderFromStripe).not.toHaveBeenCalled();
    expect(stripe.retrieve).not.toHaveBeenCalled();
  });
});

// ── 4. ORDER FINALIZATION / DB FAILURE ────────────────────────────────────────
describe("downstream (Supabase) finalization failure", () => {
  it("returns 500 and logs when finalizePaidOrderFromStripe throws", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    stripe.constructEvent.mockReturnValue(makeEvent("checkout.session.completed"));
    stripe.retrieve.mockResolvedValue(makeSession());
    orders.getOrderWithItemsByStripeSessionId.mockResolvedValue({
      order: { id: "order_1", status: "pending" },
      items: [],
    });
    orders.applyStripeCheckoutSessionToOrder.mockResolvedValue({ updated: true });
    orders.finalizePaidOrderFromStripe.mockRejectedValue(
      new Error("insert into orders failed: connection terminated"),
    );

    const res = await POST(makeRequest("{}"));

    // 5xx tells Stripe to retry — correct for a transient DB outage.
    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toMatchObject({
      success: false,
      error: "Webhook handler failed.",
    });
    expect(errorSpy).toHaveBeenCalled();
    expect(
      errorSpy.mock.calls.some(([msg]) =>
        String(msg).includes("[stripe webhook] Handler error"),
      ),
    ).toBe(true);
  });
});

// ── 5. IDEMPOTENCY ────────────────────────────────────────────────────────────
describe("idempotency — duplicate delivery of the same session", () => {
  it("does not create a duplicate order on a repeated checkout.session.completed", async () => {
    // Reproduce the real contract: the FIRST finalize flips the order to
    // "processing"; a SECOND finalize for an already-"processing" order short-
    // circuits (see finalizePaidOrderFromStripe) — no duplicate write/payment.
    let status = "pending";
    let realFinalizations = 0;

    stripe.constructEvent.mockReturnValue(makeEvent("checkout.session.completed"));
    stripe.retrieve.mockResolvedValue(makeSession());
    orders.getOrderWithItemsByStripeSessionId.mockImplementation(async () => ({
      order: { id: "order_1", status },
      items: [],
    }));
    orders.applyStripeCheckoutSessionToOrder.mockResolvedValue({ updated: true });
    orders.finalizePaidOrderFromStripe.mockImplementation(async () => {
      if (status === "processing") {
        return { id: "order_1", status }; // idempotent no-op
      }
      status = "processing";
      realFinalizations += 1;
      return { id: "order_1", status };
    });

    const first = await POST(makeRequest("{}"));
    const second = await POST(makeRequest("{}"));

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);

    // The route delegates on every delivery (it has no dedup of its own)…
    expect(orders.finalizePaidOrderFromStripe).toHaveBeenCalledTimes(2);
    // …but exactly ONE finalization mutates the order — no duplicate is created.
    expect(realFinalizations).toBe(1);
  });
});
