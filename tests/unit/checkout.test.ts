import { describe, expect, it } from "vitest";
import type { CartSummary, ShippingDetails } from "@/app/lib/types";

/**
 * Unit tests for `@/app/lib/checkout`.
 *
 * `validateShippingDetails` is pure (type-only imports), so no mocks are needed.
 *
 * NOTE ON THE EXPECTED API:
 *  - `ShippingDetails` has NO `phone` and NO `shippingMethod` field, and
 *    `validateShippingDetails` does not validate either. Those requested cases
 *    are recorded below as `it.todo` so the gap is visible rather than tested
 *    against an API that doesn't exist.
 *  - Shipping cost is derived (free over the threshold, otherwise a flat rate),
 *    not selected by the user — covered via getShippingAmountCents / getOrderTotals.
 */

import {
  buildOrderNumber,
  FLAT_SHIPPING_CENTS,
  FREE_SHIPPING_THRESHOLD_CENTS,
  getOrderTotals,
  getShippingAmountCents,
  toStripeCountryCode,
  validateShippingDetails,
} from "@/app/lib/checkout";

function makeShipping(overrides: Partial<ShippingDetails> = {}): ShippingDetails {
  return {
    fullName: "Mystique Test User",
    email: "shopper@example.com",
    addressLine1: "1200 Market Street",
    addressLine2: "",
    city: "Austin",
    state: "TX",
    postalCode: "78701",
    country: "United States",
    ...overrides,
  };
}

function makeCart(subtotalCents: number): CartSummary {
  return {
    items: [],
    lines: [],
    itemCount: 1,
    subtotalCents,
    source: "cookie",
    userId: null,
  };
}

describe("validateShippingDetails — valid form", () => {
  it("returns null for a complete, valid US address", () => {
    expect(validateShippingDetails(makeShipping())).toBeNull();
  });

  it("accepts the 'United States of America' country spelling", () => {
    expect(
      validateShippingDetails(makeShipping({ country: "United States of America" })),
    ).toBeNull();
  });

  it("accepts a bare 'US' country code", () => {
    expect(validateShippingDetails(makeShipping({ country: "us" }))).toBeNull();
  });
});

describe("validateShippingDetails — required fields", () => {
  it("fails when full name is missing", () => {
    expect(validateShippingDetails(makeShipping({ fullName: "" }))).toBe(
      "Please enter your full name.",
    );
  });

  it("fails when the shipping address line is missing", () => {
    expect(validateShippingDetails(makeShipping({ addressLine1: "" }))).toBe(
      "Please enter your shipping address.",
    );
  });

  it("fails when the city is missing", () => {
    expect(validateShippingDetails(makeShipping({ city: "" }))).toBe(
      "Please enter your city.",
    );
  });

  it("fails when the state is missing or too short", () => {
    expect(validateShippingDetails(makeShipping({ state: "" }))).toBe(
      "Please enter a valid state.",
    );
    expect(validateShippingDetails(makeShipping({ state: "T" }))).toBe(
      "Please enter a valid state.",
    );
  });

  it("fails when the postal code is missing or shorter than 5 chars", () => {
    expect(validateShippingDetails(makeShipping({ postalCode: "" }))).toBe(
      "Please enter a valid postal code.",
    );
    expect(validateShippingDetails(makeShipping({ postalCode: "787" }))).toBe(
      "Please enter a valid postal code.",
    );
  });
});

describe("validateShippingDetails — format & policy rules", () => {
  it.each([
    "plainaddress",
    "missing-at.example.com",
    "no-domain@",
    "spaces in@email.com",
    "@nolocal.com",
  ])("rejects invalid email %s", (email) => {
    expect(validateShippingDetails(makeShipping({ email }))).toBe(
      "Please enter a valid email address.",
    );
  });

  it("rejects shipping outside the United States", () => {
    expect(validateShippingDetails(makeShipping({ country: "Canada" }))).toBe(
      "We currently support shipping within the United States only.",
    );
  });

  it("checks fields in priority order (name before email)", () => {
    // Both name AND email are invalid -> the name error wins.
    expect(
      validateShippingDetails(makeShipping({ fullName: "", email: "bad" })),
    ).toBe("Please enter your full name.");
  });
});

describe("validateShippingDetails — documented gaps (not in current API)", () => {
  // `ShippingDetails` has no phone field and `validateShippingDetails` never
  // inspects one. Implement before un-skipping.
  it.todo("phone is optional but must be a valid format when provided");
  // Shipping is computed from subtotal (free-shipping threshold), not chosen by
  // the user, so there is no 'shipping method required' validation.
  it.todo("shipping method is required");
});

describe("getShippingAmountCents", () => {
  it("charges the flat rate below the free-shipping threshold", () => {
    expect(getShippingAmountCents(FREE_SHIPPING_THRESHOLD_CENTS - 1)).toBe(FLAT_SHIPPING_CENTS);
    expect(getShippingAmountCents(0)).toBe(FLAT_SHIPPING_CENTS);
  });

  it("is free at or above the threshold", () => {
    expect(getShippingAmountCents(FREE_SHIPPING_THRESHOLD_CENTS)).toBe(0);
    expect(getShippingAmountCents(FREE_SHIPPING_THRESHOLD_CENTS + 5_000)).toBe(0);
  });
});

describe("getOrderTotals — promo + shipping math", () => {
  it("computes totals with no discount and flat shipping", () => {
    const totals = getOrderTotals(makeCart(6_000));
    expect(totals).toEqual({
      subtotalAmount: 6_000,
      discountAmount: 0,
      shippingAmount: FLAT_SHIPPING_CENTS,
      taxAmount: 0,
      totalAmount: 6_000 + FLAT_SHIPPING_CENTS,
    });
  });

  it("applies a discount and floors it at the subtotal (never negative)", () => {
    const totals = getOrderTotals(makeCart(4_200), 99_999);
    expect(totals.discountAmount).toBe(4_200);
    expect(totals.totalAmount).toBe(FLAT_SHIPPING_CENTS); // subtotal fully discounted
  });

  it("clamps a negative discount to 0", () => {
    const totals = getOrderTotals(makeCart(6_000), -500);
    expect(totals.discountAmount).toBe(0);
  });

  it("recomputes free shipping against the post-promo subtotal", () => {
    // Subtotal qualifies for free shipping, but a promo drops it below the
    // threshold -> shipping is charged again.
    const totals = getOrderTotals(makeCart(8_000), 2_000);
    expect(totals.shippingAmount).toBe(FLAT_SHIPPING_CENTS);
    expect(totals.totalAmount).toBe(8_000 - 2_000 + FLAT_SHIPPING_CENTS);
  });

  it("keeps free shipping when the post-promo subtotal still clears the threshold", () => {
    const totals = getOrderTotals(makeCart(20_000), 2_000);
    expect(totals.shippingAmount).toBe(0);
    expect(totals.totalAmount).toBe(18_000);
  });
});

describe("buildOrderNumber & toStripeCountryCode", () => {
  it("builds an order number matching MYS-YYYYMMDD-XXXXXX", () => {
    expect(buildOrderNumber()).toMatch(/^MYS-\d{8}-[A-Z0-9]{6}$/);
  });

  it("produces unique order numbers across calls", () => {
    expect(buildOrderNumber()).not.toBe(buildOrderNumber());
  });

  it("normalizes country names to a Stripe country code", () => {
    expect(toStripeCountryCode("United States")).toBe("US");
    expect(toStripeCountryCode("  united states of america ")).toBe("US");
    expect(toStripeCountryCode("Canada")).toBe("CANADA");
  });
});
