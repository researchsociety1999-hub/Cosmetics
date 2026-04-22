"use client";

import { useId } from "react";
import { useFormStatus } from "react-dom";

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

function SubmitButton({
  label,
  className,
  disabled,
}: {
  label: string;
  className: string;
  disabled: boolean;
}) {
  const { pending } = useFormStatus();
  const isDisabled = disabled || pending;

  return (
    <button
      type="submit"
      className={className}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={pending}
    >
      <span className="inline-flex items-center justify-center gap-2">
        <span>{pending ? "Adding…" : label}</span>
        {pending ? (
          <span
            aria-hidden
            className="inline-flex h-1.5 w-1.5 rounded-full bg-current opacity-70 shadow-[0_0_10px_rgba(214,168,95,0.35)]"
          />
        ) : null}
      </span>
    </button>
  );
}

export function AddToCartForm({
  action,
  productId,
  variantId,
  redirectTo = "cart",
  buttonLabel = "Add to bag",
  buttonClassName = "mystic-button-primary inline-flex min-h-[50px] items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em]",
  formClassName = "mystic-card space-y-5 p-6",
  showQuantity = true,
  defaultQuantity = 1,
  controlledQuantity,
  disabled = false,
}: AddToCartFormProps) {
  const quantityFieldId = useId();
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
          <label
            htmlFor={quantityFieldId}
            className="mb-2 block text-xs uppercase tracking-[0.22em] text-[#b8ab95]"
          >
            Quantity
          </label>
          <input
            id={quantityFieldId}
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
      <SubmitButton
        label={buttonLabel}
        className={buttonClassName}
        disabled={disabled}
      />
    </form>
  );
}
