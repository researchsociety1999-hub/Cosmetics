import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { HomeHeroMotion } from "./components/HomeHeroMotion";
import { NewsletterForm } from "./components/NewsletterForm";
import ProductCard from "./components/productcard";
import { SiteChrome } from "./components/SiteChrome";
import { MYSTIQUE_CANONICAL_INGREDIENTS } from "./lib/data";
import { getProducts } from "./lib/queries";

export const metadata: Metadata = {
  title: {
    absolute: "Mystique | Where Beauty Transcends",
  },
  description:
    "California-rooted skincare—five-step routines, layer-friendly textures, and calm, healthy-looking radiance.",
};

export const revalidate = 300;

export default async function HomePage() {
  return (
    <SiteChrome>
      <main>
        <HomeHeroMotion />
        <FirstVisitGuidanceStrip />
        <Suspense fallback={<SectionLoading title="Ritual signatures" />}>
          <FeaturedProductsSection />
        </Suspense>
        <RitualStripSection />
        <IngredientSpotlightSection />
        <NewsletterSection />
      </main>
    </SiteChrome>
  );
}

const FIRST_VISIT_CONCERNS: { label: string; href: string }[] = [
  { label: "Dryness", href: "/shop?search=dryness" },
  { label: "Dullness", href: "/shop?search=dullness" },
  { label: "Sensitivity", href: "/shop?search=sensitivity" },
  { label: "Glow & Even tone", href: "/shop?search=glow-even-tone" },
];

