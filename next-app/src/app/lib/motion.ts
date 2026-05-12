import type { Transition, Variants } from "framer-motion";

// Durations in milliseconds
export const durationsMs = {
  fast: 100,
  medium: 300,
  slow: 700,
  /** Navbar "Home" logo breathing loop (one full scale cycle). */
  navbarLogoBreathingLoop: 3000,
  /** Quick View: backdrop opacity (subtle, fast). */
  quickViewBackdrop: 120,
  /** Quick View: panel enter/exit (calm, not theatrical). */
  quickViewPanel: 220,
} as const;

/** Hero scroll-linked copy fade — max opacity reduction at full scroll progress. */
export const heroScrollFadeCopyOpacityMaxDelta = 0.028;

// Convert ms to seconds for framer-motion
export const msToSeconds = (ms: number) => ms / 1000;

// Easing curves
export const easings = {
  soft: [0.25, 0.08, 0.25, 1] as [number, number, number, number],
  out: [0.16, 1, 0.3, 1] as [number, number, number, number],
  inOut: [0.4, 0, 0.2, 1] as [number, number, number, number],
};

// Spring configs
export const springs = {
  soft: { type: "spring", stiffness: 180, damping: 17 } satisfies Transition,
  gentle: { type: "spring", stiffness: 120, damping: 20 } satisfies Transition,
};

// Reusable variant sets
export const variants = {
  fadeUp: {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
  } satisfies Variants,

  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  } satisfies Variants,

  scaleIn: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  } satisfies Variants,

  staggerContainer: {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
  } satisfies Variants,
};

