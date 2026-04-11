"use client";

import { useEffect, useRef, useState } from "react";

export type MysticMergedOption = { value: string; label: string };

type MysticMergedSelectProps = {
  id: string;
  /** Accessible name (sr-only label text). */
  ariaLabel: string;
  value: string;
  options: MysticMergedOption[];
  onChange: (value: string) => void;
  className?: string;
};

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 shrink-0 text-[#e8c56e] transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

/**
 * Custom listbox styled as one continuous panel with the trigger (gold frame, dark glass).
 * Native `<select>` cannot merge the open list with the control in most browsers.
 */
export function MysticMergedSelect({
  id,
  ariaLabel,
  value,
  options,
  onChange,
  className = "",
}: MysticMergedSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = `${id}-listbox`;
  const selected = options.find((o) => o.value === value) ?? options[0];
  const displayLabel = selected?.label ?? "";

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => document.removeEventListener("pointerdown", handlePointerDown, true);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <span id={`${id}-sr`} className="sr-only">
        {ariaLabel}
      </span>
      <div
        className={`overflow-hidden rounded-[14px] border border-[rgba(212,175,55,0.34)] bg-[rgba(0,0,0,0.94)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_0_1px_rgba(212,175,55,0.06),0_12px_32px_rgba(0,0,0,0.55)] transition-[border-color,box-shadow] duration-200 ${
          open
            ? "border-[rgba(232,197,110,0.55)] shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_0_0_1px_rgba(212,175,55,0.2),0_0_36px_rgba(255,154,80,0.1),0_20px_48px_rgba(0,0,0,0.6)]"
            : "hover:border-[rgba(232,197,110,0.42)]"
        }`}
      >
        <button
          type="button"
          id={id}
          aria-labelledby={`${id}-sr`}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          onClick={() => setOpen((o) => !o)}
          className="flex min-h-[54px] w-full items-center justify-between gap-3 px-4 py-3 text-left text-[0.8rem] font-medium leading-snug tracking-[0.04em] text-[#f6f0e6] outline-none transition-colors hover:bg-[rgba(212,175,55,0.07)] focus-visible:bg-[rgba(212,175,55,0.11)]"
        >
          <span className="min-w-0 truncate">{displayLabel}</span>
          <Chevron open={open} />
        </button>

        {open ? (
          <ul
            id={listboxId}
            role="listbox"
            aria-labelledby={id}
            className="mystic-merged-select-list max-h-56 overflow-y-auto border-t border-[rgba(212,175,55,0.22)] bg-[rgba(0,0,0,0.35)] py-1"
          >
            {options.map((opt) => {
              const isActive = value === opt.value;
              return (
                <li key={opt.value || "__empty__"} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    className={`flex w-full px-4 py-2.5 text-left text-[0.78rem] tracking-[0.03em] outline-none transition-colors focus-visible:bg-[rgba(212,175,55,0.14)] ${
                      isActive
                        ? "bg-[rgba(212,175,55,0.16)] text-[#f5e0a8]"
                        : "text-[#d8cbb0] hover:bg-[rgba(212,175,55,0.09)] hover:text-[#faf6ef]"
                    }`}
                    onClick={() => {
                      setOpen(false);
                      onChange(opt.value);
                    }}
                  >
                    {opt.label}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
