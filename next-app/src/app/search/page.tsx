import type { Metadata } from "next";
import { SearchExperience } from "./SearchExperience";
import { PageContainer } from "../components/PageContainer";
import { PageHeader } from "../components/PageHeader";
import { SiteChrome } from "../components/SiteChrome";
import { searchProducts } from "../lib/queries";

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ q?: string }>;

export const metadata: Metadata = {
  title: "Search products",
  description:
    "Search the Mystique collection by name, concern, or ingredient—fast paths to the right texture.",
};

export const revalidate = 30;

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
      <PageContainer as="main" variant="wide">
        <PageHeader
          eyebrow="Search"
          title={query ? `Find a ritual: “${query}”` : "Find a ritual"}
        />
        <section aria-label="Search results" className="mt-10">
          <SearchExperience initialQuery={query} initialProducts={products} />
        </section>
      </PageContainer>
    </SiteChrome>
  );
}
