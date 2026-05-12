"use client";

/**
 * First focusable control in tab order; moves focus to #main-content for keyboard and AT users.
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="fixed left-4 top-0 z-[200] -translate-y-[120%] rounded-b-md border border-[rgba(214,168,95,0.45)] bg-[rgba(6,8,14,0.98)] px-3 py-2 text-sm text-[#f5eee3] shadow-[0_8px_32px_rgba(0,0,0,0.5)] outline-none ring-2 ring-transparent transition-transform duration-200 focus:z-[201] focus:translate-y-[max(0.5rem,env(safe-area-inset-top,0px))] focus:ring-[rgba(212,175,55,0.55)] motion-reduce:transition-none"
      onClick={(e) => {
        e.preventDefault();
        const el = document.getElementById("main-content");
        if (!el) return;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        el.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
        queueMicrotask(() => {
          if (el instanceof HTMLElement) {
            el.focus({ preventScroll: true });
          }
        });
      }}
    >
      Skip to main content
    </a>
  );
}
