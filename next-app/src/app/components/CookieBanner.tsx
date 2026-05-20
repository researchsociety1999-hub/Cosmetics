"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useSyncExternalStore } from "react";

type ConsentState = "accepted" | "managed" | null;

const STORAGE_KEY = "mystique_cookie_consent";
const CONSENT_EVENT = "mystique:cookie-consent";

function readConsent(): ConsentState {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (value === "accepted" || value === "managed") return value;
    return null;
  } catch {
    return null;
  }
}

function writeConsent(next: Exclude<ConsentState, null>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // ignore storage access issues
  }
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener(CONSENT_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(CONSENT_EVENT, handler);
  };
}

/** Write the banner's live height into --cookie-bar-h so sibling floating
 *  widgets (ChatWidget, BackToTopButton) can offset themselves dynamically.
 *  Clears to 0px when the banner is dismissed. */
function useCookieBarHeight(ref: React.RefObject<HTMLDivElement | null>, active: boolean) {
  useEffect(() => {
    const root = document.documentElement;

    if (!active) {
      root.style.setProperty("--cookie-bar-h", "0px");
      return;
    }

    const el = ref.current;
    if (!el) return;

    const write = () => {
      const h = Math.ceil(el.getBoundingClientRect().height);
      root.style.setProperty("--cookie-bar-h", `${h > 0 ? h : 0}px`);
    };

    write();
    const ro = new ResizeObserver(write);
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.setProperty("--cookie-bar-h", "0px");
    };
  }, [ref, active]);
}

export function CookieBanner() {
  const consent = useSyncExternalStore(subscribe, readConsent, () => null);
  const bannerRef = useRef<HTMLDivElement>(null);

  // Keep --cookie-bar-h in sync with the banner's rendered height.
  useCookieBarHeight(bannerRef, !consent);

  if (consent) return null;

  const acceptAll = () => writeConsent("accepted");
  const manage = () => writeConsent("managed");

  return (
    <div
      ref={bannerRef}
      className="fixed bottom-0 left-0 right-0 z-[60] flex flex-col items-stretch justify-between gap-3 border-t border-[#C9A84C] bg-[#1A1A1A] px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sm:px-5 sm:py-4 sm:pb-[calc(1rem+env(safe-area-inset-bottom,0px))] md:flex-row md:items-center md:gap-6 md:px-10 md:py-5 md:pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]"
      role="region"
      aria-label="Cookie consent"
    >
      <p className="max-w-2xl text-[13px] leading-relaxed text-[#F0EDE6] sm:text-[14px]">
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

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 md:flex md:flex-wrap md:items-center">
        <button
          type="button"
          onClick={acceptAll}
          className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-[#C9A84C] px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-black transition duration-200 ease-[ease] hover:bg-[#E5C76B] md:w-auto md:px-7 md:py-3 md:text-[13px]"
        >
          Accept All
        </button>
        <Link
          href="/cookies"
          onClick={manage}
          className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full border border-[#C9A84C] bg-transparent px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#C9A84C] transition duration-200 ease-[ease] hover:bg-[rgba(201,168,76,0.08)] md:w-auto md:px-7 md:py-3 md:text-[13px]"
        >
          Manage Preferences
        </Link>
      </div>
    </div>
  );
}
