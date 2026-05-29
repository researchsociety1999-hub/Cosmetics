import type { ChatOutcome } from "../lib/chatLog";

interface ChatOutcomeChipProps {
  outcome: ChatOutcome;
  size?: "compact" | "default";
}

const TONES: Record<
  ChatOutcome,
  { bg: string; text: string; label: string }
> = {
  success: {
    bg: "bg-emerald-500/15 ring-1 ring-inset ring-emerald-500/30",
    text: "text-emerald-300",
    label: "Success",
  },
  fallback: {
    bg: "bg-amber-500/15 ring-1 ring-inset ring-amber-500/30",
    text: "text-amber-200",
    label: "Fallback",
  },
  blocked: {
    bg: "bg-indigo-500/15 ring-1 ring-inset ring-indigo-500/30",
    text: "text-indigo-300",
    label: "Blocked",
  },
  error: {
    bg: "bg-rose-500/15 ring-1 ring-inset ring-rose-500/30",
    text: "text-rose-300",
    label: "Error",
  },
};

export function ChatOutcomeChip({ outcome, size = "default" }: ChatOutcomeChipProps) {
  const tone = TONES[outcome];
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
