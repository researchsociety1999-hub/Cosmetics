import type Stripe from "stripe";
import type { PostgrestError } from "@supabase/supabase-js";
import { clearCartItemsCookie } from "./cart";
import {
  buildOrderNumber,
  CHECKOUT_CURRENCY,
  getOrderTotals,
} from "./checkout";
import { sendOrderPaidEmails } from "./orderNotifications";
import { clearStoredPromoCode } from "./promo";
import { supabase, supabaseAdmin } from "./supabaseClient";
import type {
  AppliedPromo,
  Address,
  CartSummary,
  Order,
  OrderItem,
  Payment,
  ShippingDetails,
} from "./types";

function logSupabaseResult(label: string, result: { data: unknown; error: PostgrestError | null }) {
  console.error(`[checkoutOrders] ${label}`, { error: result.error, data: result.data });
}

function assertCheckoutServerEnv(): void {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim();
  if (!url) {
    console.error(
      "[checkoutOrders] Missing Supabase project URL: set NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) on the server.",
    );
    throw new Error(
      "Server misconfiguration: NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) is not set.",
    );
  }

  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SECRET_KEY?.trim();
  if (!serviceKey) {
    console.error(
      "[checkoutOrders] Missing SUPABASE_SERVICE_ROLE_KEY — checkout order writes require the service role key (server-only; never use NEXT_PUBLIC_).",
    );
    throw new Error(
      "Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY is not set.",
    );
  }
}

function formatPostgrestError(error: PostgrestError): string {
  const parts = [
    error.message,
    error.code ? `(${error.code})` : "",
    error.details ? `details: ${error.details}` : "",
    error.hint ? `hint: ${error.hint}` : "",
  ].filter(Boolean);
  return parts.join(" | ");
}

function throwPostgrest(label: string, error: PostgrestError | null, fallback: string): never {
  if (error) {
    const err = new Error(`[${label}] ${formatPostgrestError(error)}`) as Error & { code?: string };
    err.code = error.code;
    throw err;
  }
  throw new Error(fallback);
}

function validateAddressInsertPayload(
  userId: string,
  type: string,
  details: ShippingDetails,
): void {
  if (!userId?.trim()) {
    throw new Error(`Invalid address payload (${type}): user_id is required.`);
  }
  const fields: [string, string][] = [
    ["full_name", details.fullName],
    ["address_line1", details.addressLine1],
    ["city", details.city],
    ["state", details.state],
    ["postal_code", details.postalCode],
    ["country", details.country],
  ];
  for (const [name, value] of fields) {
    if (typeof value !== "string" || !value.trim()) {
      throw new Error(`Invalid address payload (${type}): ${name} is missing or empty.`);
    }
  }
}

function validateOrderInsertPayload(
  orderPayload: Record<string, unknown>,
  label = "orders",
): void {
  const requiredStrings = ["order_number", "email", "currency", "status", "full_name", "address_line1", "city", "state", "postal_code", "country"] as const;
  for (const key of requiredStrings) {
    const v = orderPayload[key];
    if (v == null || (typeof v === "string" && !v.trim())) {
      throw new Error(`Invalid ${label} insert: ${key} is null, undefined, or empty.`);
    }
  }
  const moneyKeys = [
    "subtotal_cents",
    "shipping_cents",
    "discount_cents",
    "total_cents",
    "subtotal_amount",
    "shipping_amount",
    "tax_amount",
    "total_amount",
  ] as const;
  for (const key of moneyKeys) {
    const n = orderPayload[key];
    if (typeof n !== "number" || !Number.isFinite(n) || n < 0) {
      throw new Error(`Invalid ${label} insert: ${key} must be a finite number ≥ 0 (got ${String(n)}).`);
    }
  }
  const uid = orderPayload.user_id;
  if (uid !== null && typeof uid !== "string") {
    throw new Error(`Invalid ${label} insert: user_id must be string or null (guest).`);
  }
}

function validateOrderItemRows(
  rows: Array<{
    order_id: string;
    product_id: number;
    variant_id: number | null;
    quantity: number;
    price_cents_at_time: number;
  }>,
): void {
  if (!rows.length) {
    throw new Error("Invalid order_items insert: no rows.");
  }
  rows.forEach((row, i) => {
    if (!row.order_id?.trim()) {
      throw new Error(`Invalid order_items row ${i}: order_id is missing.`);
    }
    if (!Number.isFinite(row.product_id) || row.product_id < 1) {
      throw new Error(`Invalid order_items row ${i}: product_id must be a positive number.`);
    }
    const q = Math.floor(Number(row.quantity));
    if (!Number.isFinite(q) || q < 1) {
      throw new Error(`Invalid order_items row ${i}: quantity must be an integer ≥ 1.`);
    }
    const p = Number(row.price_cents_at_time);
    if (!Number.isFinite(p) || p < 1) {
      throw new Error(`Invalid order_items row ${i}: price_cents_at_time must be a finite number ≥ 1.`);
    }
    if (row.variant_id !== null && (!Number.isFinite(row.variant_id) || row.variant_id < 1)) {
      throw new Error(`Invalid order_items row ${i}: variant_id must be null or a positive number.`);
    }
  });
}

