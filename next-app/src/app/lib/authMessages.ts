/**
 * Strips implementation details from auth-related query messages so the UI
 * never exposes backend vendor or env file names to shoppers.
 */
export function sanitizeClientAuthMessage(
  message: string | undefined | null,
): string | undefined {
  if (!message?.trim()) {
    return undefined;
  }
  const m = message.trim();
  if (
    /supabase/i.test(m) ||
    /\.env\.local/i.test(m) ||
    /service role/i.test(m) ||
    /anon key/i.test(m) ||
    /next_public_/i.test(m) ||
    /gotrue/i.test(m) ||
    /pkce/i.test(m) ||
    /jwt/i.test(m) ||
    /access_token/i.test(m) ||
    /refresh_token/i.test(m)
  ) {
    return undefined;
  }
  return m;
}

const DEFAULT_LINK_FAILURE =
  "We couldn't verify that sign-in link. Request a fresh magic link from the sign-in page.";

/**
 * Maps Supabase/email-link errors to short, shopper-safe copy. Unknown or
 * sensitive strings never pass through verbatim.
 */
export function getCustomerAuthFailureMessage(
  messageParam: string | undefined | null,
): string {
  if (!messageParam?.trim()) {
    return DEFAULT_LINK_FAILURE;
  }

  let decoded: string;
  try {
    decoded = decodeURIComponent(messageParam.trim());
  } catch {
    return DEFAULT_LINK_FAILURE;
  }

  const sanitized = sanitizeClientAuthMessage(decoded);
  if (!sanitized) {
    return DEFAULT_LINK_FAILURE;
  }

  const lower = sanitized.toLowerCase();
  if (lower.includes("expir")) {
    return "That sign-in link has expired. Request a new magic link to continue.";
  }
  if (lower.includes("already been used") || lower.includes("already used")) {
    return "That sign-in link was already used. Request a new magic link if you still need access.";
  }
  if (
    lower.includes("invalid") ||
    lower.includes("otp") ||
    lower.includes("token") ||
    lower.includes("malformed") ||
    lower.includes("not found")
  ) {
    return "That sign-in link is no longer valid. Request a fresh magic link and try again.";
  }
  if (lower.includes("rate limit") || lower.includes("too many")) {
    return "Too many attempts right now. Wait a few minutes and try again.";
  }
  if (lower.includes("fetch failed") || lower.includes("network")) {
    return "We can't reach the sign-in service right now. Check your connection and try again.";
  }

  return DEFAULT_LINK_FAILURE;
}
