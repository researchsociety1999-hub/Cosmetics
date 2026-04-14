"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { HOME_BRAND_IMAGES } from "../lib/homeBrandImages";

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
      {/* Full-bleed campaign photography — ink veil keeps copy legible */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <Image
          src={HOME_BRAND_IMAGES.hero}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_32%] sm:object-[center_28%]"
          quality={88}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(105deg,rgba(1,2,3,0.82)_0%,rgba(1,2,3,0.55)_32%,rgba(1,2,3,0.25)_52%,rgba(1,2,3,0.45)_100%),radial-gradient(ellipse_90%_70%_at_70%_35%,transparent_0%,rgba(1,2,3,0.35)_62%,rgba(1,2,3,0.72)_100%)]"
        />
        <div aria-hidden className="absolute inset-0 bg-[#010203]/25" />
      </div>

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

      {/* Sparkle field — subtle depth over photography */}
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

      {/* Soft gold lift on the portrait so the frame still feels “Mystique” without the wordmark */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_95%_65%_at_58%_38%,rgba(214,168,95,0.1),transparent_58%)]"
      />

      {/* Theme knit: vignette + bottom ramp into first section */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[4] bg-[linear-gradient(90deg,rgba(1,2,3,0.78)_0%,rgba(1,2,3,0.35)_18%,transparent_42%,transparent_78%,rgba(1,2,3,0.55)_100%),linear-gradient(180deg,rgba(1,2,3,0.2)_0%,transparent_14%,transparent_26%,rgba(1,2,3,0.06)_48%,rgba(5,6,10,0.78)_74%,rgba(5,6,10,0.95)_88%,rgb(5,6,10)_100%),radial-gradient(ellipse_70%_55%_at_50%_38%,transparent_0%,rgba(1,2,3,0.18)_100%)]"
      />

      {/* Copy: bottom-weighted; veils keep type legible over campaign art */}
      <div className="relative z-10 mx-auto flex min-h-[90dvh] w-full max-w-6xl items-end justify-start px-4 pb-16 pt-6 sm:px-8 sm:pb-20 sm:pt-8 md:px-10 md:pb-24 md:pt-10 lg:px-12 lg:pb-28 lg:pt-12 xl:px-14">
        <div
          ref={copyRef}
          className="w-full max-w-[min(36rem,92vw)] py-8 text-left sm:py-10 md:max-w-lg md:py-12"
          style={{ opacity: 1 }}
        >
          <div className="space-y-10">
            <div className="space-y-5">
              <h1
                className={`max-w-[18ch] font-literata text-[clamp(1.75rem,4vw,2.75rem)] font-normal leading-[1.12] tracking-[0.028em] text-[#e8e0d4] antialiased [text-shadow:0_1px_28px_rgba(0,0,0,0.72),0_2px_48px_rgba(0,0,0,0.45),0_0_40px_rgba(214,168,95,0.07)] ${
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
