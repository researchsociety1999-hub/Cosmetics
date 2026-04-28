"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

type WaitlistModalProps = {
  productName?: string | null;
  productSlug?: string | null;
  triggerLabel?: string;
  triggerClassName?: string;
  align?: "left" | "right";
};

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function WaitlistModal({
  productName,
  productSlug,
  triggerLabel = "Get restock note",
  triggerClassName,
  align = "right",
}: WaitlistModalProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelId = useMemo(() => {
    const ref = productSlug?.trim() || "unknown";
    return `waitlist-panel-${ref}`;
  }, [productSlug]);

  const source = useMemo(() => {
    const ref = productSlug?.trim();
    return ref ? `waitlist:${ref}` : "waitlist:unknown";
  }, [productSlug]);

  const title = productName?.trim() || "This item";
  const panelAlign = align === "left" ? "left-0" : "right-0";

  const closePopover = (opts?: { restoreFocus?: boolean }) => {
    setOpen(false);
    if (opts?.restoreFocus) {
      window.requestAnimationFrame(() => triggerRef.current?.focus());
    }
  };

  useEffect(() => {
    if (!open) return;
    const id = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closePopover({ restoreFocus: true });
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      const root = rootRef.current;
      if (!root) return;
      if (e.target instanceof Node && !root.contains(e.target)) {
        closePopover({ restoreFocus: true });
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [open]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;

    const normalized = normalizeEmail(email);
    if (!normalized) {
      setStatus("error");
      setMessage("Enter your email to get a restock note.");
      return;
    }
    if (!isValidEmail(normalized)) {
      setStatus("error");
      setMessage("Enter a valid email address.");
      return;
    }

    setStatus("submitting");
    setMessage(null);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalized, source }),
      });

      const data = (await res.json().catch(() => null)) as
        | { success?: boolean; message?: string; error?: string }
        | null;

      if (!res.ok || !data?.success) {
        setStatus("error");
        setMessage(
          data?.error ||
            "We couldn't save that request right now. Please try again in a moment.",
        );
        return;
      }

      setStatus("success");
      setMessage(
        data?.message ||
          "You're on the list. We'll email you when this item is available.",
      );
    } catch {
      setStatus("error");
      setMessage("We couldn't save that request right now. Please try again in a moment.");
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setStatus("idle");
          setMessage(null);
        }}
        className={
          triggerClassName ??
          "rounded-full border border-[rgba(214,168,95,0.35)] px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#f0d19a] transition hover:bg-[rgba(214,168,95,0.1)]"
        }
        aria-expanded={open}
        aria-controls={panelId}
      >
        {triggerLabel}
      </button>

      {open ? (
        <div
          id={panelId}
          role="group"
          aria-label="Restock note signup"
          className={`absolute z-40 mt-3 w-[min(22rem,92vw)] rounded-[18px] border border-[rgba(214,168,95,0.18)] bg-[rgba(2,3,6,0.98)] p-5 shadow-[0_28px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl ${panelAlign}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[0.62rem] uppercase tracking-[0.24em] text-[#d6a85f]">
                Restock note
              </p>
              <p className="mt-2 font-literata text-xl tracking-[0.08em] text-[#f5eee3]">
                {title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#b8ab95]">
                Enter your email and we’ll send a note when it’s available.
              </p>
            </div>
            <button
              type="button"
              onClick={() => closePopover({ restoreFocus: true })}
              className="inline-flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/10 text-[#b8ab95] transition hover:border-[rgba(214,168,95,0.25)] hover:text-[#f5eee3]"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <form onSubmit={onSubmit} className="mt-4 space-y-3">
            <label className="block">
              <span className="sr-only">Email</span>
              <input
                ref={inputRef}
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="mystic-input w-full text-sm"
              />
            </label>

            <p className="text-xs leading-relaxed text-[#7a7265]">
              By requesting a restock note, you agree to receive a one-time email about
              availability. If you’re already subscribed, this may also add you to Mystique
              launch notes and seasonal updates.
            </p>

            <button
              type="submit"
              disabled={status === "submitting"}
              className="mystic-button-primary inline-flex min-h-[46px] w-full items-center justify-center px-6 py-3 text-xs uppercase tracking-[0.22em] disabled:opacity-45"
            >
              {status === "submitting" ? "Saving…" : "Email me"}
            </button>

            {message ? (
              <p
                className={`text-sm ${
                  status === "success" ? "text-[#d6a85f]" : "text-[#e8a0a0]"
                }`}
                role={status === "error" ? "alert" : "status"}
              >
                {message}
              </p>
            ) : null}
          </form>
        </div>
      ) : null}
    </div>
  );
}

