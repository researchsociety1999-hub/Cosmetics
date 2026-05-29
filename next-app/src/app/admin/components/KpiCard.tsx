import type { ReactNode } from "react";

interface KpiCardProps {
  label: string;
  value: ReactNode;
  /** Optional secondary line under the value (e.g. "Updated 2 min ago"). */
  hint?: string;
  /** Gold tone for the value when this metric is an alert (e.g. low stock). */
  emphasis?: "default" | "alert";
}

export function KpiCard({ label, value, hint, emphasis = "default" }: KpiCardProps) {
  const valueTone =
    emphasis === "alert" ? "text-[#e8c56e]" : "text-[#f5eee3]";

  return (
    <div className="rounded-[16px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)] p-5">
      <p className="text-[0.65rem] uppercase tracking-[0.22em] text-[#9a8f7a]">
        {label}
      </p>
      <p
        className={`mt-3 font-literata text-3xl tracking-[0.04em] tabular-nums ${valueTone}`}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-2 text-xs leading-relaxed text-[#7a7265]">{hint}</p>
      ) : null}
    </div>
  );
}
