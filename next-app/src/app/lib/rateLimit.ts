import rateLimit from "next-rate-limit";
import type { NextRequest } from "next/server";

const AUTH_WINDOW_MS = 600 * 1000;
const AUTH_MAX_REQUESTS = 5;

const authLimiter = rateLimit({
  interval: AUTH_WINDOW_MS,
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
