import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { getIngredients } from "../lib/queries";

export const dynamic = "force-dynamic";

export default async function IngredientsPage() {
  const ingredients = await getIngredients();

  return (
    <div className="min-h-screen bg-[#06080c] text-[#f5eee3]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <header className="mb-10 space-y-4">
          <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
            Ingredients
          </p>
          <h1 className="font-cormorant text-4xl tracking-[0.12em] text-[#f5eee3] md:text-5xl">
            The ingredient library behind the ritual.
          </h1>
          <p className="max-w-3xl text-sm text-[#b8ab95] md:text-base">
            This section is mapped to your `ingredients` table and is ready for
            real seed content whenever you add it.
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
              <p className="mt-4 text-sm text-[#b8ab95]">
                {ingredient.description}
              </p>
              <p className="mt-5 text-xs uppercase tracking-[0.2em] text-[#d6a85f]">
                {ingredient.benefits}
              </p>
            </article>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}
