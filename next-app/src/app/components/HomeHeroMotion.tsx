"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BrandLogo } from "./BrandLogo";

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduce(mq.matches);
    queueMicrotask(() => {
      setReduce(mq.matches);
    });
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduce;
}

export function HomeHeroMotion() {
  const reduce = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduce) return;

    function update() {
      const section = sectionRef.current;
      const copy = copyRef.current;
      if (!section || !copy) return;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const raw = 1 - rect.bottom / (rect.height + vh);
      const progress = Math.max(0, Math.min(1, raw));
      copy.style.opacity = String(1 - progress * 0.06);
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [reduce]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-dvh overflow-x-clip overflow-y-hidden"
    >
      <div className="pointer-events-none absolute inset-0 bg-[#010203]" />

      {/* Quiet depth: vignette + soft gold wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_45%,rgba(214,168,95,0.07),transparent_52%),radial-gradient(circle_at_0%_0%,rgba(255,154,80,0.06),transparent_35%),radial-gradient(circle_at_100%_20%,rgba(212,175,55,0.05),transparent_32%)]"
      />
      <div
        aria-hidden
        className="mystic-hero-ambient pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_50%_at_50%_22%,rgba(214,168,95,0.08),transparent_58%),radial-gradient(circle_at_50%_100%,rgba(255,120,60,0.04),transparent_45%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.55),inset_0_-80px_100px_rgba(0,0,0,0.45)]"
      />

      {/* Sparkle field sits *behind* the watermark so the lockup stays readable */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <span
          className="mystic-particle mystic-particle-md left-[12%] top-[20%] opacity-90"
          style={{ animationDelay: "-1.2s" }}
        />
        <span
          className="mystic-particle mystic-particle-sm left-[78%] top-[24%] opacity-80"
          style={{ animationDelay: "-3.4s" }}
        />
        <span
          className="mystic-particle mystic-particle-lg left-[88%] top-[58%] opacity-70"
          style={{ animationDelay: "-0.6s" }}
        />
        <span
          className="mystic-particle mystic-particle-sm left-[48%] top-[72%] opacity-50"
          style={{ animationDelay: "-5.1s" }}
        />
        <span
          className="mystic-particle mystic-particle-sm left-[24%] top-[56%] opacity-45"
          style={{ animationDelay: "-2.8s" }}
        />
        <span
          className="mystic-particle mystic-particle-md left-[62%] top-[14%] opacity-45"
          style={{ animationDelay: "-4.2s" }}
        />
      </div>

      {/* Watermark: scales with viewport + safe area; fades at edges via BrandLogo mask */}
      <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center px-3 pb-8 [padding-left:max(0.75rem,env(safe-area-inset-left,0px))] [padding-right:max(0.75rem,env(safe-area-inset-right,0px))] [padding-top:max(4.25rem,env(safe-area-inset-top,0px))] [padding-bottom:max(1.25rem,env(safe-area-inset-bottom,0px))] sm:px-5 sm:pb-10 sm:pt-24 md:px-8 md:pt-28 lg:px-12">
        <div className="relative aspect-[16/5] w-full max-w-[min(72rem,calc(100vw-1.5rem))] max-h-[min(44dvh,52svh)] min-h-[120px] sm:max-h-[min(48dvh,54svh)] md:max-h-[min(52dvh,56svh)] lg:max-h-[min(56dvh,58svh)] xl:max-w-[min(80rem,calc(100vw-2.5rem))] xl:max-h-[min(58dvh,60svh)]">
          <BrandLogo watermark priority />
        </div>
      </div>

      {/* Merges hero into page: side vignette + bottom ramp to next section (#05060a family) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[4] bg-[linear-gradient(90deg,rgba(1,2,3,0.65)_0%,transparent_12%,transparent_88%,rgba(1,2,3,0.65)_100%),linear-gradient(180deg,transparent_0%,transparent_32%,rgba(1,2,3,0.12)_58%,rgba(5,6,10,0.75)_78%,rgba(5,6,10,0.95)_90%,rgb(5,6,10)_100%)]"
      />

      {/* Copy: vertically centered band, left-aligned (editorial) */}
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-6xl items-center px-4 sm:px-8 md:px-10 lg:px-12 xl:px-14">
        <div
          ref={copyRef}
          className="w-full max-w-[min(36rem,92vw)] py-16 text-left sm:py-20 md:max-w-lg md:py-24"
          style={{ opacity: 1 }}
        >
          <div className="space-y-10">
            <div className="space-y-5">
              <h1
                className={`max-w-[17ch] font-literata text-[clamp(2.1rem,5vw,3.5rem)] font-medium leading-[1.05] tracking-[0.06em] text-[#faf6ef] [text-shadow:0_2px_32px_rgba(0,0,0,0.82),0_0_60px_rgba(0,0,0,0.35)] ${
                  reduce ? "" : "mystic-hero-reveal mystic-hero-reveal--title"
                }`}
              >
                Where Beauty Transcends
              </h1>
              <div
                aria-hidden
                className="h-px w-12 bg-gradient-to-r from-[rgba(214,168,95,0.55)] to-transparent sm:w-14"
              />
            </div>
            <div
              className={`flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:gap-4 ${
                reduce ? "" : "mystic-hero-reveal mystic-hero-reveal--cta"
              }`}
            >
              <div className="transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]">
                <Link
                  href="/shop"
                  className="mystic-button-primary inline-flex min-h-[46px] min-w-[11rem] items-center justify-center rounded-full px-7 py-2.5 text-[0.64rem] uppercase tracking-[0.24em] transition-shadow duration-300 hover:shadow-[0_0_32px_rgba(214,168,95,0.32)] md:min-h-[48px] md:px-8"
                >
                  Shop skincare
                </Link>
              </div>
              <div className="transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]">
                <Link
                  href="/ingredients"
                  className="mystic-button-secondary inline-flex min-h-[46px] min-w-[11rem] items-center justify-center rounded-full px-7 py-2.5 text-[0.64rem] uppercase tracking-[0.24em] transition-[box-shadow,transform] duration-300 hover:border-[rgba(214,168,95,0.5)] hover:shadow-[0_0_24px_rgba(214,168,95,0.1)] md:min-h-[48px] md:px-8"
                >
                  Ingredient guide
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
