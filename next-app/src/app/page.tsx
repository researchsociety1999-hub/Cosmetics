// src/app/page.tsx
// Fix all red lines
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

// src/app/page.tsx

import { Navbar } from "./components/Navbar";
import { PromoBanner } from "./components/PromoBanner";
import ProductCard from "./components/ProductCard";

import {
  getActivePromo,
  getCategories,
  getProducts,
  getPressmentions,
  getIngredients,
} from "./lib/data";

import type { Product } from "./lib/types";

export default async function HomePage() {
  const [products, categories, promo, press, ingredients] =
    await Promise.all([
      getProducts({ sortBy: "newest" }),
      getCategories(),
      getActivePromo(),
      getPressmentions(),
      getIngredients(),
    ]);

  const featuredProducts: Product[] = products.slice(0, 8);

  return (
    <div className="min-h-screen bg-[#06080c] text-[#f5eee3]">
      {promo && <PromoBanner promo={promo} />}
      <Navbar />

      <main>
        {/* Hero */}
        <section
          id="home"
          className="relative overflow-hidden border-b border-[rgba(214,168,95,0.18)]"
        >
          <div className="pointer-events-none absolute inset-0 opacity-60 mix-blend-screen">
            <div className="absolute -left-10 top-10 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,#d6a85f33,transparent)] blur-2xl" />
            <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,#f0d19a22,transparent)] blur-3xl" />
          </div>
          <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-4 pb-20 pt-16 md:flex-row md:items-center md:gap-16 md:px-6 md:pb-24 md:pt-20">
            <div className="flex-1 space-y-8">
              <p className="text-[0.75rem] uppercase tracking-[0.3em] text-[#b8ab95]">
                Luxury Beauty · Mystic Rituals
              </p>
              <h1 className="font-cormorant text-4xl leading-tight tracking-[0.08em] text-[#f5eee3] sm:text-5xl md:text-6xl">
                Beauty reimagined in a world of{" "}
                <span className="text-[#d6a85f]">shadow, gold, and glow.</span>
              </h1>
              <p className="max-w-xl text-sm text-[#b8ab95] md:text-base">
                Discover elevated skincare and beauty essentials designed to
                feel ceremonial, indulgent, and unforgettable—from your first
                cleanse to your final veil of luminance.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <a
                  href="#shop"
                  className="mystic-button-primary inline-flex items-center justify-center px-10 py-3 text-xs uppercase tracking-[0.22em]"
                >
                  Shop the Ritual
                </a>
                <a
                  href="#about"
                  className="mystic-button-secondary inline-flex items-center justify-center px-10 py-3 text-xs uppercase tracking-[0.22em]"
                >
                  Discover the Story
                </a>
              </div>
              <div className="mt-4 grid gap-4 text-xs text-[#b8ab95] sm:grid-cols-3">
                <HeroProof
                  title="Free U.S. shipping"
                  body="Complimentary on orders over $75."
                />
                <HeroProof
                  title="Clean & Conscious"
                  body="Cruelty-free, thoughtfully sourced ingredients."
                />
                <HeroProof
                  title="Ritual-backed results"
                  body="Formulas created to transform daily routines."
                />
              </div>
            </div>

            <div className="flex-1">
              <div className="mystic-card relative mx-auto max-w-md overflow-hidden">
                <div className="aspect-[4/5] bg-gradient-to-br from-[#020617] via-[#111827] to-[#020617]" />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(214,168,95,0.2),transparent_60%),radial-gradient(circle_at_80%_100%,rgba(240,209,154,0.25),transparent_55%)]" />
                <div className="absolute inset-0 flex flex-col justify-between p-6">
                  <div className="flex items-center justify-between text-[0.7rem] uppercase tracking-[0.25em] text-[#b8ab95]">
                    <span>Night Ritual Oil</span>
                    <span>New</span>
                  </div>
                  <div className="space-y-2">
                    <p className="font-cormorant text-2xl tracking-[0.14em] text-[#f5eee3]">
                      The Eclipse Serum
                    </p>
                    <p className="max-w-xs text-[0.7rem] text-[#b8ab95]">
                      A velvety concentrate that floods skin with radiance,
                      inspired by lunar light on pooling gold.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured products */}
        <section
          id="shop"
          className="border-b border-[rgba(17,24,39,0.9)] bg-[#05070d]/80 py-16"
        >
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <header className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-[0.75rem] uppercase tracking-[0.3em] text-[#b8ab95]">
                  The Collection
                </p>
                <h2 className="font-cormorant text-3xl tracking-[0.16em] text-[#f5eee3] md:text-4xl">
                  Crafted rituals for every glow.
                </h2>
                <p className="mt-2 max-w-xl text-sm text-[#b8ab95]">
                  Explore our most-loved essentials, each designed to slip
                  seamlessly into your nightly ceremony.
                </p>
              </div>
              <a
                href="/shop"
                className="mystic-button-secondary inline-flex items-center justify-center px-8 py-2 text-[0.7rem] uppercase tracking-[0.22em]"
              >
                View All
              </a>
            </header>

            {featuredProducts.length === 0 ? (
              <div className="rounded-[22px] border border-[rgba(148,163,184,0.35)] bg-black/40 p-6 text-sm text-[#b8ab95]">
                No products are available yet. Once your Mystic collection is
                published in Supabase, they will appear here.
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Categories strip */}
        <section
          id="categories"
          className="border-b border-[rgba(17,24,39,0.9)] bg-[#04050a]/90 py-12"
        >
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <header className="mb-4 flex items-center justify-between">
              <h3 className="font-cormorant text-xl tracking-[0.18em] text-[#f5eee3]">
                Choose your ritual path
              </h3>
            </header>
            {categories.length === 0 ? (
              <p className="text-sm text-[#b8ab95]">
                No categories have been created yet.
              </p>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {categories.map((category) => (
                  <a
                    key={category.id}
                    href={`/shop?category=${encodeURIComponent(category.slug)}`}
                    className="mystic-card flex min-w-[180px] items-center justify-between px-4 py-3 text-xs uppercase tracking-[0.2em] text-[#f5eee3]"
                  >
                    <span>{category.name}</span>
                    <span className="text-[0.65rem] text-[#b8ab95]">
                      Explore
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Ingredients teaser */}
        <section
          id="ingredients"
          className="border-b border-[rgba(17,24,39,0.9)] bg-[#05060c] py-16"
        >
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[0.75rem] uppercase tracking-[0.3em] text-[#b8ab95]">
                  Crafted from nature
                </p>
                <h3 className="font-cormorant text-3xl tracking-[0.16em] text-[#f5eee3]">
                  Ingredients that honor skin and story.
                </h3>
              </div>
              <a
                href="/ingredients"
                className="mystic-button-secondary inline-flex items-center justify-center px-6 py-2 text-[0.7rem] uppercase tracking-[0.22em]"
              >
                Explore all ingredients
              </a>
            </div>

            {ingredients.length === 0 ? (
              <p className="text-sm text-[#b8ab95]">
                Ingredient profiles will appear here once they are added to your
                Supabase project.
              </p>
            ) : (
              <div className="grid gap-6 md:grid-cols-3">
                {ingredients.slice(0, 3).map((ingredient) => (
                  <article
                    key={ingredient.id}
                    className="mystic-card h-full p-5"
                  >
                    <h4 className="font-cormorant text-xl tracking-[0.14em] text-[#f5eee3]">
                      {ingredient.name}
                    </h4>
                    {ingredient.benefits && (
                      <p className="mt-3 text-sm text-[#b8ab95]">
                        {ingredient.benefits}
                      </p>
                    )}
                    {ingredient.source && (
                      <p className="mt-2 text-xs uppercase tracking-[0.22em] text-[#6b7280]">
                        Source: {ingredient.source}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Press mentions */}
        <section
          id="press"
          className="border-b border-[rgba(17,24,39,0.9)] bg-[#05070d] py-14"
        >
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-cormorant text-2xl tracking-[0.16em] text-[#f5eee3]">
                As seen in
              </h3>
            </div>
            {press.length === 0 ? (
              <p className="text-sm text-[#b8ab95]">
                Press features will appear here once they are added to your
                Supabase project.
              </p>
            ) : (
              <div className="flex gap-5 overflow-x-auto pb-2">
                {press.slice(0, 4).map((mention) => (
                  <article
                    key={mention.id}
                    className="mystic-card min-w-[260px] max-w-xs p-5"
                  >
                    <p className="text-[0.7rem] uppercase tracking-[0.26em] text-[#d6a85f]">
                      {mention.source}
                    </p>
                    {mention.quote && (
                      <p className="mt-3 text-sm italic text-[#f5eee3]">
                        “{mention.quote}”
                      </p>
                    )}
                    {mention.published_at && (
                      <p className="mt-3 text-[0.7rem] text-[#6b7280]">
                        {new Date(mention.published_at).toLocaleDateString()}
                      </p>
                    )}
                    {mention.link && (
                      <a
                        href={mention.link}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex text-[0.7rem] uppercase tracking-[0.22em] text-[#d6a85f] hover:text-[#f0d19a]"
                      >
                        Read more
                      </a>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* About preview / FAQ / Newsletter / Contact placeholders */}
        <section
          id="about"
          className="border-b border-[rgba(17,24,39,0.9)] bg-[#05060c] py-16"
        >
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="grid gap-10 md:grid-cols-2 md:items-center">
              <div>
                <p className="text-[0.75rem] uppercase tracking-[0.3em] text-[#b8ab95]">
                  About Mystic
                </p>
                <h3 className="mt-2 font-cormorant text-3xl tracking-[0.16em] text-[#f5eee3]">
                  Beauty as ritual, not routine.
                </h3>
                <p className="mt-4 text-sm text-[#b8ab95]">
                  Mystic was born from the belief that skincare can be more than
                  a checklist—it can be a ceremony you look forward to. Every
                  formula, texture, and scent is crafted to slow you down,
                  ground you in your body, and let your glow linger long after
                  the mirror.
                </p>
              </div>
              <div className="grid gap-4 text-sm text-[#b8ab95] md:grid-cols-2">
                <div className="mystic-card p-4">
                  <p className="text-[0.7rem] uppercase tracking-[0.22em] text-[#d6a85f]">
                    Clean Alchemy
                  </p>
                  <p className="mt-2">
                    High-performance botanicals meet skin-barrier-respecting
                    science.
                  </p>
                </div>
                <div className="mystic-card p-4">
                  <p className="text-[0.7rem] uppercase tracking-[0.22em] text-[#d6a85f]">
                    Night-first formulas
                  </p>
                  <p className="mt-2">
                    Designed for the liminal hours when your skin, and mind,
                    are ready to reset.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ + Newsletter placeholders (client accordions/forms can be added next) */}
        <section
          id="faq"
          className="border-b border-[rgba(17,24,39,0.9)] bg-[#04050a] py-14"
        >
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <h3 className="font-cormorant text-2xl tracking-[0.16em] text-[#f5eee3]">
              Questions, answered softly.
            </h3>
            <p className="mt-2 text-sm text-[#b8ab95]">
              An interactive FAQ accordion and support links will live here.
            </p>
          </div>
        </section>

        <section
          id="contact"
          className="border-b border-[rgba(17,24,39,0.9)] bg-[#05070d] py-14"
        >
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="mystic-card flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[0.75rem] uppercase tracking-[0.3em] text-[#b8ab95]">
                  Stay in the ritual
                </p>
                <h3 className="mt-2 font-cormorant text-2xl tracking-[0.16em] text-[#f5eee3]">
                  Receive early access, rituals, and quiet offers.
                </h3>
              </div>
              <form
                className="flex w-full flex-col gap-3 md:max-w-md md:flex-row"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  className="mystic-input w-full text-sm"
                />
                <button
                  type="submit"
                  className="mystic-button-primary w-full px-6 py-2 text-[0.7rem] uppercase tracking-[0.22em] md:w-auto"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function HeroProof({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <p className="text-[0.7rem] uppercase tracking-[0.24em] text-[#d6a85f]">
        {title}
      </p>
      <p className="mt-1 text-xs text-[#b8ab95]">{body}</p>
    </div>
  );
}