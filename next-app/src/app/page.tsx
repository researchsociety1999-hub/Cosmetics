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

export const metadata: Metadata = {
  title: {
    absolute: "Mystique | Where Beauty Transcends",
  },
  description:
    "California-rooted skincare—five-step routines, layer-friendly textures, and calm, healthy-looking radiance.",
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
              : "mt-6 grid gap-6 md:grid-cols-3"
          }
        >
          {(isFeatured ? [0, 1, 2, 3] : [0, 1, 2]).map((i) => (
            <div
              key={i}
              className={
                isFeatured
                  ? "mystic-card aspect-[3/5] max-h-72 animate-pulse sm:max-h-none"
                  : "mystic-card h-64 animate-pulse"
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}

async function JournalHomeSection() {
  const entries = await getJournalEntries();
  const labelByCategory: Record<string, string> = {
    Ritual: "Ritual",
    Science: "Ingredient",
    Glow: "Guide",
    Routine: "Guide",
  };
  const preview = entries.slice(0, 3);

  return (
    <section className="mystic-section border-b border-[rgba(17,24,39,0.9)] bg-[#04050a]">
      <div className="mystic-section-shell">
        <SectionIntro
          eyebrow="Journal"
          title="Rituals, guides, and glow notes."
          body="Short reads from the studio—layering, ingredients, and the quiet art of caring for your skin."
          ctaHref="/journal"
          ctaLabel="All journal entries"
        />
        {preview.length === 0 ? (
          <div className="mystic-card max-w-2xl p-8 text-sm leading-relaxed text-[#b8ab95]">
            <p>
              New essays are in edit. When they publish, you will find ritual
              walk-throughs and ingredient notes here—and on the full{" "}
              <Link href="/journal" className="text-[#d6a85f] underline-offset-4 hover:underline">
                journal
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {preview.map((entry) => (
              <article key={entry.slug} className="mystic-card flex flex-col p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="mystic-pill !px-3 !py-1.5 !text-[0.62rem] !tracking-[0.24em]">
                    {labelByCategory[entry.category] ?? "Guide"}
                  </span>
                  <p className="text-[0.72rem] uppercase tracking-[0.22em] text-[#d6a85f]">
                    {entry.category} · {entry.readTime}
                  </p>
                </div>
                <h3 className="mt-3 font-literata text-2xl tracking-[0.08em] text-[#f5eee3] md:text-[1.75rem]">
                  {entry.title}
                </h3>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-[#b8ab95]">
                  {entry.excerpt}
                </p>
                <Link
                  href={`/journal/${entry.slug}`}
                  className="mt-6 inline-flex text-[0.65rem] uppercase tracking-[0.2em] text-[#f0d19a] underline-offset-4 hover:underline"
                >
                  Continue reading
                </Link>
              </article>
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
  const products = await getProducts({ sortBy: "featured", limit: 4 });

  return (
    <section className="mystic-section border-b border-[rgba(17,24,39,0.9)] bg-[#05070d]/80">
      <div className="mystic-section-shell">
        <SectionIntro
          eyebrow="Ritual signatures"
          title="Textures worth the ritual."
          body=""
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
          <div className="mx-auto grid w-full max-w-[min(100%,42rem)] grid-cols-2 gap-2.5 sm:max-w-[min(100%,48rem)] sm:gap-3 md:max-w-[min(100%,52rem)] md:grid-cols-4 md:gap-3.5 lg:gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} compact />
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
          title="Our rituals"
          body="Morning, night, and weekly."
          ctaHref="/routines"
          ctaLabel="View routines"
        />
        <div className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7">
          {HOME_RITUAL_RHYTHMS.map((ritual) => (
            <article
              key={ritual.label}
              className="group relative isolate flex min-h-[15.5rem] flex-col justify-end overflow-hidden mystic-card sm:min-h-[16.5rem] md:min-h-[17rem]"
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
              <div className="relative z-10 flex flex-col gap-5 p-6 md:gap-6 md:p-7">
                <div className="space-y-2.5">
                  <p className="text-[0.62rem] uppercase tracking-[0.26em] text-[#e8d4b0] drop-shadow-[0_1px_12px_rgba(0,0,0,0.85)]">
                    {ritual.label}
                  </p>
                  <h3 className="font-literata text-2xl tracking-[0.1em] text-[#f5eee3] drop-shadow-[0_2px_24px_rgba(0,0,0,0.75)] md:text-[1.65rem]">
                    {ritual.title}
                  </h3>
                </div>
                <Link
                  href={ritual.href}
                  className="inline-flex w-fit text-[0.62rem] uppercase tracking-[0.22em] text-[#e8c56e] underline-offset-4 transition hover:text-[#f5e6c8] hover:underline"
                >
                  {ritual.linkLabel}
                </Link>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-10 max-w-2xl text-sm leading-relaxed text-[#8f8576] md:mt-12">
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
                <p className="mt-2 text-sm text-[#b8ab95]">{ingredient.benefits}</p>
                <Link
                  href={`/shop?ingredient=${ingredient.id}`}
                  className="mt-4 inline-flex text-[0.65rem] uppercase tracking-[0.2em] text-[#d6a85f] underline-offset-4 hover:underline"
                >
                  Shop products with {ingredient.name}
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
