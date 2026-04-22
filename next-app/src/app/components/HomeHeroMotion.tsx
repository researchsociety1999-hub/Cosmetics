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

      {/* —— Foreground: logo band + bottom copy (no overlap) —— */}
      <div className="absolute inset-0 z-10 flex min-h-[100svh] w-full flex-col">
        {/* Logo: primary focal — large, bright, centered in upper stage */}
        <div
          aria-hidden
          className="relative flex min-h-0 flex-1 items-center justify-center px-3 pt-2 pb-4 sm:px-6 sm:pb-6 md:px-10 md:pb-8"
        >
          <div className="pointer-events-none absolute left-1/2 top-[46%] hidden h-[min(52vh,38rem)] w-[min(140vw,72rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_72%_58%_at_50%_50%,rgba(214,168,95,0.2),rgba(214,168,95,0.07)_42%,transparent_74%)] blur-3xl md:block" />
          <div className="pointer-events-none absolute left-1/2 top-[48%] h-[min(40vh,16rem)] w-[min(130vw,48rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_68%_56%_at_50%_50%,rgba(255,200,140,0.1),transparent_70%)] blur-2xl md:hidden" />
          <div className="relative isolate mx-auto w-full max-w-[min(96vw,56rem)] sm:max-w-[min(94vw,64rem)] md:max-w-[min(88vw,72rem)] lg:max-w-[min(84vw,80rem)]">
            {/*
              Seamless integration: soft “studio” plate + screen blend + edge feather masks the export matte
              so the lockup reads as part of the scene, not a pasted rectangle.
            */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 h-[min(92%,34rem)] w-[min(104%,54rem)] max-w-[118vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_70%_58%_at_50%_44%,rgba(214,168,95,0.14)_0%,rgba(214,168,95,0.06)_28%,rgba(8,9,16,0.35)_56%,transparent_78%)] blur-[22px] opacity-[0.9]"
            />
            <div
              className="relative z-[1] w-full [mask-image:radial-gradient(ellipse_92%_86%_at_50%_48%,#000_0%,#000_64%,rgba(0,0,0,0.7)_76%,rgba(0,0,0,0.18)_86%,transparent_100%),linear-gradient(to_bottom,#000_0%,#000_56%,rgba(0,0,0,0.42)_74%,transparent_100%),linear-gradient(to_right,transparent_0%,rgba(0,0,0,0.6)_12%,#000_28%,#000_72%,rgba(0,0,0,0.6)_88%,transparent_100%)] [-webkit-mask-image:radial-gradient(ellipse_92%_86%_at_50%_48%,#000_0%,#000_64%,rgba(0,0,0,0.7)_76%,rgba(0,0,0,0.18)_86%,transparent_100%),linear-gradient(to_bottom,#000_0%,#000_56%,rgba(0,0,0,0.42)_74%,transparent_100%),linear-gradient(to_right,transparent_0%,rgba(0,0,0,0.6)_12%,#000_28%,#000_72%,rgba(0,0,0,0.6)_88%,transparent_100%)] [mask-repeat:no-repeat] [-webkit-mask-repeat:no-repeat]"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[38%] bg-[linear-gradient(to_top,rgba(3,4,10,0.62)_0%,rgba(3,4,10,0.18)_55%,transparent_100%)]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_72%_58%_at_50%_46%,transparent_0%,rgba(2,3,8,0.26)_54%,rgba(2,3,8,0.72)_100%)] mix-blend-multiply opacity-[0.72]"
              />
              <Image
                src={HERO_BRAND_MARK_SRC}
                alt=""
                width={1024}
                height={682}
                priority
                sizes="(max-width: 640px) 96vw, (max-width: 768px) 94vw, (max-width: 1024px) 88vw, (max-width: 1280px) 84vw, 80rem"
                className="relative z-[1] h-auto w-full object-contain object-center mix-blend-screen opacity-[0.86] md:opacity-[0.92] [filter:brightness(1.12)_contrast(1.06)_saturate(1.02)] [image-rendering:auto] drop-shadow-[0_10px_44px_rgba(0,0,0,0.5),0_0_70px_rgba(214,168,95,0.075)]"
              />
            </div>
          </div>
        </div>

        {/* Copy: bottom — centered on small screens, left-aligned on md+ */}
        <div
          data-hero-copy="home"
          className="relative mx-auto w-full max-w-[min(36rem,calc(100vw-1.5rem))] px-3 pb-[max(1.75rem,env(safe-area-inset-bottom,0px))] pt-0 text-center sm:max-w-[min(40rem,calc(100vw-2rem))] sm:px-6 md:mx-0 md:max-w-[min(42rem,calc(100vw-4rem))] md:px-10 md:text-left lg:px-12 xl:px-14"
          style={{ opacity: 1 }}
        >
          <div className="rounded-2xl bg-[linear-gradient(180deg,rgba(2,3,8,0.12)_0%,rgba(2,3,8,0.04)_100%)] px-1 py-1 md:rounded-none md:bg-transparent md:px-0 md:py-0">
            <div className="space-y-3 md:space-y-4">
              <h1
                className="mx-auto flex max-w-[min(22rem,calc(100vw-2rem))] flex-col gap-1.5 font-literata text-[clamp(1.6rem,4.5vw,2.85rem)] font-normal leading-[1.08] tracking-[0.03em] text-[#f6efe6] antialiased [text-shadow:0_2px_24px_rgba(0,0,0,0.75),0_4px_40px_rgba(0,0,0,0.45),0_0_28px_rgba(214,168,95,0.12)] md:mx-0 md:max-w-[min(26rem,calc(100vw-6rem))] mystic-hero-reveal mystic-hero-reveal--title"
              >
                <span className="block text-balance">Where</span>
                <span className="block text-balance">Beauty Transcends</span>
              </h1>
              <div
                aria-hidden
                className="mx-auto flex items-center justify-center gap-3 md:mx-0 md:justify-start"
              >
                <span className="h-px w-12 bg-gradient-to-r from-transparent via-[rgba(214,168,95,0.35)] to-[rgba(214,168,95,0.55)] sm:w-14" />
                <span className="h-1 w-1 shrink-0 rounded-full bg-[rgba(214,168,95,0.45)] shadow-[0_0_14px_rgba(214,168,95,0.35)]" />
                <span className="h-px w-12 bg-gradient-to-l from-transparent via-[rgba(214,168,95,0.35)] to-[rgba(214,168,95,0.55)] sm:w-14 md:hidden" />
              </div>
            </div>

            <div className="mystic-hero-reveal mystic-hero-reveal--cta mt-7 flex w-full flex-col gap-3 sm:mt-8 sm:flex-row sm:justify-center sm:gap-4 md:mt-9 md:justify-start">
              <div className="min-w-0 flex-1 transition-transform duration-300 ease-out hover:scale-[1.012] active:scale-[0.99] motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100 sm:max-w-[min(20rem,100%)] md:max-w-none md:flex-initial">
                <Link
                  href="/shop"
                  className="mystic-button-primary flex min-h-[48px] w-full items-center justify-center rounded-full px-6 py-3 text-[0.58rem] uppercase tracking-[0.24em] shadow-[0_8px_28px_rgba(0,0,0,0.38)] transition-shadow duration-300 hover:shadow-[0_0_36px_rgba(214,168,95,0.26),0_12px_36px_rgba(0,0,0,0.42)] sm:text-[0.62rem] sm:tracking-[0.26em] md:min-w-[12.5rem]"
                >
                  Shop the rituals
                </Link>
              </div>
              <div className="min-w-0 flex-1 transition-transform duration-300 ease-out hover:scale-[1.012] active:scale-[0.99] motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100 sm:max-w-[min(20rem,100%)] md:max-w-none md:flex-initial">
                <Link
                  href="/ingredients"
                  className="mystic-button-secondary flex min-h-[48px] w-full items-center justify-center rounded-full border border-[rgba(214,168,95,0.38)] bg-[rgba(4,5,12,0.28)] px-6 py-3 text-[0.58rem] uppercase tracking-[0.24em] backdrop-blur-[3px] transition-[box-shadow,transform,border-color,background-color] duration-300 hover:border-[rgba(214,168,95,0.52)] hover:bg-[rgba(8,9,16,0.42)] hover:shadow-[0_0_32px_rgba(214,168,95,0.14)] sm:text-[0.62rem] sm:tracking-[0.26em] md:min-w-[12.5rem]"
                >
                  Ingredient notes
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progressive enhancement: loads scroll-linked fade after first paint. */}
      <HomeHeroMotionEnhancer />
    </section>
  );
}
