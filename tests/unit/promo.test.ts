import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PromoCode } from "@/app/lib/types";

/**
 * Unit tests for `@/app/lib/promo`.
 *
 * Mapping of the requested coverage onto the real module API:
 *  - "discount math"            -> calculatePromoDiscountCents (pure)
 *  - "valid/invalid/expired"    -> validatePromoCodeForSubtotal (async, Supabase-backed)
 *  - "case insensitivity"       -> normalizePromoCode
 *  - "minimum order threshold"  -> validatePromoCodeForSubtotal (reason: "minimum-subtotal")
 *  - "promos do NOT stack"      -> the model stores a SINGLE promo code in one cookie and
 *                                  resolves a SINGLE AppliedPromo. Applying a second code
 *                                  replaces the first (see the cookie tests below). There is
 *                                  no API that combines two promos.
 *
 * All Supabase access is mocked via `@/app/lib/supabaseClient` and all cookie
 * access via `next/headers` — no real services are touched.
 */

// Mutable holders are created with vi.hoisted so they exist before the hoisted
// vi.mock factories run.
const supa = vi.hoisted(() => ({
  result: { data: null as unknown, error: null as unknown },
}));

const cookieState = vi.hoisted(() => ({ store: new Map<string, string>() }));

vi.mock("@/app/lib/supabaseClient", () => ({
  hasSupabaseServiceEnv: true,
  supabaseAdmin: {
    from: () => ({
      select: () => ({
        ilike: () => ({
          limit: () => ({
            maybeSingle: async () => supa.result,
          }),
        }),
      }),
    }),
  },
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => {
      const value = cookieState.store.get(name);
      return value === undefined ? undefined : { value };
    },
    set: (name: string, value: string) => {
      if (value === "") {
        cookieState.store.delete(name);
      } else {
        cookieState.store.set(name, value);
      }
    },
  }),
}));

import {
  calculatePromoDiscountCents,
  clearStoredPromoCode,
  getAppliedPromoFromStoredCode,
  getPromoFailureMessage,
  getStoredPromoCode,
  normalizePromoCode,
  setStoredPromoCode,
  validatePromoCodeForSubtotal,
} from "@/app/lib/promo";

function makePromo(overrides: Partial<PromoCode> = {}): PromoCode {
  return {
    id: "promo-1",
    code: "SAVE10",
    discount_type: "percent",
    discount_value: 10,
    is_active: true,
    starts_at: null,
    expires_at: null,
    minimum_subtotal: null,
    created_at: "2024-01-01T00:00:00.000Z",
    ...overrides,
  };
}

beforeEach(() => {
  supa.result = { data: null, error: null };
  cookieState.store.clear();
});

describe("normalizePromoCode", () => {
  it("uppercases and trims (case-insensitive codes)", () => {
    expect(normalizePromoCode("  save10 ")).toBe("SAVE10");
    expect(normalizePromoCode("Save10")).toBe("SAVE10");
    expect(normalizePromoCode("sAvE10")).toBe("SAVE10");
  });

  it("returns an empty string for blank input", () => {
    expect(normalizePromoCode("   ")).toBe("");
    expect(normalizePromoCode("")).toBe("");
  });
});

describe("calculatePromoDiscountCents — discount math", () => {
  it("applies a percentage discount", () => {
    const promo = makePromo({ discount_type: "percent", discount_value: 10 });
    expect(calculatePromoDiscountCents(promo, 10_000)).toBe(1_000);
  });

  it("applies a fixed (cents) discount", () => {
    const promo = makePromo({ discount_type: "fixed", discount_value: 1_500 });
    expect(calculatePromoDiscountCents(promo, 10_000)).toBe(1_500);
  });

  it("rounds percentage discounts to the nearest cent", () => {
    const promo = makePromo({ discount_type: "percent", discount_value: 15 });
    // 15% of 3333 = 499.95 -> 500
    expect(calculatePromoDiscountCents(promo, 3_333)).toBe(500);
  });

  it("returns 0 for a 0% discount", () => {
    const promo = makePromo({ discount_type: "percent", discount_value: 0 });
    expect(calculatePromoDiscountCents(promo, 10_000)).toBe(0);
  });

  it("caps a 100% discount at the subtotal", () => {
    const promo = makePromo({ discount_type: "percent", discount_value: 100 });
    expect(calculatePromoDiscountCents(promo, 8_750)).toBe(8_750);
  });

  it("clamps a percentage above 100 down to the subtotal (never negative remainder)", () => {
    const promo = makePromo({ discount_type: "percent", discount_value: 150 });
    expect(calculatePromoDiscountCents(promo, 5_000)).toBe(5_000);
  });

  it("floors a fixed discount larger than the cart total at the subtotal", () => {
    const promo = makePromo({ discount_type: "fixed", discount_value: 99_999 });
    expect(calculatePromoDiscountCents(promo, 4_200)).toBe(4_200);
  });

  it("treats negative discount values as 0 (fixed)", () => {
    const promo = makePromo({ discount_type: "fixed", discount_value: -500 });
    expect(calculatePromoDiscountCents(promo, 10_000)).toBe(0);
  });

  it("returns 0 when the subtotal is 0 or negative", () => {
    const promo = makePromo({ discount_type: "percent", discount_value: 50 });
    expect(calculatePromoDiscountCents(promo, 0)).toBe(0);
    expect(calculatePromoDiscountCents(promo, -100)).toBe(0);
  });
});

