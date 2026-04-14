"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { httpCookieSecure } from "../lib/httpCookieSecure";
import { createSupabaseServerClient, getAuthenticatedUser } from "../lib/supabaseServer";
import { clearCartItemsCookie, getCartItemsFromCookie, getCartSummary } from "../lib/cart";
import { clearStoredPromoCode, getStoredPromoCode, validatePromoCodeForSubtotal } from "../lib/promo";
import type { CartCookieItem } from "../lib/types";

const CART_COOKIE_NAME = "mystique-cart";

function revalidateCartRoutes() {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/cart");
  revalidatePath("/checkout");
}

async function syncPromoCodeAfterCartMutation(subtotalCents: number) {
  const storedCode = await getStoredPromoCode();

  if (!storedCode) {
    return;
  }

  if (subtotalCents <= 0) {
    await clearStoredPromoCode();
    return;
  }

  const result = await validatePromoCodeForSubtotal({
    code: storedCode,
    subtotalCents,
  });

  if (!result.ok) {
    await clearStoredPromoCode();
  }
}

function parseOptionalVariantId(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function isSameCartLine(
  item: { productId: number; variantId?: number | null },
  productId: number,
  variantId: number | null,
) {
  const leftPid = Number(item.productId);
  const rightPid = Number(productId);
  const leftVid = item.variantId == null ? null : Number(item.variantId);
  const rightVid = variantId == null ? null : Number(variantId);
  return (
    Number.isFinite(leftPid) &&
    Number.isFinite(rightPid) &&
    leftPid === rightPid &&
    leftVid === rightVid
  );
}

async function persistGuestCart(items: CartCookieItem[]) {
  const cookieStore = await cookies();
  const normalized = items
    .filter((item) => Number.isFinite(Number(item.productId)) && item.quantity > 0)
    .map((item) => ({
      productId: Math.floor(Number(item.productId)),
      quantity: Math.max(1, Math.floor(item.quantity)),
      variantId: item.variantId ?? null,
    }));

  if (normalized.length === 0) {
    await clearCartItemsCookie();
    return;
  }

  cookieStore.set(CART_COOKIE_NAME, JSON.stringify(normalized), {
    httpOnly: true,
    sameSite: "lax",
    secure: httpCookieSecure(),
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function addToCartAction(formData: FormData): Promise<void> {
  const productId = Number(formData.get("productId"));
  const quantity = Math.max(1, Number(formData.get("quantity") ?? 1));
  const variantId = parseOptionalVariantId(formData.get("variantId"));
  const redirectTarget = String(formData.get("redirectTo") ?? "");

  if (!Number.isFinite(productId)) {
    return;
  }

  const user = await getAuthenticatedUser();

  if (user) {
    const supabase = await createSupabaseServerClient();

    if (!supabase) {
      throw new Error("Supabase public auth client is not configured.");
    }

    const query = supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", user.id)
      .eq("product_id", productId);
    const variantScopedQuery =
      variantId == null ? query.is("variant_id", null) : query.eq("variant_id", variantId);
    const { data: existing, error } = await variantScopedQuery.limit(1).maybeSingle();

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
        user_id: user.id,
        product_id: productId,
        variant_id: variantId,
        quantity,
      });

      if (insertError) {
        throw new Error(insertError.message);
      }
    }

    const updatedCart = await getCartSummary();
    await syncPromoCodeAfterCartMutation(updatedCart.subtotalCents);
    revalidateCartRoutes();

    if (redirectTarget === "cart") {
      redirect("/cart");
    }

    if (redirectTarget === "checkout") {
      redirect("/checkout");
    }

    return;
  }

  const items = await getCartItemsFromCookie();
  const existing = items.find((item) => isSameCartLine(item, productId, variantId));

  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({ productId, quantity, variantId });
  }

  await persistGuestCart(items);
  const updatedCart = await getCartSummary();
  await syncPromoCodeAfterCartMutation(updatedCart.subtotalCents);
  revalidateCartRoutes();

  if (redirectTarget === "cart") {
    redirect("/cart");
  }

  if (redirectTarget === "checkout") {
    redirect("/checkout");
  }
}

export async function updateCartQuantityAction(formData: FormData): Promise<void> {
  const productId = Number(formData.get("productId"));
  const quantity = Math.max(0, Number(formData.get("quantity") ?? 0));
  const variantId = parseOptionalVariantId(formData.get("variantId"));

  if (!Number.isFinite(productId)) {
    return;
  }

  const user = await getAuthenticatedUser();

  if (user) {
    const supabase = await createSupabaseServerClient();

    if (!supabase) {
      throw new Error("Supabase public auth client is not configured.");
    }

    const query = supabase
      .from("cart_items")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", productId);
    const variantScopedQuery =
      variantId == null ? query.is("variant_id", null) : query.eq("variant_id", variantId);
    const { data: existing, error } = await variantScopedQuery.limit(1).maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!existing) {
      return;
    }

    if (quantity <= 0) {
      const { error: deleteError } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", existing.id);

      if (deleteError) {
        throw new Error(deleteError.message);
      }
    } else {
      const { error: updateError } = await supabase
        .from("cart_items")
        .update({
          quantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (updateError) {
        throw new Error(updateError.message);
      }
    }

    const updatedCart = await getCartSummary();
    await syncPromoCodeAfterCartMutation(updatedCart.subtotalCents);
    revalidateCartRoutes();
    redirect("/cart");
  }

  const items = await getCartItemsFromCookie();
  const nextItems =
    quantity <= 0
      ? items.filter((item) => !isSameCartLine(item, productId, variantId))
      : items.map((item) =>
          isSameCartLine(item, productId, variantId) ? { ...item, quantity } : item,
        );

  await persistGuestCart(nextItems);
  const updatedCart = await getCartSummary();
  await syncPromoCodeAfterCartMutation(updatedCart.subtotalCents);
  revalidateCartRoutes();
  // Full navigation so the next request always carries the updated cart cookie.
  // RSC refresh alone can race with Set-Cookie and leave line totals out of sync with the input.
  redirect("/cart");
}

export async function removeFromCartAction(formData: FormData): Promise<void> {
  const productId = Number(formData.get("productId"));
  const variantId = parseOptionalVariantId(formData.get("variantId"));

  if (!Number.isFinite(productId)) {
    return;
  }

  const user = await getAuthenticatedUser();

  if (user) {
    const supabase = await createSupabaseServerClient();

    if (!supabase) {
      throw new Error("Supabase public auth client is not configured.");
    }

    const query = supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);
    const { error } =
      variantId == null ? await query.is("variant_id", null) : await query.eq("variant_id", variantId);

    if (error) {
      throw new Error(error.message);
    }

    const updatedCart = await getCartSummary();
    await syncPromoCodeAfterCartMutation(updatedCart.subtotalCents);
    revalidateCartRoutes();
    redirect("/cart");
  }

  const items = await getCartItemsFromCookie();
  const nextItems = items.filter((item) => !isSameCartLine(item, productId, variantId));
  await persistGuestCart(nextItems);
  const updatedCart = await getCartSummary();
  await syncPromoCodeAfterCartMutation(updatedCart.subtotalCents);
  revalidateCartRoutes();
  redirect("/cart");
}
