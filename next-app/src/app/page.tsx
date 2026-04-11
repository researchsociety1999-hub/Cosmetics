import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { HomeHeroMotion } from "./components/HomeHeroMotion";
import { NewsletterForm } from "./components/NewsletterForm";
import ProductCard from "./components/productcard";
import { PurchaseTrustFootnote } from "./components/PurchaseTrustFootnote";
import { SiteChrome } from "./components/SiteChrome";
import { formatMoney } from "./lib/format";
import {
  getCategories,
  getProducts,
} from "./lib/queries";

export const metadata: Metadata = {
  title: {
    absolute: "Mystique | Where Beauty Transcends",
  },
  description:
    "Ritual-led, California-rooted skincare—texture-first formulas, calm radiance, and a restrained editorial lens.",
};

export const revalidate = 300;

export default async function HomePage() {
  return (
    <SiteChrome>
      <main>
        <HomeHeroMotion />
        <FirstVisitGuidanceStrip />
        <Suspense fallback={<SectionLoading title="Editor's picks" />}>
          <FeaturedProductsSection />
        </Suspense>
        <Suspense fallback={<SectionLoading title="Ritual sequence" />}>
          <RitualStripSection />
        </Suspense>
        <Suspense fallback={<SectionLoading title="Ingredient spotlight" />}>
          <IngredientSpotlightSection />
        </Suspense>
        <BrandStandardsSection />
        <NewsletterSection />
      </main>
    </SiteChrome>
  );
}

