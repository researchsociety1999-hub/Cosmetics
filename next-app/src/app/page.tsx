import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
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

/** B&W profile — dark negative space on the left for type; figure on the right. */
const HERO_PORTRAIT_SRC = "/hero-portrait-silhouette.png";

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
    <section className="relative min-h-[min(85vh,800px)] overflow-hidden border-b border-[rgba(214,168,95,0.14)]">
      {/* Base */}
      <div className="pointer-events-none absolute inset-0 bg-[#010203]" />

      {/* Portrait — calmer so the hero reads as one focal column */}
      <div className="pointer-events-none absolute inset-0">
        <Image
          src={HERO_PORTRAIT_SRC}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[72%_30%] opacity-[0.4] sm:object-[76%_28%] md:object-[88%_22%] md:opacity-[0.44]"
          aria-hidden
        />
      </div>

      {/* Strong left column for copy; softer gold wash (no extra ring — less visual noise) */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#000000_0%,rgba(0,0,0,0.92)_min(42%,22rem),rgba(0,0,0,0.55)_50%,rgba(3,4,6,0.2)_68%,rgba(5,6,9,0.45)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_50%_at_78%_38%,rgba(214,168,95,0.07),transparent_58%),radial-gradient(circle_at_88%_88%,rgba(255,120,60,0.04),transparent_45%)]" />

      {/* Fewer sparkles — keeps first impression calmer */}
      <div className="pointer-events-none absolute inset-0">
        <span className="mystic-particle mystic-particle-md left-[12%] top-[20%]" />
        <span className="mystic-particle mystic-particle-sm left-[78%] top-[24%]" />
        <span className="mystic-particle mystic-particle-lg left-[88%] top-[58%]" />
        <span className="mystic-particle mystic-particle-sm left-[48%] top-[72%]" />
      </div>

      <div className="relative z-10 w-full px-4 pb-[4.5rem] pt-16 md:px-6 md:pb-[6rem] md:pt-24 lg:px-10 xl:px-14">
        <div className="max-w-xl space-y-8">
          <div className="space-y-5">
            <h1 className="font-literata text-[clamp(2rem,4.5vw,3.35rem)] font-medium leading-[1.06] tracking-[0.04em] text-[#faf6ef] [text-shadow:0_2px_28px_rgba(0,0,0,0.75)]">
              Where Beauty Transcends
            </h1>
            <p className="max-w-md text-sm font-normal leading-relaxed text-[#c4b8a4] [text-shadow:0_1px_18px_rgba(0,0,0,0.65)] md:text-[0.95rem]">
              Ritual-led skincare, refined for a calm, luminous finish.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/shop"
              className="mystic-button-primary inline-flex min-h-[44px] min-w-[10rem] items-center justify-center rounded-full px-6 py-2.5 text-[0.65rem] uppercase tracking-[0.22em] md:min-h-[46px] md:px-7"
            >
              Shop rituals
            </Link>
            <Link
              href="/ingredients"
              className="mystic-button-secondary inline-flex min-h-[44px] min-w-[10rem] items-center justify-center rounded-full px-6 py-2.5 text-[0.65rem] uppercase tracking-[0.22em] md:min-h-[46px] md:px-7"
            >
              Ingredients
            </Link>
          </div>
          <div className="flex flex-wrap gap-2.5 border-t border-[rgba(214,168,95,0.1)] pt-7">
            <span className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-1.5 text-[0.58rem] uppercase tracking-[0.2em] text-[#9a8f7e] backdrop-blur-md md:px-3.5 md:py-2 md:text-[0.62rem]">
              Dermatologist-informed
            </span>
            <span className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-1.5 text-[0.58rem] uppercase tracking-[0.2em] text-[#9a8f7e] backdrop-blur-md md:px-3.5 md:py-2 md:text-[0.62rem]">
              5-step ritual
            </span>
            <span className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-1.5 text-[0.58rem] uppercase tracking-[0.2em] text-[#9a8f7e] backdrop-blur-md md:px-3.5 md:py-2 md:text-[0.62rem]">
              Free U.S. shipping $75+
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

async function FeaturedProductsSection() {
  const products = await getProducts({ sortBy: "newest", limit: 6 });

  return (
    <section className="mystic-section border-b border-[rgba(17,24,39,0.9)] bg-[#05070d]/80">
      <div className="mystic-section-shell">
        <SectionIntro
          eyebrow="Featured"
          title="Your next ritual."
          body="A few favorites to start with."
          ctaHref="/shop"
          ctaLabel="View all"
        />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-4 xl:gap-5">
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
          title="Five steps. Simple."
          body="Cleanse to protect—no overthinking."
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
              <h3 className="mt-3 font-literata text-3xl tracking-[0.12em]">
                {step}
              </h3>
              <p className="mt-3 text-sm text-[#b8ab95]">
                {product?.name ?? `${step} essential`}
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
          eyebrow="Ingredients"
          title="A calm, polished finish."
          body={`Comfort-first formulas across ${categories.length} collections.`}
          ctaHref="/ingredients"
          ctaLabel="See all"
        />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {/* TODO: wire to skincare-filtered query once ingredient categories are available. */}
          {ingredients.map((ingredient) => (
            <article key={ingredient.id} className="mystic-card p-6">
              <p className="text-[0.72rem] uppercase tracking-[0.24em] text-[#d6a85f]">
                {ingredient.source ?? "Active"}
              </p>
              <h3 className="mt-3 font-literata text-3xl tracking-[0.08em]">
                {ingredient.name}
              </h3>
              <p className="mt-3 text-sm text-[#b8ab95]">{ingredient.benefits}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function SocialProofSection() {
  const featuredTestimonials = mockTestimonials.slice(0, 2);

  return (
    <section className="mystic-section border-b border-[rgba(17,24,39,0.9)] bg-[#05070d]">
      <div className="mystic-section-shell">
        <SectionIntro
          eyebrow="Client notes"
          title="A few words."
          body="Short notes from early rituals."
        />
        <div className="grid gap-6 md:grid-cols-2">
          {featuredTestimonials.map((testimonial) => (
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
            <h2 className="mt-3 font-literata text-4xl tracking-[0.12em] text-[#f5eee3]">
              Early access, quietly.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#b8ab95]">
              Launch notes and seasonal drops.
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
        <h2 className="font-literata text-3xl tracking-[0.14em] text-[#f5eee3] md:text-4xl">
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

function SectionLoading({ title }: { title: string }) {
  return (
    <section className="border-b border-[rgba(17,24,39,0.9)] py-16">
      <div className="w-full px-4 md:px-6 lg:px-10 xl:px-14">
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
