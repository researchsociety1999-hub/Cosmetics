import Image from "next/image";
import Link from "next/link";
import type { Product } from "../lib/types";
import HomeHeroMotionEnhancer from "./HomeHeroMotionEnhancer";

/** Wide lockup: wordmark + tagline + arc — `/public` asset (prefer export with transparency). */
const HERO_BRAND_MARK_SRC = "/mystique-brand-logo.png";

export function HomeHeroMotion({
  quickViewProduct: _quickViewProduct = null,
}: {
  /** Reserved for homepage merchandising; kept for API compatibility. */
  quickViewProduct?: Product | null;
}) {
  return (
    <section
      data-hero-section="home"
      className="relative left-1/2 -mt-[max(6.75rem,calc(5.75rem+env(safe-area-inset-top,0px)))] min-h-[100svh] w-screen -translate-x-1/2 overflow-hidden sm:-mt-[max(7rem,calc(5.9rem+env(safe-area-inset-top,0px)))] md:-mt-[4.65rem]"
    >
      {/* —— Atmosphere (behind all content) —— */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
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
      <div className="relative z-10 flex min-h-[100svh] w-full flex-col items-stretch px-4 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] pt-[max(7.25rem,calc(6.1rem+env(safe-area-inset-top,0px)))] sm:px-6 sm:pt-[max(7.5rem,calc(6.3rem+env(safe-area-inset-top,0px)))] md:px-10 md:pt-[max(5.25rem,calc(4.75rem+env(safe-area-inset-top,0px)))] lg:px-12 xl:px-14">
        <div className="flex min-h-0 flex-1 flex-col justify-start">
          {/* Brand mark: max 52vh */}
          <div className="mx-auto flex w-full max-w-[min(92rem,calc(100vw-2rem))] items-center justify-center">
            <div className="relative w-full max-w-[min(60rem,96vw)]">
              <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 h-[min(52vh,26rem)] w-[min(96vw,58rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_70%_58%_at_50%_44%,rgba(214,168,95,0.14)_0%,rgba(214,168,95,0.06)_28%,rgba(8,9,16,0.35)_56%,transparent_78%)] blur-[22px] opacity-[0.95]"
              />
              <Image
                src={HERO_BRAND_MARK_SRC}
                alt="Mystique logo in metallic gold with arc linework, on a dark background"
                width={1024}
                height={682}
                priority
                sizes="(max-width: 640px) 92vw, (max-width: 1024px) 80vw, 960px"
                className="relative mx-auto block h-auto max-h-[52vh] w-full object-contain object-center opacity-[0.92] [filter:brightness(1.08)_contrast(1.06)_saturate(1.02)] drop-shadow-[0_10px_44px_rgba(0,0,0,0.5),0_0_70px_rgba(214,168,95,0.075)]"
              />
            </div>
          </div>

          {/* Copy block: immediately below mark */}
          <div
            data-hero-copy="home"
            className="mx-auto w-full max-w-[56rem] pt-6 text-center md:pt-8"
            style={{ opacity: 1 }}
          >
            <h1 className="font-playfair text-[40px] leading-[1.06] font-semibold tracking-[-0.01em] text-white md:text-[64px] mystic-hero-reveal mystic-hero-reveal--title">
              Where Beauty Transcends.
            </h1>
            <p className="font-playfair mt-4 text-[18px] leading-[1.6] italic text-[#C9A84C] md:text-[20px]">
              Premium rituals for luminous skin.
            </p>

            <div className="mystic-hero-reveal mystic-hero-reveal--cta mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:gap-4">
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
