import Link from "next/link";
import type { Metadata } from "next";
import { HomeHeroMotion } from "./components/HomeHeroMotion";
import {
  DeferredHomeGuidedDiscovery,
  DeferredHomeIngredientSpotlight,
  DeferredHomeJournal,
  DeferredHomeNewsletter,
  DeferredHomeRitualStrip,
  DeferredHomeServicesModule,
  DeferredHomeTrustStrip,
} from "./components/home/HomeDeferredSections";
import ProductCard from "./components/productcard";
import { SiteChrome } from "./components/SiteChrome";
import { getJournalEntries, getProducts } from "./lib/queries";
import { buildPageMetadata } from "./lib/seo";
import { mystiqueDefaultOpenGraphImages } from "./lib/socialMetadata";
import type { Product } from "./lib/types";

// Homepage-only styles are loaded via this CSS module rather than globals.css
// so they don't add bytes to every other route's render-blocking stylesheet.
// `:global { ... }` inside page.module.css preserves the existing class names.
import pageStyles from "./page.module.css";
void pageStyles;

export const dynamic = "force-dynamic";

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
// HomePage (root)
// ---------------------------------------------------------------------------
//
// Render strategy (Problem 2: defer below-fold JS until scroll):
//   1. Hero (`HomeHeroMotion`)              — immediate, ships with the page
//   2. Featured products (`FeaturedProductsSection`) — immediate (first product
//      grid, contains the LCP candidate)
//
// Everything else is wrapped in `dynamic({ ssr: false })` so its JS chunk
// only loads when React mounts the lazy boundary on the client. The trust
// strip, guided discovery, services, and ritual companion launchers were
// already deferred; this commit also defers rituals, ingredients, journal,
// and newsletter.
// ---------------------------------------------------------------------------
export default async function HomePage() {
  const [catalog, journalEntries] = await Promise.all([
    getProducts({ sortBy: "featured", limit: 12 }),
    getJournalEntries(),
  ]);
  const heroQuickViewProduct = catalog[0] ?? null;

  return (
    <SiteChrome>
      <LCPPreload />
      <main className="relative isolate min-w-0 w-full">
        <div className="home-page-ambient" aria-hidden>
          <div className="home-page-ambient__photo" />
          <div className="home-page-ambient__veins" />
          <div className="home-page-ambient__veins home-page-ambient__veins--mirror" />
          <div className="home-page-ambient__wash" />
        </div>
        <div className="home-premium-filmgrain" aria-hidden />
        <div className="home-premium-stack w-full min-w-0">
          {/* 1. Hero — PRIMARY CTA (Shop the collection). Immediate render. */}
          <HomeHeroMotion quickViewProduct={heroQuickViewProduct} />

          <div className="min-w-0 overflow-x-clip">
            {/* 2. Trust strip — already lazy. */}
            <DeferredHomeTrustStrip />

            {/* 3. Featured Products — immediate (LCP-adjacent first grid). */}
            <FeaturedProductsSection products={catalog} />

            {/* 4. Rituals — deferred. */}
            <DeferredHomeRitualStrip />

            {/* 5. Guided discovery — deferred. */}
            <DeferredHomeGuidedDiscovery />

            {/* 6. Ingredients — deferred. */}
            <DeferredHomeIngredientSpotlight />

            {/* 7. Journal — deferred (server-fetched entries flow through). */}
            <DeferredHomeJournal entries={journalEntries} />

            {/* 8. Services / Gifting — deferred. */}
            <DeferredHomeServicesModule />

            {/* 9. Brand Story + Newsletter — deferred. */}
            <DeferredHomeNewsletter />
          </div>
        </div>
      </main>
    </SiteChrome>
  );
}

// ---------------------------------------------------------------------------
// SectionIntro (only used by the immediate-render FeaturedProductsSection
// below). Lazy sections own their own local SectionIntro to keep the bundle
// graph tight.
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
        /*
         * CTA hierarchy audit: ghost CTA — must not compete with the hero
         * primary "Shop the collection" button. min-h-[44px] = WCAG 2.5.5.
         */
        <Link
          href={ctaHref}
          className="inline-flex min-h-[44px] items-center justify-center self-start border border-[rgba(214,168,95,0.2)] bg-transparent px-6 py-2.5 text-[0.64rem] uppercase tracking-[0.26em] text-[#b5a896] backdrop-blur-sm transition-[border-color,color,background-color] duration-500 ease-out hover:border-[rgba(214,168,95,0.32)] hover:bg-[rgba(214,168,95,0.06)] hover:text-[#e8dfd2] motion-reduce:transition-none md:self-auto"
        >
          {ctaLabel}
        </Link>
      ) : null}
    </header>
  );
}

// ---------------------------------------------------------------------------
// FeaturedProductsSection — immediate render. Stays in page.tsx because the
// hero's quick-view product comes from the same catalog query, and the LCP
// candidate lives inside this grid.
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
