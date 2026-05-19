"use client";

import { useEffect, useRef, useState } from "react";

export function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const rafRef = useRef<number>(0);
  const visibleRef = useRef(false);

  useEffect(() => {
    function handleScroll() {
      const next = window.scrollY > 420;
      if (next === visibleRef.current) return;
      visibleRef.current = next;
      if (rafRef.current) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = 0;
        setIsVisible(visibleRef.current);
      });
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => {
        const instant = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: instant ? "auto" : "smooth" });
      }}
      className={`fixed bottom-[6.75rem] right-5 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full border text-[#f5eee3] transition-[opacity,transform,background-color,border-color,box-shadow] duration-300 md:bottom-[7.25rem] md:right-7 ${
        isVisible
          ? "pointer-events-auto border-[rgba(214,168,95,0.42)] bg-[rgba(214,168,95,0.12)] opacity-100 shadow-[0_0_28px_rgba(214,168,95,0.22)] translate-y-0"
          : "pointer-events-none border-transparent bg-transparent opacity-0 translate-y-2"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5 fill-none stroke-current"
        aria-hidden="true"
      >
        <path d="M12 19V5" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M6.5 10.5L12 5l5.5 5.5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
