import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { HomeHeroMotion } from "./components/HomeHeroMotion";
import { IngredientSpotlightThumb } from "./components/IngredientSpotlightThumb";
import { NewsletterForm } from "./components/NewsletterForm";
import ProductCard from "./components/productcard";
import { SiteChrome } from "./components/SiteChrome";
import { MYSTIQUE_CANONICAL_INGREDIENTS } from "./lib/data";
import { getJournalEntries, getProducts } from "./lib/queries";
import { isProductPurchasable } from "./lib/productMerch";

export const metadata: Metadata = {
  title: {
    absolute: "Mystique | Where Beauty Transcends",
  },
  description:
    "Premium skincare with clear morning, night, and weekly rituals—shop formulas by concern, read ingredient notes, and build a routine you will keep.",
};

export const revalidate = 300;

function SectionIntro({
  eyebrow,
  title,
  body,
  ctaHref,
  ctaLabel,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <header className="mb-12 flex flex-col gap-5 md:mb-14 md:flex-row md:items-end md:justify-between md:gap-6">
      <div className="max-w-2xl space-y-3 md:space-y-4">
        {eyebrow ? (
          <p className="text-[0.75rem] uppercase tracking-[0.3em] text-[#b8ab95]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-literata text-3xl tracking-[0.14em] text-[#f5eee3] md:text-4xl">
          {title}
        </h2>
        {body ? (
          <p className="max-w-xl text-sm leading-relaxed text-[#b8ab95] md:text-base">
            {body}
          </p>
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

function SectionLoading({
  title,
  layout = "default",
}: {
  title: string;
  layout?: "default" | "featuredProducts";
}) {
  const isFeatured = layout === "featuredProducts";
  return (
    <section className="border-b border-[rgba(17,24,39,0.9)] bg-[#05070d]/80 py-16">
      <div className="mystic-section-shell">
        <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
          {title}
        </p>
        <div
          className={
            isFeatured
              ? "mx-auto mt-6 grid w-full max-w-[min(100%,42rem)] grid-cols-2 gap-2.5 sm:max-w-[min(100%,48rem)] sm:gap-3 md:max-w-[min(100%,52rem)] md:grid-cols-4 md:gap-3.5 lg:gap-4"
              : "mt-6 grid gap-10 md:grid-cols-2 md:gap-x-10 md:gap-y-12 lg:grid-cols-3"
          }
        >
          {(isFeatured ? [0, 1, 2, 3] : [0, 1, 2]).map((i) => (
            <div
              key={i}
              className={
                isFeatured
                  ? "mystic-card aspect-[3/5] max-h-72 animate-pulse sm:max-h-none"
                  : "mystic-card min-h-[15.5rem] animate-pulse rounded-[var(--mystic-radius-card)]"
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}

const JOURNAL_CATEGORY_PILL: Record<string, string> = {
  Ritual: "Ritual",
  Science: "Science",
  Glow: "Glow",
  Routine: "Routine",
};

async function JournalHomeSection() {
  const entries = await getJournalEntries();
  const preview = entries.slice(0, 3);

  return (
    <section className="mystic-section border-b border-[rgba(17,24,39,0.9)] bg-[linear-gradient(180deg,#020308_0%,#04050a_42%,#03040a_100%)] !py-[5.25rem] md:!py-28 lg:!py-32">
      <div className="mystic-section-shell">
        <header className="mb-14 flex max-w-4xl flex-col gap-8 border-b border-[rgba(214,168,95,0.09)] pb-12 sm:mb-16 sm:flex-row sm:items-end sm:justify-between sm:gap-10 sm:pb-14 md:mb-20 md:max-w-none md:pb-16">
          <div className="space-y-4 md:space-y-5">
            <p className="text-[0.7rem] uppercase tracking-[0.34em] text-[#8a8275]">
              Journal
            </p>
            <h2 className="max-w-xl font-literata text-[clamp(1.625rem,3.6vw,2.375rem)] font-normal leading-[1.2] tracking-[0.1em] text-[#f2ebe4]">
              Skincare reads, written with care.
            </h2>
          </div>
          <Link
            href="/journal"
            className="shrink-0 self-start border border-[rgba(214,168,95,0.2)] bg-[rgba(2,3,6,0.35)] px-6 py-3 text-[0.65rem] uppercase tracking-[0.24em] text-[#d4c9b4] backdrop-blur-sm transition hover:border-[rgba(214,168,95,0.35)] hover:text-[#f0e8dc] sm:self-auto"
          >
            View all
          </Link>
        </header>
        {preview.length === 0 ? (
          <div className="mystic-card max-w-2xl border border-[rgba(214,168,95,0.12)] p-8 text-sm leading-[1.7] text-[#a99e8e]">
            <p>
              New pieces will appear here as the library grows. Until then, browse the full{" "}
              <Link href="/journal" className="text-[#d6c4a0] underline-offset-4 transition hover:text-[#e8d5b0] hover:underline">
                journal
              </Link>{" "}
              or explore the{" "}
              <Link href="/shop" className="text-[#d6c4a0] underline-offset-4 transition hover:text-[#e8d5b0] hover:underline">
                shop
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="mx-auto grid max-w-6xl gap-10 sm:gap-12 md:grid-cols-2 md:gap-x-10 md:gap-y-14 lg:grid-cols-3 lg:gap-x-12">
            {preview.map((entry) => (
              <Link
                key={entry.slug}
                href={`/journal/${entry.slug}`}
                className="group relative block rounded-[var(--mystic-radius-card)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(212,175,55,0.4)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04050a]"
              >
                <article className="relative flex h-full min-h-[15.5rem] flex-col overflow-hidden rounded-[var(--mystic-radius-card)] border border-[rgba(214,168,95,0.1)] bg-[linear-gradient(168deg,rgba(255,255,255,0.035)_0%,rgba(255,255,255,0.012)_42%,rgba(0,0,0,0.14)_100%)] px-7 py-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-[border-color,box-shadow,transform] duration-500 ease-out before:pointer-events-none before:absolute before:inset-0 before:rounded-[var(--mystic-radius-card)] before:bg-[radial-gradient(ellipse_90%_70%_at_0%_0%,rgba(214,168,95,0.07),transparent_55%)] before:opacity-60 group-hover:-translate-y-0.5 group-hover:border-[rgba(214,168,95,0.24)] group-hover:shadow-[0_32px_64px_rgba(0,0,0,0.42)] md:min-h-[16rem] md:px-8 md:py-9">
                  <p className="text-[0.6rem] uppercase tracking-[0.26em] text-[#7d7568]">
                    <span className="text-[#b5a892]">
                      {JOURNAL_CATEGORY_PILL[entry.category] ?? entry.category}
                    </span>
                    <span className="mx-2.5 inline-block text-[rgba(214,168,95,0.22)]">·</span>
                    <span className="font-medium tabular-nums tracking-[0.18em]">
                      {entry.readTime}
                    </span>
                  </p>
                  <div
                    aria-hidden
                    className="mt-5 h-px w-10 bg-gradient-to-r from-[rgba(214,168,95,0.35)] via-[rgba(214,168,95,0.1)] to-transparent"
                  />
                  <h3 className="mt-6 text-balance font-literata text-[clamp(1.2rem,2.4vw,1.45rem)] leading-[1.35] tracking-[0.06em] text-[#f5f0ea] transition group-hover:text-[#faf7f3]">
                    {entry.title}
                  </h3>
                  <div className="mt-auto flex items-center justify-between gap-3 pt-10">
                    <span className="text-[0.58rem] uppercase tracking-[0.22em] text-[#9d8f78] transition group-hover:text-[#c9b896]">
                      Essay
                    </span>
                    <span
                      aria-hidden
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(214,168,95,0.14)] text-[0.75rem] text-[rgba(214,168,95,0.55)] transition duration-300 group-hover:border-[rgba(214,168,95,0.28)] group-hover:text-[rgba(214,168,95,0.9)]"
                    >
                      →
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default async function HomePage() {
  return (
    <SiteChrome>
      <main>
        <HomeHeroMotion />
        <RitualStripSection />
        <FirstVisitGuidanceStrip />
        <Suspense fallback={<SectionLoading title="Ritual signatures" layout="featuredProducts" />}>
          <FeaturedProductsSection />
        </Suspense>
        <IngredientSpotlightSection />
        <Suspense fallback={<SectionLoading title="Journal" />}>
          <JournalHomeSection />
        </Suspense>
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
  const products = await getProducts({ sortBy: "featured", limit: 12 });
  const purchasable = products.filter(isProductPurchasable).slice(0, 4);

  if (purchasable.length === 0) {
    return null;
  }

  return (
    <section className="mystic-section border-b border-[rgba(17,24,39,0.9)] bg-[#05070d]/80">
      <div className="mystic-section-shell">
        <SectionIntro
          eyebrow="Featured"
          title="Textures worth returning to."
          ctaHref="/shop?sort=featured"
          ctaLabel="Browse featured"
        />
        <div className="mx-auto grid w-full max-w-[min(100%,42rem)] grid-cols-2 gap-2.5 sm:max-w-[min(100%,48rem)] sm:gap-3 md:max-w-[min(100%,52rem)] md:grid-cols-4 md:gap-3.5 lg:gap-4">
          {purchasable.map((product) => (
            <ProductCard key={product.id} product={product} compact />
          ))}
        </div>
      </div>
    </section>
  );
}

const HOME_RITUAL_RHYTHMS: {
  label: string;
  title: string;
  href: string;
  linkLabel: string;
  /** CSS-only wash (no photography). */
  washClassName: string;
}[] = [
  {
    label: "Morning",
    title: "Daylight Ritual",
    href: "/routines#morning-ritual",
    linkLabel: "Morning routine",
    washClassName:
      "bg-[radial-gradient(ellipse_90%_70%_at_18%_12%,rgba(255,186,120,0.22),transparent_55%),radial-gradient(circle_at_92%_78%,rgba(214,168,95,0.12),transparent_42%),linear-gradient(195deg,rgba(28,22,18,0.95)_0%,rgba(6,7,12,1)_55%,rgb(4,5,10)_100%)]",
  },
  {
    label: "Night",
    title: "Recovery Ritual",
    href: "/routines#night-ritual",
    linkLabel: "Night routine",
    washClassName:
      "bg-[radial-gradient(ellipse_85%_65%_at_82%_8%,rgba(120,140,220,0.18),transparent_52%),radial-gradient(circle_at_12%_70%,rgba(214,168,95,0.08),transparent_45%),linear-gradient(205deg,rgba(10,12,24,1)_0%,rgba(4,5,10,1)_58%,rgb(3,4,8)_100%)]",
  },
  {
    label: "Weekly",
    title: "Reset Ritual",
    href: "/routines#weekly-ritual",
    linkLabel: "Weekly routine",
    washClassName:
      "bg-[radial-gradient(ellipse_95%_60%_at_50%_0%,rgba(214,168,95,0.16),transparent_50%),radial-gradient(circle_at_30%_90%,rgba(255,140,90,0.07),transparent_48%),linear-gradient(185deg,rgba(14,12,18,1)_0%,rgba(5,6,11,1)_50%,rgb(4,5,10)_100%)]",
  },
];

function RitualStripSection() {
  return (
    <section className="mystic-section border-b border-[rgba(17,24,39,0.9)] bg-[#04050a] !pt-24 !pb-24 md:!pt-32 md:!pb-32">
      <div className="mystic-section-shell">
        <SectionIntro
          title="Our Rituals"
          ctaHref="/routines"
          ctaLabel="See routine steps"
        />
        <div className="mx-auto grid max-w-5xl items-start gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7">
          {HOME_RITUAL_RHYTHMS.map((ritual) => (
            <article
              key={ritual.label}
              className="group relative isolate flex h-auto flex-col justify-start overflow-hidden mystic-card"
            >
              <div className="pointer-events-none absolute inset-0">
                <div
                  aria-hidden
                  className={`absolute inset-0 opacity-90 transition duration-700 ease-out group-hover:opacity-[0.98] ${ritual.washClassName}`}
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,5,10,0.5)_0%,rgba(4,5,10,0.72)_38%,rgba(4,5,10,0.92)_72%,rgb(4,5,10)_100%)]"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(214,168,95,0.12),transparent_55%)] opacity-80 mix-blend-soft-light"
                />
              </div>
              <div className="relative z-10 flex flex-col gap-4 p-5 md:gap-5 md:p-6">
                <div className="space-y-2">
                  <p className="text-[0.62rem] uppercase tracking-[0.26em] text-[#e8d4b0] drop-shadow-[0_1px_12px_rgba(0,0,0,0.85)]">
                    {ritual.label}
                  </p>
                  <h3 className="font-literata text-[1.4rem] tracking-[0.1em] text-[#f5eee3] drop-shadow-[0_2px_24px_rgba(0,0,0,0.75)] md:text-[1.55rem]">
                    {ritual.title}
                  </h3>
                </div>
                <Link
                  href={ritual.href}
                  className="inline-flex w-fit text-[0.6rem] uppercase tracking-[0.2em] text-[#e8c56e] underline-offset-4 transition hover:text-[#f5e6c8] hover:underline"
                >
                  {ritual.linkLabel}
                </Link>
              </div>
            </article>
          ))}
        </div>
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
          title="Actives we formulate around."
          ctaHref="/ingredients"
          ctaLabel="How we choose ingredients"
        />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {ingredients.map((ingredient) => (
            <article
              key={ingredient.id}
              className="group mystic-card relative flex flex-row items-start gap-4 overflow-hidden border border-white/[0.04] bg-gradient-to-br from-[rgba(18,20,28,0.55)] via-[rgba(8,10,16,0.35)] to-[rgba(4,5,10,0.25)] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.28)] transition duration-300 before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_90%_80%_at_0%_0%,rgba(214,168,95,0.06),transparent_55%)] before:opacity-0 before:transition-opacity hover:before:opacity-100 sm:gap-5 sm:p-6"
            >
              <IngredientSpotlightThumb
                id={ingredient.id}
                imageSrc={ingredient.imageSrc}
                name={ingredient.name}
              />
              <div className="relative z-[1] min-w-0 flex-1">
                <p className="text-[0.72rem] uppercase tracking-[0.24em] text-[#d6a85f]">
                  {ingredient.source ?? "Active"}
                </p>
                <h3 className="mt-2 font-literata text-2xl tracking-[0.08em] sm:text-3xl">
                  {ingredient.name}
                </h3>
                <Link
                  href={`/shop?ingredient=${ingredient.id}`}
                  className="mt-4 inline-flex text-[0.65rem] uppercase tracking-[0.2em] text-[#d6a85f] underline-offset-4 hover:underline"
                >
                  Shop {ingredient.name} formulas
                </Link>
              </div>
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
              Notes from the studio.
            </h2>
          </div>
          <div>
            <NewsletterForm />
            <p className="mt-3 text-xs text-[#8f8576]">
              Unsubscribe anytime. We send only what feels worth opening.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
