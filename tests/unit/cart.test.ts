import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Product } from "@/app/lib/types";

/**
 * Unit tests for `@/app/lib/cart`.
 *
 * NOTE ON THE EXPECTED API:
 * The task described pure store mutators (addItem / removeItem / updateQty /
 * getCartTotal / getItemCount) — those do NOT exist. There is also no Zustand
 * store in the codebase. `cart.ts` is the real cart "logic layer": it is
 * cookie/DB-backed and async. These tests therefore exercise the actual
 * exported functions and map each requested behavior onto them:
 *
 *   addItem / dup / removeItem / updateQty=0 / negative-qty
 *        -> normalization performed by getCartItemsFromCookie + setCartItemsCookie
 *           (qty<=0 and non-finite ids are dropped == "removed/rejected"; fractional
 *            quantities are floored). Note: the cookie layer does not merge
 *            duplicate product ids — that merge happens server-side in
 *            mergeGuestCartIntoUserCart against the DB and is out of scope here.
 *   getCartTotal   -> getCartSummary(...).subtotalCents
 *   getItemCount   -> getCartSummary(...).itemCount
 *   empty cart     -> getCartSummary(null) with no cookie
 *
 * Supabase and catalog queries are mocked; no real services are touched.
 */

const cookieState = vi.hoisted(() => ({ store: new Map<string, string>() }));
const catalog = vi.hoisted(() => ({
  products: [] as unknown[],
  variants: [] as unknown[],
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

// Guest path passes user=null, so these should never run — but the module
// imports them at load time, so they must resolve.
vi.mock("@/app/lib/supabaseServer", () => ({
  createSupabaseServerClient: async () => null,
  getAuthenticatedUser: async () => null,
}));

vi.mock("@/app/lib/queries", () => ({
  getProductsByIds: async () => catalog.products,
  getProductVariantsByIds: async () => catalog.variants,
}));

import {
  clearCartItemsCookie,
  getCartItemsFromCookie,
  getCartSummary,
  setCartItemsCookie,
} from "@/app/lib/cart";

const CART_COOKIE_NAME = "mystique-cart";

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    name: "Celestial Glow Serum",
    description: null,
    price_cents: 6_000,
    sale_price_cents: null,
    image_url: null,
    extra_images: null,
    slug: "celestial-glow-serum",
    category_id: null,
    sku: null,
    stock: 10,
    in_stock: true,
    is_published: true,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: null,
    ...overrides,
  };
}

/** Seed the raw cart cookie exactly as the browser would. */
function seedCookie(items: unknown[]) {
  cookieState.store.set(CART_COOKIE_NAME, JSON.stringify(items));
}

beforeEach(() => {
  cookieState.store.clear();
  catalog.products = [];
  catalog.variants = [];
});

describe("getCartItemsFromCookie — parsing & normalization", () => {
  it("returns an empty array when no cart cookie is set", async () => {
    expect(await getCartItemsFromCookie()).toEqual([]);
  });

  it("returns an empty array for malformed JSON", async () => {
    cookieState.store.set(CART_COOKIE_NAME, "{not valid json");
    expect(await getCartItemsFromCookie()).toEqual([]);
  });

  it("returns an empty array when the cookie is not an array", async () => {
    cookieState.store.set(CART_COOKIE_NAME, JSON.stringify({ productId: 1, quantity: 1 }));
    expect(await getCartItemsFromCookie()).toEqual([]);
  });

  it("drops items with quantity <= 0 (qty=0 removes, negative rejected)", async () => {
    seedCookie([
      { productId: 1, quantity: 2 },
      { productId: 2, quantity: 0 },
      { productId: 3, quantity: -5 },
    ]);
    const items = await getCartItemsFromCookie();
    expect(items).toEqual([{ productId: 1, quantity: 2, variantId: null }]);
  });

  it("drops items with a non-finite product id", async () => {
    seedCookie([
      { productId: Number.NaN, quantity: 1 },
      { productId: 5, quantity: 1 },
    ]);
    const items = await getCartItemsFromCookie();
    expect(items).toEqual([{ productId: 5, quantity: 1, variantId: null }]);
  });

  it("floors fractional quantities and defaults variantId to null", async () => {
    seedCookie([{ productId: 7, quantity: 3.9 }]);
    const items = await getCartItemsFromCookie();
    expect(items).toEqual([{ productId: 7, quantity: 3, variantId: null }]);
  });

  it("preserves an explicit variantId", async () => {
    seedCookie([{ productId: 7, quantity: 1, variantId: 42 }]);
    const items = await getCartItemsFromCookie();
    expect(items).toEqual([{ productId: 7, quantity: 1, variantId: 42 }]);
  });
});

describe("setCartItemsCookie — write + roundtrip", () => {
  it("writes normalized items that round-trip back through getCartItemsFromCookie", async () => {
    await setCartItemsCookie([
      { productId: 1, quantity: 2 },
      { productId: 2, quantity: 0 }, // dropped on write
    ]);

    const raw = cookieState.store.get(CART_COOKIE_NAME);
    expect(raw).toBeDefined();
    expect(JSON.parse(raw as string)).toEqual([{ productId: 1, quantity: 2, variantId: null }]);

    expect(await getCartItemsFromCookie()).toEqual([
      { productId: 1, quantity: 2, variantId: null },
    ]);
  });

  it("clearCartItemsCookie empties the cart", async () => {
    await setCartItemsCookie([{ productId: 1, quantity: 1 }]);
    await clearCartItemsCookie();
    expect(await getCartItemsFromCookie()).toEqual([]);
  });
});

describe("getCartSummary (guest/cookie path) — totals & counts", () => {
  it("returns an empty summary for an empty cart", async () => {
    const summary = await getCartSummary(null);
    expect(summary).toMatchObject({
      items: [],
      lines: [],
      itemCount: 0,
      subtotalCents: 0,
      source: "cookie",
      userId: null,
    });
  });

  it("computes itemCount (getItemCount) and subtotalCents (getCartTotal)", async () => {
    catalog.products = [
      makeProduct({ id: 1, price_cents: 6_000 }),
      makeProduct({ id: 2, price_cents: 2_500, slug: "cleanser" }),
    ];
    seedCookie([
      { productId: 1, quantity: 2 },
      { productId: 2, quantity: 1 },
    ]);

    const summary = await getCartSummary(null);
    expect(summary.itemCount).toBe(3);
    expect(summary.subtotalCents).toBe(2 * 6_000 + 2_500); // 14_500
    expect(summary.lines).toHaveLength(2);
  });

  it("prefers sale_price_cents over price_cents for the unit price", async () => {
    catalog.products = [makeProduct({ id: 1, price_cents: 6_000, sale_price_cents: 5_800 })];
    seedCookie([{ productId: 1, quantity: 2 }]);

    const summary = await getCartSummary(null);
    expect(summary.lines[0]?.unitPriceCents).toBe(5_800);
    expect(summary.lines[0]?.lineTotalCents).toBe(11_600);
    expect(summary.subtotalCents).toBe(11_600);
  });

  it("lets a variant price override the product price", async () => {
    catalog.products = [makeProduct({ id: 1, price_cents: 6_000 })];
    catalog.variants = [
      { id: 42, product_id: 1, variant_name: "50ml", price_cents: 9_000, price: null, stock: 5, sku: null },
    ];
    seedCookie([{ productId: 1, quantity: 1, variantId: 42 }]);

    const summary = await getCartSummary(null);
    expect(summary.lines[0]?.unitPriceCents).toBe(9_000);
    expect(summary.subtotalCents).toBe(9_000);
  });

  it("skips cart lines whose product is missing from the catalog", async () => {
    catalog.products = [makeProduct({ id: 1, price_cents: 6_000 })];
    seedCookie([
      { productId: 1, quantity: 1 },
      { productId: 999, quantity: 3 }, // not in catalog -> no line
    ]);

    const summary = await getCartSummary(null);
    expect(summary.lines).toHaveLength(1);
    expect(summary.itemCount).toBe(1);
    expect(summary.subtotalCents).toBe(6_000);
  });
});
