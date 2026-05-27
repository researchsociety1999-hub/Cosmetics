"use client";

import { useTransition } from "react";

const RANGES = [
  { value: "24h", label: "24h" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
  { value: "all", label: "All time" },
] as const;

type RangeValue = (typeof RANGES)[number]["value"];

interface ChatRangeTabsProps {
  activeRange: RangeValue;
  /**
   * Invoked on tab click. Spec type is `(r: string) => void` — accepting
   * `void | Promise<void>` keeps both sync client callbacks and async server
   * actions assignable. The component does NOT fetch data itself.
   */
  onRangeChange: (range: string) => void | Promise<void>;
}

export function ChatRangeTabs({
  activeRange,
  onRangeChange,
}: ChatRangeTabsProps) {
  const [pending, startTransition] = useTransition();

  function handleClick(value: RangeValue) {
    if (value === activeRange) return;
    // Wrapping in startTransition keeps the active style snappy when the
    // parent's onRangeChange triggers a server-rendered navigation.
    startTransition(() => {
      void onRangeChange(value);
    });
  }

  return (
    <nav
      role="tablist"
      aria-label="Chat log time range"
      className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-1 text-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      {RANGES.map(({ value, label }) => {
        const isActive = value === activeRange;
        return (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-current={isActive ? "page" : undefined}
            onClick={() => handleClick(value)}
            disabled={pending && !isActive}
            className={[
              "rounded-md px-3 py-1.5 font-medium transition-colors",
              isActive
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
              pending && !isActive ? "opacity-60" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {label}
          </button>
        );
      })}
    </nav>
  );
}
