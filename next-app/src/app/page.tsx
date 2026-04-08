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
      <div className="absolute inset-y-[4%] right-[0%] w-[90%] rounded-[48%] bg-[radial-gradient(circle_at_30%_24%,rgba(255,170,70,0.12),transparent_13%),radial-gradient(circle_at_38%_42%,rgba(214,168,95,0.1),transparent_22%),linear-gradient(180deg,rgba(4,5,8,0.02),rgba(4,5,8,0.62))] blur-[2px]" />
      <div className="absolute right-[18%] top-[10%] h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.4),rgba(255,245,221,0.12)_30%,rgba(214,168,95,0.08)_46%,rgba(214,168,95,0)_72%)] blur-3xl" />
      <div className="absolute right-[10%] top-[40%] h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(214,168,95,0.08),transparent_72%)] blur-3xl" />
      <svg
        viewBox="0 0 420 720"
        className="absolute bottom-0 right-[6%] h-[95%] w-auto opacity-[0.98]"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="heroBacklight" cx="31%" cy="24%" r="56%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.64)" />
            <stop offset="22%" stopColor="rgba(255,241,211,0.22)" />
            <stop offset="42%" stopColor="rgba(214,168,95,0.12)" />
            <stop offset="100%" stopColor="rgba(214,168,95,0)" />
          </radialGradient>
          <linearGradient id="heroShadowFill" x1="18%" x2="88%" y1="8%" y2="100%">
            <stop offset="0%" stopColor="rgba(7,8,12,0.99)" />
            <stop offset="50%" stopColor="rgba(3,4,7,0.99)" />
            <stop offset="100%" stopColor="rgba(10,12,18,0.95)" />
          </linearGradient>
          <linearGradient id="heroRimLight" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,184,92,0)" />
            <stop offset="38%" stopColor="rgba(255,225,170,0.06)" />
            <stop offset="58%" stopColor="rgba(255,228,177,0.28)" />
            <stop offset="100%" stopColor="rgba(255,184,92,0)" />
          </linearGradient>
          <radialGradient id="heroHairGlow" cx="58%" cy="40%" r="58%">
            <stop offset="0%" stopColor="rgba(214,168,95,0.12)" />
            <stop offset="56%" stopColor="rgba(214,168,95,0.03)" />
            <stop offset="100%" stopColor="rgba(214,168,95,0)" />
          </radialGradient>
        </defs>
        <ellipse cx="204" cy="190" rx="126" ry="128" fill="url(#heroBacklight)" />
        <ellipse cx="250" cy="392" rx="124" ry="250" fill="url(#heroHairGlow)" />
        <path
          d="M223 91c32 0 65 12 89 34 24 22 39 53 40 84 0 28-10 51-28 72-10 12-24 23-41 34 19 19 34 41 47 70 18 40 27 89 27 137 0 54-11 118-39 166-12 22-31 42-55 51-29 11-61 4-87-18-33-27-54-68-66-111-14-50-16-106-7-156 8-45 24-86 48-120-18-12-32-26-42-42-13-21-18-47-16-74 3-31 17-60 40-82 24-28 55-42 90-45Z"
          fill="url(#heroShadowFill)"
        />
        <path
          d="M211 108c-24 4-43 15-60 34-18 21-29 46-31 73-2 25 4 49 16 68 9 13 22 26 41 36-16 23-28 48-35 76-11 39-13 80-10 122 4 56 19 110 46 153"
          fill="none"
          stroke="url(#heroRimLight)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M232 111c31 2 57 14 75 34 19 20 29 46 29 72 0 19-5 37-15 52-9 13-22 24-39 34 17 18 32 40 43 65 20 44 27 99 25 147-1 52-13 112-46 161 23-43 34-88 38-131 5-55-2-117-27-168-11-21-25-41-42-56 16-11 28-22 37-36 11-16 17-36 16-56-1-28-13-55-34-77-18-19-43-34-60-41Z"
          fill="rgba(255,255,255,0.04)"
        />
        <path
          d="M225 132c-24 4-44 16-57 34-14 18-19 39-14 58 3 11 10 21 19 30-10 11-19 21-28 29-8 7-19 14-32 21 22-1 42-5 59-12-5 12-14 25-25 37 18-4 33-10 47-18-4 17-12 31-24 44 18-4 35-6 50-5-11-15-24-28-38-41-11-11-22-20-35-28 18-10 31-21 40-35 10-15 14-33 11-50-2-17-12-32-28-44-13-9-30-13-45-10Z"
          fill="rgba(5,6,9,0.99)"
        />
        <path
          d="M169 178c8-21 22-40 43-52-5 14-5 28-1 40 5 14 14 27 26 38-10 9-22 18-37 25-15 8-31 12-47 15 11-11 18-22 21-33 4-13 3-24-5-33Z"
          fill="rgba(3,4,7,0.98)"
        />
      </svg>
      <div className="absolute bottom-[8%] right-[4%] h-[76%] w-[72%] bg-[radial-gradient(circle_at_34%_18%,rgba(255,255,255,0.12),transparent_10%),radial-gradient(circle_at_36%_24%,rgba(255,168,59,0.12),transparent_12%),radial-gradient(circle_at_34%_54%,rgba(214,168,95,0.06),transparent_18%),linear-gradient(90deg,rgba(5,7,11,0.02),rgba(5,7,11,0.56))]" />
      <span className="mystic-particle mystic-particle-md right-[28%] top-[18%]" />
      <span className="mystic-particle mystic-particle-sm right-[24%] top-[26%]" />
      <span className="mystic-particle mystic-particle-sm right-[36%] top-[48%]" />
      <span className="mystic-particle mystic-particle-lg right-[18%] top-[62%]" />
    </div>
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
