import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { HomeHeroMotion } from "./components/HomeHeroMotion";
import {
  DeferredHomeGuidedDiscovery,
  DeferredHomeServicesModule,
  DeferredHomeTrustStrip,
} from "./components/home/HomeDeferredSections";
import { IngredientSpotlightThumb } from "./components/IngredientSpotlightThumb";
import { NewsletterForm } from "./components/NewsletterForm";
import ProductCard from "./components/productcard";
import { SiteChrome } from "./components/SiteChrome";
import { MYSTIQUE_CANONICAL_INGREDIENTS } from "./lib/data";
import { getJournalEntries, getProducts } from "./lib/queries";
import { buildPageMetadata } from "./lib/seo";
import { mystiqueDefaultOpenGraphImages } from "./lib/socialMetadata";
import type { Product } from "./lib/types";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: "Mystique | Where Beauty Transcends",
    description:
      "Premium skincare with clear morning, night, and weekly rituals\u2014shop formulas by concern, read ingredient notes, and build a routine you will keep.",
    canonicalPath: "/",
    images: mystiqueDefaultOpenGraphImages(),
  }),
  title: { absolute: "Mystique | Where Beauty Transcends" },
  other: {
    "x-lcp-preload": "1",
  },
};

function LCPPreload() {
  return (
    <link
      rel="preload"
      as="image"
      href="/about/hero.jpg"
      imageSizes="(max-width: 768px) 100vw, (max-width: 1280px) 100vw, 1280px"
      fetchPriority="high"
    />
  );
}

export const revalidate = 30;

// ---------------------------------------------------------------------------
// SectionIntro
// ---------------------------------------------------------------------------
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
    <header className="mb-10 flex flex-col gap-6 md:mb-[4.5rem] md:flex-row md:items-end md:justify-between md:gap-10">
      <div className="relative max-w-2xl space-y-3.5 md:space-y-5 md:pl-1">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-1 top-1 hidden h-[calc(100%-0.25rem)] w-px bg-gradient-to-b from-[rgba(214,168,95,0.22)] via-[rgba(214,168,95,0.08)] to-transparent md:block"
        />
        {eyebrow ? (
          <p className="text-[0.68rem] uppercase tracking-[0.34em] text-[#8f8475]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-literata text-3xl font-light leading-[1.18] tracking-[0.12em] text-[#f5eee3] md:text-[2.35rem] md:leading-[1.15]">
          {title}
        </h2>
        {body ? (
          <p className="max-w-xl text-sm leading-[1.75] text-[#a99e8c] md:text-base md:leading-[1.78]">
            {body}
          </p>
        ) : null}
      </div>
      {ctaHref && ctaLabel ? (
        <Link
          href={ctaHref}
          className="mystic-button-secondary inline-flex items-center justify-center px-6 py-3 text-[0.66rem] uppercase tracking-[0.26em] transition-[color,border-color,background-color] duration-500 ease-out motion-reduce:transition-none"
        >
          {ctaLabel}
        </Link>
      ) : null}
    </header>
  );
}

