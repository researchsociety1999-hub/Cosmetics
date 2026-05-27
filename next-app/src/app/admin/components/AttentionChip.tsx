import type { AttentionReason } from "../lib/fulfillmentStatus";

interface AttentionChipProps {
  reasons: ReadonlyArray<AttentionReason>;
  size?: "compact" | "default";
}

/**
 * Renders a rose chip when one or more attention rules fired. The chip itself
 * uses a native `title` attribute so hovering surfaces the explanation copy
 * verbatim — keeps things server-renderable with no client JS cost.
 */
export function AttentionChip({ reasons, size = "default" }: AttentionChipProps) {
  if (reasons.length === 0) {
    return <span className="text-[0.7rem] text-[#5c5c54]">—</span>;
  }

  const padding =
    size === "compact" ? "px-2 py-0.5 text-[0.6rem]" : "px-2.5 py-1 text-[0.65rem]";
  const label =
    reasons.length === 1
      ? reasons[0]!.label
      : `${reasons.length} issues`;
  const explanation = reasons.map((r) => `• ${r.explanation}`).join("\n");

  return (
    <span
      title={explanation}
      className={`inline-flex items-center gap-1.5 rounded-full font-medium uppercase tracking-[0.18em] bg-rose-500/15 ring-1 ring-inset ring-rose-500/30 text-rose-300 ${padding}`}
    >
      <span aria-hidden>⚠</span>
      <span>{label}</span>
    </span>
  );
}
