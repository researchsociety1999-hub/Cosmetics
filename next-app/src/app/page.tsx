import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { NewsletterForm } from "./components/NewsletterForm";
import ProductCard from "./components/productcard";
import { SiteChrome } from "./components/SiteChrome";
import { formatMoney } from "./lib/format";
import { mockTestimonials } from "./lib/data";
import {
  getCategories,
  getProducts,
} from "./lib/queries";

export const metadata: Metadata = {
  title: {
    absolute: "Mystique | Where Beauty Transcends",
  },
  description:
    "Luxury dermatological skincare with a mystical edge, rooted in ritual and bloom-skin storytelling.",
};

export const revalidate = 300;

export default async function HomePage() {
  return (
    <SiteChrome>
      <main>
        <HeroSection />
        <Suspense fallback={<SectionLoading title="Featured collections" />}>
          <FeaturedProductsSection />
        </Suspense>
        <Suspense fallback={<SectionLoading title="Ritual sequence" />}>
          <RitualStripSection />
        </Suspense>
        <Suspense fallback={<SectionLoading title="Ingredient spotlight" />}>
          <IngredientSpotlightSection />
        </Suspense>
        <SocialProofSection />
        <NewsletterSection />
      </main>
    </SiteChrome>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-[rgba(214,168,95,0.18)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,rgba(214,168,95,0.2),transparent_18%),radial-gradient(circle_at_82%_24%,rgba(240,209,154,0.09),transparent_24%),radial-gradient(circle_at_62%_56%,rgba(255,143,38,0.07),transparent_22%),linear-gradient(180deg,rgba(3,4,6,0.1),rgba(3,4,6,0.84))]" />
      <div className="pointer-events-none absolute left-[42%] top-1/2 h-[92%] w-[96%] -translate-x-1/2 -translate-y-1/2 bg-[url('/Photo%20Mar%2019%202026,%204%2022%2015%20PM.png')] bg-contain bg-center bg-no-repeat opacity-[0.09] mix-blend-screen blur-[1px]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[56%] bg-[radial-gradient(circle_at_50%_42%,rgba(255,168,59,0.18),transparent_17%),radial-gradient(circle_at_36%_56%,rgba(214,168,95,0.1),transparent_28%)] blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_32%,rgba(3,4,6,0.18)_58%,rgba(3,4,6,0.46)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,rgba(6,8,12,0),rgba(6,8,12,0.82))]" />
      <div className="pointer-events-none absolute inset-0 hidden md:block">
        <span className="mystic-particle mystic-particle-lg left-[10%] top-[12%]" />
        <span className="mystic-particle mystic-particle-md left-[24%] top-[20%]" />
        <span className="mystic-particle mystic-particle-sm left-[44%] top-[10%]" />
        <span className="mystic-particle mystic-particle-md left-[55%] top-[24%]" />
        <span className="mystic-particle mystic-particle-sm left-[70%] top-[16%]" />
        <span className="mystic-particle mystic-particle-lg left-[82%] top-[28%]" />
        <span className="mystic-particle mystic-particle-sm left-[68%] top-[54%]" />
        <span className="mystic-particle mystic-particle-md left-[86%] top-[66%]" />
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[48%] md:block">
        <HeroSilhouette />
      </div>
      <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-[4.5rem] pt-14 md:grid-cols-[1.08fr_0.92fr] md:px-6 md:pb-[6.5rem] md:pt-20">
        <div className="relative z-10 max-w-3xl space-y-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-[rgba(214,168,95,0.18)] bg-[rgba(255,255,255,0.03)] px-4 py-2 text-[0.68rem] uppercase tracking-[0.3em] text-[#d8c6aa] backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-[#d6a85f] shadow-[0_0_16px_rgba(214,168,95,0.9)]" />
            California luxury K-beauty
          </div>
          <div className="space-y-4">
            <p className="text-[0.72rem] uppercase tracking-[0.32em] text-[#b8ab95]">
              Rituals for radiant skin
            </p>
            <h1 className="font-cormorant text-5xl leading-[0.95] tracking-[0.08em] text-[#f5eee3] sm:text-6xl md:text-7xl">
              Where Beauty Transcends
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-[#b8ab95] md:text-lg">
              Plush textures, guided layering, and a darker luxury finish come
              together in routines designed to leave skin calm, luminous, and polished.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/shop"
              className="mystic-button-primary inline-flex min-h-[52px] items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em]"
            >
              Shop rituals
            </Link>
            <Link
              href="/ingredients"
              className="mystic-button-secondary inline-flex min-h-[52px] items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em]"
            >
              Explore ingredients
            </Link>
          </div>
          <div className="grid gap-4 border-t border-[rgba(214,168,95,0.12)] pt-6 text-[#d8c6aa] sm:grid-cols-2">
            <div className="rounded-[22px] border border-[rgba(214,168,95,0.1)] bg-[rgba(255,255,255,0.02)] p-4">
              <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#9f927f]">
                Clean formulas
              </p>
              <p className="mt-2 text-sm">No parabens, no sulfates, no compromise.</p>
            </div>
            <div className="rounded-[22px] border border-[rgba(214,168,95,0.1)] bg-[rgba(255,255,255,0.02)] p-4">
              <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#9f927f]">
                Cruelty free
              </p>
              <p className="mt-2 text-sm">Tested with care, never on animals.</p>
            </div>
          </div>
          <div className="grid gap-4 text-sm text-[#b8ab95] sm:grid-cols-3">
            <HeroProof title="Dermatologist-informed" body="Science-led, ritual-inspired." />
            <HeroProof title="K-beauty ritual" body="5-step layering system, designed to layer." />
            <HeroProof title="Free U.S. shipping" body="On all orders over $75." />
          </div>
        </div>
        

        <div className="relative z-10 min-h-[320px] md:min-h-[560px]" />
      </div>
    </section>
  );
}

