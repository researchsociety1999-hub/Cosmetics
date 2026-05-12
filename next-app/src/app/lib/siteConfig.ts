/**
 * Public site metadata — optional `NEXT_PUBLIC_*` URLs for social profiles.
 * Footer shows each network with a link when `FOOTER_SOCIAL_PROFILE_URLS` has an https URL;
 * otherwise the label stays visible without a link (no fake URLs).
 */
export type SocialLink = {
  label: string;
  href: string;
};

function pickUrl(...keys: string[]): string | undefined {
  for (const key of keys) {
    const raw = process.env[key];
    if (typeof raw === "string") {
      const trimmed = raw.trim();
      if (trimmed.length > 0) {
        return trimmed;
      }
    }
  }
  return undefined;
}

/**
 * Official social profile URLs for the footer “Follow us” row.
 * Leave a value as `""` until the profile is live; the footer still shows the
 * network name and icon, but the row is non-clickable for that slot.
 *
 * Example:
 * `https://www.tiktok.com/@yourhandle`
 * `https://www.instagram.com/yourhandle`
 * `https://www.facebook.com/yourpage`
 */
export const FOOTER_SOCIAL_PROFILE_URLS: Record<
  "tiktok" | "instagram" | "facebook",
  string
> = {
  tiktok: "",
  instagram: "",
  facebook: "",
};

export type FooterSocialProfile = {
  id: keyof typeof FOOTER_SOCIAL_PROFILE_URLS;
  label: string;
  href: string;
};

export function getFooterSocialProfiles(): FooterSocialProfile[] {
  return [
    { id: "tiktok", label: "TikTok", href: FOOTER_SOCIAL_PROFILE_URLS.tiktok.trim() },
    { id: "instagram", label: "Instagram", href: FOOTER_SOCIAL_PROFILE_URLS.instagram.trim() },
    { id: "facebook", label: "Facebook", href: FOOTER_SOCIAL_PROFILE_URLS.facebook.trim() },
  ];
}

/** Returns only links with real URLs (https recommended). */
export function getConfiguredSocialLinks(): SocialLink[] {
  const entries: Array<[label: string, url: string | undefined]> = [
    ["Instagram", pickUrl("NEXT_PUBLIC_SOCIAL_INSTAGRAM_URL")],
    ["TikTok", pickUrl("NEXT_PUBLIC_SOCIAL_TIKTOK_URL")],
    ["X", pickUrl("NEXT_PUBLIC_SOCIAL_X_URL", "NEXT_PUBLIC_SOCIAL_TWITTER_URL")],
    ["Facebook", pickUrl("NEXT_PUBLIC_SOCIAL_FACEBOOK_URL")],
    ["YouTube", pickUrl("NEXT_PUBLIC_SOCIAL_YOUTUBE_URL")],
    ["Pinterest", pickUrl("NEXT_PUBLIC_SOCIAL_PINTEREST_URL")],
  ];

  const links: SocialLink[] = [];
  for (const [label, url] of entries) {
    if (!url) {
      continue;
    }
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        continue;
      }
      links.push({ label, href: url });
    } catch {
      continue;
    }
  }
  return links;
}

/** Public inbox shown on Contact (and similar). Omit until a real monitored address exists. */
export function getPublicStudioEmail(): string | null {
  const raw = process.env.NEXT_PUBLIC_STUDIO_EMAIL?.trim();
  if (!raw) {
    return null;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
    return null;
  }
  return raw;
}
