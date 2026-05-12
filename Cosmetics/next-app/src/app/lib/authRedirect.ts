/**
 * Same-origin path only — used for post-login redirects from query params,
 * hidden form fields, and OAuth/magic-link callback targets.
 */
export function getSafeNextPath(
  next: string | null | undefined,
  fallback = "/account",
): string {
  const trimmed = typeof next === "string" ? next.trim() : "";
  if (!trimmed || !trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }
  if (trimmed.includes("\\") || trimmed.includes("\0") || trimmed.includes("@")) {
    return fallback;
  }
  return trimmed;
}
