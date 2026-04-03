"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, getAuthenticatedUser } from "../lib/supabaseServer";
import { getCartItemsFromCookie, setCartItemsCookie } from "../lib/cart";

function revalidateCartRoutes() {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/cart");
  revalidatePath("/checkout");
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
  return item.productId === productId && (item.variantId ?? null) === variantId;
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

    revalidateCartRoutes();

    if (redirectTarget === "cart") {
      redirect("/cart");
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

  await setCartItemsCookie(items);
  revalidateCartRoutes();

  if (redirectTarget === "cart") {
    redirect("/cart");
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

    revalidateCartRoutes();
    return;
  }

  const items = await getCartItemsFromCookie();
  const nextItems =
    quantity <= 0
      ? items.filter((item) => !isSameCartLine(item, productId, variantId))
      : items.map((item) =>
          isSameCartLine(item, productId, variantId) ? { ...item, quantity } : item,
        );

  await setCartItemsCookie(nextItems);
  revalidateCartRoutes();
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

    revalidateCartRoutes();
    return;
  }

  const items = await getCartItemsFromCookie();
  await setCartItemsCookie(
    items.filter((item) => !isSameCartLine(item, productId, variantId)),
  );
  revalidateCartRoutes();
}
