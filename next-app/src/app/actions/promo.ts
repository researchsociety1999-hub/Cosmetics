"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCartSummary } from "../lib/cart";
import {
  clearStoredPromoCode,
  normalizePromoCode,
  setStoredPromoCode,
  validatePromoCodeForSubtotal,
} from "../lib/promo";

function revalidatePromoRoutes() {
  revalidatePath("/cart");
  revalidatePath("/checkout");
}

export async function applyPromoCodeAction(formData: FormData): Promise<void> {
  const rawCode = String(formData.get("promoCode") ?? "");
  const promoCode = normalizePromoCode(rawCode);
  const cart = await getCartSummary();

  if (!promoCode) {
    redirect("/cart?promo-status=missing");
  }

  if (!cart.lines.length) {
    await clearStoredPromoCode();
    revalidatePromoRoutes();
    redirect(`/cart?promo-status=empty&promo-code=${encodeURIComponent(promoCode)}`);
  }

  const result = await validatePromoCodeForSubtotal({
    code: promoCode,
    subtotalCents: cart.subtotalCents,
  });

  if (!result.ok) {
    await clearStoredPromoCode();
    revalidatePromoRoutes();
    redirect(
      `/cart?promo-status=${encodeURIComponent(result.reason)}&promo-code=${encodeURIComponent(promoCode)}`,
    );
  }

  await setStoredPromoCode(result.appliedPromo.promo.code);
  revalidatePromoRoutes();
  redirect(
    `/cart?promo-status=applied&promo-code=${encodeURIComponent(result.appliedPromo.promo.code)}`,
  );
}

export async function removePromoCodeAction(): Promise<void> {
  await clearStoredPromoCode();
  revalidatePromoRoutes();
  redirect("/cart?promo-status=removed");
}
