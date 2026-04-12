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
      className="relative min-h-[90dvh] overflow-x-clip overflow-y-hidden"
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

      {/* Brand lockup as full-hero background: larger than viewport, clipped — reads as environmental texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_95%_70%_at_50%_42%,rgba(214,168,95,0.09),transparent_55%)]" />
        <div className="absolute left-1/2 top-[48%] aspect-[16/5] h-[min(104dvh,108svh)] w-auto -translate-x-1/2 -translate-y-1/2 sm:top-1/2 sm:h-[min(108dvh,112svh)] md:h-[min(112dvh,118svh)] lg:h-[min(118dvh,124svh)]">
          <BrandLogo watermark priority />
        </div>
      </div>

      {/* Theme knit: vignette + bottom ramp into first section (same ink family as logo field) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[4] bg-[linear-gradient(90deg,rgba(1,2,3,0.72)_0%,transparent_14%,transparent_86%,rgba(1,2,3,0.72)_100%),linear-gradient(180deg,rgba(1,2,3,0.14)_0%,transparent_16%,transparent_28%,rgba(1,2,3,0.08)_52%,rgba(5,6,10,0.72)_76%,rgba(5,6,10,0.94)_88%,rgb(5,6,10)_100%),radial-gradient(ellipse_70%_55%_at_50%_38%,transparent_0%,rgba(1,2,3,0.22)_100%)]"
      />

      {/* Copy: bottom-weighted so the watermark reads clearly above the fold */}
      <div className="relative z-10 mx-auto flex min-h-[90dvh] w-full max-w-6xl items-end justify-start px-4 pb-16 pt-6 sm:px-8 sm:pb-20 sm:pt-8 md:px-10 md:pb-24 md:pt-10 lg:px-12 lg:pb-28 lg:pt-12 xl:px-14">
        <div
          ref={copyRef}
          className="w-full max-w-[min(36rem,92vw)] py-8 text-left sm:py-10 md:max-w-lg md:py-12"
          style={{ opacity: 1 }}
        >
          <div className="space-y-10">
            <div className="space-y-5">
              <h1
                className={`max-w-[18ch] font-literata text-[clamp(1.75rem,4vw,2.75rem)] font-normal leading-[1.12] tracking-[0.028em] text-[#e8e0d4] antialiased [text-shadow:0_1px_20px_rgba(0,0,0,0.55),0_0_40px_rgba(214,168,95,0.06)] ${
                  reduce ? "" : "mystic-hero-reveal mystic-hero-reveal--title"
                }`}
              >
                Where Beauty Transcends
              </h1>
              <div
                aria-hidden
                className="h-px w-12 bg-gradient-to-r from-[rgba(214,168,95,0.38)] to-transparent sm:w-14"
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
