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

/** Prefer service role for order writes; fall back to shared server client. */
function clientForCheckoutWrites() {
  if (supabaseAdmin) {
    return supabaseAdmin;
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
    const { data, error } = await client
      .from("addresses")
      .update(payload)
      .eq("id", existing.id)
      .select("*")
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? `Failed to update ${type} address.`);
    }

    return data as Address;
  }

  const { data, error } = await client
    .from("addresses")
    .insert(payload)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? `Failed to create ${type} address.`);
  }

  return data as Address;
}

export async function createPendingOrderFromCart({
  userId,
  shippingDetails,
  cart,
  appliedPromo = null,
}: {
  userId: string;
  shippingDetails: ShippingDetails;
  cart: CartSummary;
  appliedPromo?: AppliedPromo | null;
}): Promise<{ order: Order; items: OrderItem[] }> {
  const client = clientForCheckoutWrites();

  if (!cart.lines.length) {
    throw new Error("Cart is empty.");
  }

  const [shippingAddress, billingAddress] = await Promise.all([
    upsertDefaultAddress({ userId, type: "shipping", details: shippingDetails }),
    upsertDefaultAddress({ userId, type: "billing", details: shippingDetails }),
  ]);
  const totals = getOrderTotals(cart, appliedPromo?.discountCents ?? 0);
  const orderNumber = buildOrderNumber();

  const orderPayload = {
    order_number: orderNumber,
    user_id: userId,
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
    shipping_address_id: shippingAddress.id,
    billing_address_id: billingAddress.id,
  };

  const { data: order, error: orderError } = await client
    .from("orders")
    .insert(orderPayload)
    .select("*")
    .single();

  if (orderError || !order) {
    throw new Error(orderError?.message ?? "Failed to create order.");
  }

  const itemRows = cart.lines.map((line) => ({
    order_id: order.id,
    product_id: line.product.id,
    variant_id: line.variantId,
    quantity: line.quantity,
    price_cents_at_time: getVariantPriceCents(line),
  }));

  const { data: createdItems, error: itemsError } = await client
    .from("order_items")
    .insert(itemRows)
    .select("*");

  if (itemsError) {
    await client.from("orders").delete().eq("id", order.id);
    throw new Error(itemsError.message);
  }

  return {
    order: order as Order,
    items: (createdItems ?? []) as OrderItem[],
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