/** Prefer service role for order writes; fall back to shared server client. */
function clientForCheckoutWrites() {
  if (supabaseAdmin) {
    return supabaseAdmin;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Checkout writes require SUPABASE_SERVICE_ROLE_KEY in production (server-only).",
    );
  }

  if (supabase) {
    return supabase;
  }

  throw new Error(
    "Supabase is not configured. Set project URL and keys (SUPABASE_SERVICE_ROLE_KEY recommended for checkout).",
  );
}

function getVariantPriceCents(line: CartSummary["lines"][number]) {
  return line.unitPriceCents;
}

async function upsertDefaultAddress({
  userId,
  type,
  details,
}: {
  userId: string;
  type: string;
  details: ShippingDetails;
}): Promise<Address> {
  validateAddressInsertPayload(userId, type, details);

  const client = clientForCheckoutWrites();
  const { data: existing } = await client
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .eq("type", type)
    .eq("is_default", true)
    .limit(1)
    .maybeSingle();

  const payload = {
    user_id: userId,
    type,
    full_name: details.fullName,
    address_line1: details.addressLine1,
    address_line2: details.addressLine2 || null,
    city: details.city,
    state: details.state,
    postal_code: details.postalCode,
    country: details.country,
    is_default: true,
  };

  if (existing) {
    const updateResult = await client
      .from("addresses")
      .update(payload)
      .eq("id", existing.id)
      .select("*")
      .single();

    logSupabaseResult(`addresses update (${type})`, updateResult);

    if (updateResult.error || !updateResult.data) {
      throwPostgrest(
        `addresses update (${type})`,
        updateResult.error,
        `Failed to update ${type} address.`,
      );
    }

    return updateResult.data as Address;
  }

  const insertResult = await client
    .from("addresses")
    .insert(payload)
    .select("*")
    .single();

  logSupabaseResult(`addresses insert (${type})`, insertResult);

  if (insertResult.error || !insertResult.data) {
    throwPostgrest(
      `addresses insert (${type})`,
      insertResult.error,
      `Failed to create ${type} address.`,
    );
  }

  return insertResult.data as Address;
}

export async function createPendingOrderFromCart({
  userId,
  shippingDetails,
  cart,
  appliedPromo = null,
}: {
  userId: string | null;
  shippingDetails: ShippingDetails;
  cart: CartSummary;
  appliedPromo?: AppliedPromo | null;
}): Promise<{ order: Order; items: OrderItem[]; guestToken: string | null }> {
  assertCheckoutServerEnv();
  const client = clientForCheckoutWrites();

  if (!cart.lines.length) {
    throw new Error("Bag is empty.");
  }

  const [shippingAddress, billingAddress] = userId
    ? await Promise.all([
        upsertDefaultAddress({ userId, type: "shipping", details: shippingDetails }),
        upsertDefaultAddress({ userId, type: "billing", details: shippingDetails }),
      ])
    : [null, null];
  const totals = getOrderTotals(cart, appliedPromo?.discountCents ?? 0);
  const orderNumber = buildOrderNumber();

  // Generate a hard-to-guess tracking token for guest (unauthenticated) orders.
  // Authenticated orders do not need one — the user can see orders in their account.
  const guestToken: string | null = userId === null ? crypto.randomUUID() : null;

  const orderPayload = {
    order_number: orderNumber,
    user_id: userId,
    guest_token: guestToken,
    email: shippingDetails.email,
    promo_code: appliedPromo?.promo.code ?? null,
    status: "pending",
    currency: CHECKOUT_CURRENCY,
    subtotal_cents: cart.subtotalCents,
    shipping_cents: totals.shippingAmount,
    discount_cents: totals.discountAmount,
    total_cents: totals.totalAmount,
    subtotal_amount: totals.subtotalAmount,
    shipping_amount: totals.shippingAmount,
    tax_amount: totals.taxAmount,
    total_amount: totals.totalAmount,
    full_name: shippingDetails.fullName,
    address_line1: shippingDetails.addressLine1,
    address_line2: shippingDetails.addressLine2 || null,
    city: shippingDetails.city,
    state: shippingDetails.state,
    postal_code: shippingDetails.postalCode,
    country: shippingDetails.country,
    shipping_address_id: shippingAddress?.id ?? null,
    billing_address_id: billingAddress?.id ?? null,
  };

  validateOrderInsertPayload(orderPayload);

  const orderInsertResult = await client
    .from("orders")
    .insert(orderPayload)
    .select("*")
    .single();

  logSupabaseResult("orders insert", orderInsertResult);

  const { data: order, error: orderError } = orderInsertResult;

  if (orderError || !order) {
    throwPostgrest("orders insert", orderError, "Failed to create order.");
  }

  const itemRows = cart.lines.map((line) => ({
    order_id: order.id,
    product_id: line.product.id,
    variant_id: line.variantId,
    quantity: line.quantity,
    price_cents_at_time: getVariantPriceCents(line),
  }));

  validateOrderItemRows(itemRows);

  const orderItemsInsertResult = await client
    .from("order_items")
    .insert(itemRows)
    .select("*");

  logSupabaseResult("order_items insert", orderItemsInsertResult);

  const { data: createdItems, error: itemsError } = orderItemsInsertResult;

  if (itemsError) {
    await client.from("orders").delete().eq("id", order.id);
    throwPostgrest("order_items insert", itemsError, itemsError.message);
  }

  return {
    order: order as Order,
    items: (createdItems ?? []) as OrderItem[],
    guestToken,
  };
}

