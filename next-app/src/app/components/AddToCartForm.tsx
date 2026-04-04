"use client";

import type { FormEvent } from "react";

const CART_COOKIE_NAME = "mystique-cart";

type AddToCartFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  productId: number;
  redirectTo?: string;
  buttonLabel?: string;
  buttonClassName?: string;
  formClassName?: string;
  showQuantity?: boolean;
  defaultQuantity?: number;
};

export function AddToCartForm({
  action,
  productId,
  redirectTo = "cart",
  buttonLabel = "Add to cart",
  buttonClassName = "mystic-button-primary inline-flex min-h-[50px] items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em]",
  formClassName = "mystic-card space-y-5 p-6",
  showQuantity = true,
  defaultQuantity = 1,
}: AddToCartFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const quantityInput = form.elements.namedItem("quantity");
    const variantInput = form.elements.namedItem("variantId");
    const quantity =
      quantityInput instanceof HTMLInputElement
        ? Math.max(1, Number(quantityInput.value || "1"))
        : 1;
    const variantId =
      variantInput instanceof HTMLInputElement && variantInput.value.trim()
        ? Number(variantInput.value)
        : null;

    try {
      const existingCookie = document.cookie
        .split("; ")
        .find((entry) => entry.startsWith(`${CART_COOKIE_NAME}=`));
      const existingItems = existingCookie
        ? JSON.parse(decodeURIComponent(existingCookie.split("=")[1]))
        : [];

      const items = Array.isArray(existingItems) ? existingItems : [];
      const existingItem = items.find(
        (item: { productId?: number; variantId?: number | null }) =>
          item.productId === productId && (item.variantId ?? null) === variantId,
      );

      if (existingItem) {
        existingItem.quantity = Math.max(
          1,
          Math.floor(Number(existingItem.quantity ?? 0) + quantity),
        );
      } else {
        items.push({
          productId,
          quantity,
          variantId,
        });
      }

      document.cookie = `${CART_COOKIE_NAME}=${encodeURIComponent(
        JSON.stringify(items),
      )}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
    } catch {
      // Let the server action remain the source of truth if client-side cookie sync fails.
    }
  }

  return (
    <form action={action} onSubmit={handleSubmit} className={formClassName}>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="redirectTo" value={redirectTo} />
      {showQuantity ? (
        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-[#b8ab95]">
            Quantity
          </label>
          <input
            type="number"
            min="1"
            max="10"
            defaultValue={defaultQuantity}
            name="quantity"
            className="mystic-input w-24 text-sm"
          />
        </div>
      ) : (
        <input type="hidden" name="quantity" value={defaultQuantity} />
      )}
      <button type="submit" className={buttonClassName}>
        {buttonLabel}
      </button>
    </form>
  );
}