function FirstVisitGuidanceStrip() {
  return (
    <section
      aria-labelledby="first-visit-heading"
      className="border-b border-[rgba(214,168,95,0.1)] bg-[linear-gradient(180deg,rgba(5,6,10,0.95),rgba(4,5,9,0.88))]"
    >
      <div className="mystic-section-shell py-9 md:py-10">
        <div className="flex max-w-3xl flex-col gap-2">
          <p
            id="first-visit-heading"
            className="text-[0.72rem] uppercase tracking-[0.28em] text-[#b8ab95]"
          >
            First visit
          </p>
          <p className="font-literata text-2xl tracking-[0.12em] text-[#f5eee3] md:text-3xl">
            Start with what your skin needs most.
          </p>
        </div>
        <ul className="mt-6 flex flex-wrap gap-2.5 md:gap-3">
          {FIRST_VISIT_CONCERNS.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className="group inline-flex items-center justify-center rounded-full border border-[rgba(214,168,95,0.2)] bg-[rgba(255,255,255,0.03)] px-5 py-2.5 transition hover:border-[rgba(214,168,95,0.45)] hover:bg-[rgba(214,168,95,0.08)] md:px-6 md:py-3"
              >
                <span className="text-[0.62rem] uppercase tracking-[0.22em] text-[#f5eee3]">
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

async function FeaturedProductsSection() {
  const products = await getProducts({ sortBy: "featured", limit: 6 });

  return (
    <section className="mystic-section border-b border-[rgba(17,24,39,0.9)] bg-[#05070d]/80">
      <div className="mystic-section-shell">
        <SectionIntro
          eyebrow="Ritual signatures"
          title="Textures worth the ritual."
          body="A short list of formulas we reach for first—layer-clean, barrier-kind, and built for morning, night, and the weekly reset."
          ctaHref="/shop?sort=featured"
          ctaLabel="Shop ritual staples"
        />
        {products.length === 0 ? (
          <div className="mystic-card max-w-2xl p-8 text-sm leading-relaxed text-[#b8ab95]">
            <p>
              The ritual shelves are being stocked—published products will appear here
              automatically once your catalog is live in the studio database.
            </p>
            <p className="mt-4 text-[#8f8576]">
              Until then, explore{" "}
              <Link href="/routines" className="text-[#d6a85f] underline-offset-4 hover:underline">
                routines
              </Link>
              ,{" "}
              <Link href="/journal" className="text-[#d6a85f] underline-offset-4 hover:underline">
                journal
              </Link>
              , or{" "}
              <Link href="/contact" className="text-[#d6a85f] underline-offset-4 hover:underline">
                write the studio
              </Link>{" "}
              for wholesale or press.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-4 xl:gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

const HOME_RITUAL_RHYTHMS: {
  label: string;
  title: string;
  body: string;
  href: string;
  linkLabel: string;
}[] = [
  {
    label: "Morning",
    title: "Daylight ritual",
    body: "Light layers, clarity, and SPF-forward finish—built to move under makeup and real schedules.",
    href: "/routines#morning-ritual",
    linkLabel: "Morning routine",
  },
  {
    label: "Night",
    title: "Recovery ritual",
    body: "Double cleanse, treatment, and seal—richer textures while skin resets overnight.",
    href: "/routines#night-ritual",
    linkLabel: "Night routine",
  },
  {
    label: "Weekly",
    title: "Reset ritual",
    body: "Exfoliation, masks, and focused care—one or two nights a week to refine tone and texture.",
    href: "/routines#weekly-ritual",
    linkLabel: "Weekly routine",
  },
];

function RitualStripSection() {
  return (
    <section className="mystic-section border-b border-[rgba(17,24,39,0.9)] bg-[#04050a]">
      <div className="mystic-section-shell">
        <SectionIntro
          eyebrow="Rituals"
          title="Morning, night, and weekly."
          ctaHref="/routines"
          ctaLabel="View routines"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {HOME_RITUAL_RHYTHMS.map((ritual) => (
            <article key={ritual.label} className="mystic-card p-6 md:p-7">
              <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[#d6a85f]">
                {ritual.label}
              </p>
              <h3 className="mt-3 font-literata text-3xl tracking-[0.12em] text-[#f5eee3]">
                {ritual.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#b8ab95]">{ritual.body}</p>
              <Link
                href={ritual.href}
                className="mt-5 inline-flex text-[0.65rem] uppercase tracking-[0.22em] text-[#d6a85f] underline-offset-4 hover:underline"
              >
                {ritual.linkLabel}
              </Link>
            </article>
          ))}
        </div>
        <p className="mt-8 max-w-2xl text-sm leading-relaxed text-[#8f8576]">
          Ready to browse products? Open the{" "}
          <Link href="/shop" className="text-[#d6a85f] underline-offset-4 hover:underline">
            shop
          </Link>{" "}
          anytime.
        </p>
      </div>
    </section>
  );
}

function IngredientSpotlightSection() {
  const ingredients = MYSTIQUE_CANONICAL_INGREDIENTS;

  return (
    <section className="mystic-section border-b border-[rgba(17,24,39,0.9)] bg-[#05060c]">
      <div className="mystic-section-shell">
        <SectionIntro
          eyebrow="Ingredients"
          title="Actives we lean on."
          ctaHref="/ingredients"
          ctaLabel="Full ingredient guide"
        />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {/* Highlights; replace with API-driven rows when ingredient categories ship. */}
          {ingredients.map((ingredient) => (
            <article key={ingredient.id} className="mystic-card p-6">
              <p className="text-[0.72rem] uppercase tracking-[0.24em] text-[#d6a85f]">
                {ingredient.source ?? "Active"}
              </p>
              <h3 className="mt-3 font-literata text-3xl tracking-[0.08em]">
                {ingredient.name}
              </h3>
              <p className="mt-3 text-sm text-[#b8ab95]">{ingredient.benefits}</p>
              <Link
                href={`/shop?ingredient=${ingredient.id}`}
                className="mt-5 inline-flex text-[0.65rem] uppercase tracking-[0.2em] text-[#d6a85f] underline-offset-4 hover:underline"
              >
                Shop products with {ingredient.name}
              </Link>
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
              Letters from the house.
            </h2>
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
  body?: string;
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
        {body ? (
          <p className="text-sm leading-relaxed text-[#b8ab95]">{body}</p>
        ) : null}
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
