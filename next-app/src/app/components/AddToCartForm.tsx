"use client";

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
  return (
    <form action={action} className={formClassName}>
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
