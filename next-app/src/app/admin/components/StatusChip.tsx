import { getStatusTone } from "../lib/orderStatus";

interface StatusChipProps {
  status: string | null | undefined;
  /** Compact = tighter padding for inline-table use. */
  size?: "compact" | "default";
}

export function StatusChip({ status, size = "default" }: StatusChipProps) {
  const tone = getStatusTone(status);
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