const FIRST_VISIT_GOALS: { label: string; href: string; hint: string }[] = [
  { label: "Glow & even tone", href: "/shop?search=glow", hint: "Dullness, uneven texture" },
  { label: "Deep hydration", href: "/shop?search=hydrat", hint: "Dry or depleted skin" },
  { label: "Weightless SPF", href: "/shop?search=spf", hint: "Daily protection" },
  { label: "Full five-step arc", href: "/routines", hint: "Learn the sequence first" },
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
            Choose a lane—then let texture lead.
          </p>
          <p className="max-w-2xl text-sm leading-relaxed text-[#8f8576]">
            Practical entry points into the catalog. Each opens filtered shop results or the
            ritual walkthrough—nothing loud, nothing stacked.
          </p>
        </div>
        <ul className="mt-6 flex flex-wrap gap-2.5 md:gap-3">
          {FIRST_VISIT_GOALS.map((goal) => (
            <li key={goal.label}>
              <Link
                href={goal.href}
                title={goal.hint}
                className="group inline-flex flex-col rounded-full border border-[rgba(214,168,95,0.2)] bg-[rgba(255,255,255,0.03)] px-4 py-2.5 transition hover:border-[rgba(214,168,95,0.45)] hover:bg-[rgba(214,168,95,0.08)] md:px-5 md:py-3"
              >
                <span className="text-[0.62rem] uppercase tracking-[0.22em] text-[#f5eee3]">
                  {goal.label}
                </span>
                <span className="mt-0.5 text-[0.58rem] uppercase tracking-[0.16em] text-[#7a7265] transition group-hover:text-[#9a8f7e]">
                  {goal.hint}
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
          eyebrow="Editor's picks"
          title="Where to begin."
          body="High-touch textures and steady favorites—curated so you are not choosing from the entire house at once."
          ctaHref="/shop?sort=featured"
          ctaLabel="Shop picks"
        />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-4 xl:gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-10 max-w-3xl">
          <PurchaseTrustFootnote />
        </div>
      </div>
    </section>
  );
}

const RITUAL_STEP_ORDER = [
  "Cleanse",
  "Tone",
  "Treat",
  "Moisturize",
  "Protect",
] as const;

/** When no catalog match for a step, cards still read editorial and complete. */
const RITUAL_STEP_EDITORIAL: Record<
  (typeof RITUAL_STEP_ORDER)[number],
  { title: string; body: string }
> = {
  Cleanse: {
    title: "First light",
    body: "Lift SPF, makeup, and the day with textures that leave skin cushioned—never stripped.",
  },
  Tone: {
    title: "Quiet balance",
    body: "Rehydrate and refine the canvas so every layer that follows absorbs with intention.",
  },
  Treat: {
    title: "Targeted luminosity",
    body: "Serums and concentrates meet tone, texture, and overnight renewal where your ritual needs it most.",
  },
  Moisturize: {
    title: "Seal the veil",
    body: "Lock in water and comfort with finishes that read polished in candlelight and confident by day.",
  },
  Protect: {
    title: "Daylight finish",
    body: "Close with protection that feels weightless—daily armor for bloom-skin radiance.",
  },
};

async function RitualStripSection() {
  const products = await getProducts({ sortBy: "featured" });
  const ritualSteps = RITUAL_STEP_ORDER.map((step) => ({
    step,
    product: products.find((product) => product.routine_step === step) ?? null,
  }));

  return (
    <section className="mystic-section border-b border-[rgba(17,24,39,0.9)] bg-[#04050a]">
      <div className="mystic-section-shell">
        <SectionIntro
          eyebrow="Ritual sequence"
          title="Five gestures, one arc."
          body="From cleanse to protect, each step earns the next. When a piece is in stock, you can jump straight to it—otherwise browse the step on the shop."
          ctaHref="/shop"
          ctaLabel="Shop all steps"
        />
        <div className="flex gap-4 overflow-x-auto pb-2">
          {ritualSteps.map(({ step, product }, index) => {
            const editorial = RITUAL_STEP_EDITORIAL[step];
            const headline = product?.name ?? editorial.title;
            const supporting =
              product?.description?.trim() || editorial.body;

            return (
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
                  {headline}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#b8ab95]">
                  {supporting}
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#b8ab95]">
                    {product
                      ? `From ${formatMoney(product.sale_price_cents ?? product.price_cents)}`
                      : "Build this step on the shop"}
                  </p>
                  <Link
                    href={
                      product?.slug?.trim()
                        ? `/products/${product.slug.trim()}`
                        : getStepHref(step)
                    }
                    className="inline-flex text-[0.65rem] uppercase tracking-[0.22em] text-[#d6a85f] underline-offset-4 hover:underline"
                  >
                    {product?.slug?.trim() ? "View this ritual piece" : getStepLinkLabel(step)}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
        <p className="mt-8 max-w-2xl text-sm leading-relaxed text-[#8f8576]">
          Prefer to browse by step instead? Use the links above, or open the{" "}
          <Link href="/shop" className="text-[#d6a85f] underline-offset-4 hover:underline">
            full shop
          </Link>{" "}
          and filter by category.
        </p>
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
          body={`Comfort-first formulas across ${categories.length} collections—then carry what you learn into the shop.`}
          ctaHref="/ingredients"
          ctaLabel="See all"
        />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {/* Curated highlights; swap for a filtered query when ingredient categories ship in the API. */}
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
                href={`/shop?search=${encodeURIComponent(ingredient.name)}`}
                className="mt-5 inline-flex text-[0.65rem] uppercase tracking-[0.2em] text-[#d6a85f] underline-offset-4 hover:underline"
              >
                Shop formulas with {ingredient.name}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function BrandStandardsSection() {
  return (
    <section className="mystic-section border-b border-[rgba(17,24,39,0.9)] bg-[#05070d]">
      <div className="mystic-section-shell">
        <header className="mb-10 max-w-2xl space-y-3">
          <p className="text-[0.75rem] uppercase tracking-[0.3em] text-[#b8ab95]">
            Trust
          </p>
          <h2 className="font-literata text-3xl tracking-[0.14em] text-[#f5eee3] md:text-4xl">
            What we omit on purpose
          </h2>
          <p className="text-sm leading-relaxed text-[#b8ab95]">
            No scripted homepage quotes or logo walls. Product pages carry purchase-backed
            reviews when shoppers publish them. Press entries require a real outbound link.
          </p>
        </header>
        <div className="grid gap-6 md:grid-cols-2">
          <article className="mystic-card p-6">
            <h3 className="font-literata text-2xl tracking-[0.1em] text-[#f5eee3]">
              Press &amp; media
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[#b8ab95]">
              Coverage is listed only alongside a working article link. For kits, pulls, or
              wholesale, the studio routes requests through one thread.
            </p>
            <Link
              href="/press"
              className="mt-5 inline-flex text-[0.65rem] uppercase tracking-[0.2em] text-[#d6a85f] underline-offset-4 hover:underline"
            >
              Press room
            </Link>
          </article>
          <article className="mystic-card p-6">
            <h3 className="font-literata text-2xl tracking-[0.1em] text-[#f5eee3]">
              Care &amp; answers
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[#b8ab95]">
              Texture questions, order help, or a note for the right person on the team—use
              the form so nothing is lost in transit.
            </p>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
              <Link
                href="/contact"
                className="inline-flex text-[0.65rem] uppercase tracking-[0.2em] text-[#d6a85f] underline-offset-4 hover:underline"
              >
                Contact
              </Link>
              <Link
                href="/faq"
                className="inline-flex text-[0.65rem] uppercase tracking-[0.2em] text-[#d6a85f] underline-offset-4 hover:underline"
              >
                FAQ
              </Link>
            </div>
          </article>
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
              Launch notes, restocks, and ritual drops—one letter when there is something
              worth your attention.
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

  if (step === "Tone") {
    return "/shop?search=toner";
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

  if (step === "Tone") {
    return "View toners";
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