function HeroSilhouette() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute right-[3%] top-[8%] h-[26%] w-[44%] rounded-[46%] border border-[rgba(214,168,95,0.08)] bg-[linear-gradient(180deg,rgba(18,15,12,0.22),rgba(7,8,11,0.06))] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.01),0_32px_80px_rgba(0,0,0,0.35)]" />
      <div className="absolute right-[8%] top-[28%] h-[66%] w-[34%] rounded-[48%] border border-[rgba(214,168,95,0.07)] bg-[linear-gradient(180deg,rgba(18,15,12,0.18),rgba(7,8,11,0.05))] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.01),0_40px_110px_rgba(0,0,0,0.4)]" />
      <div className="absolute right-[16%] top-[16%] h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.26),rgba(255,255,255,0.06)_30%,rgba(214,168,95,0.08)_48%,rgba(214,168,95,0)_72%)] blur-3xl" />
      <div className="absolute right-[10%] top-[44%] h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(214,168,95,0.06),transparent_72%)] blur-3xl" />
      <div className="pointer-events-none absolute bottom-[32%] right-[26%] text-[7rem] font-cormorant tracking-[0.08em] text-[rgba(214,168,95,0.08)] blur-[1px]">
        Mystique...
      </div>
      <div className="pointer-events-none absolute bottom-[27%] right-[19%] text-[1.15rem] uppercase tracking-[0.34em] text-[rgba(214,168,95,0.08)]">
        Where Beauty Transcends
      </div>
      <div className="absolute right-[8%] top-[10%] h-[24%] w-[38%] overflow-hidden rounded-[46%] opacity-[0.36] mix-blend-screen">
        <HeroPortraitGraphic className="h-full w-full scale-[0.72] translate-x-[8%] translate-y-[-4%]" />
      </div>
      <div className="absolute right-[7%] top-[23%] h-[68%] w-[34%] overflow-hidden rounded-[48%] opacity-[0.94]">
        <HeroPortraitGraphic className="h-full w-full scale-[1.04] translate-x-[2%] translate-y-[2%]" />
      </div>
      <div className="absolute right-[6%] top-[22%] h-[70%] w-[36%] rounded-[48%] bg-[linear-gradient(180deg,rgba(5,7,11,0.04),rgba(5,7,11,0.42))]" />
      <div className="absolute right-[3%] top-[8%] h-[26%] w-[44%] bg-[radial-gradient(circle_at_26%_26%,rgba(255,255,255,0.08),transparent_16%),radial-gradient(circle_at_44%_42%,rgba(214,168,95,0.06),transparent_26%)] blur-[2px]" />
      <svg
        viewBox="0 0 420 720"
        className="absolute bottom-0 right-[8%] h-[94%] w-auto opacity-[0.42]"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="heroBacklight" cx="42%" cy="18%" r="62%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.58)" />
            <stop offset="20%" stopColor="rgba(255,255,255,0.18)" />
            <stop offset="42%" stopColor="rgba(214,168,95,0.08)" />
            <stop offset="100%" stopColor="rgba(214,168,95,0)" />
          </radialGradient>
          <linearGradient id="heroShadowFill" x1="14%" x2="88%" y1="6%" y2="100%">
            <stop offset="0%" stopColor="rgba(5,6,9,0.995)" />
            <stop offset="52%" stopColor="rgba(2,3,5,0.995)" />
            <stop offset="100%" stopColor="rgba(9,11,16,0.96)" />
          </linearGradient>
          <linearGradient id="heroRimLight" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="36%" stopColor="rgba(255,255,255,0.04)" />
            <stop offset="58%" stopColor="rgba(255,255,255,0.42)" />
            <stop offset="88%" stopColor="rgba(255,214,145,0.14)" />
            <stop offset="100%" stopColor="rgba(255,184,92,0)" />
          </linearGradient>
          <radialGradient id="heroHairGlow" cx="58%" cy="40%" r="58%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
            <stop offset="46%" stopColor="rgba(214,168,95,0.04)" />
            <stop offset="100%" stopColor="rgba(214,168,95,0)" />
          </radialGradient>
          <linearGradient id="heroLineLight" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
            <stop offset="44%" stopColor="rgba(255,255,255,0.18)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        <ellipse cx="228" cy="180" rx="138" ry="130" fill="url(#heroBacklight)" />
        <ellipse cx="232" cy="392" rx="132" ry="254" fill="url(#heroHairGlow)" />
        <path
          d="M205 92c31 0 61 11 84 31 23 19 38 46 43 75 4 24-1 46-15 67-11 16-27 30-48 44 19 18 37 41 53 70 20 37 30 81 33 126 3 55-5 118-31 170-11 22-29 44-53 57-25 14-56 14-82 2-31-14-55-44-71-82-19-45-27-99-24-147 3-38 11-76 27-110 11-24 26-45 46-63-20-12-35-28-45-48-13-25-15-55-8-82 8-32 31-63 58-82 20-14 43-23 63-28 4 0 8 0 11 0Z"
          fill="url(#heroShadowFill)"
        />
        <path
          d="M205 102c-25 4-46 15-62 33-18 20-29 45-32 70-4 27 1 52 14 73 10 15 25 28 45 39-18 18-31 42-39 68-12 36-16 76-13 117 4 55 18 108 44 154"
          fill="none"
          stroke="url(#heroRimLight)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M200 101c31 3 59 16 79 36 20 20 31 45 34 71 2 20-2 38-12 55-8 14-21 27-40 38 17 17 31 38 42 64 18 43 24 96 22 145-2 53-12 111-38 159 17-43 24-86 25-127 1-58-10-122-36-172-10-20-23-39-39-54 16-12 27-24 35-39 10-17 13-36 10-57-4-26-16-51-36-72-14-15-30-27-46-35Z"
          fill="rgba(255,255,255,0.04)"
        />
        <path
          d="M215 130c-22 2-40 11-53 26-14 16-21 36-20 55 1 14 7 26 18 38-9 12-18 24-27 33-8 7-17 14-28 21 23-3 42-8 56-15-4 13-12 26-23 40 17-4 32-12 45-21-3 15-10 30-22 44 17-5 33-8 48-8-10-14-22-28-35-41-12-11-25-22-40-31 18-10 31-21 40-33 11-14 16-31 16-47 0-18-7-34-22-46-14-11-32-16-53-15Z"
          fill="rgba(5,6,9,0.99)"
        />
        <path
          d="M154 177c10-25 29-45 53-56-7 15-8 30-4 44 4 13 13 26 27 37-11 9-24 17-39 24-16 7-31 12-45 13 10-10 16-21 18-33 3-11 0-22-10-29Z"
          fill="rgba(3,4,7,0.98)"
        />
        <path
          d="M164 141c10-14 23-25 39-33 21-11 44-14 63-10-19 2-38 11-51 24-11 11-19 25-21 40-2 13 0 25 5 37-10-8-18-17-25-27-9-11-13-21-10-31Z"
          fill="rgba(255,255,255,0.05)"
        />
        <path
          d="M173 130c20 5 39 18 56 37 12 15 25 34 37 56-16-16-31-28-44-38-16-11-33-22-53-30l-16 23 20-31Z"
          fill="none"
          stroke="url(#heroLineLight)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M158 158c15 9 29 22 42 38 11 14 21 31 32 50-13-15-25-28-37-40-13-12-29-24-46-33"
          fill="none"
          stroke="url(#heroLineLight)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M146 204c12 12 24 27 34 46 8 15 16 34 24 55-10-18-20-34-30-49-9-14-20-28-34-41"
          fill="none"
          stroke="url(#heroLineLight)"
          strokeWidth="1.15"
          strokeLinecap="round"
        />
        <path
          d="M222 405c-13 42-23 92-27 149 4-32 10-64 19-95 10-38 22-74 41-110"
          fill="none"
          stroke="url(#heroRimLight)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute bottom-[8%] right-[4%] h-[76%] w-[72%] bg-[radial-gradient(circle_at_38%_18%,rgba(255,255,255,0.08),transparent_10%),radial-gradient(circle_at_40%_22%,rgba(255,168,59,0.06),transparent_12%),radial-gradient(circle_at_34%_54%,rgba(214,168,95,0.04),transparent_18%),linear-gradient(90deg,rgba(5,7,11,0.02),rgba(5,7,11,0.58))]" />
      <span className="mystic-particle mystic-particle-md right-[28%] top-[18%]" />
      <span className="mystic-particle mystic-particle-sm right-[24%] top-[26%]" />
      <span className="mystic-particle mystic-particle-sm right-[36%] top-[48%]" />
      <span className="mystic-particle mystic-particle-lg right-[18%] top-[62%]" />
    </div>
  );
}

