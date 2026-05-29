import { getProductStatusTone, type ProductStatus } from "../lib/productStatus";

interface ProductStatusChipProps {
  status: ProductStatus | null | undefined;
  size?: "compact" | "default";
}

export function ProductStatusChip({ status, size = "default" }: ProductStatusChipProps) {
  const tone = getProductStatusTone(status);
  const padding =
    size === "compact" ? "px-2 py-0.5 text-[0.6rem]" : "px-2.5 py-1 text-[0.65rem]";

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium uppercase tracking-[0.18em] ${tone.bg} ${tone.text} ${padding}`}
    >
      {tone.label}
    </span>
  );
}
