"use client";

import { useEffect, useRef, useState } from "react";

interface CopyableIdProps {
  /** The full value to copy. Shown truncated in the UI. */
  value: string;
  /** Optional short label rendered as a muted prefix (e.g. "pi_…"). */
  label?: string;
  /**
   * Visible truncation length. The full value is always written to the clipboard.
   * Defaults to 14.
   */
  visible?: number;
}

function truncateMiddle(value: string, visible: number): string {
  if (value.length <= visible) return value;
  const head = Math.max(4, Math.floor(visible * 0.6));
  const tail = Math.max(2, visible - head - 1);
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

export function CopyableId({ value, label, visible = 14 }: CopyableIdProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!value) {
    return <span className="text-[#7a7265]">—</span>;
  }

  async function handleCopy() {
    try {
      // Fallback path matters here: navigator.clipboard requires a secure context.
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const ta = document.createElement("textarea");
        ta.value = value;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={value}
      aria-label={`Copy ${label ?? "value"} ${value}`}
      className="group inline-flex items-center gap-2 rounded-md border border-[rgba(214,168,95,0.15)] bg-[rgba(255,255,255,0.02)] px-2 py-1 font-mono text-[0.72rem] text-[#e8dcc4] transition-colors duration-150 hover:border-[rgba(214,168,95,0.32)] hover:bg-[rgba(214,168,95,0.06)]"
    >
      {label ? (
        <span className="text-[0.62rem] uppercase tracking-[0.18em] text-[#9a8f7a] group-hover:text-[#b8ab95]">
          {label}
        </span>
      ) : null}
      <span>{truncateMiddle(value, visible)}</span>
      <span
        aria-hidden="true"
        className={`text-[0.65rem] uppercase tracking-[0.16em] ${
          copied ? "text-emerald-300" : "text-[#9a8f7a] group-hover:text-[#d6a85f]"
        }`}
      >
        {copied ? "Copied" : "Copy"}
      </span>
    </button>
  );
}
