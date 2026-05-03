import Image from "next/image";
import Link from "next/link";
import type { Product } from "../lib/types";
import HomeHeroMotionEnhancer from "./HomeHeroMotionEnhancer";

/**
 * Premium Mystique hero — uses the full brand lockup (crescent + wordmark)
 * as the cinematic centerpiece of the viewport, with the copy block anchored
 * bottom-left below it.
 *
 * Image source priority:
 *  1. /Mystique_Logo_Premium.png — uploaded hi-res PNG with transparent bg
 *  2. /Mystique_Logo-removebg-preview.jpg — fallback (same data, .jpg ext)
 */
const HERO_LOGO_SRC = "/Mystique_Logo_Premium.png";
const HERO_BG_SRC = "/about/hero.jpg";

export function HomeHeroMotion({
  quickViewProduct: _quickViewProduct = null,
}: {
  quickViewProduct?: Product | null;
}) {
  void _quickViewProduct;
  return (
    <section
      data-hero-section="home"
      className="relative left-1/2 -mt-[max(6.75rem,calc(5.75rem+env(safe-area-inset-top,0px)))] min-h-[100svh] w-[100dvw] -translate-x-1/2 overflow-hidden bg-black sm:-mt-[max(7rem,calc(5.9rem+env(safe-area-inset-top,0px)))] lg:-mt-[4.65rem]"
    >
      {/* ══════════════════════════════════════════════════════════
          LAYER 0 – background photograph (darkened, desaturated)
         ══════════════════════════════════════════════════════════ */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <Image
          src={HERO_BG_SRC}
          alt=""
          fill
          priority
          fetchPriority="high"
          loading="eager"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 100vw, 1280px"
          quality={88}
          className="object-cover object-[center_24%] opacity-[0.18] saturate-[0.4] contrast-[0.88] brightness-[0.7] sm:opacity-[0.22]"
        />
        {/* Deep black wash on top of photo */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.38)_40%,rgba(0,0,0,0.72)_100%)]" />
      </div>

      {/* ══════════════════════════════════════════════════════════
          LAYER 1 – warm gold / ember ambient washes
         ══════════════════════════════════════════════════════════ */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_90%_65%_at_50%_38%,rgba(214,168,95,0.14),transparent_62%),radial-gradient(circle_at_92%_12%,rgba(255,120,40,0.09),transparent_38%),radial-gradient(circle_at_8%_72%,rgba(255,100,30,0.05),transparent_44%)]"
      />

      {/* ══════════════════════════════════════════════════════════
          LAYER 2 – edge vignette + inset gold hairline
         ══════════════════════════════════════════════════════════ */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2] shadow-[inset_0_0_0_1px_rgba(214,168,95,0.10),inset_0_0_140px_rgba(0,0,0,0.62),inset_0_-100px_120px_rgba(0,0,0,0.52)]"
      />

      {/* ══════════════════════════════════════════════════════════
          LAYER 3 – floating ember particles
         ══════════════════════════════════════════════════════════ */}
      <div className="pointer-events-none absolute inset-0 z-[3] opacity-[0.65]">
        <span className="mystic-particle mystic-particle-md left-[12%] top-[16%] opacity-80" style={{ animationDelay: "-1.2s" }} />
        <span className="mystic-particle mystic-particle-sm left-[82%] top-[20%] opacity-70" style={{ animationDelay: "-3.4s" }} />
        <span className="mystic-particle mystic-particle-lg left-[88%] top-[50%] opacity-60" style={{ animationDelay: "-0.6s" }} />
        <span className="mystic-particle mystic-particle-sm left-[44%] top-[70%] opacity-45" style={{ animationDelay: "-5.1s" }} />
        <span className="mystic-particle mystic-particle-sm left-[20%] top-[56%] opacity-38" style={{ animationDelay: "-2.8s" }} />
        <span className="mystic-particle mystic-particle-md left-[60%] top-[10%] opacity-35" style={{ animationDelay: "-4.2s" }} />
      </div>

      {/* ══════════════════════════════════════════════════════════
          LAYER 4 – bottom readability gradient (above photo, below UI)
         ══════════════════════════════════════════════════════════ */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] h-[min(55%,26rem)] bg-[linear-gradient(to_top,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.42)_52%,transparent_100%)]"
      />

      {/* ══════════════════════════════════════════════════════════
          LAYER 5 – left copy-zone guard (keeps headline legible)
         ══════════════════════════════════════════════════════════ */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[5] bg-[radial-gradient(ellipse_110%_65%_at_12%_28%,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.44)_48%,transparent_72%),linear-gradient(90deg,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.38)_38%,transparent_62%)]"
      />

      {/* ══════════════════════════════════════════════════════════
          FOREGROUND — logo centerpiece + copy block
         ══════════════════════════════════════════════════════════ */}
      <div className="relative z-10 flex min-h-[100svh] w-full flex-col items-stretch px-4 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] pt-[max(7rem,calc(6rem+env(safe-area-inset-top,0px)))] sm:px-6 sm:pt-[max(7.5rem,calc(6.3rem+env(safe-area-inset-top,0px)))] md:px-10 lg:pt-[max(5rem,calc(4.6rem+env(safe-area-inset-top,0px)))] lg:px-12 xl:px-14">

        {/* ── Centered logo cinematic block (upper ~52 vh) ── */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 flex h-[54vh] items-center justify-center" aria-hidden>
          {/* Ember bloom behind the crescent */}
          <div className="absolute h-[min(52vh,28rem)] w-[min(90vw,52rem)] rounded-full bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(255,100,20,0.20),rgba(214,168,95,0.10)_42%,transparent_72%)] blur-[48px] opacity-80" />
          <div className="absolute h-[min(48vh,26rem)] w-[min(80vw,46rem)] rounded-full bg-[radial-gradient(ellipse_60%_55%_at_50%_50%,rgba(201,168,76,0.16),transparent_65%)] blur-[36px] opacity-70" />
          {/* The logo itself */}
          <div className="relative w-[min(72vw,34rem)] sm:w-[min(64vw,36rem)] md:w-[min(52vw,38rem)] lg:w-[min(44vw,40rem)] xl:w-[min(38vw,42rem)]">
            <Image
              src={HERO_LOGO_SRC}
              alt="Mystique — Where Beauty Transcends"
              width={1080}
              height={1080}
              loading="lazy"
              sizes="(max-width: 640px) 72vw, (max-width: 1024px) 52vw, 42vw"
              className="block h-auto w-full object-contain [filter:brightness(1.04)_contrast(1.06)_saturate(1.08)] drop-shadow-[0_0_48px_rgba(255,130,30,0.45)]"
            />
          </div>
        </div>

        {/* ── Copy block — anchored bottom-left ── */}
        <div className="relative flex min-h-0 flex-1 items-end pb-10 sm:pb-12 lg:pb-16">
          <div
            data-hero-copy="home"
            className="relative z-10 w-full max-w-[32rem] pt-2 text-left md:max-w-[36rem] lg:max-w-[38rem]"
          >
            {/* Eyebrow pill */}
            <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-[rgba(214,168,95,0.22)] bg-[rgba(0,0,0,0.42)] px-4 py-2 backdrop-blur-sm">
              <span className="h-[5px] w-[5px] rounded-full bg-[#ff9a3c] shadow-[0_0_8px_rgba(255,154,60,0.9)]" aria-hidden />
              <span className="font-ui text-[0.62rem] uppercase tracking-[0.30em] text-[#d8c5a0]">
                Luxury Skincare
              </span>
            </div>

            {/* Headline */}
            <h1 className="mystic-hero-reveal mystic-hero-reveal--title font-playfair text-[clamp(2.2rem,6vw,4rem)] font-semibold leading-[1.05] tracking-[-0.01em] text-white">
              Where Beauty
              <br />
              <span className="bg-gradient-to-r from-[#f5e3b8] via-[#d4af37] to-[#e8c56e] bg-clip-text text-transparent">
                Transcends.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mystic-hero-reveal mt-4 max-w-[28rem] text-[0.875rem] leading-[1.65] tracking-[0.02em] text-[#b8ab95] md:text-[0.9375rem]">
              Formulas built for ritual. Textures that reward repetition.
              Ingredients chosen with clarity.
            </p>

            {/* CTA buttons */}
            <div className="mystic-hero-reveal mystic-hero-reveal--cta mt-7 flex flex-col items-stretch justify-start gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/shop"
                className="inline-flex min-h-[50px] w-full items-center justify-center rounded-full bg-gradient-to-r from-[#C9A84C] to-[#e8c56e] px-8 py-3 font-ui text-[0.68rem] font-bold uppercase tracking-[0.26em] text-black shadow-[0_0_28px_rgba(201,168,76,0.32),0_14px_36px_rgba(0,0,0,0.55)] transition duration-200 hover:shadow-[0_0_42px_rgba(201,168,76,0.48),0_18px_44px_rgba(0,0,0,0.6)] hover:scale-[1.02] active:scale-[0.99] motion-reduce:transition-none motion-reduce:hover:scale-100 sm:w-auto sm:min-w-[13.5rem]"
              >
                Shop the Rituals
              </Link>
              <Link
                href="/ingredients"
                className="inline-flex min-h-[50px] w-full items-center justify-center rounded-full border border-[rgba(212,175,55,0.38)] bg-[rgba(0,0,0,0.35)] px-8 py-3 font-ui text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#e8d8b0] shadow-[0_10px_28px_rgba(0,0,0,0.42)] backdrop-blur-sm transition duration-200 hover:border-[rgba(212,175,55,0.60)] hover:bg-[rgba(201,168,76,0.08)] hover:text-[#f5e8c6] hover:scale-[1.02] active:scale-[0.99] motion-reduce:transition-none motion-reduce:hover:scale-100 sm:w-auto sm:min-w-[13.5rem]"
              >
                Ingredient Notes
              </Link>
            </div>

            {/* Scroll cue */}
            <div className="mt-10 hidden items-center gap-3 sm:flex" aria-hidden>
              <div className="h-px w-8 bg-gradient-to-r from-[rgba(214,168,95,0.5)] to-transparent" />
              <span className="font-ui text-[0.58rem] uppercase tracking-[0.30em] text-[#7a6e5e]">
                Scroll to explore
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progressive enhancement: scroll-linked fade */}
      <HomeHeroMotionEnhancer />
    </section>
  );
}
