"use client";

type AddToCartFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  productId: number;
  /** When set, cart line includes this variant (omit for no variant). */
  variantId?: number | null;
  redirectTo?: string;
  buttonLabel?: string;
  buttonClassName?: string;
  formClassName?: string;
  showQuantity?: boolean;
  defaultQuantity?: number;
  /** When set, quantity is fixed (e.g. shared PDP state for two buttons). */
  controlledQuantity?: number;
  disabled?: boolean;
};

export function AddToCartForm({
  action,
  productId,
  variantId,
  redirectTo = "cart",
  buttonLabel = "Add to cart",
  buttonClassName = "mystic-button-primary inline-flex min-h-[50px] items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em]",
  formClassName = "mystic-card space-y-5 p-6",
  showQuantity = true,
  defaultQuantity = 1,
  controlledQuantity,
  disabled = false,
}: AddToCartFormProps) {
  const useControlled =
    typeof controlledQuantity === "number" && Number.isFinite(controlledQuantity);
  const qtyHiddenValue = useControlled
    ? Math.max(1, Math.min(10, Math.floor(controlledQuantity)))
    : defaultQuantity;

  return (
    <form action={action} className={formClassName}>
      <input type="hidden" name="productId" value={productId} />
      {typeof variantId === "number" ? (
        <input type="hidden" name="variantId" value={variantId} />
      ) : null}
      <input type="hidden" name="redirectTo" value={redirectTo} />
      {useControlled ? (
        <input type="hidden" name="quantity" value={qtyHiddenValue} />
      ) : showQuantity ? (
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
      <button type="submit" className={buttonClassName} disabled={disabled}>
        {buttonLabel}
      </button>
    </form>
  );
}
