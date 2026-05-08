/**
 * Canonical public site origin for Stripe redirects, magic links, metadataBase, etc.
 * On Vercel previews, `VERCEL_URL` is set automatically when `NEXT_PUBLIC_SITE_URL` is omitted.
 */
export function getConfiguredSiteUrl(): string {
  const normalizeOrigin = (raw: string): string => {
    const trimmed = raw.trim().replace(/\/$/, "");
    if (trimmed.length === 0) {
      return "http://localhost:3000";
    }

    // Already absolute.
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        return parsed.origin;
      }
    } catch {
      // Fall through to host-like handling.
    }

    // Common case: env contains host only (e.g. "example.com").
    // Metadata and redirects require an absolute URL.
    const withoutScheme = trimmed.replace(/^\/\//, "");
    return `https://${withoutScheme}`.replace(/\/$/, "");
  };

  const explicit =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.SITE_URL?.trim();
  if (explicit) {
    return normalizeOrigin(explicit);
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//i, "");
    return normalizeOrigin(`https://${host}`);
  }

  return "http://localhost:3000";
}
