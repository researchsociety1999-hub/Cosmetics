"use server";

import { redirect } from "next/navigation";
import { getCartSummary } from "../lib/cart";
import {
  buildOrderNumber,
  getOrderTotals,
  validateShippingDetails,
} from "../lib/checkout";
import { attachStripeCheckoutSession, createPendingOrder } from "../lib/queries";
import { createStripeCheckoutSession, isStripeConfigured } from "../lib/stripe";
import type { ShippingDetails } from "../lib/types";

function getField(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function getShippingDetails(formData: FormData): ShippingDetails {
  return {
    fullName: getField(formData, "full_name"),
    email: getField(formData, "email"),
    addressLine1: getField(formData, "address_line1"),
    addressLine2: getField(formData, "address_line2"),
    city: getField(formData, "city"),
    state: getField(formData, "state"),
    postalCode: getField(formData, "postal_code"),
    country: getField(formData, "country"),
  };
}

export async function submitOrderAction(formData: FormData): Promise<void> {
  const shippingDetails = getShippingDetails(formData);
  const validationError = validateShippingDetails(shippingDetails);

  if (validationError) {
    redirect(`/checkout?status=validation&message=${encodeURIComponent(validationError)}`);
  }

  if (!isStripeConfigured()) {
    redirect("/checkout?status=stripe-error");
  }

  const cart = await getCartSummary();

  if (cart.lines.length === 0) {
    redirect("/checkout?status=empty");
  }

  const orderNumber = buildOrderNumber();
  const totals = getOrderTotals(cart);

  try {
    const order = await createPendingOrder({
      orderNumber,
      shippingDetails,
      cart,
      totals,
    });

    const session = await createStripeCheckoutSession({
      orderId: order.id,
      orderNumber,
      customerEmail: shippingDetails.email,
      fullName: shippingDetails.fullName,
      addressLine1: shippingDetails.addressLine1,
      addressLine2: shippingDetails.addressLine2,
      city: shippingDetails.city,
      state: shippingDetails.state,
      postalCode: shippingDetails.postalCode,
      country: shippingDetails.country,
      cart,
    });

    await attachStripeCheckoutSession(order.id, session.id);
    redirect(session.url);
  } catch (error) {
    console.error("submitOrderAction error", error);
    redirect("/checkout?status=order-error");
  }
}
