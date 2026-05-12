"use client";

import { updateCartQuantityAction } from "../actions/cart";

export function CartQuantityUpdateForm({
  productId,
  variantId,
  initialQuantity,
}: {
  productId: number;
  variantId: number | null;
  initialQuantity: number;
}) {
  return (
    <form action={updateCartQuantityAction} className="flex items-center gap-2">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="variantId" value={variantId ?? ""} />
      <label className="sr-only" htmlFor={`qty-${productId}`}>
        Quantity
      </label>
      <input
        id={`qty-${productId}`}
        name="quantity"
        type="number"
        min="0"
        defaultValue={initialQuantity}
        className="mystic-input w-20 text-sm"
      />
      <button
        type="submit"
        className="rounded-full border border-[rgba(214,168,95,0.3)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#f5eee3]"
      >
        Update
      </button>
    </form>
  );
}
