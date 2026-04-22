"use client";

import { useEffect } from "react";

export default function HomeHeroMotionEnhancer() {
  useEffect(() => {
    let cleanup: null | (() => void) = null;
    let cancelled = false;

    import("./HomeHeroMotionFade").then((mod) => {
      if (cancelled) return;
      cleanup = mod.attachHomeHeroScrollFade();
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return null;
}

