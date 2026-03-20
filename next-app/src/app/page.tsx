import type { Metadata } from "next";
import { Suspense } from "react";
import { NewsletterForm } from "./components/NewsletterForm";
import ProductCard from "./components/productcard";
import { PromoBanner } from "./components/PromoBanner";
import { SiteChrome } from "./components/SiteChrome";
import { formatMoney } from "./lib/format";
import { mockTestimonials } from "./lib/data";
import {
  getActivePromo,
  getCategories,
  getIngredients,
  getProducts,
} from "./lib/queries";

export const metadata: Metadata = {
  title: "Where Beauty Transcends",
  description:
    "Luxury dermatological skincare with a mystical edge, rooted in ritual and bloom-skin storytelling.",
};

export const revalidate = 300;

export default async function HomePage() {
  const promo = await getActivePromo();

  return (
    <SiteChrome>
      {promo ? <PromoBanner promo={promo} /> : null}
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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(214,168,95,0.18),transparent_18%),radial-gradient(circle_at_86%_28%,rgba(240,209,154,0.08),transparent_24%),radial-gradient(circle_at_48%_74%,rgba(255,143,38,0.08),transparent_24%),linear-gradient(180deg,rgba(3,4,6,0.16),rgba(3,4,6,0.82))]" />
      <div className="pointer-events-none absolute left-[42%] top-1/2 h-[92%] w-[96%] -translate-x-1/2 -translate-y-1/2 bg-[url('/Photo%20Mar%2019%202026,%204%2022%2015%20PM.png')] bg-contain bg-center bg-no-repeat opacity-[0.045] mix-blend-screen blur-[1px]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[56%] bg-[radial-gradient(circle_at_50%_46%,rgba(255,168,59,0.16),transparent_17%),radial-gradient(circle_at_38%_58%,rgba(214,168,95,0.1),transparent_28%)] blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_32%,rgba(3,4,6,0.18)_58%,rgba(3,4,6,0.46)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,rgba(6,8,12,0),rgba(6,8,12,0.82))]" />
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
            <a
              href="/shop"
              className="mystic-button-primary inline-flex min-h-[52px] items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em]"
            >
              Shop rituals
            </a>
            <a
              href="/ingredients"
              className="mystic-button-secondary inline-flex min-h-[52px] items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em]"
            >
              Explore ingredients
            </a>
          </div>
          <div className="grid gap-4 border-t border-[rgba(214,168,95,0.12)] pt-6 text-[#d8c6aa] sm:grid-cols-2">
            <div className="rounded-[22px] border border-[rgba(214,168,95,0.1)] bg-[rgba(255,255,255,0.02)] p-4">
              <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#9f927f]">
                Visual mood
              </p>
              <p className="mt-2 text-sm">Black smoke, molten halo, and a softened feminine shadow.</p>
            </div>
            <div className="rounded-[22px] border border-[rgba(214,168,95,0.1)] bg-[rgba(255,255,255,0.02)] p-4">
              <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#9f927f]">
                Signature finish
              </p>
              <p className="mt-2 text-sm">Warm gold detail with a polished, after-dark elegance.</p>
            </div>
          </div>
          <div className="grid gap-4 text-sm text-[#b8ab95] sm:grid-cols-3">
            <HeroProof title="Bloom skin" body="Softly radiant, never greasy." />
            <HeroProof title="Regenerative story" body="PDRN, exosomes, peptides, centella." />
            <HeroProof title="Fast ritual" body="Curated for morning and evening flow." />
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
      <div className="absolute inset-y-[6%] right-[2%] w-[84%] rounded-[48%] bg-[radial-gradient(circle_at_38%_24%,rgba(255,170,70,0.18),transparent_16%),radial-gradient(circle_at_42%_38%,rgba(214,168,95,0.12),transparent_22%),linear-gradient(180deg,rgba(4,5,8,0.02),rgba(4,5,8,0.48))] blur-[2px]" />
      <div className="absolute right-[20%] top-[16%] h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(255,171,65,0.18),transparent_72%)] blur-3xl" />
      <div className="absolute right-[12%] top-[36%] h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(214,168,95,0.1),transparent_72%)] blur-3xl" />
      <svg
        viewBox="0 0 420 720"
        className="absolute bottom-0 right-[4%] h-[96%] w-auto opacity-[0.82]"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="womanShadowFill" x1="10%" x2="90%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(116,79,30,0.22)" />
            <stop offset="42%" stopColor="rgba(34,25,15,0.56)" />
            <stop offset="100%" stopColor="rgba(5,6,9,0.08)" />
          </linearGradient>
          <radialGradient id="womanGlow" cx="34%" cy="28%" r="62%">
            <stop offset="0%" stopColor="rgba(255,170,70,0.26)" />
            <stop offset="44%" stopColor="rgba(214,168,95,0.1)" />
            <stop offset="100%" stopColor="rgba(214,168,95,0)" />
          </radialGradient>
          <linearGradient id="profileEdge" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,184,92,0)" />
            <stop offset="52%" stopColor="rgba(255,184,92,0.32)" />
            <stop offset="100%" stopColor="rgba(255,184,92,0)" />
          </linearGradient>
          <radialGradient id="hairMist" cx="44%" cy="28%" r="58%">
            <stop offset="0%" stopColor="rgba(255,154,52,0.2)" />
            <stop offset="56%" stopColor="rgba(255,154,52,0.06)" />
            <stop offset="100%" stopColor="rgba(255,154,52,0)" />
          </radialGradient>
        </defs>
        <path
          d="M171 93c45-8 100 7 137 41 38 36 58 87 56 141-1 43-16 83-42 118-11 14-25 27-36 39 22 26 36 55 46 88 14 46 18 95 16 143-2 39-8 79-21 116-8 25-23 50-47 63-33 19-74 8-102-16-36-31-56-77-66-122-12-54-13-112-2-166 10-48 32-91 59-131-26-22-47-49-57-81-12-37-8-80 10-115 17-33 44-60 79-83 4-11 7-23 10-35Z"
          fill="url(#womanShadowFill)"
        />
        <path
          d="M230 138c28 2 58 16 79 39 22 24 34 56 34 88 0 18-4 36-12 52-7 14-18 24-31 35 15 9 27 23 36 38 18 30 27 67 31 102 5 44 4 91-8 135-9 33-25 70-56 88"
          fill="none"
          stroke="url(#profileEdge)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M142 151c13-36 39-68 73-88 42-25 98-30 143-8-18-26-49-47-84-56-40-11-85-7-121 11-43 21-79 58-95 103-14 38-10 86 10 121 7 13 17 26 29 36-1-14 1-29 5-43 11-36 23-54 40-76Z"
          fill="url(#hairMist)"
        />
        <path
          d="M245 150c-18 4-31 18-39 34-7 14-11 30-19 43-6 11-16 21-30 30 25-3 45-8 61-15-2 12-9 24-18 36 18-4 31-8 42-15-1 18-8 34-18 48 20-6 36-11 53-8-9-18-27-33-46-47 17-13 29-27 37-43 11-24 8-47-23-63Z"
          fill="rgba(6,8,12,0.34)"
        />
        <ellipse cx="215" cy="336" rx="126" ry="214" fill="url(#womanGlow)" />
        <ellipse cx="177" cy="186" rx="108" ry="98" fill="url(#womanGlow)" />
      </svg>
      <div className="absolute bottom-[18%] right-[14%] h-[46%] w-[46%] bg-[url('/Photo%20Mar%2019%202026,%204%2022%2015%20PM.png')] bg-contain bg-center bg-no-repeat opacity-[0.08] mix-blend-screen blur-[1px]" />
      <div className="absolute bottom-[10%] right-[6%] h-[70%] w-[72%] bg-[radial-gradient(circle_at_40%_24%,rgba(255,168,59,0.16),transparent_10%),radial-gradient(circle_at_36%_52%,rgba(214,168,95,0.1),transparent_18%),linear-gradient(90deg,rgba(5,7,11,0.04),rgba(5,7,11,0.5))]" />
      <div className="absolute bottom-[22%] right-[17%] h-3 w-3 rounded-full bg-[#d6a85f] shadow-[0_0_18px_rgba(214,168,95,0.8)]" />
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
                <a
                  href={getStepHref(step)}
                  className="text-[0.65rem] uppercase tracking-[0.22em] text-[#d6a85f]"
                >
                  {getStepLinkLabel(step)}
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

async function IngredientSpotlightSection() {
  const [ingredients, categories] = await Promise.all([
    getIngredients(),
    getCategories(),
  ]);

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
          {ingredients.slice(0, 5).map((ingredient) => (
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
          <NewsletterForm />
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
        <a
          href={ctaHref}
          className="mystic-button-secondary inline-flex items-center justify-center px-6 py-3 text-[0.7rem] uppercase tracking-[0.22em]"
        >
          {ctaLabel}
        </a>
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
    return "/shop?category=cleansers";
  }

  if (step === "Treat") {
    return "/shop?category=serums";
  }

  if (step === "Moisturize") {
    return "/shop?category=moisturizers";
  }

  if (step === "Protect") {
    return "/shop?category=protect";
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
