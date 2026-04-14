/**
 * Whether to set the `Secure` flag on httpOnly cookies.
 * Browsers drop `Secure` cookies on plain HTTP. `next start` for local / Playwright
 * uses `NODE_ENV=production` but still serves over http://localhost — set
 * `E2E_ALLOW_HTTP_COOKIES=1` in the Playwright webServer env so guest cart / promo
 * cookies persist during E2E.
 */
export function httpCookieSecure(): boolean {
  const raw = String(process.env.E2E_ALLOW_HTTP_COOKIES ?? "").toLowerCase();
  if (raw === "1" || raw === "true" || raw === "yes") {
    return false;
  }
  return process.env.NODE_ENV === "production";
}
