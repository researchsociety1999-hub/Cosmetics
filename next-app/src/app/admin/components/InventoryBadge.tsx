interface InventoryBadgeProps {
  /** Total sellable stock across variants (or the legacy product.stock fallback). */
  stockTotal: number;
  /** True when no stock data at all is available — render as a muted "—". */
  isUnknown?: boolean;
  /** True when total stock is 0. */
  isOutOfStock?: boolean;
  /** True when stock is non-zero but at/below the low-stock threshold. */
  isLowStock?: boolean;
  /** Number of variants the stock total covers. Suppressed when 0. */
  variantCount?: number;
  size?: "compact" | "default";
}

const PADDING_COMPACT = "px-2 py-0.5 text-[0.6rem]";
const PADDING_DEFAULT = "px-2.5 py-1 text-[0.65rem]";

/**
 * Single chip that communicates inventory state at a glance.
 *
 * Visual ordering chosen so the dangerous states (rose) read first when
 * scanning a table column.
 */
export function InventoryBadge({
  stockTotal,
  isUnknown,
  isOutOfStock,
  isLowStock,
  variantCount,
  size = "default",
}: InventoryBadgeProps) {
  const padding = size === "compact" ? PADDING_COMPACT : PADDING_DEFAULT;

  if (isUnknown) {
    return <span className="text-[0.75rem] text-[#7a7265]">—</span>;
  }

  if (isOutOfStock) {
    return (
      <span
        className={`inline-flex items-center rounded-full font-medium uppercase tracking-[0.18em] bg-rose-500/15 ring-1 ring-inset ring-rose-500/30 text-rose-300 ${padding}`}
      >
        Out of stock
      </span>
    );
  }

  if (isLowStock) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-medium uppercase tracking-[0.18em] bg-amber-500/15 ring-1 ring-inset ring-amber-500/30 text-amber-200 ${padding}`}
      >
        <span>Low</span>
        <span className="font-mono tabular-nums tracking-normal text-amber-100">
          {stockTotal}
        </span>
      </span>
    );
  }

  const variantSuffix =
    typeof variantCount === "number" && variantCount > 1
      ? ` · ${variantCount} variants`
      : "";

  return (
    <span className="inline-flex items-center gap-1.5 text-[0.75rem] text-[#b8ab95]">
      <span className="font-mono tabular-nums text-[#f5eee3]">{stockTotal}</span>
      {variantSuffix ? (
        <span className="text-[0.65rem] text-[#7a7265]">{variantSuffix}</span>
      ) : null}
    </span>
  );
}
