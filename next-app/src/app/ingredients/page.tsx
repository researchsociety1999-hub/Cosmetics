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
      <main className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <header className="mb-10 max-w-3xl space-y-4">
          <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
            Ingredients
          </p>
          <h1 className="font-cormorant text-4xl tracking-[0.12em] md:text-5xl">
            The ingredient library behind the ritual.
          </h1>
          <p className="text-sm leading-relaxed text-[#b8ab95] md:text-base">
            Mystique combines comfort-first hydration, regenerative-science language,
            and clean-texture layering to support bloom skin and polished radiance.
          </p>
        </header>
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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
