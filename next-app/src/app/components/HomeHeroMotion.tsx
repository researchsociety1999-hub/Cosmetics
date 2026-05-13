import Image from "next/image";
import Link from "next/link";
import { mystiqueLayoutClass } from "../lib/mystiqueLayoutClasses";
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
 * Fix log:
 *  - Switched HERO_LOGO_SRC from the misnamed .jpg (PNG data) to
 *    /mystique-hero-logo.png — a proper PNG with real transparency.
 *  - Added `priority` prop to the logo Image so Next.js emits
 *    fetchPriority="high" + loading="eager", fixing the delayed LCP.
 *  - Removed `aria-hidden` from the logo container — the brand mark
 *    should be accessible to screen readers.
 *  - Corrected intrinsic dimensions to 800×800 to match the actual
 *    square canvas; object-contain handles the wide lockup within it.
 */
const HERO_LOGO_SRC = "/mystique-hero-logo.png";
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
      className={`${mystiqueLayoutClass.firstSection} relative left-1/2 min-h-[100svh] w-[100dvw] -translate-x-1/2 overflow-hidden bg-black`}
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
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_90%_65%_at_50%_36%,rgba(214,168,95,0.09),transparent_62%),radial-gradient(circle_at_92%_12%,rgba(255,120,40,0.05),transparent_38%),radial-gradient(circle_at_8%_72%,rgba(255,100,30,0.035),transparent_44%)]"
      />

      {/* ══════════════════════════════════════════════════════════
          LAYER 2 — edge vignette + inset gold hairline frame
         ══════════════════════════════════════════════════════════ */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2] shadow-[inset_0_0_0_1px_rgba(214,168,95,0.065),inset_0_0_160px_rgba(0,0,0,0.58),inset_0_-120px_140px_rgba(0,0,0,0.5)]"
      />

      {/* ══════════════════════════════════════════════════════════
          LAYER 3 — floating ember particles
         ══════════════════════════════════════════════════════════ */}
      <div className="pointer-events-none absolute inset-0 z-[3] opacity-[0.38]">
        <span className="mystic-particle mystic-particle-md left-[12%] top-[16%] opacity-55" style={{ animationDelay: "-1.2s" }} />
        <span className="mystic-particle mystic-particle-sm left-[82%] top-[20%] opacity-48" style={{ animationDelay: "-3.4s" }} />
        <span className="mystic-particle mystic-particle-lg left-[88%] top-[50%] opacity-42" style={{ animationDelay: "-0.6s" }} />
        <span className="mystic-particle mystic-particle-sm left-[44%] top-[70%] opacity-32" style={{ animationDelay: "-5.1s" }} />
        <span className="mystic-particle mystic-particle-sm left-[20%] top-[56%] opacity-28" style={{ animationDelay: "-2.8s" }} />
        <span className="mystic-particle mystic-particle-md left-[60%] top-[10%] opacity-26" style={{ animationDelay: "-4.2s" }} />
      </div>

      {/* ══════════════════════════════════════════════════════════
          LAYER 4 — bottom readability gradient
         ══════════════════════════════════════════════════════════ */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] h-[min(56%,26rem)] bg-[linear-gradient(to_top,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.38)_55%,transparent_100%)]"
      />

      {/* ══════════════════════════════════════════════════════════
          LAYER 5 — left copy-zone protection (keeps headline legible)
         ══════════════════════════════════════════════════════════ */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[5] bg-[radial-gradient(ellipse_110%_65%_at_10%_30%,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.38)_50%,transparent_74%),linear-gradient(90deg,rgba(0,0,0,0.68)_0%,rgba(0,0,0,0.32)_40%,transparent_64%)]"
      />

      {/* ══════════════════════════════════════════════════════════
          FOREGROUND — logo centerpiece + copy block
         ══════════════════════════════════════════════════════════ */}
      <div className="relative z-10 flex min-h-[100svh] w-full flex-col items-stretch px-5 pb-[max(2rem,env(safe-area-inset-bottom,0px))] pt-[max(1.25rem,env(safe-area-inset-top,0px))] sm:px-8 md:px-12 lg:px-14 xl:px-16">

        {/* ── Centered logo — cinematic focal point (upper ~52 vh) ── */}
        {/* aria-hidden removed: the brand lockup is meaningful content */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-0 flex h-[56vh] items-center justify-center"
        >
          {/* Ember bloom — warm orange-gold glow behind the crescent */}
          <div className="absolute h-[min(54vh,30rem)] w-[min(92vw,54rem)] rounded-full bg-[radial-gradient(ellipse_72%_62%_at_50%_50%,rgba(255,100,20,0.14),rgba(214,168,95,0.075)_44%,transparent_74%)] blur-[56px] opacity-70" />
          <div className="absolute h-[min(50vh,28rem)] w-[min(82vw,48rem)] rounded-full bg-[radial-gradient(ellipse_62%_56%_at_50%_50%,rgba(201,168,76,0.11),transparent_66%)] blur-[44px] opacity-62" />
          {/* Logo image — proper PNG with transparency, priority-loaded as LCP element */}
          <div className="relative w-[min(74vw,36rem)] sm:w-[min(62vw,38rem)] md:w-[min(50vw,40rem)] lg:w-[min(42vw,42rem)] xl:w-[min(36vw,44rem)]">
            <Image
              src={HERO_LOGO_SRC}
              alt="Mystique — Where Beauty Transcends"
              width={800}
              height={800}
              priority
              sizes="(max-width: 640px) 74vw, (max-width: 1024px) 50vw, 42vw"
              className="block h-auto w-full object-contain [filter:brightness(1.02)_contrast(1.04)_saturate(1.03)] drop-shadow-[0_0_40px_rgba(214,168,95,0.14)]"
            />
          </div>
        </div>

        {/* ── Copy block — anchored bottom-left ── */}
        <div className="relative flex min-h-0 flex-1 items-end pb-12 sm:pb-14 lg:pb-[4.5rem]">
          <div
            data-hero-copy="home"
            className="relative z-10 w-full max-w-[32rem] pt-4 text-left md:max-w-[36rem] lg:max-w-[38rem]"
          >
            {/* Eyebrow pill */}
            <div className="mystic-hero-reveal-pill mb-6 inline-flex items-center gap-2.5 rounded-full border border-[rgba(214,168,95,0.14)] bg-[rgba(0,0,0,0.35)] px-4 py-2 backdrop-blur-sm">
              <span
                className="h-[3px] w-[3px] rounded-full bg-[rgba(214,168,95,0.55)] shadow-[0_0_6px_rgba(214,168,95,0.18)]"
                aria-hidden
              />
              <span className="font-ui text-[0.6rem] uppercase tracking-[0.34em] text-[#c9bba5]">
                Luxury Skincare
              </span>
            </div>

            {/* Headline */}
            <h1 className="mystic-hero-reveal mystic-hero-reveal--title font-playfair text-[clamp(2.1rem,5.2vw,3.65rem)] font-light leading-[1.1] tracking-[0.02em] text-[#f4f0ea]">
              Where Beauty
              <br />
              <span className="bg-gradient-to-r from-[#e8e0d4] via-[#b89a68] to-[#d2c4a8] bg-clip-text text-transparent">
                Transcends.
              </span>
            </h1>

            {/* Tagline */}
            <p className="mystic-hero-reveal--sub mt-5 max-w-[28rem] text-[0.875rem] leading-[1.72] tracking-[0.04em] text-[#a99e8c] md:text-[0.9375rem]">
              Formulas built for ritual. Textures that reward repetition.
              Ingredients chosen with clarity.
            </p>

            {/* CTAs */}
            <div className="mystic-hero-reveal mystic-hero-reveal--cta mt-9 flex flex-col items-stretch justify-start gap-3.5 sm:flex-row sm:items-center sm:gap-5">
              <Link
                href="/shop"
                className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full border border-[rgba(212,175,55,0.26)] bg-[rgba(6,7,11,0.5)] px-8 py-3 font-ui text-[0.63rem] font-medium uppercase tracking-[0.34em] text-[#e8e2d8] shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_8px_28px_rgba(0,0,0,0.28)] backdrop-blur-sm transition-[border-color,background-color,color,box-shadow] duration-[580ms] ease-out hover:border-[rgba(212,175,55,0.38)] hover:bg-[rgba(11,10,15,0.58)] hover:text-[#faf8f4] motion-reduce:transition-none sm:w-auto sm:min-w-[12.5rem]"
              >
                Shop the Rituals
              </Link>
              <Link
                href="/ingredients"
                className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full border border-[rgba(255,255,255,0.05)] bg-transparent px-8 py-3 font-ui text-[0.61rem] font-medium uppercase tracking-[0.32em] text-[#847a6e] transition-[border-color,color,background-color] duration-[580ms] ease-out hover:border-[rgba(212,175,55,0.14)] hover:bg-[rgba(255,255,255,0.02)] hover:text-[#b8ab9c] motion-reduce:transition-none sm:w-auto sm:min-w-[11.5rem]"
              >
                Ingredient Notes
              </Link>
            </div>

            {/* Scroll cue */}
            <div className="mt-12 hidden items-center gap-3.5 sm:flex" aria-hidden>
              <div className="h-px w-10 bg-gradient-to-r from-[rgba(214,168,95,0.28)] to-transparent" />
              <span className="font-ui text-[0.56rem] uppercase tracking-[0.34em] text-[#6e665c]">
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
