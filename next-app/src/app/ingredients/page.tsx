import type { Metadata } from "next";
import { SiteChrome } from "../components/SiteChrome";
import { getIngredients } from "../lib/queries";

export const metadata: Metadata = {
  title: "Ingredients",
  description: "Explore the ingredient library behind Mystique: peptides, centella, niacinamide, hyaluronic acid, and more.",
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
          <h1 className="font-cormorant text-4xl tracking-[0.12em] md:text-5xl">
            Ingredients with intention.
          </h1>
          <p className="text-sm leading-relaxed text-[#b8ab95] md:text-base">
            Thoughtful, comfort-first formulas meet the layering sensibility of K-beauty
            to support skin that looks calm, luminous, and refined.
          </p>
        </header>
        <section className="mystic-panel mt-10 grid gap-6 p-6 md:grid-cols-[0.85fr_1.15fr] md:p-8">
          <div className="space-y-4">
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#d6a85f]">
              Ingredient philosophy
            </p>
            <h2 className="font-cormorant text-3xl tracking-[0.08em] text-[#f5eee3]">
              Clean-feeling formulas, layered with care.
            </h2>
            <p className="text-sm leading-relaxed text-[#b8ab95]">
              Mystique focuses on thoughtful formulations, sensorial textures, and
              ritual-friendly layering rather than aggressive claims or overcomplication.
            </p>
          </div>
          <div className="grid gap-4 text-sm text-[#cdbca1] sm:grid-cols-3">
            <div className="rounded-[20px] border border-[rgba(214,168,95,0.1)] bg-[rgba(255,255,255,0.02)] p-4">
              Hydration-first textures
            </div>
            <div className="rounded-[20px] border border-[rgba(214,168,95,0.1)] bg-[rgba(255,255,255,0.02)] p-4">
              Regenerative-inspired storytelling
            </div>
            <div className="rounded-[20px] border border-[rgba(214,168,95,0.1)] bg-[rgba(255,255,255,0.02)] p-4">
              Layering that stays elegant on skin
            </div>
          </div>
        </section>
        <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {ingredients.map((ingredient) => (
            <article key={ingredient.id} className="mystic-card p-6">
              <p className="text-[0.7rem] uppercase tracking-[0.24em] text-[#d6a85f]">
                {ingredient.source ?? "Ingredient source"}
              </p>
              <h2 className="mt-3 font-cormorant text-3xl tracking-[0.08em] text-[#f5eee3]">
                {ingredient.name}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[#b8ab95]">
                {ingredient.description}
              </p>
              <p className="mt-5 text-xs uppercase tracking-[0.2em] text-[#d6a85f]">
                {ingredient.benefits}
              </p>
            </article>
          ))}
        </section>
      </main>
    </SiteChrome>
  );
}
