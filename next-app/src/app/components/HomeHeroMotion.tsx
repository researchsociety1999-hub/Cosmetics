import Image from "next/image";
import Link from "next/link";
import type { Product } from "../lib/types";
import HomeHeroMotionEnhancer from "./HomeHeroMotionEnhancer";

/** Wide lockup: wordmark + tagline + arc — `/public` asset (prefer export with transparency). */
const HERO_BRAND_MARK_SRC = "/Mystique_Logo-removebg-preview.jpg";

export function HomeHeroMotion({
  quickViewProduct: _quickViewProduct = null,
}: {
  /** Reserved for homepage merchandising; kept for API compatibility. */
  quickViewProduct?: Product | null;
}) {
  void _quickViewProduct;
  return (
    <section
      data-hero-section="home"
      className="relative left-1/2 -mt-[max(6.75rem,calc(5.75rem+env(safe-area-inset-top,0px)))] min-h-[100svh] w-[100dvw] -translate-x-1/2 overflow-hidden bg-[radial-gradient(ellipse_80%_60%_at_50%_30%,oklch(0.10_0.025_55)_0%,oklch(0.05_0.01_55)_60%,oklch(0.04_0_0)_100%)] sm:-mt-[max(7rem,calc(5.9rem+env(safe-area-inset-top,0px)))] lg:-mt-[4.65rem]"
    >
      {/* —— Atmosphere (behind all content) —— */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        {/* Primary marble wallpaper presence (derived directly from attached image). */}
        <div
          aria-hidden
          className="absolute inset-[-12%] opacity-[0.55] sm:opacity-[0.6] md:opacity-[0.66] bg-[image:var(--mystique-wallpaper-url)] bg-cover bg-no-repeat bg-[position:55%_42%] [filter:brightness(0.92)_contrast(1.12)_saturate(1.06)]"
          style={{
            WebkitMaskImage:
              "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 34%, rgba(0,0,0,0.75) 62%, rgba(0,0,0,1) 100%)",
            maskImage:
              "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 34%, rgba(0,0,0,0.75) 62%, rgba(0,0,0,1) 100%)",
          }}
        />
        {/* LCP hero <Image>: prioritized + discoverable immediately (priority, fetchPriority, eager loading, realistic sizes). */}
        <Image
          src="/about/hero.jpg"
          alt=""
          fill
          priority
          fetchPriority="high"
          loading="eager"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 100vw, 1280px"
          quality={88}
          className="home-hero-studio-bg object-cover object-[center_24%] opacity-[0.28] saturate-[0.58] contrast-[0.92] brightness-[0.78] sm:opacity-[0.32] sm:object-[center_28%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(175deg,rgba(6,5,9,0.62)_0%,rgba(3,4,10,0.42)_40%,rgba(4,5,12,0.72)_100%)]" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/10 via-black/30 to-black/70"
      />
      {/* Marble-vein material layer (hero only): masked away from left copy block. */}
      <div aria-hidden className="mystique-vein-layer absolute inset-0 z-[1]" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_100%_60%_at_50%_18%,rgba(214,168,95,0.12),transparent_55%),radial-gradient(circle_at_90%_18%,rgba(255,154,80,0.07),transparent_38%),radial-gradient(circle_at_10%_45%,rgba(120,90,160,0.06),transparent_42%),linear-gradient(168deg,rgba(10,8,14,0.85)_0%,rgba(4,5,10,0.9)_45%,rgb(2,3,7)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(100deg,rgba(1,2,4,0.55)_0%,rgba(1,2,4,0.22)_38%,rgba(1,2,4,0.08)_55%,rgba(1,2,4,0.35)_100%)]"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 bg-[#020308]/18" />

      {/* Soft gold wash — stays behind hero UI */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_130%_85%_at_50%_42%,rgba(214,168,95,0.09),transparent_58%),radial-gradient(circle_at_0%_0%,rgba(255,154,80,0.05),transparent_38%),radial-gradient(circle_at_100%_25%,rgba(212,175,55,0.04),transparent_34%)]"
      />
      <div
        aria-hidden
        className="mystic-hero-ambient pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_90%_55%_at_50%_20%,rgba(214,168,95,0.06),transparent_60%),radial-gradient(circle_at_50%_100%,rgba(255,120,60,0.03),transparent_48%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] shadow-[inset_0_0_80px_rgba(0,0,0,0.35),inset_0_-48px_64px_rgba(0,0,0,0.28)]"
      />

      {/* Particles — subtle, below copy + logo stack */}
      <div className="pointer-events-none absolute inset-0 z-[2] opacity-[0.72]">
        <span
          className="mystic-particle mystic-particle-md left-[14%] top-[18%] opacity-[0.85]"
          style={{ animationDelay: "-1.2s" }}
        />
        <span
          className="mystic-particle mystic-particle-sm left-[80%] top-[22%] opacity-[0.75]"
          style={{ animationDelay: "-3.4s" }}
        />
        <span
          className="mystic-particle mystic-particle-lg left-[86%] top-[52%] opacity-[0.65]"
          style={{ animationDelay: "-0.6s" }}
        />
        <span
          className="mystic-particle mystic-particle-sm left-[46%] top-[68%] opacity-[0.48]"
          style={{ animationDelay: "-5.1s" }}
        />
        <span
          className="mystic-particle mystic-particle-sm left-[22%] top-[54%] opacity-[0.42]"
          style={{ animationDelay: "-2.8s" }}
        />
        <span
          className="mystic-particle mystic-particle-md left-[58%] top-[12%] opacity-[0.4]"
          style={{ animationDelay: "-4.2s" }}
        />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_95%_70%_at_50%_38%,rgba(214,168,95,0.05),transparent_65%)]"
      />

      {/* Bottom readability only — does not veil the centered mark */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-[min(52%,24rem)] bg-[linear-gradient(to_top,rgba(3,4,10,0.88)_0%,rgba(3,4,10,0.35)_52%,transparent_100%)] md:h-[min(48%,22rem)]"
      />

      {/* —— Foreground: 52vh mark + content block below (Phase 2A) —— */}
      <div className="relative z-10 flex min-h-[100svh] w-full flex-col items-stretch px-4 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] pt-[max(7.25rem,calc(6.1rem+env(safe-area-inset-top,0px)))] sm:px-6 sm:pt-[max(7.5rem,calc(6.3rem+env(safe-area-inset-top,0px)))] md:px-10 lg:pt-[max(5.25rem,calc(4.75rem+env(safe-area-inset-top,0px)))] lg:px-12 xl:px-14">
        <div className="relative flex min-h-0 flex-1 items-end pb-10 sm:pb-12 lg:pb-14">
          {/* Watermark logo (cinematic, integrated): sits behind copy, centered/right. */}
          <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
            <div className="absolute left-1/2 top-[46%] h-[min(60vh,32rem)] w-[min(120vw,84rem)] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_70%_55%_at_55%_50%,rgba(2,3,7,0.40)_0%,rgba(2,3,7,0.16)_55%,rgba(2,3,7,0)_100%)] opacity-[0.55]" />
            <div className="absolute left-1/2 top-[46%] h-[min(54vh,30rem)] w-[min(110vw,78rem)] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_60%_55%_at_55%_50%,rgba(201,168,76,0.11)_0%,rgba(201,168,76,0.05)_32%,transparent_72%)] blur-[22px] opacity-[0.30]" />
            <div className="absolute left-1/2 top-[46%] w-[min(120vw,92rem)] -translate-x-1/2 -translate-y-1/2 opacity-[0.26] sm:opacity-[0.30] md:opacity-[0.34]">
              <Image
                src={HERO_BRAND_MARK_SRC}
                alt=""
                width={1600}
                height={900}
                priority
                sizes="(max-width: 768px) 110vw, (max-width: 1280px) 120vw, 1440px"
                className="mx-auto block h-auto w-full object-contain object-center [filter:brightness(0.96)_contrast(1.04)_saturate(0.98)]"
              />
            </div>
          </div>

          {/* Copy block (left, anchored; logo remains the hero mood behind). */}
          <div
            data-hero-copy="home"
            className="relative z-10 w-full max-w-[34rem] pt-2 text-left md:max-w-[38rem] lg:max-w-[40rem]"
            style={{ opacity: 1 }}
          >
            <h1 className="font-playfair text-[40px] leading-[1.06] font-semibold tracking-[-0.01em] text-white md:text-[64px] mystic-hero-reveal mystic-hero-reveal--title">
              Where Beauty Transcends.
            </h1>

            <div className="mystic-hero-reveal mystic-hero-reveal--cta mt-6 flex flex-col items-stretch justify-start gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/shop"
                className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-[#C9A84C] px-8 py-3 font-ui text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-black shadow-[0_14px_36px_rgba(0,0,0,0.45)] transition duration-200 hover:shadow-[0_0_32px_rgba(201,168,76,0.22),0_16px_42px_rgba(0,0,0,0.5)] hover:scale-[1.02] active:scale-[0.99] motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100 sm:w-auto sm:min-w-[14rem]"
              >
                Shop the rituals
              </Link>
              <Link
                href="/ingredients"
                className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full border border-[#C9A84C] bg-transparent px-8 py-3 font-ui text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-white shadow-[0_10px_28px_rgba(0,0,0,0.38)] transition duration-200 hover:bg-white/5 hover:shadow-[0_0_28px_rgba(201,168,76,0.16)] hover:scale-[1.02] active:scale-[0.99] motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100 sm:w-auto sm:min-w-[14rem]"
              >
                Ingredient notes
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Progressive enhancement: loads scroll-linked fade after first paint. */}
      <HomeHeroMotionEnhancer />
    </section>
  );
}
