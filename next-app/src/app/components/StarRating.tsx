/**
 * Presentational star row + optional rating summary (no mock data — callers pass real counts).
 */

export function StarRow({ rating }: { rating: number }) {
  const full = Math.round(Math.min(5, Math.max(0, rating)));
  return (
    <span className="text-[#d6a85f]" aria-hidden>
      {"★".repeat(full)}
      <span className="text-[#4a4035]">{"★".repeat(Math.max(0, 5 - full))}</span>
    </span>
  );
}

export function RatingSummaryText({
  average,
  count,
}: {
  average: number;
  count: number;
}) {
  return (
    <span className="text-[#b8ab95]">
      <span className="text-[#f5eee3]">{average.toFixed(1)}</span>
      <span className="mx-1 text-[#4a4035]">·</span>
      {count} review{count === 1 ? "" : "s"}
    </span>
  );
}
