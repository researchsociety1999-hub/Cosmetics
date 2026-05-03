import Image from "next/image";
import Link from "next/link";
import type { Product } from "../lib/types";
import HomeHeroMotionEnhancer from "./HomeHeroMotionEnhancer";

/**
 * Homepage hero — cinematic luxury stage.
 *
 * Foreground brand art sits in a fixed-aspect, overflow-hidden stage (full-bleed on small
 * screens). Canonical transparent lockup: `HERO_BRAND_ART` → `/brand/mystique-hero-brand.png`.
 * For full-bleed painted key art later, switch to `objectFit: "cover"` and focal `object-*` classes.
 * No blend/mask/glass. Editorial stays left-anchored; art dominates center/right.
 */
type HeroBrandArtObjectFit = "cover" | "contain";

/** Transparent hero lockup — place file at `public` + `src` path below. */
const HERO_BRAND_ART: {
  src: string;
  alt: string;
  objectFit: HeroBrandArtObjectFit;
  /**
   * Tailwind `object-*` position classes. Transparent lockup: `contain` + `object-center`.
   * Scene-style raster: `cover` + responsive `object-[x%_y%]` focal nudges.
   */
  objectPositionClassName: string;
  /** Responsive width hint for `/_next/image` (stage is full-bleed ≤1024px, ≤~64rem wide above). */
  sizes: string;
} = {
  src: "/brand/mystique-hero-brand.png",
  alt: "Mystique",
  objectFit: "contain",
  objectPositionClassName: "object-center",
  sizes: "(max-width: 1024px) 100vw, 64rem",
};

const heroBrandObjectFitClass =
  HERO_BRAND_ART.objectFit === "cover" ? "object-cover" : "object-contain";

type HomeHeroMotionProps = {
  /** Reserved for homepage merchandising; kept for API compatibility. */
  quickViewProduct?: Product | null;
};

