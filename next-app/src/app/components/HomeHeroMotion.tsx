"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/** Wide lockup: wordmark + tagline + arc — sits behind hero copy (replace file in `/public` to refresh art). */
const HERO_BRAND_MARK_SRC = "/mystique-brand-logo.png";

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
      className="relative -mt-[max(5rem,calc(4rem+env(safe-area-inset-top,0px)))] min-h-[90dvh] overflow-x-clip overflow-y-hidden sm:-mt-[max(5.25rem,calc(4.1rem+env(safe-area-inset-top,0px)))] md:-mt-[4.65rem]"
    >
      {/* Brand studio still — Mystique /public only; heavily graded into palette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <Image
          src="/about/hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="home-hero-studio-bg object-cover object-[center_22%] opacity-[0.22] saturate-[0.55] contrast-[0.9] brightness-[0.72] sm:opacity-[0.26] sm:object-[center_28%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(168deg,rgba(8,6,10,0.75)_0%,rgba(4,5,10,0.55)_32%,rgba(4,5,10,0.82)_100%)]" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_110%_55%_at_50%_12%,rgba(214,168,95,0.14),transparent_52%),radial-gradient(circle_at_88%_22%,rgba(255,154,80,0.1),transparent_36%),radial-gradient(circle_at_8%_40%,rgba(120,90,160,0.08),transparent_40%),linear-gradient(168deg,rgba(12,10,16,0.92)_0%,rgba(4,5,10,0.96)_38%,rgba(6,8,14,0.98)_72%,rgb(2,3,6)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(105deg,rgba(1,2,3,0.78)_0%,rgba(1,2,3,0.48)_32%,rgba(1,2,3,0.2)_52%,rgba(1,2,3,0.42)_100%),radial-gradient(ellipse_90%_70%_at_70%_32%,transparent_0%,rgba(1,2,3,0.32)_62%,rgba(1,2,3,0.68)_100%)]"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 bg-[#010203]/22" />

      {/*
        Center brand: integrated “etched in light” — radial mask feathers edges (no poster crop),
        screen-blend lifts black plate into the scene, ambient bloom sits behind the asset (not on it).
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center px-2 pt-[min(10vh,5rem)] sm:px-4 sm:pt-[min(9vh,4.5rem)] md:pt-[min(8vh,4rem)]"
      >
        <div className="relative isolate w-full max-w-[min(118vw,68rem)] sm:max-w-[min(112vw,76rem)] lg:max-w-[min(104vw,84rem)]">
          {/* Soft bloom behind the mark — diffuse, no hard box */}
          <div className="pointer-events-none absolute left-1/2 top-[44%] h-[min(58vh,34rem)] w-[min(132vw,64rem)] max-w-none -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_75%_55%_at_50%_50%,rgba(214,168,95,0.16),rgba(214,168,95,0.06)_40%,transparent_72%)] blur-3xl sm:h-[min(54vh,36rem)] sm:w-[72rem]" />
          <div className="pointer-events-none absolute left-1/2 top-[46%] h-[min(44vh,24rem)] w-[min(102vw,48rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,rgba(255,186,120,0.08),transparent_68%)] blur-2xl opacity-90" />
          <div
            className="relative mx-auto w-full [mask-image:radial-gradient(ellipse_82%_72%_at_50%_48%,#000_0%,#000_36%,rgba(0,0,0,0.55)_58%,rgba(0,0,0,0.18)_76%,transparent_92%)] [-webkit-mask-image:radial-gradient(ellipse_82%_72%_at_50%_48%,#000_0%,#000_36%,rgba(0,0,0,0.55)_58%,rgba(0,0,0,0.18)_76%,transparent_92%)]"
          >
            <Image
              src={HERO_BRAND_MARK_SRC}
              alt=""
              width={1120}
              height={640}
              priority
              sizes="(max-width:640px) 118vw, (max-width:1024px) 100vw, 84rem"
              className="h-auto w-full scale-[1.08] object-contain object-center opacity-[0.4] mix-blend-screen [filter:brightness(1.08)_contrast(0.98)_saturate(0.9)] sm:scale-[1.12] sm:opacity-[0.44] lg:scale-[1.14]"
            />
          </div>
        </div>
      </div>

      {/* Quiet depth: vignette + soft gold wash (above brand art, below particles) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_120%_80%_at_50%_45%,rgba(214,168,95,0.07),transparent_52%),radial-gradient(circle_at_0%_0%,rgba(255,154,80,0.06),transparent_35%),radial-gradient(circle_at_100%_20%,rgba(212,175,55,0.05),transparent_32%)]"
      />
      <div
        aria-hidden
        className="mystic-hero-ambient pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_85%_50%_at_50%_22%,rgba(214,168,95,0.08),transparent_58%),radial-gradient(circle_at_50%_100%,rgba(255,120,60,0.04),transparent_45%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2] shadow-[inset_0_0_100px_rgba(0,0,0,0.42),inset_0_-72px_88px_rgba(0,0,0,0.38)]"
      />

      {/* Sparkle field — subtle depth */}
      <div className="pointer-events-none absolute inset-0 z-[3]">
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

      {/* Soft gold lift — wide, diffuse (not a tight hotspot on the asset) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[3] bg-[radial-gradient(ellipse_100%_72%_at_52%_40%,rgba(214,168,95,0.06),transparent_62%)]"
      />

      {/* Legibility: left veil for headline; center stays open so the brand reads atmospheric */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[4] bg-[linear-gradient(90deg,rgba(1,2,3,0.7)_0%,rgba(1,2,3,0.22)_24%,transparent_46%,transparent_62%,rgba(1,2,3,0.12)_100%),linear-gradient(180deg,rgba(1,2,3,0.14)_0%,transparent_14%,transparent_30%,rgba(1,2,3,0.04)_50%,rgba(5,6,10,0.68)_78%,rgba(5,6,10,0.94)_90%,rgb(5,6,10)_100%),radial-gradient(ellipse_78%_62%_at_50%_38%,transparent_0%,rgba(1,2,3,0.06)_100%)]"
      />

      {/* Copy: pinned to bottom-left of hero (full-bleed width; inset matches page gutters) */}
      <div className="relative z-10 flex min-h-[90dvh] w-full flex-col px-4 pb-[max(2.75rem,env(safe-area-inset-bottom,0px))] sm:px-8 sm:pb-16 md:px-10 md:pb-20 lg:px-12 lg:pb-24 xl:px-14">
        <div className="min-h-0 flex-1" aria-hidden />
        <div
          ref={copyRef}
          className="w-full max-w-[min(36rem,calc(100vw-2rem))] shrink-0 self-start text-left sm:max-w-[min(38rem,calc(100vw-4rem))] md:max-w-[min(40rem,calc(100vw-5rem))]"
          style={{ opacity: 1 }}
        >
          <div className="relative border-l border-[rgba(214,168,95,0.28)] bg-[linear-gradient(90deg,rgba(2,3,6,0.55)_0%,rgba(2,3,6,0.08)_52%,transparent_100%)] py-1 pl-5 shadow-[inset_8px_0_32px_-8px_rgba(214,168,95,0.06)] backdrop-blur-[2px] sm:pl-7 md:pl-8">
            <div className="pointer-events-none absolute -left-px top-0 h-full w-px bg-gradient-to-b from-[rgba(214,168,95,0.55)] via-[rgba(214,168,95,0.2)] to-[rgba(214,168,95,0.08)]" aria-hidden />
            <div className="space-y-5">
              <h1
                className={`flex max-w-[min(22rem,calc(100vw-2.5rem))] flex-col gap-2 font-literata text-[clamp(1.875rem,4.5vw,3.125rem)] font-normal leading-[1.12] tracking-[0.02em] text-[#f2ebe1] antialiased [text-shadow:0_1px_32px_rgba(0,0,0,0.78),0_2px_56px_rgba(0,0,0,0.42),0_0_48px_rgba(214,168,95,0.06)] sm:max-w-[min(24rem,calc(100vw-4rem))] sm:gap-2.5 ${
                  reduce ? "" : "mystic-hero-reveal mystic-hero-reveal--title"
                }`}
              >
                <span className="block text-balance">Where</span>
                <span className="block text-balance">Beauty Transcends</span>
              </h1>
              <div
                aria-hidden
                className="flex items-center gap-3"
              >
                <span className="h-px w-14 bg-gradient-to-r from-[rgba(214,168,95,0.5)] via-[rgba(214,168,95,0.22)] to-transparent sm:w-16" />
                <span className="h-1 w-1 shrink-0 rounded-full bg-[rgba(214,168,95,0.35)] shadow-[0_0_12px_rgba(214,168,95,0.25)]" />
              </div>
            </div>

            <div
              className={`mt-11 flex w-full max-w-md flex-col gap-3 sm:mt-12 sm:flex-row sm:items-stretch sm:gap-4 ${
                reduce ? "" : "mystic-hero-reveal mystic-hero-reveal--cta"
              }`}
            >
              <div className="min-w-0 flex-1 transition-transform duration-300 ease-out hover:scale-[1.015] active:scale-[0.99]">
                <Link
                  href="/shop"
                  className="mystic-button-primary flex min-h-[48px] w-full items-center justify-center rounded-full px-6 py-3 text-[0.62rem] uppercase tracking-[0.26em] shadow-[0_8px_32px_rgba(0,0,0,0.35)] transition-shadow duration-300 hover:shadow-[0_0_40px_rgba(214,168,95,0.28),0_12px_40px_rgba(0,0,0,0.4)] sm:min-w-[12.5rem] sm:px-8"
                >
                  Shop the rituals
                </Link>
              </div>
              <div className="min-w-0 flex-1 transition-transform duration-300 ease-out hover:scale-[1.015] active:scale-[0.99]">
                <Link
                  href="/ingredients"
                  className="mystic-button-secondary flex min-h-[48px] w-full items-center justify-center rounded-full border border-[rgba(214,168,95,0.42)] bg-[rgba(2,3,6,0.35)] px-6 py-3 text-[0.62rem] uppercase tracking-[0.26em] backdrop-blur-sm transition-[box-shadow,transform,border-color] duration-300 hover:border-[rgba(214,168,95,0.55)] hover:bg-[rgba(8,9,14,0.45)] hover:shadow-[0_0_36px_rgba(214,168,95,0.12)] sm:min-w-[12.5rem] sm:px-8"
                >
                  Ingredient notes
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
