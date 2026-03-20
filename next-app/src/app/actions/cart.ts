"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCartItemsFromCookie, setCartItemsCookie } from "../lib/cart";

function revalidateCartRoutes() {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/cart");
  revalidatePath("/checkout");
}

export async function addToCartAction(formData: FormData): Promise<void> {
  const productId = Number(formData.get("productId"));
  const quantity = Math.max(1, Number(formData.get("quantity") ?? 1));
  const redirectTarget = String(formData.get("redirectTo") ?? "");

  if (!Number.isFinite(productId)) {
    return;
  }

  const items = await getCartItemsFromCookie();
  const existing = items.find((item) => item.productId === productId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({ productId, quantity, variantId: null });
  }

  await setCartItemsCookie(items);
  revalidateCartRoutes();

  if (redirectTarget === "cart") {
    redirect("/cart");
  }
}

export async function updateCartQuantityAction(formData: FormData): Promise<void> {
  const productId = Number(formData.get("productId"));
  const quantity = Math.max(0, Number(formData.get("quantity") ?? 0));

  if (!Number.isFinite(productId)) {
    return;
  }

  const items = await getCartItemsFromCookie();
  const nextItems =
    quantity <= 0
      ? items.filter((item) => item.productId !== productId)
      : items.map((item) =>
          item.productId === productId ? { ...item, quantity } : item,
        );

  await setCartItemsCookie(nextItems);
  revalidateCartRoutes();
}

export async function removeFromCartAction(formData: FormData): Promise<void> {
  const productId = Number(formData.get("productId"));

  if (!Number.isFinite(productId)) {
    return;
  }

  const items = await getCartItemsFromCookie();
  await setCartItemsCookie(items.filter((item) => item.productId !== productId));
  revalidateCartRoutes();
}
