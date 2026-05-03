import Image from "next/image";
import Link from "next/link";
import type { Product } from "../lib/types";
import HomeHeroMotionEnhancer from "./HomeHeroMotionEnhancer";

/**
 * Premium Mystique hero — uses the full brand lockup (crescent + wordmark)
 * as the cinematic centerpiece of the viewport.
 *
 * The logo is placed as the dominant visual element in the upper 52 vh,
 * with a warm ember bloom behind the crescent mark and the copy block
 * anchored to the bottom-left.
 *
 * NOTE: /Mystique_Logo-removebg-preview.jpg contains valid PNG data
 * (magic bytes 89 50 4E 47) with a transparent background. Next.js Image
 * optimizer preserves the alpha channel correctly despite the .jpg ext.
 */
const HERO_LOGO_SRC = "/Mystique_Logo-removebg-preview.jpg";
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
          LAYER 0 — background photograph (heavily darkened + desaturated)
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
          className="object-cover object-[center_24%] opacity-[0.18] saturate-[0.38] contrast-[0.86] brightness-[0.68] sm:opacity-[0.22]"
        />
        {/* Deep black wash over photo */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.60)_0%,rgba(0,0,0,0.40)_42%,rgba(0,0,0,0.75)_100%)]" />
      </div>

      {/* ══════════════════════════════════════════════════════════
          LAYER 1 — warm gold / ember ambient washes
         ══════════════════════════════════════════════════════════ */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_90%_65%_at_50%_36%,rgba(214,168,95,0.15),transparent_62%),radial-gradient(circle_at_92%_12%,rgba(255,120,40,0.10),transparent_38%),radial-gradient(circle_at_8%_72%,rgba(255,100,30,0.06),transparent_44%)]"
      />

      {/* ══════════════════════════════════════════════════════════
          LAYER 2 — edge vignette + inset gold hairline frame
         ══════════════════════════════════════════════════════════ */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2] shadow-[inset_0_0_0_1px_rgba(214,168,95,0.11),inset_0_0_140px_rgba(0,0,0,0.65),inset_0_-100px_120px_rgba(0,0,0,0.55)]"
      />

      {/* ══════════════════════════════════════════════════════════
          LAYER 3 — floating ember particles
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
          LAYER 4 — bottom readability gradient
         ══════════════════════════════════════════════════════════ */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] h-[min(58%,28rem)] bg-[linear-gradient(to_top,rgba(0,0,0,0.94)_0%,rgba(0,0,0,0.45)_52%,transparent_100%)]"
      />

      {/* ══════════════════════════════════════════════════════════
          LAYER 5 — left copy-zone protection (keeps headline legible)
         ══════════════════════════════════════════════════════════ */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[5] bg-[radial-gradient(ellipse_110%_65%_at_10%_30%,rgba(0,0,0,0.80)_0%,rgba(0,0,0,0.46)_48%,transparent_72%),linear-gradient(90deg,rgba(0,0,0,0.75)_0%,rgba(0,0,0,0.40)_38%,transparent_62%)]"
      />

      {/* ══════════════════════════════════════════════════════════
          FOREGROUND — logo centerpiece + copy block
         ══════════════════════════════════════════════════════════ */}
      <div className="relative z-10 flex min-h-[100svh] w-full flex-col items-stretch px-4 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] pt-[max(7rem,calc(6rem+env(safe-area-inset-top,0px)))] sm:px-6 sm:pt-[max(7.5rem,calc(6.3rem+env(safe-area-inset-top,0px)))] md:px-10 lg:pt-[max(5rem,calc(4.6rem+env(safe-area-inset-top,0px)))] lg:px-12 xl:px-14">

        {/* ── Centered logo — cinematic focal point (upper ~52 vh) ── */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-0 flex h-[56vh] items-center justify-center"
        >
          {/* Ember bloom — warm orange-gold glow behind the crescent */}
          <div className="absolute h-[min(54vh,30rem)] w-[min(92vw,54rem)] rounded-full bg-[radial-gradient(ellipse_72%_62%_at_50%_50%,rgba(255,100,20,0.22),rgba(214,168,95,0.11)_44%,transparent_74%)] blur-[52px] opacity-85" />
          <div className="absolute h-[min(50vh,28rem)] w-[min(82vw,48rem)] rounded-full bg-[radial-gradient(ellipse_62%_56%_at_50%_50%,rgba(201,168,76,0.18),transparent_66%)] blur-[38px] opacity-75" />
          {/* Logo image */}
          <div className="relative w-[min(74vw,36rem)] sm:w-[min(62vw,38rem)] md:w-[min(50vw,40rem)] lg:w-[min(42vw,42rem)] xl:w-[min(36vw,44rem)]">
            <Image
              src={HERO_LOGO_SRC}
              alt="Mystique — Where Beauty Transcends"
              width={1080}
              height={1080}
              loading="lazy"
              sizes="(max-width: 640px) 74vw, (max-width: 1024px) 50vw, 42vw"
              className="block h-auto w-full object-contain [filter:brightness(1.06)_contrast(1.08)_saturate(1.10)] drop-shadow-[0_0_52px_rgba(255,130,30,0.50)]"
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
            <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-[rgba(214,168,95,0.24)] bg-[rgba(0,0,0,0.45)] px-4 py-2 backdrop-blur-sm">
              <span
                className="h-[5px] w-[5px] rounded-full bg-[#ff9a3c] shadow-[0_0_8px_rgba(255,154,60,0.95)]"
                aria-hidden
              />
              <span className="font-ui text-[0.62rem] uppercase tracking-[0.30em] text-[#d8c5a0]">
                Luxury Skincare
              </span>
            </div>

            {/* Headline */}
            <h1 className="mystic-hero-reveal mystic-hero-reveal--title font-playfair text-[clamp(2.2rem,5.8vw,4rem)] font-semibold leading-[1.05] tracking-[-0.01em] text-white">
              Where Beauty
              <br />
              <span className="bg-gradient-to-r from-[#f5e3b8] via-[#d4af37] to-[#e8c56e] bg-clip-text text-transparent">
                Transcends.
              </span>
            </h1>

            {/* Tagline */}
            <p className="mystic-hero-reveal mt-4 max-w-[28rem] text-[0.875rem] leading-[1.65] tracking-[0.02em] text-[#b8ab95] md:text-[0.9375rem]">
              Formulas built for ritual. Textures that reward repetition.
              Ingredients chosen with clarity.
            </p>

            {/* CTAs */}
            <div className="mystic-hero-reveal mystic-hero-reveal--cta mt-7 flex flex-col items-stretch justify-start gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/shop"
                className="inline-flex min-h-[50px] w-full items-center justify-center rounded-full bg-gradient-to-r from-[#C9A84C] to-[#e8c56e] px-8 py-3 font-ui text-[0.68rem] font-bold uppercase tracking-[0.26em] text-black shadow-[0_0_28px_rgba(201,168,76,0.35),0_14px_36px_rgba(0,0,0,0.58)] transition duration-200 hover:shadow-[0_0_44px_rgba(201,168,76,0.52),0_18px_44px_rgba(0,0,0,0.62)] hover:scale-[1.02] active:scale-[0.99] motion-reduce:transition-none motion-reduce:hover:scale-100 sm:w-auto sm:min-w-[13.5rem]"
              >
                Shop the Rituals
              </Link>
              <Link
                href="/ingredients"
                className="inline-flex min-h-[50px] w-full items-center justify-center rounded-full border border-[rgba(212,175,55,0.40)] bg-[rgba(0,0,0,0.38)] px-8 py-3 font-ui text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#e8d8b0] shadow-[0_10px_28px_rgba(0,0,0,0.44)] backdrop-blur-sm transition duration-200 hover:border-[rgba(212,175,55,0.62)] hover:bg-[rgba(201,168,76,0.09)] hover:text-[#f5e8c6] hover:scale-[1.02] active:scale-[0.99] motion-reduce:transition-none motion-reduce:hover:scale-100 sm:w-auto sm:min-w-[13.5rem]"
              >
                Ingredient Notes
              </Link>
            </div>

            {/* Scroll cue */}
            <div className="mt-10 hidden items-center gap-3 sm:flex" aria-hidden>
              <div className="h-px w-8 bg-gradient-to-r from-[rgba(214,168,95,0.52)] to-transparent" />
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
