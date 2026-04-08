import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient, getAuthenticatedUser } from "./supabaseServer";
import { getProductsByIds, getProductVariantsByIds } from "./queries";
import type {
  CartCookieItem,
  CartLine,
  CartItem,
  CartSummary,
  CartSummaryItem,
} from "./types";

const CART_COOKIE_NAME = "mystique-cart";

function normalizeItems(items: CartCookieItem[]): CartCookieItem[] {
  return items
    .filter((item) => Number.isFinite(item.productId) && item.quantity > 0)
    .map((item) => ({
      productId: item.productId,
      quantity: Math.max(1, Math.floor(item.quantity)),
      variantId: item.variantId ?? null,
    }));
}

function getVariantUnitPriceCents(variant: {
  price_cents: number | null;
  price: number | null;
}): number | null {
  if (typeof variant.price_cents === "number") {
    return variant.price_cents;
  }

  if (typeof variant.price === "number") {
    return Math.round(variant.price * 100);
  }

  return null;
}

export async function getCartItemsFromCookie(): Promise<CartCookieItem[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(CART_COOKIE_NAME)?.value;

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as CartCookieItem[];
    return normalizeItems(Array.isArray(parsed) ? parsed : []);
  } catch {
    return [];
  }
}

export async function setCartItemsCookie(items: CartCookieItem[]): Promise<void> {
  const cookieStore = await cookies();
  const normalized = normalizeItems(items);
  cookieStore.set(CART_COOKIE_NAME, JSON.stringify(normalized), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearCartItemsCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CART_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

async function getDatabaseCartSummary(userId: string): Promise<CartSummary> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    throw new Error("Supabase public auth client is not configured.");
  }

  const { data, error } = await supabase
    .from("cart_items")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const cartItems = ((data ?? []) as CartItem[]).filter(
    (item) => Number.isFinite(item.product_id) && item.quantity > 0,
  );
  const products = await getProductsByIds(cartItems.map((item) => item.product_id));
  const variants = await getProductVariantsByIds(
    cartItems
      .map((item) => item.variant_id)
      .filter((variantId): variantId is number => typeof variantId === "number"),
  );
  const productsById = new Map(products.map((product) => [product.id, product]));
  const variantsById = new Map(variants.map((variant) => [variant.id, variant]));

  const lines: CartLine[] = cartItems.flatMap((item) => {
    const product = productsById.get(item.product_id);
    if (!product) {
      return [];
    }

    const variant =
      typeof item.variant_id === "number"
        ? variantsById.get(item.variant_id) ?? null
        : null;
    const unitPriceCents =
      (variant ? getVariantUnitPriceCents(variant) : null) ??
      product.sale_price_cents ??
      product.price_cents;

    return [
      {
        cartItemId: item.id,
        product,
        variant,
        quantity: item.quantity,
        variantId: item.variant_id,
        unitPriceCents,
        lineTotalCents: unitPriceCents * item.quantity,
      },
    ];
  });

  const items: CartSummaryItem[] = cartItems.map((item) => ({
    id: item.id,
    productId: item.product_id,
    quantity: item.quantity,
    variantId: item.variant_id,
  }));

  return {
    items,
    lines,
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotalCents: lines.reduce((sum, line) => sum + line.lineTotalCents, 0),
    source: "database",
    userId,
  };
}

export async function getCartSummary(user?: User | null): Promise<CartSummary> {
  const resolvedUser = user === undefined ? await getAuthenticatedUser() : user;

  if (resolvedUser) {
    return getDatabaseCartSummary(resolvedUser.id);
  }

  const items = await getCartItemsFromCookie();
  const products = await getProductsByIds(items.map((item) => item.productId));
  const productsById = new Map(products.map((product) => [product.id, product]));

  const lines: CartLine[] = items
    .map((item) => {
      const product = productsById.get(item.productId);
      if (!product) {
        return null;
      }

      const unitPriceCents = product.sale_price_cents ?? product.price_cents;

      return {
        product,
        quantity: item.quantity,
        variantId: item.variantId ?? null,
        unitPriceCents,
        lineTotalCents: unitPriceCents * item.quantity,
      };
    })
    .filter((line): line is CartLine => Boolean(line));

  return {
    items,
    lines,
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotalCents: lines.reduce((sum, line) => sum + line.lineTotalCents, 0),
    source: "cookie",
    userId: null,
  };
}