export function HomeHeroMotion(props: HomeHeroMotionProps) {
  void props.quickViewProduct;
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
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_100%_58%_at_50%_22%,rgba(214,168,95,0.06),transparent_52%),radial-gradient(circle_at_88%_20%,rgba(200,160,110,0.04),transparent_36%),radial-gradient(circle_at_12%_48%,rgba(90,80,110,0.04),transparent_40%),linear-gradient(168deg,rgba(10,8,14,0.88)_0%,rgba(4,5,10,0.92)_48%,rgb(2,3,7)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(100deg,rgba(1,2,4,0.55)_0%,rgba(1,2,4,0.22)_38%,rgba(1,2,4,0.08)_55%,rgba(1,2,4,0.35)_100%)]"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 bg-[#020308]/18" />

      {/* Soft gold wash — stays behind hero UI */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_125%_80%_at_50%_44%,rgba(214,168,95,0.05),transparent_56%),radial-gradient(circle_at_0%_8%,rgba(190,155,105,0.03),transparent_34%),radial-gradient(circle_at_100%_28%,rgba(188,165,120,0.025),transparent_32%)]"
      />
      <div
        aria-hidden
        className="mystic-hero-ambient pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_88%_52%_at_50%_24%,rgba(214,168,95,0.04),transparent_58%),radial-gradient(circle_at_50%_100%,rgba(160,120,90,0.02),transparent_46%)]"
      />
      {/* Warm key on the brand-art side — reads as cinematic spotlight, not UI */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_75%_65%_at_72%_38%,rgba(214,168,95,0.07),transparent_58%),radial-gradient(ellipse_55%_45%_at_85%_55%,rgba(180,140,90,0.04),transparent_50%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] shadow-[inset_0_0_80px_rgba(0,0,0,0.35),inset_0_-48px_64px_rgba(0,0,0,0.28)]"
      />

      {/* Particles — subtle, below copy + logo stack */}
      <div className="pointer-events-none absolute inset-0 z-[2] opacity-[0.38]">
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
        className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_92%_68%_at_50%_40%,rgba(214,168,95,0.028),transparent_62%)]"
      />

      {/* Bottom readability — anchors copy; keep transparent above brand-art focal area */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-[min(52%,24rem)] bg-[linear-gradient(to_top,rgba(3,4,10,0.88)_0%,rgba(3,4,10,0.35)_52%,transparent_100%)] md:h-[min(48%,22rem)]"
      />

      {/* —— Foreground: key art (cropped stage) + left editorial; art bleeds on mobile —— */}
      <div className="relative z-10 flex min-h-[100svh] w-full flex-col px-4 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] pt-[max(7.25rem,calc(6.1rem+env(safe-area-inset-top,0px)))] sm:px-6 sm:pt-[max(7.5rem,calc(6.3rem+env(safe-area-inset-top,0px)))] md:px-10 md:pt-[max(5.25rem,calc(4.75rem+env(safe-area-inset-top,0px)))] lg:px-12 xl:px-14">
        <div className="flex min-h-0 w-full flex-1 flex-col gap-6 sm:gap-7 lg:grid lg:min-h-[min(640px,calc(100svh-8.5rem))] lg:grid-cols-12 lg:items-end lg:gap-x-0 lg:gap-y-0">
          {/* Brand artwork — full-bleed key strip on mobile; wide crop stage on lg */}
          <div className="hero-brand-art relative z-[1] order-1 flex w-full justify-center sm:justify-end lg:order-2 lg:col-span-9 lg:col-start-4 lg:-mr-2 lg:justify-end xl:col-span-9 xl:col-start-3 xl:-mr-4">
            <div
              className="
                relative left-1/2 aspect-[2.45/1] w-screen max-w-none -translate-x-1/2 overflow-hidden
                min-h-[min(38vh,13.75rem)] max-h-[min(44vh,15.25rem)]
                sm:left-0 sm:w-full sm:max-w-[min(42rem,calc(100vw-3rem))] sm:translate-x-0 sm:rounded-sm
                sm:aspect-[2.35/1] sm:min-h-[min(40vh,15rem)] sm:max-h-[min(46vh,17.5rem)]
                md:max-w-[min(48rem,calc(100vw-4rem))] md:min-h-[min(44vh,17rem)] md:max-h-[min(50vh,19rem)]
                lg:aspect-[2.55/1] lg:min-h-[min(52vh,26rem)] lg:max-h-[min(64vh,34rem)] lg:w-[min(118%,56rem)] xl:min-h-[min(56vh,28rem)] xl:max-h-[min(70vh,38rem)] xl:w-[min(128%,64rem)]
              "
            >
              {/* No `priority` here — background `/about/hero.jpg` stays the sole LCP preload candidate. */}
              <Image
                src={HERO_BRAND_ART.src}
                alt={HERO_BRAND_ART.alt}
                fill
                quality={88}
                sizes={HERO_BRAND_ART.sizes}
                className={`${heroBrandObjectFitClass} ${HERO_BRAND_ART.objectPositionClassName}`}
              />
            </div>
          </div>

          {/* Editorial — supporting voice; overlaps art column start on lg for one-scene read */}
          <div
            data-hero-copy="home"
            className="relative z-[2] order-2 flex w-full flex-col items-start px-0.5 pb-0.5 text-left sm:px-0 lg:order-1 lg:col-span-4 lg:col-start-1 lg:row-start-1 lg:-mr-6 lg:max-w-none lg:self-end lg:pb-2 xl:col-span-3 xl:-mr-10"
          >
            <header className="w-full max-w-[min(19.5rem,calc(100vw-2.25rem))] sm:max-w-[20.5rem] lg:max-w-[19rem] xl:max-w-[17.5rem]">
              <h1 className="font-playfair mystic-hero-reveal mystic-hero-reveal--title text-[clamp(1.75rem,4.8vw,3.1rem)] font-normal leading-[1.1] tracking-[0.04em] text-[#f2ece4] md:text-[clamp(1.875rem,2.5vw,2.875rem)]">
                Where Beauty Transcends.
              </h1>
            </header>
            <p className="font-playfair mystic-hero-reveal mystic-hero-reveal--sub mt-5 max-w-[18.5rem] text-[0.875rem] font-normal leading-[1.72] tracking-[0.08em] text-[#b0a088] sm:mt-5 sm:max-w-[19.5rem] sm:text-[0.9375rem] lg:mt-5">
              Premium rituals for luminous skin.
            </p>
            <div className="mystic-hero-reveal mystic-hero-reveal--cta mt-7 flex w-full max-w-[19.5rem] flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-3.5 lg:mt-8">
              <Link
                href="/shop"
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-[#a68b63] px-6 py-2.5 font-ui text-[0.62rem] font-medium uppercase tracking-[0.2em] text-[#0f0e0c] shadow-[0_3px_12px_rgba(0,0,0,0.2)] transition-colors duration-300 hover:bg-[#b39970] motion-reduce:transition-none sm:w-auto sm:min-w-[11.5rem]"
              >
                Shop the rituals
              </Link>
              <Link
                href="/ingredients"
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full border border-[#8a7b62]/45 bg-transparent px-6 py-2.5 font-ui text-[0.62rem] font-medium uppercase tracking-[0.2em] text-[#ebe4d4]/90 transition-colors duration-300 hover:border-[#a09072]/55 hover:bg-white/[0.03] motion-reduce:transition-none sm:w-auto sm:min-w-[11.5rem]"
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
