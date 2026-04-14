/**
 * Campaign photography served from `/public/images/brand`.
 * Filenames are stable; replace files in that folder to refresh art direction.
 */
export const HOME_BRAND_IMAGES = {
  /** Center navbar — full Mystique lockup; taps through to `/` */
  navCenterMark: "/images/brand/nav-mystique-mark.png",
  /** Full-bleed home hero — campaign key art (moonlight portrait + tagline in frame) */
  hero: "/images/brand/hero-where-beauty-transcends.png",
  rituals: {
    morning: "/images/brand/ritual-portrait-glow.png",
    night: "/images/brand/ritual-blue-moon.png",
    weekly: "/images/brand/ritual-halo-portrait.png",
  },
  /** Optional editorial panels (about, journal promos, etc.) */
  editorial: {
    profileMoon: "/images/brand/editorial-profile-moon.png",
    mystiqueFlame: "/images/brand/editorial-mystique-flame.png",
  },
} as const;
