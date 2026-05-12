"use client";

import { useLayoutEffect } from "react";

/**
 * App Router client navigation often skips native hash scrolling. Sync scroll + open
 * accordions when landing on /faq#shipping-and-returns (footer, trust footnote, etc.).
 */
export function FaqHashSync() {
  useLayoutEffect(() => {
    function applyHash() {
      if (typeof window === "undefined") return;
      const hash = window.location.hash;

      if (hash === "#faq-top") {
        const top = document.getElementById("faq-top");
        if (top) {
          requestAnimationFrame(() => {
            top.scrollIntoView({ behavior: "smooth", block: "start" });
          });
        }
        return;
      }

      if (hash !== "#shipping-and-returns") return;

      const section = document.getElementById("shipping-and-returns");
      if (!section) return;

      section.querySelectorAll("details").forEach((node) => {
        (node as HTMLDetailsElement).open = true;
      });

      requestAnimationFrame(() => {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  return null;
}