export async function attachStripeCheckoutSessionToOrder(
  orderId: string,
  sessionId: string,
): Promise<void> {
  const client = clientForCheckoutWrites();
  const { error } = await client
    .from("orders")
    .update({
      stripe_checkout_session_id: sessionId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function markOrderFailedForCheckout(orderId: string): Promise<void> {
  const client = clientForCheckoutWrites();
  const { error } = await client
    .from("orders")
    .update({
      status: "failed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    throw new Error(error.message);
  }
}

/** Read-only: resolve a human order reference for cancel/success UI (no PII). */
export async function getOrderNumberByIdForDisplay(
  orderId: string,
): Promise<string | null> {
  const trimmed = orderId?.trim();
  if (!trimmed) {
    return null;
  }

  const client = supabaseAdmin ?? supabase;
  if (!client) {
    return null;
  }

  const { data, error } = await client
    .from("orders")
    .select("order_number")
    .eq("id", trimmed)
    .maybeSingle();

  if (error || !data?.order_number) {
    return null;
  }

  return data.order_number as string;
}

/** Read-only: map Stripe session → order number for checkout success UI (no PII). */
export async function getOrderNumberByStripeSessionIdForDisplay(
  sessionId: string,
): Promise<string | null> {
  const trimmed = sessionId?.trim();
  if (!trimmed) {
    return null;
  }

  const client = supabaseAdmin ?? supabase;
  if (!client) {
    return null;
  }

  const { data, error } = await client
    .from("orders")
    .select("order_number")
    .eq("stripe_checkout_session_id", trimmed)
    .limit(1)
    .maybeSingle();

  if (error || !data?.order_number) {
    return null;
  }

  return data.order_number as string;
}

/**
 * Read-only guest order lookup by token.
 *
 * The token is a random UUID generated at checkout for unauthenticated orders
 * and embedded in the /checkout/success URL and the /order/[token] page.
 * Uses service-role client so no RLS policy is needed for anon reads.
 */
export async function getOrderDetailsByGuestToken(token: string): Promise<{
  order: Order;
  items: OrderItem[];
} | null> {
  // Validate UUID format before hitting the DB — prevents log noise and SQL injection.
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(token?.trim() ?? "")) {
    return null;
  }

  const client = supabaseAdmin ?? supabase;
  if (!client) {
    return null;
  }

  const { data: order } = await client
    .from("orders")
    .select("*")
    .eq("guest_token", token.trim())
    .limit(1)
    .maybeSingle();

  if (!order) {
    return null;
  }

  const { data: items } = await client
    .from("order_items")
    .select("*")
    .eq("order_id", order.id);

  return {
    order: order as Order,
    items: (items ?? []) as OrderItem[],
  };
}

/** Stripe returns `shipping_details` on completed Checkout Sessions; SDK types may lag. */
type CheckoutSessionShipping = {
  shipping_details?: {
    name?: string | null;
    address?: Stripe.Address | null;
  } | null;
};

/**
 * After Stripe Checkout completes, the customer-confirmed shipping address lives on the
 * Session (`shipping_details`). Merge that into our pending order row so emails and
 * fulfillment match what was charged (guest or logged-in).
 */
export async function applyStripeCheckoutSessionToOrder(
  session: Stripe.Checkout.Session,
): Promise<{ updated: boolean }> {
  const orderWithItems = await getOrderWithItemsByStripeSessionId(session.id);
  if (!orderWithItems) {
    return { updated: false };
  }

  const client = clientForCheckoutWrites();
  const updates: Record<string, unknown> = {};

  const sd = (session as Stripe.Checkout.Session & CheckoutSessionShipping)
    .shipping_details;
  if (sd?.address) {
    const a = sd.address;
    if (sd.name) {
      updates.full_name = sd.name;
    }
    if (a.line1) {
      updates.address_line1 = a.line1;
    }
    if (a.line2 !== undefined) {
      updates.address_line2 = a.line2 || null;
    }
    if (a.city) {
      updates.city = a.city;
    }
    if (a.state) {
      updates.state = a.state;
    }
    if (a.postal_code) {
      updates.postal_code = a.postal_code;
    }
    if (a.country) {
      updates.country = a.country;
    }
  }

  const email =
    session.customer_email ?? session.customer_details?.email ?? null;
  if (email) {
    updates.email = email;
  }

  if (Object.keys(updates).length === 0) {
    return { updated: false };
  }

  updates.updated_at = new Date().toISOString();

  const { error } = await client
    .from("orders")
    .update(updates)
    .eq("id", orderWithItems.order.id);

  if (error) {
    console.error(
      "[checkout] applyStripeCheckoutSessionToOrder failed:",
      error.message,
    );
    throw new Error(error.message);
  }

  return { updated: true };
}

export async function getOrderWithItemsByStripeSessionId(sessionId: string): Promise<{
  order: Order;
  items: OrderItem[];
} | null> {
  const client = clientForCheckoutWrites();
  const { data: order } = await client
    .from("orders")
    .select("*")
    .eq("stripe_checkout_session_id", sessionId)
    .limit(1)
    .maybeSingle();

  if (!order) {
    return null;
  }

  const { data: items } = await client
    .from("order_items")
    .select("*")
    .eq("order_id", order.id);

  return {
    order: order as Order,
    items: (items ?? []) as OrderItem[],
  };
}

async function insertPaymentRecord({
  orderId,
  stripePaymentId,
  amountCents,
  paymentMethod,
}: {
  orderId: string;
  stripePaymentId: string | null;
  amountCents: number;
  paymentMethod: string | null;
}) {
  const client = clientForCheckoutWrites();

  if (stripePaymentId) {
    const { data: existing } = await client
      .from("payments")
      .select("*")
      .eq("stripe_payment_id", stripePaymentId)
      .limit(1)
      .maybeSingle();

    if (existing) {
      return existing as Payment;
    }
  }

  const { data, error } = await client
    .from("payments")
    .insert({
      order_id: orderId,
      stripe_payment_id: stripePaymentId,
      amount_cents: amountCents,
      status: "succeeded",
      payment_method: paymentMethod,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to insert payment record.");
  }

  return data as Payment;
}

export async function finalizePaidOrderFromStripe({
  sessionId,
  paymentIntentId,
  amountCents,
  paymentMethod,
  paidAt,
}: {
  sessionId: string;
  paymentIntentId: string | null;
  amountCents: number;
  paymentMethod: string | null;
  paidAt: string;
}): Promise<Order> {
  const orderWithItems = await getOrderWithItemsByStripeSessionId(sessionId);

  if (!orderWithItems) {
    throw new Error(`No order found for checkout session ${sessionId}.`);
  }

  if (orderWithItems.order.status === "processing") {
    return orderWithItems.order;
  }

  const client = clientForCheckoutWrites();
  const { data: order, error } = await client
    .from("orders")
    .update({
      status: "processing",
      stripe_checkout_session_id: sessionId,
      stripe_payment_intent_id: paymentIntentId,
      payment_intent_id: paymentIntentId,
      paid_at: paidAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderWithItems.order.id)
    .select("*")
    .single();

  if (error || !order) {
    throw new Error(error?.message ?? "Failed to update paid order.");
  }

  await insertPaymentRecord({
    orderId: order.id,
    stripePaymentId: paymentIntentId,
    amountCents,
    paymentMethod,
  });

  if (order.user_id) {
    await client.from("cart_items").delete().eq("user_id", order.user_id);
  }

  await clearCartItemsCookie();
  await clearStoredPromoCode();
  await sendOrderPaidEmails({
    order: order as Order,
    items: orderWithItems.items,
  });

  return order as Order;
}
