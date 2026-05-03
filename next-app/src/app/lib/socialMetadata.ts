/**
 * Canonical Open Graph / Twitter card image (1200×630 recommended).
 * Resolved to an absolute URL via `metadataBase` in root layout.
 */
export const MYSTIQUE_DEFAULT_OG_IMAGE = {
  url: "/brand/mystique-social-card.png",
  width: 1200,
  height: 630,
  alt: "Mystique — premium skincare",
} as const;

export function mystiqueDefaultOpenGraphImages(): Array<{
  url: string;
  width: number;
  height: number;
  alt: string;
}> {
  return [{ ...MYSTIQUE_DEFAULT_OG_IMAGE }];
}
