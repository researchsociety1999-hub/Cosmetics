import type { Metadata } from "next";
import { Suspense } from "react";
import { NewsletterForm } from "./components/NewsletterForm";
import { BrandLogo } from "./components/BrandLogo";
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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(214,168,95,0.22),transparent_18%),radial-gradient(circle_at_84%_24%,rgba(240,209,154,0.1),transparent_24%),linear-gradient(180deg,rgba(3,4,6,0.2),rgba(3,4,6,0.78))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-full bg-[url('/Photo%20Mar%2019%202026,%204%2022%2015%20PM.png')] bg-contain bg-center bg-no-repeat opacity-[0.08] mix-blend-screen" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_32%,rgba(3,4,6,0.18)_58%,rgba(3,4,6,0.46)_100%)]" />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-16 md:grid-cols-[1.1fr_0.9fr] md:px-6 md:pb-28 md:pt-24">
        <div className="relative z-10 space-y-8">
          <p className="text-[0.75rem] uppercase tracking-[0.3em] text-[#b8ab95]">
            California-born luxury K-beauty
          </p>
          <div className="space-y-5">
            <h1 className="font-cormorant text-5xl leading-[0.95] tracking-[0.08em] text-[#f5eee3] sm:text-6xl md:text-7xl">
              Where Beauty Transcends
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-[#b8ab95] md:text-lg">
              Luxury dermatological skincare with a mystical edge. Mystique
              channels regenerative science, ritual layering, and bloom-skin
              finish into a dark-luxury experience built for modern routines.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <a
              href="/shop"
              className="mystic-button-primary inline-flex items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em]"
            >
              Shop rituals
            </a>
            <a
              href="/ingredients"
              className="mystic-button-secondary inline-flex items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em]"
            >
              Explore ingredients
            </a>
          </div>
          <div className="grid gap-4 text-sm text-[#b8ab95] sm:grid-cols-3">
            <HeroProof title="Bloom skin" body="Softly radiant, never greasy." />
            <HeroProof title="Regenerative story" body="PDRN, exosomes, peptides, centella." />
            <HeroProof title="Fast ritual" body="Curated for morning and evening flow." />
          </div>
        </div>

        <div className="relative z-10">
          <div className="mystic-card relative overflow-hidden p-6">
            <div className="aspect-[4/5] rounded-[24px] bg-[linear-gradient(180deg,#090b0f,#030406)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_38%,rgba(255,161,46,0.26),transparent_18%),radial-gradient(circle_at_82%_75%,rgba(240,209,154,0.18),transparent_22%)]" />
            <div className="absolute inset-0 bg-[url('/Photo%20Mar%2019%202026,%204%2022%2015%20PM.png')] bg-contain bg-center bg-no-repeat opacity-[0.24] mix-blend-screen" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,3,5,0.18),rgba(2,3,5,0.84))]" />
            <div className="absolute inset-0 flex flex-col justify-between p-8">
              <div className="flex justify-between text-[0.72rem] uppercase tracking-[0.24em] text-[#d8b37a]">
                <span>Signature identity</span>
                <span>Gold ritual</span>
              </div>
              <div className="space-y-5">
                <div className="max-w-[320px]">
                  <BrandLogo />
                </div>
                <p className="max-w-sm text-sm leading-relaxed text-[#d8c6aa]">
                  The site now follows the same visual world as the mark itself:
                  black smoke, molten gold, and a ceremonial luxury finish.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

async function FeaturedProductsSection() {
  const products = await getProducts({ sortBy: "newest", limit: 6 });

  return (
    <section className="border-b border-[rgba(17,24,39,0.9)] bg-[#05070d]/80 py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionIntro
          eyebrow="Featured collections"
          title="Newest rituals for glow, texture, and nightly reset."
          body="A launch edit drawn from the latest Mystique formulas and designed to feel premium from the first click."
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
    <section className="border-b border-[rgba(17,24,39,0.9)] bg-[#04050a] py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionIntro
          eyebrow="Ritual sequence"
          title="Move through the routine with intention."
          body="A horizontal ritual map designed for skincare discovery, layering guidance, and better product storytelling."
        />
        <div className="flex gap-4 overflow-x-auto pb-2">
          {ritualSteps.map(({ step, product }, index) => (
            <article
              key={step}
              className="mystic-card min-w-[240px] flex-1 p-5"
            >
              <p className="text-[0.7rem] uppercase tracking-[0.24em] text-[#d6a85f]">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-3 font-cormorant text-3xl tracking-[0.12em]">
                {step}
              </h3>
              <p className="mt-3 text-sm text-[#b8ab95]">
                {product?.name ?? `[REPLACE LATER] ${step} product`}
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#b8ab95]">
                {product ? formatMoney(product.sale_price_cents ?? product.price_cents) : "Coming soon"}
              </p>
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
    <section className="border-b border-[rgba(17,24,39,0.9)] bg-[#05060c] py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionIntro
          eyebrow="Ingredient spotlight"
          title="Regenerative language meets comfort-first formulation."
          body={`Mystique centers ingredient stories that speak to bloom skin, barrier support, and ritual elegance across ${categories.length} collection categories.`}
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
    <section className="border-b border-[rgba(17,24,39,0.9)] bg-[#05070d] py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionIntro
          eyebrow="Client notes"
          title="What early ritual devotees are saying."
          body="[REPLACE LATER] These testimonials can be swapped for live review excerpts once the reviews table is fully seeded."
        />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {mockTestimonials.map((testimonial) => (
            <article key={testimonial.name} className="mystic-card p-6">
              <p className="text-sm leading-relaxed text-[#f5eee3]">
                "{testimonial.quote}"
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
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mystic-card grid gap-8 px-6 py-8 md:grid-cols-[1fr_auto] md:items-center md:px-8">
          <div>
            <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
              Newsletter
            </p>
            <h2 className="mt-3 font-cormorant text-4xl tracking-[0.12em] text-[#f5eee3]">
              Early access to rituals and seasonal drops.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#b8ab95]">
              Join the list for launch edits, ingredient stories, and private access
              to future Mystique releases.
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
      <div className="max-w-2xl">
        <p className="text-[0.75rem] uppercase tracking-[0.3em] text-[#b8ab95]">
          {eyebrow}
        </p>
        <h2 className="mt-3 font-cormorant text-3xl tracking-[0.14em] text-[#f5eee3] md:text-4xl">
          {title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[#b8ab95]">{body}</p>
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
