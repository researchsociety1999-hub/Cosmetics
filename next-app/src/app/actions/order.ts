"use server";

import { redirect } from "next/navigation";
import { getCartSummary } from "../lib/cart";
import {
  validateShippingDetails,
} from "../lib/checkout";
import {
  attachStripeCheckoutSessionToOrder,
  createPendingOrderFromCart,
  markOrderFailedForCheckout,
} from "../lib/checkoutOrders";
import { getAppliedPromoFromStoredCode } from "../lib/promo";
import { getAuthenticatedUser } from "../lib/supabaseServer";
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

  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/account/login?next=%2Fcart");
  }

  const cart = await getCartSummary();
  const { appliedPromo, invalidMessage } = await getAppliedPromoFromStoredCode(
    cart.subtotalCents,
  );

  if (cart.lines.length === 0) {
    redirect("/checkout?status=empty");
  }

  if (invalidMessage) {
    redirect(`/checkout?status=validation&message=${encodeURIComponent(invalidMessage)}`);
  }

  try {
    const { order } = await createPendingOrderFromCart({
      userId: user.id,
      shippingDetails,
      cart,
      appliedPromo,
    });

    try {
      const session = await createStripeCheckoutSession({
        order,
        cart,
        appliedPromo,
      });

      await attachStripeCheckoutSessionToOrder(order.id, session.id);
      redirect(session.url ?? `/checkout/success?session_id=${encodeURIComponent(session.id)}`);
    } catch (stripeError) {
      await markOrderFailedForCheckout(order.id);
      throw stripeError;
    }
  } catch (error) {
    console.error("submitOrderAction error", error);
    redirect("/checkout?status=order-error");
  }
}