describe("validatePromoCodeForSubtotal — validity & errors", () => {
  it("accepts a valid active percentage promo and returns the computed discount", async () => {
    supa.result = {
      data: makePromo({ discount_type: "percent", discount_value: 20 }),
      error: null,
    };

    const result = await validatePromoCodeForSubtotal({
      code: "save20",
      subtotalCents: 10_000,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.appliedPromo.discountCents).toBe(2_000);
      expect(result.appliedPromo.promo.code).toBe("SAVE10"); // from fixture
    }
  });

  it("rejects an empty code with reason 'missing'", async () => {
    const result = await validatePromoCodeForSubtotal({ code: "   ", subtotalCents: 10_000 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("missing");
      expect(result.message).toBe(getPromoFailureMessage("missing"));
    }
  });

  it("rejects an unknown code with reason 'not-found'", async () => {
    supa.result = { data: null, error: null };
    const result = await validatePromoCodeForSubtotal({ code: "NOPE", subtotalCents: 10_000 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("not-found");
  });

  it("rejects an inactive promo with reason 'inactive'", async () => {
    supa.result = { data: makePromo({ is_active: false }), error: null };
    const result = await validatePromoCodeForSubtotal({ code: "SAVE10", subtotalCents: 10_000 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("inactive");
  });

  it("rejects a not-yet-started promo with reason 'not-started'", async () => {
    const future = new Date(Date.now() + 86_400_000).toISOString();
    supa.result = { data: makePromo({ starts_at: future }), error: null };
    const result = await validatePromoCodeForSubtotal({ code: "SAVE10", subtotalCents: 10_000 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("not-started");
  });

  it("rejects an expired promo with reason 'expired'", async () => {
    const past = new Date(Date.now() - 86_400_000).toISOString();
    supa.result = { data: makePromo({ expires_at: past }), error: null };
    const result = await validatePromoCodeForSubtotal({ code: "SAVE10", subtotalCents: 10_000 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("expired");
  });

  it("enforces the minimum-subtotal threshold", async () => {
    supa.result = { data: makePromo({ minimum_subtotal: 5_000 }), error: null };

    const below = await validatePromoCodeForSubtotal({ code: "SAVE10", subtotalCents: 4_999 });
    expect(below.ok).toBe(false);
    if (!below.ok) {
      expect(below.reason).toBe("minimum-subtotal");
      expect(below.message).toContain("$50.00");
    }

    const atThreshold = await validatePromoCodeForSubtotal({
      code: "SAVE10",
      subtotalCents: 5_000,
    });
    expect(atThreshold.ok).toBe(true);
  });
});

describe("getPromoFailureMessage", () => {
  it("returns a distinct human-readable message per reason", () => {
    expect(getPromoFailureMessage("missing")).toMatch(/enter a promo code/i);
    expect(getPromoFailureMessage("inactive")).toMatch(/not active/i);
    expect(getPromoFailureMessage("not-started")).toMatch(/not available yet/i);
    expect(getPromoFailureMessage("expired")).toMatch(/expired/i);
    expect(getPromoFailureMessage("not-found")).toMatch(/couldn't find/i);
  });

  it("formats the minimum-subtotal message with the dollar threshold", () => {
    expect(getPromoFailureMessage("minimum-subtotal", 7_500)).toContain("$75.00");
    expect(getPromoFailureMessage("minimum-subtotal", null)).toMatch(/higher cart subtotal/i);
  });
});

describe("single-promo model — promos do NOT stack", () => {
  it("stores exactly one promo code; applying a second replaces the first", async () => {
    await setStoredPromoCode("save10");
    expect(await getStoredPromoCode()).toBe("SAVE10");

    // Applying a different code overwrites — it does not accumulate.
    await setStoredPromoCode("save20");
    expect(await getStoredPromoCode()).toBe("SAVE20");

    await clearStoredPromoCode();
    expect(await getStoredPromoCode()).toBeNull();
  });

  it("resolves the stored code into a single AppliedPromo", async () => {
    supa.result = {
      data: makePromo({ code: "SAVE20", discount_type: "percent", discount_value: 20 }),
      error: null,
    };
    await setStoredPromoCode("SAVE20");

    const resolved = await getAppliedPromoFromStoredCode(10_000);
    expect(resolved.appliedPromo).not.toBeNull();
    expect(resolved.appliedPromo?.discountCents).toBe(2_000);
    expect(resolved.invalidMessage).toBeNull();
    // The shape is a single promo, not a list — stacking is structurally impossible.
    expect(Array.isArray(resolved.appliedPromo)).toBe(false);
  });

  it("drops the applied promo when the bag becomes empty", async () => {
    await setStoredPromoCode("SAVE20");
    const resolved = await getAppliedPromoFromStoredCode(0);
    expect(resolved.appliedPromo).toBeNull();
    expect(resolved.invalidMessage).toMatch(/bag is empty/i);
  });
});
