"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const CookieBanner = dynamic(
  () => import("./CookieBanner").then((m) => m.CookieBanner),
  { ssr: false, loading: () => null }
);

const BackToTopButton = dynamic(
  () => import("./BackToTopButton").then((m) => m.BackToTopButton),
  { ssr: false, loading: () => null }
);

const ChatWidget = dynamic(
  () => import("./ChatWidget").then((m) => m.ChatWidget),
  { ssr: false, loading: () => null }
);

type WindowWithIdleCallback = Window & {
  requestIdleCallback?: (
    callback: IdleRequestCallback,
    options?: IdleRequestOptions,
  ) => number;
  cancelIdleCallback?: (handle: number) => void;
};

function scheduleIdle(cb: () => void) {
  if (typeof window === "undefined") return;
  // requestIdleCallback is ideal for non-critical UI; fall back safely.
  const ric = (window as WindowWithIdleCallback).requestIdleCallback;
  if (typeof ric === "function") {
    ric(cb, { timeout: 2000 });
    return;
  }
  window.setTimeout(cb, 1200);
}

/**
 * Non-critical, purely client-side UI (kept out of the initial JS budget).
 * - Cookie consent banner
 * - Back-to-top affordance
 */
export function DeferredClientBits() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    scheduleIdle(() => setReady(true));
  }, []);

  if (!ready) return null;

  return (
    <>
      <CookieBanner />
      <BackToTopButton />
      <ChatWidget />
    </>
  );
}

