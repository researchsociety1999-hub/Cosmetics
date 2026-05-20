"use client";

/**
 * GoogleAnalytics — consent gate + SPA page-view tracking
 *
 * @next/third-parties <GoogleAnalytics> in layout.tsx loads the gtag.js
 * script. This companion component:
 *   1. Guards all tracking behind cookie consent ("accepted" only).
 *   2. Sends a page_view on every client-side route change (App Router
 *      does not do this automatically).
 *
 * Mount once in layout.tsx, alongside <DeferredClientBits>.
 */

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// ---------------------------------------------------------------------------
// Consent helpers
// ---------------------------------------------------------------------------

const CONSENT_KEY = "mystique_cookie_consent";

function getConsent(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
}

export function hasAnalyticsConsent(): boolean {
  return getConsent() === "accepted";
}

// ---------------------------------------------------------------------------
// gtag wrapper — typed, safe to call before gtag is defined
// ---------------------------------------------------------------------------

type GtagCommand = "config" | "event" | "js" | "set" | "consent";

function gtag(command: GtagCommand, ...args: unknown[]): void {
  if (typeof window === "undefined") return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  if (typeof w.gtag !== "function") return;
  w.gtag(command, ...args);
}

// ---------------------------------------------------------------------------
// Public helper — use this anywhere in the app to fire GA4 events
// ---------------------------------------------------------------------------

/**
 * Fire a GA4 event.
 * No-op if:
 *  - GA Measurement ID is not set
 *  - Cookie consent is not "accepted"
 *  - gtag is not loaded yet
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>
): void {
  if (!hasAnalyticsConsent()) return;
  gtag("event", eventName, params ?? {});
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface GoogleAnalyticsProps {
  measurementId: string;
}

export function GoogleAnalyticsTracker({ measurementId }: GoogleAnalyticsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasSentInitial = useRef(false);

  useEffect(() => {
    if (!hasAnalyticsConsent()) return;
    if (!measurementId) return;

    const url =
      pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");

    // Skip the very first render — @next/third-parties fires the initial
    // page_view automatically via the gtag config call.
    if (!hasSentInitial.current) {
      hasSentInitial.current = true;
      return;
    }

    gtag("event", "page_view", {
      page_path: url,
      page_title: document.title,
      send_to: measurementId,
    });
  }, [pathname, searchParams, measurementId]);

  return null;
}
