import type { CartSummary, OrderTotals, ShippingDetails } from "./types";

export const CHECKOUT_CURRENCY = "usd";
export const FLAT_SHIPPING_CENTS = 599;
export const FREE_SHIPPING_THRESHOLD_CENTS = 5000;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeCountry(value: string): string {
  const normalized = value.trim().toUpperCase();

  if (normalized === "UNITED STATES" || normalized === "UNITED STATES OF AMERICA") {
    return "US";
  }

  return normalized;
}

export function getShippingAmountCents(subtotalCents: number): number {
  if (subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS) {
    return 0;
  }

  return FLAT_SHIPPING_CENTS;
}

export function getOrderTotals(cart: CartSummary): OrderTotals {
  const subtotalAmount = cart.subtotalCents;
  const shippingAmount = getShippingAmountCents(subtotalAmount);
  const taxAmount = 0;

  return {
    subtotalAmount,
    shippingAmount,
    taxAmount,
    totalAmount: subtotalAmount + shippingAmount + taxAmount,
  };
}

export function buildOrderNumber(): string {
  const now = new Date();
  const datePart = [
    now.getUTCFullYear(),
    String(now.getUTCMonth() + 1).padStart(2, "0"),
    String(now.getUTCDate()).padStart(2, "0"),
  ].join("");
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `MYS-${datePart}-${randomPart}`;
}

export function validateShippingDetails(details: ShippingDetails): string | null {
  if (!details.fullName) {
    return "Please enter your full name.";
  }

  if (!EMAIL_PATTERN.test(details.email)) {
    return "Please enter a valid email address.";
  }

  if (!details.addressLine1) {
    return "Please enter your shipping address.";
  }

  if (!details.city) {
    return "Please enter your city.";
  }

  if (!details.state || details.state.trim().length < 2) {
    return "Please enter a valid state.";
  }

  if (!details.postalCode || details.postalCode.trim().length < 5) {
    return "Please enter a valid postal code.";
  }

  const country = normalizeCountry(details.country);
  if (country !== "US") {
    return "We currently support shipping within the United States only.";
  }

  return null;
}

export function toStripeCountryCode(country: string): string {
  return normalizeCountry(country);
}