function HeroPortraitGraphic({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 720"
      className={className}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id="portraitBacklight" cx="38%" cy="18%" r="60%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.56)" />
          <stop offset="20%" stopColor="rgba(255,255,255,0.18)" />
          <stop offset="44%" stopColor="rgba(214,168,95,0.08)" />
          <stop offset="100%" stopColor="rgba(214,168,95,0)" />
        </radialGradient>
        <linearGradient id="portraitFill" x1="14%" x2="88%" y1="6%" y2="100%">
          <stop offset="0%" stopColor="rgba(5,6,9,0.995)" />
          <stop offset="52%" stopColor="rgba(2,3,5,0.995)" />
          <stop offset="100%" stopColor="rgba(9,11,16,0.96)" />
        </linearGradient>
        <linearGradient id="portraitRim" x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="36%" stopColor="rgba(255,255,255,0.04)" />
          <stop offset="58%" stopColor="rgba(255,255,255,0.42)" />
          <stop offset="88%" stopColor="rgba(255,214,145,0.14)" />
          <stop offset="100%" stopColor="rgba(255,184,92,0)" />
        </linearGradient>
        <linearGradient id="portraitHairLine" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
          <stop offset="44%" stopColor="rgba(255,255,255,0.18)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      <ellipse cx="228" cy="180" rx="138" ry="130" fill="url(#portraitBacklight)" />
      <path
        d="M205 92c31 0 61 11 84 31 23 19 38 46 43 75 4 24-1 46-15 67-11 16-27 30-48 44 19 18 37 41 53 70 20 37 30 81 33 126 3 55-5 118-31 170-11 22-29 44-53 57-25 14-56 14-82 2-31-14-55-44-71-82-19-45-27-99-24-147 3-38 11-76 27-110 11-24 26-45 46-63-20-12-35-28-45-48-13-25-15-55-8-82 8-32 31-63 58-82 20-14 43-23 63-28 4 0 8 0 11 0Z"
        fill="url(#portraitFill)"
      />
      <path
        d="M205 102c-25 4-46 15-62 33-18 20-29 45-32 70-4 27 1 52 14 73 10 15 25 28 45 39-18 18-31 42-39 68-12 36-16 76-13 117 4 55 18 108 44 154"
        fill="none"
        stroke="url(#portraitRim)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M215 130c-22 2-40 11-53 26-14 16-21 36-20 55 1 14 7 26 18 38-9 12-18 24-27 33-8 7-17 14-28 21 23-3 42-8 56-15-4 13-12 26-23 40 17-4 32-12 45-21-3 15-10 30-22 44 17-5 33-8 48-8-10-14-22-28-35-41-12-11-25-22-40-31 18-10 31-21 40-33 11-14 16-31 16-47 0-18-7-34-22-46-14-11-32-16-53-15Z"
        fill="rgba(5,6,9,0.99)"
      />
      <path
        d="M154 177c10-25 29-45 53-56-7 15-8 30-4 44 4 13 13 26 27 37-11 9-24 17-39 24-16 7-31 12-45 13 10-10 16-21 18-33 3-11 0-22-10-29Z"
        fill="rgba(3,4,7,0.98)"
      />
      <path
        d="M173 130c20 5 39 18 56 37 12 15 25 34 37 56-16-16-31-28-44-38-16-11-33-22-53-30l-16 23 20-31Z"
        fill="none"
        stroke="url(#portraitHairLine)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M158 158c15 9 29 22 42 38 11 14 21 31 32 50-13-15-25-28-37-40-13-12-29-24-46-33"
        fill="none"
        stroke="url(#portraitHairLine)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M146 204c12 12 24 27 34 46 8 15 16 34 24 55-10-18-20-34-30-49-9-14-20-28-34-41"
        fill="none"
        stroke="url(#portraitHairLine)"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
      <path
        d="M222 405c-13 42-23 92-27 149 4-32 10-64 19-95 10-38 22-74 41-110"
        fill="none"
        stroke="url(#portraitRim)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

async function FeaturedProductsSection() {
  const products = await getProducts({ sortBy: "newest", limit: 6 });

  return (
    <section className="mystic-section border-b border-[rgba(17,24,39,0.9)] bg-[#05070d]/80">
      <div className="mystic-section-shell">
        <SectionIntro
          eyebrow="Featured collections"
          title="Rituals for radiant skin."
          body="Begin with a cleanser, then build your routine step by step with the formulas that fit your texture and finish goals."
          ctaHref="/shop"
          ctaLabel="View all"
        />
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

async function RitualStripSection() {
  const products = await getProducts({ sortBy: "featured" });
  const ritualSteps = [
    "Cleanse",
    "Tone",
    "Treat",
    "Moisturize",
    "Protect",
  ].map((step) => ({
    step,
    product: products.find((product) => product.routine_step === step) ?? null,
  }));

  return (
    <section className="mystic-section border-b border-[rgba(17,24,39,0.9)] bg-[#04050a]">
      <div className="mystic-section-shell">
        <SectionIntro
          eyebrow="Ritual sequence"
          title="Build your ritual with ease."
          body="Each step has a clear role, so shoppers can move from first cleanse to final protection with confidence."
        />
        <div className="flex gap-4 overflow-x-auto pb-2">
          {ritualSteps.map(({ step, product }, index) => (
            <article
              key={step}
              className="mystic-card min-w-[240px] flex-1 p-5"
            >
              <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[#d6a85f]">
                Step {index + 1}
              </p>
              <p className="mt-2 text-[0.7rem] uppercase tracking-[0.22em] text-[#9f927f]">
                {step}
              </p>
              <h3 className="mt-3 font-cormorant text-3xl tracking-[0.12em]">
                {step}
              </h3>
              <p className="mt-3 text-sm text-[#b8ab95]">
                {getStepGuidance(step)}
              </p>
              <p className="mt-3 text-sm text-[#f5eee3]">
                {product?.name ?? `${step} ritual essential`}
              </p>
              <div className="mt-3 flex items-center justify-between gap-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[#b8ab95]">
                  {product ? formatMoney(product.sale_price_cents ?? product.price_cents) : "Explore selection"}
                </p>
                <Link
                  href={getStepHref(step)}
                  className="text-[0.65rem] uppercase tracking-[0.22em] text-[#d6a85f]"
                >
                  {getStepLinkLabel(step)}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

async function IngredientSpotlightSection() {
  const categories = await getCategories();
  const ingredients = [
    {
      id: "hyaluronic-acid",
      source: "Humectant",
      name: "Hyaluronic Acid",
      description: "Draws in lasting hydration for a plump, dewy finish.",
      benefits: "Hydration, bounce, smoothness",
    },
    {
      id: "centella-asiatica",
      source: "Leaf extract",
      name: "Centella Asiatica",
      description: "Helps calm visible redness and support a comfort-first ritual.",
      benefits: "Soothing, recovery, softness",
    },
    {
      id: "niacinamide",
      source: "Vitamin B3",
      name: "Niacinamide",
      description: "Refines the look of tone and texture for polished radiance.",
      benefits: "Brightness, clarity, barrier support",
    },
  ];

  return (
    <section className="mystic-section border-b border-[rgba(17,24,39,0.9)] bg-[#05060c]">
      <div className="mystic-section-shell">
        <SectionIntro
          eyebrow="Ingredient spotlight"
          title="Ingredients with intention."
          body={`Mystique frames bloom-skin ingredients around comfort, elegant layering, and a refined finish across ${categories.length} collection categories.`}
          ctaHref="/ingredients"
          ctaLabel="See ingredient library"
        />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {/* TODO: wire to skincare-filtered query once ingredient categories are available. */}
          {ingredients.map((ingredient) => (
            <article key={ingredient.id} className="mystic-card p-6">
              <p className="text-[0.72rem] uppercase tracking-[0.24em] text-[#d6a85f]">
                {ingredient.source ?? "Active"}
              </p>
              <h3 className="mt-3 font-cormorant text-3xl tracking-[0.08em]">
                {ingredient.name}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-[#b8ab95]">
                {ingredient.description}
              </p>
              <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[#d6a85f]">
                {ingredient.benefits}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function SocialProofSection() {
  return (
    <section className="mystic-section border-b border-[rgba(17,24,39,0.9)] bg-[#05070d]">
      <div className="mystic-section-shell">
        <SectionIntro
          eyebrow="Client notes"
          title="What clients notice first."
          body="The earliest reactions point to the same strengths: refined textures, calm layering, and skin that looks quietly luminous."
        />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {mockTestimonials.map((testimonial) => (
            <article key={testimonial.name} className="mystic-card p-6">
              <p className="text-sm leading-relaxed text-[#f5eee3]">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <p className="mt-5 text-[0.72rem] uppercase tracking-[0.22em] text-[#d6a85f]">
                {testimonial.name}
              </p>
              <p className="mt-1 text-xs text-[#b8ab95]">{testimonial.title}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsletterSection() {
  return (
    <section className="mystic-section">
      <div className="mystic-section-shell">
        <div className="mystic-card grid gap-8 px-6 py-8 md:grid-cols-[1fr_auto] md:items-center md:px-8">
          <div>
            <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
              Newsletter
            </p>
            <h2 className="mt-3 font-cormorant text-4xl tracking-[0.12em] text-[#f5eee3]">
              Early access to rituals and seasonal drops.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#b8ab95]">
              Join for launch edits, routine notes, and private access to future Mystique releases.
            </p>
          </div>
          <div>
            <NewsletterForm />
            <p className="mt-3 text-xs text-[#8f8576]">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionIntro({
  eyebrow,
  title,
  body,
  ctaHref,
  ctaLabel,
}: {
  eyebrow: string;
  title: string;
  body: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl space-y-3">
        <p className="text-[0.75rem] uppercase tracking-[0.3em] text-[#b8ab95]">
          {eyebrow}
        </p>
        <h2 className="font-cormorant text-3xl tracking-[0.14em] text-[#f5eee3] md:text-4xl">
          {title}
        </h2>
        <p className="text-sm leading-relaxed text-[#b8ab95]">{body}</p>
      </div>
      {ctaHref && ctaLabel ? (
        <Link
          href={ctaHref}
          className="mystic-button-secondary inline-flex items-center justify-center px-6 py-3 text-[0.7rem] uppercase tracking-[0.22em]"
        >
          {ctaLabel}
        </Link>
      ) : null}
    </header>
  );
}

function getStepGuidance(step: string): string {
  if (step === "Cleanse") {
    return "Sweep away buildup while keeping the skin feeling cushioned and calm.";
  }

  if (step === "Tone") {
    return "Prep the skin so every layer that follows feels smoother and more even.";
  }

  if (step === "Treat") {
    return "Layer targeted actives where glow, firmness, and recovery matter most.";
  }

  if (step === "Moisturize") {
    return "Seal in hydration with a finish that feels plush, not heavy.";
  }

  return "Finish with daily protection to keep radiance looking fresh and refined.";
}

function getStepHref(step: string): string {
  if (step === "Cleanse") {
    return "/shop?search=cleanser";
  }

  if (step === "Treat") {
    return "/shop?search=serum";
  }

  if (step === "Moisturize") {
    return "/shop?search=moisturizer";
  }

  if (step === "Protect") {
    return "/shop?search=spf";
  }

  return "/shop";
}

function getStepLinkLabel(step: string): string {
  if (step === "Cleanse") {
    return "View cleansers";
  }

  if (step === "Treat") {
    return "View serums";
  }

  if (step === "Moisturize") {
    return "View creams";
  }

  if (step === "Protect") {
    return "View SPF";
  }

  return "View rituals";
}

function HeroProof({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[18px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)] p-4">
      <p className="text-[0.7rem] uppercase tracking-[0.24em] text-[#d6a85f]">
        {title}
      </p>
      <p className="mt-2 text-sm text-[#b8ab95]">{body}</p>
    </div>
  );
}

function SectionLoading({ title }: { title: string }) {
  return (
    <section className="border-b border-[rgba(17,24,39,0.9)] py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
          {title}
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="mystic-card h-64 animate-pulse" />
          <div className="mystic-card h-64 animate-pulse" />
          <div className="mystic-card h-64 animate-pulse" />
        </div>
      </div>
    </section>
  );
}
