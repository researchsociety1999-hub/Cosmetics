import rateLimit from "next-rate-limit";
import type { NextRequest } from "next/server";

const AUTH_WINDOW_MS = 600 * 1000;
const AUTH_MAX_REQUESTS = 5;

const NEWSLETTER_WINDOW_MS = 10 * 60 * 1000;
const NEWSLETTER_MAX_REQUESTS = 5;

const CONTACT_WINDOW_MS = 10 * 60 * 1000;
const CONTACT_MAX_REQUESTS = 5;

const CHECKOUT_WINDOW_MS = 5 * 60 * 1000;
const CHECKOUT_MAX_REQUESTS = 10;

const authLimiter = rateLimit({
  interval: AUTH_WINDOW_MS,
  uniqueTokenPerInterval: 10_000,
});

const newsletterLimiter = rateLimit({
  interval: NEWSLETTER_WINDOW_MS,
  uniqueTokenPerInterval: 10_000,
});

const contactLimiter = rateLimit({
  interval: CONTACT_WINDOW_MS,
  uniqueTokenPerInterval: 10_000,
});

const checkoutLimiter = rateLimit({
  interval: CHECKOUT_WINDOW_MS,
  uniqueTokenPerInterval: 10_000,
});

function asNextRequest(identifier: string): NextRequest {
  return {
    ip: identifier,
    headers: new Headers(),
  } as unknown as NextRequest;
}

function runLimiterCheck(
  limiter: ReturnType<typeof rateLimit>,
  identifier: string,
  maxRequests: number,
  retryAfterSeconds: number,
): { success: boolean; retryAfter?: number } {
  try {
    limiter.checkNext(asNextRequest(identifier), maxRequests);
    return { success: true };
  } catch {
    return { success: false, retryAfter: retryAfterSeconds };
  }
}

/** Magic-link auth: 5 requests per IP per 10 minutes. */
export async function checkRateLimit(
  identifier: string,
): Promise<{ success: boolean; retryAfter?: number }> {
  return runLimiterCheck(authLimiter, identifier, AUTH_MAX_REQUESTS, AUTH_WINDOW_MS / 1000);
}

/** Newsletter signup: 5 requests per IP per 10 minutes. */
export async function checkNewsletterRateLimit(
  identifier: string,
): Promise<{ success: boolean; retryAfter?: number }> {
  return runLimiterCheck(
    newsletterLimiter,
    identifier,
    NEWSLETTER_MAX_REQUESTS,
    NEWSLETTER_WINDOW_MS / 1000,
  );
}

/** Contact form: 5 submissions per IP per 10 minutes. */
export async function checkContactRateLimit(
  identifier: string,
): Promise<{ success: boolean; retryAfter?: number }> {
  return runLimiterCheck(
    contactLimiter,
    identifier,
    CONTACT_MAX_REQUESTS,
    CONTACT_WINDOW_MS / 1000,
  );
}

/** Checkout-session creation: 10 attempts per IP per 5 minutes. */
export async function checkCheckoutRateLimit(
  identifier: string,
): Promise<{ success: boolean; retryAfter?: number }> {
  return runLimiterCheck(
    checkoutLimiter,
    identifier,
    CHECKOUT_MAX_REQUESTS,
    CHECKOUT_WINDOW_MS / 1000,
  );
}

export function getClientIpFromHeaders(headerStore: Headers): string {
  const forwarded = headerStore.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return (
    headerStore.get("x-real-ip")?.trim() ||
    headerStore.get("cf-connecting-ip")?.trim() ||
    "unknown"
  );
}
