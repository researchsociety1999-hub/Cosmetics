/**
 * Mirrors utilities in `globals.css` next to `--mystique-header-offset`.
 *
 * - **Standard page:** `<main>` under `#main-content` — no second top gutter; see
 *   `#main-content > main` in globals.
 * - **Hero-first / full-bleed:** `firstSection` on the first immersive section cancels
 *   `#main-content` padding so the background meets the navbar (foreground keeps its own padding).
 * - **Hash / in-page links:** `scrollAnchor` on jump targets.
 */
export const mystiqueLayoutClass = {
  /** Preferred: cancels header padding for the first full-bleed / hero section */
  firstSection: "mystique-first-section",
  /** @deprecated alias — same CSS as `firstSection` */
  flushUnderHeader: "mystique-flush-under-header",
  scrollAnchor: "mystique-scroll-anchor",
} as const;
