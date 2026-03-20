import type { ReactNode } from "react";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import ProductCard from "../components/productcard";
import { getCategories, getProducts } from "../lib/queries";

type SearchParams = Promise<{
  category?: string;
  search?: string;
}>;

export const dynamic = "force-dynamic";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const selectedCategory = params.category ?? "";
  const categories = await getCategories();
  const matchedCategory = categories.find(
    (category) => category.slug === selectedCategory,
  );
  const products = await getProducts({
    categoryId: matchedCategory?.id,
    search: params.search,
    sortBy: "price_asc",
  });

  return (
    <div className="min-h-screen bg-[#06080c] text-[#f5eee3]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <header className="mb-10 space-y-4">
          <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
            Shop Mystic
          </p>
          <h1 className="font-cormorant text-4xl tracking-[0.12em] text-[#f5eee3] md:text-5xl">
            A storefront wired to your product schema.
          </h1>
          <p className="max-w-3xl text-sm text-[#b8ab95] md:text-base">
            This page reads products and categories from Supabase when available
            and falls back to local seed content while your tables are still
            being populated.
          </p>
        </header>

        <section className="mb-8 flex flex-wrap gap-3">
          <CategoryPill href="/shop" active={!matchedCategory}>
            All
          </CategoryPill>
          {categories.map((category) => (
            <CategoryPill
              key={category.id}
              href={`/shop?category=${encodeURIComponent(category.slug)}`}
              active={matchedCategory?.id === category.id}
            >
              {category.name}
            </CategoryPill>
          ))}
        </section>

        {products.length === 0 ? (
          <div className="mystic-card p-8 text-sm text-[#b8ab95]">
            No products matched this category yet. Once `products` and
            `categories` are seeded in Supabase, they will appear here.
          </div>
        ) : (
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

function CategoryPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className={`inline-flex rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em] transition ${
        active
          ? "border-[#d6a85f] bg-[rgba(214,168,95,0.12)] text-[#f5eee3]"
          : "border-[rgba(214,168,95,0.28)] text-[#b8ab95] hover:text-[#f5eee3]"
      }`}
    >
      {children}
    </a>
  );
}
