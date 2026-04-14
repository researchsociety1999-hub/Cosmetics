import { cookies } from "next/headers";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { httpCookieSecure } from "./httpCookieSecure";
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

function emptyDatabaseCartSummary(userId: string): CartSummary {
  return {
    items: [],
    lines: [],
    itemCount: 0,
    subtotalCents: 0,
    source: "database",
    userId,
  };
}

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
    secure: httpCookieSecure(),
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearCartItemsCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CART_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: httpCookieSecure(),
    path: "/",
    maxAge: 0,
  });
}

/**
 * After magic-link or OAuth sign-in, copy guest cookie lines into `cart_items`
 * so checkout (which requires a database cart) sees the same bag.
 */
export async function mergeGuestCartIntoUserCart(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  const guestItems = await getCartItemsFromCookie();
  if (!guestItems.length) {
    return;
  }

  for (const { productId, quantity, variantId } of guestItems) {
    const q = supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", userId)
      .eq("product_id", productId);
    const scoped =
      variantId == null ? q.is("variant_id", null) : q.eq("variant_id", variantId);
    const { data: existing, error } = await scoped.limit(1).maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from("cart_items")
        .update({
          quantity: existing.quantity + quantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (updateError) {
        throw new Error(updateError.message);
      }
    } else {
      const { error: insertError } = await supabase.from("cart_items").insert({
        user_id: userId,
        product_id: productId,
        variant_id: variantId,
        quantity,
      });

      if (insertError) {
        throw new Error(insertError.message);
      }
    }
  }

  await clearCartItemsCookie();
}

async function getDatabaseCartSummary(userId: string): Promise<CartSummary> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    console.warn("[cart] database cart skipped — Supabase public client not configured.");
    return emptyDatabaseCartSummary(userId);
  }

  try {
    const { data, error } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[cart] cart_items read failed:", error.message, error);
      return emptyDatabaseCartSummary(userId);
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
  } catch (e) {
    console.error("[cart] getDatabaseCartSummary:", e);
    return emptyDatabaseCartSummary(userId);
  }
}

export async function getCartSummary(user?: User | null): Promise<CartSummary> {
  const resolvedUser = user === undefined ? await getAuthenticatedUser() : user;

  if (resolvedUser) {
    return getDatabaseCartSummary(resolvedUser.id);
  }

  const items = await getCartItemsFromCookie();
  const products = await getProductsByIds(items.map((item) => item.productId));
  const variants = await getProductVariantsByIds(
    items
      .map((item) => item.variantId)
      .filter((id): id is number => typeof id === "number"),
  );
  const productsById = new Map(products.map((product) => [product.id, product]));
  const variantsById = new Map(variants.map((variant) => [variant.id, variant]));

  const lines: CartLine[] = items.flatMap((item) => {
    const product = productsById.get(item.productId);
    if (!product) {
      return [];
    }

    const variant =
      typeof item.variantId === "number"
        ? variantsById.get(item.variantId) ?? null
        : null;
    const unitPriceCents =
      (variant ? getVariantUnitPriceCents(variant) : null) ??
      product.sale_price_cents ??
      product.price_cents;

    return [
      {
        product,
        variant,
        quantity: item.quantity,
        variantId: item.variantId ?? null,
        unitPriceCents,
        lineTotalCents: unitPriceCents * item.quantity,
      },
    ];
  });

  return {
    items,
    lines,
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotalCents: lines.reduce((sum, line) => sum + line.lineTotalCents, 0),
    source: "cookie",
    userId: null,
  };
}
