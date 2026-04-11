/** Canonical public site origin for Stripe redirects, magic links, etc. */
export function getConfiguredSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}
