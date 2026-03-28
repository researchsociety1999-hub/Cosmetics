import { cookies } from "next/headers";
import { getProductsByIds } from "./queries";
import type { CartCookieItem, CartLine, CartSummary } from "./types";

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

export async function getCartSummary(): Promise<CartSummary> {
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
  };
}
