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

export async function addToCartAction(formData: FormData): Promise<void> {
  const productId = Number(formData.get("productId"));
  const quantity = Math.max(1, Number(formData.get("quantity") ?? 1));
  const variantIdValue = Number(formData.get("variantId"));
  const variantId = Number.isFinite(variantIdValue) ? variantIdValue : null;
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
  const variantIdValue = Number(formData.get("variantId"));
  const variantId = Number.isFinite(variantIdValue) ? variantIdValue : null;

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
      ? items.filter((item) => item.productId !== productId)
      : items.map((item) =>
          item.productId === productId ? { ...item, quantity } : item,
        );

  await setCartItemsCookie(nextItems);
  revalidateCartRoutes();
}

export async function removeFromCartAction(formData: FormData): Promise<void> {
  const productId = Number(formData.get("productId"));
  const variantIdValue = Number(formData.get("variantId"));
  const variantId = Number.isFinite(variantIdValue) ? variantIdValue : null;

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
  await setCartItemsCookie(items.filter((item) => item.productId !== productId));
  revalidateCartRoutes();
}
