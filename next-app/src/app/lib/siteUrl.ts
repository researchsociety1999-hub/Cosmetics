/**
 * Canonical public site origin for Stripe redirects, magic links, metadataBase, etc.
 * On Vercel previews, `VERCEL_URL` is set automatically when `NEXT_PUBLIC_SITE_URL` is omitted.
 */
export function getConfiguredSiteUrl(): string {
  const explicit =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.SITE_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//i, "");
    return `https://${host}`.replace(/\/$/, "");
  }

  return "http://localhost:3000";
}
