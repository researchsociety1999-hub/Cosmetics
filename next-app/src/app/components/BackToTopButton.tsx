"use client";

import { useEffect, useState } from "react";

export function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsVisible(window.scrollY > 420);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed right-5 top-1/2 z-50 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border text-[#f5eee3] transition-all duration-300 md:right-7 ${
        isVisible
          ? "pointer-events-auto border-[rgba(214,168,95,0.42)] bg-[rgba(214,168,95,0.12)] opacity-100 shadow-[0_0_28px_rgba(214,168,95,0.22)]"
          : "pointer-events-none border-transparent bg-transparent opacity-0"
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