// ---------------------------------------------------------------------------
// SectionLoading
// ---------------------------------------------------------------------------
function SectionLoading({
  title,
  layout = "default",
}: {
  title: string;
  layout?: "default" | "featuredProducts";
}) {
  const isFeatured = layout === "featuredProducts";
  return (
    <section className="border-b border-[rgba(17,24,39,0.9)] bg-transparent py-16 md:py-20">
      <div className="mystic-section-shell">
        <div className="mystique-section-surface px-6 py-10 md:px-11 md:py-12">
          <p className="text-[0.68rem] uppercase tracking-[0.34em] text-[#8f8475]">
            {title}
          </p>
          <div
            className={
              isFeatured
                ? "mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:gap-5"
                : "mt-6 grid gap-10 md:grid-cols-2 md:gap-x-10 md:gap-y-12 lg:grid-cols-3"
            }
          >
            {(isFeatured ? [0, 1, 2, 3] : [0, 1, 2]).map((i) => (
              <div
                key={i}
                className={
                  isFeatured
                    ? "mystic-card aspect-square sm:aspect-[4/5] w-full shrink-0 animate-pulse rounded-[18px]"
                    : "mystic-card min-h-[15.5rem] animate-pulse rounded-[var(--mystic-radius-card)]"
                }
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// JournalHomeSection
// ---------------------------------------------------------------------------
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
    <section className="mystic-section border-b border-[rgba(17,24,39,0.9)] bg-transparent py-16 md:py-28 lg:py-32">
      <div className="mystic-section-shell">
        <header className="mb-16 flex max-w-4xl flex-col gap-8 border-b border-[rgba(214,168,95,0.07)] pb-14 sm:mb-[4.5rem] sm:flex-row sm:items-end sm:justify-between sm:gap-12 sm:pb-16 md:mb-20 md:max-w-none md:pb-[4.5rem]">
          <div className="space-y-4 md:space-y-6">
            <p className="text-[0.66rem] uppercase tracking-[0.36em] text-[#7d7568]">
              Journal
            </p>
            <h2 className="max-w-xl font-literata text-[clamp(1.625rem,3.6vw,2.375rem)] font-light leading-[1.22] tracking-[0.11em] text-[#f2ebe4]">
              Skincare reads, written with care.
            </h2>
          </div>
          <Link
            href="/journal"
            className="shrink-0 self-start border border-[rgba(214,168,95,0.14)] bg-[rgba(2,3,6,0.28)] px-6 py-3 text-[0.62rem] uppercase tracking-[0.28em] text-[#b5a896] backdrop-blur-sm transition-[border-color,color,background-color] duration-500 ease-out hover:border-[rgba(214,168,95,0.24)] hover:bg-[rgba(2,3,6,0.38)] hover:text-[#e8dfd2] sm:self-auto"
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
          <div className="mystique-section-surface mx-auto grid max-w-6xl gap-12 px-6 py-10 sm:gap-14 md:grid-cols-2 md:gap-x-12 md:gap-y-16 md:px-11 md:py-12 lg:grid-cols-3 lg:gap-x-14">
            {preview.map((entry) => (
              <Link
                key={entry.slug}
                href={`/journal/${entry.slug}`}
                className="group relative block rounded-[var(--mystic-radius-card)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(212,175,55,0.4)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04050a]"
              >
                <article className="relative flex h-full min-h-[15.5rem] flex-col overflow-hidden rounded-[var(--mystic-radius-card)] border border-[rgba(214,168,95,0.09)] bg-[linear-gradient(168deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.01)_42%,rgba(0,0,0,0.14)_100%)] px-8 py-9 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-[border-color,box-shadow,transform] duration-700 ease-out before:pointer-events-none before:absolute before:inset-0 before:rounded-[var(--mystic-radius-card)] before:bg-[radial-gradient(ellipse_90%_70%_at_0%_0%,rgba(214,168,95,0.055),transparent_55%)] before:opacity-50 group-hover:-translate-y-px group-hover:border-[rgba(214,168,95,0.18)] group-hover:shadow-[0_28px_56px_rgba(0,0,0,0.38)] md:min-h-[16rem] md:px-9 md:py-10">
                  <p className="text-[0.6rem] uppercase tracking-[0.26em] text-[#7d7568]">
                    <span className="text-[#b5a892]">
                      {JOURNAL_CATEGORY_PILL[entry.category] ?? entry.category}
                    </span>
                    <span className="mx-2.5 inline-block text-[rgba(214,168,95,0.22)]">&middot;</span>
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
                  <p className="mt-4 line-clamp-3 text-[0.8125rem] leading-[1.55] text-[#8f867a]">
                    {entry.excerpt}
                  </p>
                  <div className="mt-auto flex items-center justify-between gap-3 pt-10">
                    <span className="text-[0.58rem] uppercase tracking-[0.22em] text-[#9d8f78] transition group-hover:text-[#c9b896]">
                      Essay
                    </span>
                    <span
                      aria-hidden
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(214,168,95,0.14)] text-[0.75rem] text-[rgba(214,168,95,0.55)] transition duration-300 group-hover:border-[rgba(214,168,95,0.28)] group-hover:text-[rgba(214,168,95,0.9)]"
                    >
                      &rarr;
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

// ---------------------------------------------------------------------------
// HomePage (root)
// ---------------------------------------------------------------------------
export default async function HomePage() {
  const catalog = await getProducts({ sortBy: "featured", limit: 12 });
  const heroQuickViewProduct = catalog[0] ?? null;

  return (
    <SiteChrome>
      <LCPPreload />
      <main className="relative isolate min-w-0">
        {/*
          Homepage-only ambient: kintsugi / gold-vein reference (very low opacity) +
          procedural vein SVGs + vignette. Sits under film grain + sections; card
          components and layouts are unchanged — theme reads in the margins and through
          transparent section backgrounds.
        */}
        <div className="home-page-ambient" aria-hidden>
          <div className="home-page-ambient__photo" />
          <div className="home-page-ambient__veins" />
          <div className="home-page-ambient__veins home-page-ambient__veins--mirror" />
          <div className="home-page-ambient__wash" />
        </div>
        <div className="home-premium-filmgrain" aria-hidden />
        <div className="home-premium-stack min-w-0">
          {/* 1. Hero */}
          <HomeHeroMotion quickViewProduct={heroQuickViewProduct} />

          {/* `overflow-x-clip` only below hero — on `<main>` it clipped `.mystique-first-section` negative margin (CSS overflow pairing). */}
          <div className="min-w-0 overflow-x-clip">
            {/* 2. Trust strip */}
            <DeferredHomeTrustStrip />

            {/* 3. Featured Products — hero card + 3-up supporting grid */}
            <FeaturedProductsSection products={catalog} />

            {/* 4. Rituals */}
            <RitualStripSection />

            {/* 5. Guided discovery (includes first-visit concerns) */}
            <DeferredHomeGuidedDiscovery />

            {/* 6. Ingredients */}
            <IngredientSpotlightSection />

            {/* 7. Journal */}
            <Suspense fallback={<SectionLoading title="Journal" />}>
              <JournalHomeSection />
            </Suspense>

            {/* 8. Services / Gifting */}
            <DeferredHomeServicesModule />

            {/* 9. Brand Story + Newsletter */}
            <NewsletterSection />
          </div>
        </div>
      </main>
    </SiteChrome>
  );
}

// ---------------------------------------------------------------------------
// FeaturedProductsSection
// Hero product gets a prominent solo card; remaining 3 go into a sub-grid.
// ---------------------------------------------------------------------------
function FeaturedProductsSection({ products }: { products: Product[] }) {
  const [hero, ...rest] = products.slice(0, 4);
  const supporting = rest.slice(0, 3);

  return (
    <section className="mystic-section mystique-atmo mystique-atmo--featured relative border-b border-[rgba(17,24,39,0.85)] bg-transparent py-16 md:py-24 lg:py-28">
      <div className="mystic-section-shell">
        <div className="mystique-section-surface mystique-commerce-surface mystique-section-ore px-6 py-10 md:px-11 md:py-12">
          <SectionIntro
            eyebrow="Featured"
            title="Textures worth returning to."
            ctaHref="/shop?sort=featured"
            ctaLabel="Browse featured"
          />

          {!hero ? (
            <div className="mystic-card max-w-2xl border border-[rgba(214,168,95,0.12)] p-8 text-sm leading-relaxed text-[#a99e8e]">
              <p className="font-literata text-xl tracking-[0.08em] text-[#f6f0e6]">
                Featured products will appear here once the catalog is live.
              </p>
              <p className="mt-3">
                Browse the{" "}
                <Link
                  href="/shop?sort=featured"
                  className="text-[#9a8f7e] underline-offset-[5px] transition-[color] duration-500 ease-out hover:text-[#c4b8a4] hover:underline"
                >
                  shop
                </Link>{" "}
                or explore{" "}
                <Link
                  href="/routines"
                  className="text-[#9a8f7e] underline-offset-[5px] transition-[color] duration-500 ease-out hover:text-[#c4b8a4] hover:underline"
                >
                  routines
                </Link>
                .
              </p>
            </div>
          ) : (
            <>
              <div className="mx-auto mb-8 w-full max-w-5xl px-1 md:mb-10 md:px-4 lg:px-6">
                <ProductCard
                  product={hero}
                  showQuickView
                  featuredHero
                  priority
                />
              </div>
              {supporting.length > 0 && (
                <div
                  role="region"
                  aria-label="More featured products"
                  className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7"
                >
                  {supporting.map((product) => (
                    <div key={product.id}>
                      <ProductCard product={product} compact showQuickView />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// RitualStripSection — spacing uses clean utility classes (no !important)
// ---------------------------------------------------------------------------
const HOME_RITUAL_RHYTHMS: {
  label: string;
  title: string;
  href: string;
  linkLabel: string;
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
    <section className="mystic-section mystique-atmo mystique-atmo--rituals relative border-b border-[rgba(214,168,95,0.06)] bg-transparent py-20 md:py-32">
      <div className="mystic-section-shell">
        <div className="mystique-section-surface px-6 py-10 md:px-11 md:py-12">
          <SectionIntro
            title="Our Rituals"
            ctaHref="/routines"
            ctaLabel="See routine steps"
          />
          <div className="mx-auto grid max-w-5xl items-start gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3 lg:gap-8">
            {HOME_RITUAL_RHYTHMS.map((ritual) => (
              <article
                key={ritual.label}
                className="group relative isolate flex h-auto flex-col justify-start overflow-hidden mystic-card shadow-[0_20px_48px_rgba(0,0,0,0.38)] ring-1 ring-inset ring-[rgba(212,175,55,0.055)] transition-[box-shadow,transform] duration-700 ease-out hover:shadow-[0_26px_60px_rgba(0,0,0,0.44)] hover:ring-[rgba(212,175,55,0.09)]"
              >
                <div className="pointer-events-none absolute inset-0">
                  <div
                    aria-hidden
                    className={`absolute inset-0 opacity-90 transition-opacity duration-700 ease-out group-hover:opacity-[0.98] ${ritual.washClassName}`}
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
                <div className="relative z-10 flex flex-col gap-5 p-6 md:gap-6 md:p-7">
                  <div className="space-y-2.5">
                    <p className="text-[0.6rem] uppercase tracking-[0.3em] text-[#c9b896] drop-shadow-[0_1px_10px_rgba(0,0,0,0.65)]">
                      {ritual.label}
                    </p>
                    <h3 className="font-literata text-[1.4rem] font-light tracking-[0.09em] text-[#f5eee3] drop-shadow-[0_2px_20px_rgba(0,0,0,0.6)] md:text-[1.52rem]">
                      {ritual.title}
                    </h3>
                  </div>
                  {/* Touch target: min-h-[44px] ensures mobile tap compliance */}
                  <Link
                    href={ritual.href}
                    className="inline-flex min-h-[44px] w-fit items-center text-[0.58rem] uppercase tracking-[0.24em] text-[#b5a078] underline-offset-[6px] transition-[color] duration-500 ease-out hover:text-[#d4c4a4] hover:underline"
                  >
                    {ritual.linkLabel}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// IngredientSpotlightSection
// Fix: ingredient shop link now reads "Shop formulas →" — no string concat.
// ---------------------------------------------------------------------------
function IngredientSpotlightSection() {
  const ingredients = MYSTIQUE_CANONICAL_INGREDIENTS;

  return (
    <section className="mystic-section mystique-material mystique-material--soft relative border-b border-[rgba(17,24,39,0.88)] bg-transparent py-16 md:py-24">
      <div className="mystic-section-shell">
        <div className="mystique-section-surface px-6 py-10 md:px-11 md:py-12">
          <SectionIntro
            eyebrow="Ingredients"
            title="Actives we formulate around."
            ctaHref="/ingredients"
            ctaLabel="How we choose ingredients"
          />
          <div className="grid gap-7 md:grid-cols-2 md:gap-8 xl:grid-cols-3">
            {ingredients.map((ingredient, index) => {
              const isPoster = ingredient.imagePresentation === "poster";
              const stg = index % 3;
              return (
                <article
                  key={ingredient.id}
                  className={`group mystic-card mystique-ingredient-card--stg-${stg} relative flex flex-row items-start gap-5 overflow-hidden rounded-[var(--mystic-radius-card)] border border-[rgba(214,168,95,0.11)] bg-gradient-to-br from-[rgba(14,16,24,0.78)] via-[rgba(8,10,18,0.58)] to-[rgba(5,6,14,0.72)] p-6 shadow-[0_14px_44px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.04)] ring-1 ring-inset ring-[rgba(214,168,95,0.06)] transition-[box-shadow,border-color,ring-color] duration-500 ease-out before:pointer-events-none before:absolute before:inset-0 before:z-[1] before:bg-[radial-gradient(ellipse_95%_85%_at_0%_0%,rgba(214,168,95,0.08),transparent_58%)] before:opacity-0 before:transition-opacity before:duration-500 hover:border-[rgba(214,168,95,0.16)] hover:shadow-[0_18px_52px_rgba(0,0,0,0.34)] hover:ring-[rgba(214,168,95,0.1)] hover:before:opacity-100 sm:gap-6 sm:p-7`}
                >
                  <div
                    className="mystique-ingredient-card-atmosphere"
                    aria-hidden
                  />
                  <div className="relative z-[2] shrink-0">
                    <IngredientSpotlightThumb
                      id={ingredient.id}
                      imageSrc={ingredient.imageSrc}
                      name={ingredient.name}
                      presentation={ingredient.imagePresentation ?? "thumb"}
                    />
                  </div>
                  <div className="relative z-[2] min-w-0 flex-1">
                    {isPoster ? (
                      <>
                        <p className="sr-only">
                          {[ingredient.source, ingredient.name]
                            .filter(Boolean)
                            .join(" — ")}
                        </p>
                        <h3 className="sr-only">{ingredient.name}</h3>
                        {ingredient.description ? (
                          <p className="text-sm leading-relaxed text-[#cfc3b0] line-clamp-5 [text-shadow:0_1px_14px_rgba(0,0,0,0.25)]">
                            {ingredient.description}
                          </p>
                        ) : null}
                      </>
                    ) : (
                      <>
                        <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#c4b49a]">
                          {ingredient.source ?? "Active"}
                        </p>
                        <h3 className="mt-2.5 font-literata text-2xl font-light tracking-[0.09em] text-[#faf6f0] [text-shadow:0_1px_18px_rgba(0,0,0,0.28)] sm:text-[1.85rem]">
                          {ingredient.name}
                        </h3>
                      </>
                    )}
                    {/*
                      FIX: Previously "Shop {ingredient.name} formulas" rendered as
                      a run-together string (e.g. "ShopNiacinamide formulas").
                      Now uses a clean, readable static label + aria-label for context.
                    */}
                    <Link
                      href={`/shop?ingredient=${ingredient.id}`}
                      aria-label={`Shop ${ingredient.name} formulas`}
                      className="mt-5 inline-flex min-h-[44px] items-center text-[0.6rem] uppercase tracking-[0.24em] text-[#c9b896] underline-offset-[5px] transition-[color] duration-500 ease-out hover:text-[#e8d4b0] hover:underline"
                    >
                      Shop formulas &rarr;
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// NewsletterSection (brand story + newsletter)
// ---------------------------------------------------------------------------
function NewsletterSection() {
  return (
    <section className="mystic-section relative py-16 pb-20 md:py-24 md:pb-28">
      <div className="mystic-section-shell">
        {/* Brand story — single instance only */}
        <section
          aria-labelledby="home-story-heading"
          className="mystique-material mystique-material--story mystique-section-ore mb-14 overflow-hidden rounded-[26px] border border-[rgba(214,168,95,0.1)] bg-[linear-gradient(168deg,rgba(255,255,255,0.026)_0%,rgba(255,255,255,0.01)_46%,rgba(0,0,0,0.15)_100%)] shadow-[0_24px_72px_rgba(0,0,0,0.4)]"
        >
          <div className="grid gap-10 p-8 md:grid-cols-[1.05fr_0.95fr] md:items-center md:gap-12 md:p-10">
            <div className="space-y-6">
              <p className="text-[0.68rem] uppercase tracking-[0.32em] text-[#8f8475]">
                The story
              </p>
              <h2
                id="home-story-heading"
                className="font-literata text-3xl font-light leading-[1.2] tracking-[0.11em] text-[#f5eee3] md:text-[2.35rem]"
              >
                California restraint, built into ritual.
              </h2>
              <p className="max-w-xl text-sm leading-[1.75] text-[#a99e8c] md:text-base md:leading-[1.78]">
                Mystique is designed for the routines you repeat: plush textures, clear steps,
                and finishes that look calm in real light.
              </p>
              <Link
                href="/about"
                className="inline-flex min-h-[44px] items-center text-[0.6rem] uppercase tracking-[0.26em] text-[#9a8a72] underline-offset-[5px] transition-[color] duration-500 ease-out hover:text-[#c4b49a] hover:underline"
              >
                Read the story
              </Link>
            </div>

            <figure className="group relative aspect-[3/2] w-full overflow-hidden rounded-[22px] border border-[rgba(214,168,95,0.12)] bg-[#05070d] shadow-[0_28px_80px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]">
              <Image
                src="/home-story-ritual.png"
                alt="Mystique ritual — golden dropper and hands in soft light"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 45vw, 520px"
                className="object-cover object-[52%_42%] transition-[transform,filter] duration-[1.35s] ease-out group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                quality={90}
              />
              {/* Readability + luxury depth */}
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-[#03050a] via-[#05070d]/55 to-[#0a0c14]/25"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(ellipse_85%_70%_at_50%_18%,rgba(214,168,95,0.14),transparent_58%)] mix-blend-soft-light opacity-90"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#04060d]/40"
              />
              <div
                aria-hidden
                className="absolute inset-0 ring-1 ring-inset ring-white/[0.06] rounded-[22px]"
              />
              <figcaption className="absolute inset-0 flex flex-col items-start justify-end p-7 md:p-8">
                <span
                  aria-hidden
                  className="mb-3 h-px w-10 bg-gradient-to-r from-[rgba(214,168,95,0.65)] to-transparent"
                />
                <p className="text-[0.58rem] uppercase tracking-[0.34em] text-[#e8d4b0] [text-shadow:0_1px_18px_rgba(0,0,0,0.85)]">
                  Est. Ritual
                </p>
                <p className="mt-2 max-w-[16rem] font-literata text-lg font-light leading-snug tracking-[0.12em] text-[#f5eee3] [text-shadow:0_2px_28px_rgba(0,0,0,0.75)] md:text-xl">
                  Built for repetition.
                </p>
              </figcaption>
            </figure>
          </div>
        </section>

        {/* Newsletter capture */}
        <div className="home-luxury-frame mystic-card mystique-material mystique-material--newsletter mystique-section-ore grid gap-10 rounded-[26px] px-7 py-10 md:grid-cols-[1fr_auto] md:items-center md:gap-12 md:px-10 md:py-11">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.32em] text-[#8f8475]">
              Newsletter
            </p>
            <h2 className="mt-4 font-literata text-4xl font-light leading-[1.15] tracking-[0.11em] text-[#f5eee3]">
              Notes from the studio.
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-[1.75] text-[#a99e8c]">
              Join for early access to launches, restock alerts, and ritual guidance&#x2014;written
              with restraint.
            </p>
          </div>
          <div>
            <NewsletterForm />
          </div>
        </div>
      </div>
    </section>
  );
}
