import type { Metadata } from "next";
import { SearchExperience } from "./SearchExperience";
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
      <main className="w-full px-4 py-14 md:px-6 lg:px-10 xl:px-14">
        <header className="mb-10 space-y-4">
          <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
            Search
          </p>
          <h1 className="font-literata text-4xl tracking-[0.12em] md:text-5xl">
            Find a ritual
          </h1>
        </header>
        <SearchExperience initialQuery={query} initialProducts={products} />
      </main>
    </SiteChrome>
  );
}
