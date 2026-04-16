import type { Metadata } from "next";
import Link from "next/link";
import { IngredientSpotlightThumb } from "../components/IngredientSpotlightThumb";
import { SiteChrome } from "../components/SiteChrome";
import { getIngredients } from "../lib/queries";

export const metadata: Metadata = {
  title: "Ingredients",
  description:
    "How Mystique chooses actives and textures—hydration-first, barrier-minded, and always written in language you can trust.",
};

export const revalidate = 300;

export default async function IngredientsPage() {
  const ingredients = await getIngredients();

  return (
    <SiteChrome>
      <main className="mystic-section-shell mystic-section">
        <header className="mystic-intro space-y-4">
          <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
            Ingredients
          </p>
          <h1 className="font-literata text-4xl tracking-[0.12em] md:text-5xl">
            Ingredients with intention.
          </h1>
          <p className="text-sm leading-relaxed text-[#b8ab95] md:text-base">
            Thoughtful, comfort-first formulas meet a layering sensibility inspired by
            modern ritual skincare—supporting skin that looks calm, luminous, and refined.
          </p>
        </header>
        <section className="mystic-panel mt-10 grid gap-6 p-6 md:grid-cols-[0.85fr_1.15fr] md:p-8">
          <div className="space-y-4">
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#d6a85f]">
              Ingredient philosophy
            </p>
            <h2 className="font-literata text-3xl tracking-[0.08em] text-[#f5eee3]">
              Clean-feeling formulas, layered with care.
            </h2>
            <p className="text-sm leading-relaxed text-[#b8ab95]">
              Mystique focuses on thoughtful formulations, sensorial textures, and
              ritual-friendly layering rather than aggressive claims or overcomplication.
            </p>
            <p className="text-xs leading-relaxed text-[#7a7265]">
              When we use phrases like &ldquo;PDRN-inspired,&rdquo; we mean the feel and
              intention of a formula&mdash;not a promise about a single ingredient. For the
              exact INCI, always check the product page and your carton, which list what
              that specific ritual contains.
            </p>
          </div>
          <div className="grid gap-4 text-sm text-[#cdbca1] sm:grid-cols-3">
            <div className="rounded-[20px] border border-[rgba(214,168,95,0.1)] bg-[rgba(255,255,255,0.02)] p-4">
              Hydration-first textures
            </div>
            <div className="rounded-[20px] border border-[rgba(214,168,95,0.1)] bg-[rgba(255,255,255,0.02)] p-4">
              Actives chosen for how they behave on skin
            </div>
            <div className="rounded-[20px] border border-[rgba(214,168,95,0.1)] bg-[rgba(255,255,255,0.02)] p-4">
              Layering that stays elegant on skin
            </div>
          </div>
        </section>
        <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {ingredients.map((ingredient) => (
            <article
              key={ingredient.id}
              className="group mystic-card relative flex flex-row items-start gap-4 overflow-hidden border border-white/[0.04] bg-gradient-to-br from-[rgba(18,20,28,0.55)] via-[rgba(8,10,16,0.35)] to-[rgba(4,5,10,0.25)] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.28)] transition duration-300 before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_90%_80%_at_0%_0%,rgba(214,168,95,0.06),transparent_55%)] before:opacity-0 before:transition-opacity hover:before:opacity-100 sm:gap-5 sm:p-6"
            >
              <IngredientSpotlightThumb
                id={ingredient.id}
                imageSrc={ingredient.imageSrc}
                name={ingredient.name}
                size="lg"
              />
              <div className="relative z-[1] min-w-0 flex-1">
                {ingredient.source ? (
                  <p className="text-[0.7rem] uppercase tracking-[0.24em] text-[#d6a85f]">
                    {ingredient.source}
                  </p>
                ) : null}
                <h2
                  className={`font-literata text-2xl tracking-[0.08em] text-[#f5eee3] sm:text-3xl ${
                    ingredient.source ? "mt-2" : ""
                  }`}
                >
                  {ingredient.name}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[#b8ab95]">
                  {ingredient.description}
                </p>
                <p className="mt-4 text-xs uppercase tracking-[0.2em] text-[#d6a85f]">
                  {ingredient.benefits}
                </p>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-14 flex flex-col items-start gap-4 border-t border-[rgba(214,168,95,0.12)] pt-10 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <p className="text-[0.72rem] uppercase tracking-[0.24em] text-[#d6a85f]">
              Next step
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#b8ab95]">
              Pair what you have learned here with the textures that fit your ritual—each
              product page lists how we use these notes in practice.
            </p>
          </div>
          <Link
            href="/shop"
            className="mystic-button-primary inline-flex items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em]"
          >
            Shop the collection
          </Link>
        </section>
      </main>
    </SiteChrome>
  );
}
