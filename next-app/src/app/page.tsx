import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { NewsletterForm } from "./components/NewsletterForm";
import ProductCard from "./components/productcard";
import { PromoBanner } from "./components/PromoBanner";
import {
  getActivePromo,
  getCategories,
  getIngredients,
  getPressMentions,
  getProducts,
} from "./lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [products, categories, promo, pressMentions, ingredients] =
    await Promise.all([
      getProducts({ sortBy: "newest" }),
      getCategories(),
      getActivePromo(),
      getPressMentions(),
      getIngredients(),
    ]);

  const featuredProducts = products.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#06080c] text-[#f5eee3]">
      {promo && <PromoBanner promo={promo} />}
      <Navbar />

      <main>
        <section
          id="home"
          className="relative overflow-hidden border-b border-[rgba(214,168,95,0.18)]"
        >
          <div className="pointer-events-none absolute inset-0 opacity-70">
            <div className="absolute -left-10 top-12 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(214,168,95,0.18),transparent_60%)] blur-3xl" />
            <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,rgba(240,209,154,0.14),transparent_60%)] blur-3xl" />
          </div>

          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-20 pt-16 md:grid-cols-[1.15fr_0.85fr] md:px-6 md:pb-24 md:pt-20">
            <div className="space-y-8">
              <p className="text-[0.75rem] uppercase tracking-[0.3em] text-[#b8ab95]">
                Luxury beauty • Mystic rituals
              </p>

              <div className="space-y-5">
                <h1 className="font-cormorant text-4xl leading-tight tracking-[0.08em] text-[#f5eee3] sm:text-5xl md:text-6xl">
                  Where beauty transcends
                  <span className="block text-[#d6a85f]">
                    shadow, gold, and glow.
                  </span>
                </h1>

                <p className="max-w-2xl text-sm text-[#b8ab95] md:text-base">
                  Mystic blends skincare performance with a cinematic luxury
                  mood. The result is a storefront that already feels premium
                  today and is ready for your Supabase catalog as real seed data
                  comes online.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <a
                  href="#shop"
                  className="mystic-button-primary inline-flex items-center justify-center px-10 py-3 text-xs uppercase tracking-[0.22em]"
                >
                  Shop the ritual
                </a>
                <a
                  href="#about"
                  className="mystic-button-secondary inline-flex items-center justify-center px-10 py-3 text-xs uppercase tracking-[0.22em]"
                >
                  Discover the story
                </a>
              </div>

              <div className="grid gap-4 text-xs text-[#b8ab95] sm:grid-cols-3">
                <HeroProof
                  title="Free U.S. shipping"
                  body="Complimentary on orders above $75."
                />
                <HeroProof
                  title="Seed-data ready"
                  body="Uses local fallback content until tables are populated."
                />
                <HeroProof
                  title="Schema-aware"
                  body="Products, categories, ingredients, and press map to your database design."
                />
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="mystic-card relative w-full max-w-md overflow-hidden p-6">
                <div className="aspect-[4/5] rounded-[18px] bg-[linear-gradient(180deg,#10131b,#05070d)]" />
                <div className="pointer-events-none absolute inset-6 rounded-[18px] bg-[radial-gradient(circle_at_20%_10%,rgba(214,168,95,0.22),transparent_35%),radial-gradient(circle_at_80%_100%,rgba(240,209,154,0.18),transparent_35%)]" />
                <div className="absolute inset-0 flex flex-col justify-between p-12">
                  <div className="flex items-center justify-between text-[0.68rem] uppercase tracking-[0.28em] text-[#b8ab95]">
                    <span>Featured ritual</span>
                    <span>New</span>
                  </div>

                  <div className="space-y-3">
                    <p className="font-cormorant text-3xl tracking-[0.14em] text-[#f5eee3]">
                      Eclipse Serum
                    </p>
                    <p className="max-w-xs text-sm text-[#b8ab95]">
                      Night-first radiance with a velvety finish and a gold-lit
                      editorial mood.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="shop"
          className="border-b border-[rgba(17,24,39,0.9)] bg-[#05070d]/80 py-16"
        >
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <header className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-[0.75rem] uppercase tracking-[0.3em] text-[#b8ab95]">
                  The collection
                </p>
                <h2 className="font-cormorant text-3xl tracking-[0.16em] text-[#f5eee3] md:text-4xl">
                  Rituals shaped for glow, texture, and mood.
                </h2>
                <p className="mt-2 max-w-xl text-sm text-[#b8ab95]">
                  These cards are wired to your product schema and will switch
                  to live Supabase data automatically once products are seeded.
                </p>
              </div>

              <a
                href="/shop"
                className="mystic-button-secondary inline-flex items-center justify-center px-8 py-2 text-[0.7rem] uppercase tracking-[0.22em]"
              >
                View all products
              </a>
            </header>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        <section
          id="categories"
          className="border-b border-[rgba(17,24,39,0.9)] bg-[#04050a]/90 py-12"
        >
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <header className="mb-6">
              <h2 className="font-cormorant text-2xl tracking-[0.18em] text-[#f5eee3] md:text-3xl">
                Choose your ritual path
              </h2>
            </header>

            <div className="flex gap-4 overflow-x-auto pb-2">
              {categories.map((category) => (
                <a
                  key={category.id}
                  href={`/shop?category=${encodeURIComponent(category.slug)}`}
                  className="mystic-card flex min-w-[190px] items-center justify-between px-4 py-3 text-xs uppercase tracking-[0.2em] text-[#f5eee3]"
                >
                  <span>{category.name}</span>
                  <span className="text-[0.65rem] text-[#b8ab95]">Explore</span>
                </a>
              ))}
            </div>
          </div>
        </section>

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
                <h2 className="font-cormorant text-3xl tracking-[0.16em] text-[#f5eee3]">
                  Ingredients that honor skin and story.
                </h2>
              </div>

              <a
                href="/ingredients"
                className="mystic-button-secondary inline-flex items-center justify-center px-6 py-2 text-[0.7rem] uppercase tracking-[0.22em]"
              >
                Explore all ingredients
              </a>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {ingredients.map((ingredient) => (
                <article key={ingredient.id} className="mystic-card h-full p-5">
                  <p className="text-[0.7rem] uppercase tracking-[0.24em] text-[#d6a85f]">
                    {ingredient.source ?? "Ingredient"}
                  </p>
                  <h3 className="mt-3 font-cormorant text-2xl tracking-[0.12em] text-[#f5eee3]">
                    {ingredient.name}
                  </h3>
                  <p className="mt-3 text-sm text-[#b8ab95]">
                    {ingredient.description}
                  </p>
                  <p className="mt-4 text-xs uppercase tracking-[0.22em] text-[#d6a85f]">
                    {ingredient.benefits}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="press"
          className="border-b border-[rgba(17,24,39,0.9)] bg-[#05070d] py-14"
        >
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-cormorant text-2xl tracking-[0.16em] text-[#f5eee3]">
                As seen in
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {pressMentions.map((mention) => (
                <article key={mention.id} className="mystic-card p-5">
                  <p className="text-[0.7rem] uppercase tracking-[0.26em] text-[#d6a85f]">
                    {mention.source}
                  </p>
                  <h3 className="mt-3 font-cormorant text-2xl tracking-[0.1em] text-[#f5eee3]">
                    {mention.title}
                  </h3>
                  {mention.quote && (
                    <p className="mt-3 text-sm italic text-[#f5eee3]">
                      "{mention.quote}"
                    </p>
                  )}
                  {mention.published_at && (
                    <p className="mt-4 text-[0.7rem] uppercase tracking-[0.2em] text-[#b8ab95]">
                      {new Date(mention.published_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="about"
          className="border-b border-[rgba(17,24,39,0.9)] bg-[#05060c] py-16"
        >
          <div className="mx-auto grid max-w-7xl gap-10 px-4 md:grid-cols-2 md:px-6">
            <div>
              <p className="text-[0.75rem] uppercase tracking-[0.3em] text-[#b8ab95]">
                About Mystic
              </p>
              <h2 className="mt-2 font-cormorant text-3xl tracking-[0.16em] text-[#f5eee3]">
                Beauty as ritual, not routine.
              </h2>
              <p className="mt-4 text-sm text-[#b8ab95]">
                Mystic was designed as a premium beauty storefront with a dark
                editorial mood, clear paths into product discovery, and a data
                shape that already reflects your database schema.
              </p>
            </div>

            <div className="grid gap-4 text-sm text-[#b8ab95] md:grid-cols-2">
              <div className="mystic-card p-4">
                <p className="text-[0.7rem] uppercase tracking-[0.22em] text-[#d6a85f]">
                  Product-ready
                </p>
                <p className="mt-2">
                  Product cards map cleanly to `products`, `categories`, and
                  future `product_variants`.
                </p>
              </div>
              <div className="mystic-card p-4">
                <p className="text-[0.7rem] uppercase tracking-[0.22em] text-[#d6a85f]">
                  Content-ready
                </p>
                <p className="mt-2">
                  Ingredients, press, and promo sections already accept real
                  table data when seeded.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="faq"
          className="border-b border-[rgba(17,24,39,0.9)] bg-[#04050a] py-14"
        >
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <h2 className="font-cormorant text-2xl tracking-[0.16em] text-[#f5eee3]">
              Questions, answered softly.
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <FaqCard
                question="Will this still work before the database is seeded?"
                answer="Yes. The storefront now uses local fallback records for products, categories, ingredients, and press until Supabase returns live rows."
              />
              <FaqCard
                question="What happens once the schema is populated?"
                answer="The same UI will read from your Supabase tables first, then quietly fall back only if data or env values are missing."
              />
            </div>
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
                <h2 className="mt-2 font-cormorant text-2xl tracking-[0.16em] text-[#f5eee3]">
                  Receive early access, rituals, and quiet offers.
                </h2>
              </div>

              <NewsletterForm />
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

function FaqCard({ question, answer }: { question: string; answer: string }) {
  return (
    <article className="mystic-card p-5">
      <h3 className="font-cormorant text-xl tracking-[0.08em] text-[#f5eee3]">
        {question}
      </h3>
      <p className="mt-3 text-sm text-[#b8ab95]">{answer}</p>
    </article>
  );
}
