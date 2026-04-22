"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ConsentState = "accepted" | "managed" | null;

const STORAGE_KEY = "mystique_cookie_consent";

export function CookieBanner() {
  const [consent, setConsent] = useState<ConsentState>(null);

  useEffect(() => {
    try {
      const value = window.localStorage.getItem(STORAGE_KEY) as ConsentState;
      if (value === "accepted" || value === "managed") {
        setConsent(value);
      }
    } catch {
      // ignore storage access issues
    }
  }, []);

  if (consent) return null;

  const acceptAll = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {
      // ignore storage access issues
    }
    setConsent("accepted");
  };

  const manage = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "managed");
    } catch {
      // ignore storage access issues
    }
    setConsent("managed");
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] flex flex-wrap items-center justify-between gap-6 border-t border-[#C9A84C] bg-[#1A1A1A] px-6 py-5 md:px-10"
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
    >
      <p className="max-w-2xl text-[14px] leading-relaxed text-[#F0EDE6]">
        We use cookies to improve your experience and personalise content. See
        our{" "}
        <Link
          href="/cookies"
          className="text-[#A89060] underline underline-offset-4 transition-colors duration-200 hover:text-[#E5C76B]"
        >
          Cookie Policy
        </Link>{" "}
        for details.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={acceptAll}
          className="rounded-full bg-[#C9A84C] px-7 py-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-black transition duration-200 ease-[ease] hover:bg-[#E5C76B]"
        >
          Accept All
        </button>
        <Link
          href="/cookies"
          onClick={manage}
          className="rounded-full border border-[#C9A84C] bg-transparent px-7 py-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-[#C9A84C] transition duration-200 ease-[ease] hover:bg-[rgba(201,168,76,0.08)]"
        >
          Manage Preferences
        </Link>
      </div>
    </div>
  );
}

