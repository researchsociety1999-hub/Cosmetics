import type { Metadata } from "next";
import Link from "next/link";
import { IngredientSpotlightThumb } from "../components/IngredientSpotlightThumb";
import { SiteChrome } from "../components/SiteChrome";
import { getIngredients } from "../lib/queries";
import { buildPageMetadata } from "../lib/seo";

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: "Ingredients",
    description:
      "How Mystique chooses actives and textures—hydration-first, barrier-minded, and always written in language you can trust.",
    canonicalPath: "/ingredients",
  }),
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
          {ingredients.map((ingredient, index) => {
            const isPoster = ingredient.imagePresentation === "poster";
            const stg = index % 3;
            return (
            <article
              key={ingredient.id}
              id={ingredient.id}
              className={`group mystic-card mystique-ingredient-card--stg-${stg} relative flex flex-row items-start gap-4 overflow-hidden rounded-[var(--mystic-radius-card)] border border-[rgba(214,168,95,0.11)] bg-gradient-to-br from-[rgba(14,16,24,0.78)] via-[rgba(8,10,18,0.58)] to-[rgba(5,6,14,0.72)] p-5 shadow-[0_14px_44px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.04)] ring-1 ring-inset ring-[rgba(214,168,95,0.06)] transition-[box-shadow,border-color,ring-color] duration-500 ease-out before:pointer-events-none before:absolute before:inset-0 before:z-[1] before:bg-[radial-gradient(ellipse_95%_85%_at_0%_0%,rgba(214,168,95,0.08),transparent_58%)] before:opacity-0 before:transition-opacity before:duration-500 hover:border-[rgba(214,168,95,0.16)] hover:shadow-[0_18px_52px_rgba(0,0,0,0.34)] hover:ring-[rgba(214,168,95,0.1)] hover:before:opacity-100 sm:gap-5 sm:p-6`}
            >
              <div className="mystique-ingredient-card-atmosphere" aria-hidden />
              <div className="relative z-[2] shrink-0">
              <IngredientSpotlightThumb
                id={ingredient.id}
                imageSrc={ingredient.imageSrc}
                name={ingredient.name}
                size="lg"
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
                    <h2 className="sr-only">{ingredient.name}</h2>
                  </>
                ) : (
                  <>
                    {ingredient.source ? (
                      <p className="text-[0.7rem] uppercase tracking-[0.24em] text-[#c9b896]">
                        {ingredient.source}
                      </p>
                    ) : null}
                    <h2
                      className={`font-literata text-2xl tracking-[0.08em] text-[#faf6f0] [text-shadow:0_1px_16px_rgba(0,0,0,0.26)] sm:text-3xl ${
                        ingredient.source ? "mt-2" : ""
                      }`}
                    >
                      {ingredient.name}
                    </h2>
                  </>
                )}
                <p
                  className={`text-sm leading-relaxed text-[#cfc3b0] [text-shadow:0_1px_12px_rgba(0,0,0,0.22)] ${
                    isPoster ? "mt-0" : "mt-3"
                  }`}
                >
                  {ingredient.description}
                </p>
                <p className="mt-4 text-xs uppercase tracking-[0.2em] text-[#d8c4a0]">
                  {ingredient.benefits}
                </p>
              </div>
            </article>
            );
          })}
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
