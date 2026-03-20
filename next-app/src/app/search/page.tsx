import type { Metadata } from "next";
import ProductCard from "../components/productcard";
import { SiteChrome } from "../components/SiteChrome";
import { searchProducts } from "../lib/queries";

type SearchParams = Promise<{ q?: string }>;

export const metadata: Metadata = {
  title: "Search",
  description: "Search the Mystique product catalog.",
};

export const revalidate = 300;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const products = query ? await searchProducts(query) : [];

  return (
    <SiteChrome>
      <main className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <header className="mb-10 space-y-4">
          <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
            Search
          </p>
          <h1 className="font-cormorant text-4xl tracking-[0.12em] md:text-5xl">
            Find a ritual
          </h1>
          <form action="/search" className="max-w-2xl">
            <label className="sr-only" htmlFor="search-query">
              Search query
            </label>
            <input
              id="search-query"
              name="q"
              defaultValue={query}
              placeholder="Search products, ingredients, or ritual steps"
              className="mystic-input w-full text-sm"
            />
          </form>
        </header>

        {!query ? (
          <div className="mystic-card p-8 text-sm text-[#b8ab95]">
            Begin with a product name, ingredient, or term like "bloom skin" or
            "peptides."
          </div>
        ) : products.length === 0 ? (
          <div className="mystic-card p-8 text-sm text-[#b8ab95]">
            No results for "{query}". Try a broader search.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </SiteChrome>
  );
}
