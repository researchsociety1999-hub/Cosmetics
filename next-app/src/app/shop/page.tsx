import type { Metadata } from "next";
import type { ReactNode } from "react";
import ProductCard from "../components/productcard";
import { SiteChrome } from "../components/SiteChrome";
import { getCategoryBySlug, getCategories, getProducts, type ProductSort } from "../lib/queries";

type SearchParams = Promise<{
  category?: string;
  search?: string;
  sort?: ProductSort;
  page?: string;
}>;

const SORT_OPTIONS: { label: string; value: ProductSort }[] = [
  { label: "Newest", value: "newest" },
  { label: "Price low to high", value: "price_asc" },
  { label: "Price high to low", value: "price_desc" },
  { label: "Featured", value: "featured" },
];

export const metadata: Metadata = {
  title: "Shop",
  description: "Shop the Mystique ritual collection by category, search, and sort.",
};

export const revalidate = 300;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? "1") || 1;
  const sort = SORT_OPTIONS.some((option) => option.value === params.sort)
    ? (params.sort as ProductSort)
    : "newest";
  const categories = await getCategories();
  const matchedCategory = params.category
    ? await getCategoryBySlug(params.category)
    : null;
  const products = await getProducts({
    categoryId: matchedCategory?.id,
    search: params.search,
    sortBy: sort,
    page,
    limit: 12,
  });

  return (
    <SiteChrome>
      <main className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <header className="mb-10 space-y-4">
          <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
            Shop Mystique
          </p>
          <h1 className="font-cormorant text-4xl tracking-[0.12em] md:text-5xl">
            Build your ritual by texture, need, and mood.
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-[#b8ab95] md:text-base">
            Explore the full Mystique catalog. Filter by category, discover your
            ritual step, or search by texture and concern.
          </p>
        </header>

        <section className="mystic-card mb-8 grid gap-4 p-5 md:grid-cols-[1fr_auto_auto]">
          <form action="/shop">
            <label className="sr-only" htmlFor="shop-search">
              Search products
            </label>
            <input
              id="shop-search"
              name="search"
              defaultValue={params.search ?? ""}
              placeholder="Search serums, bloom skin, peptides..."
              className="mystic-input w-full text-sm"
            />
          </form>
          <form action="/shop">
            <input type="hidden" name="search" value={params.search ?? ""} />
            <label className="sr-only" htmlFor="shop-category">
              Category
            </label>
            <select
              id="shop-category"
              name="category"
              defaultValue={matchedCategory?.slug ?? ""}
              className="mystic-input min-h-[50px] px-4 text-sm"
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </form>
          <form action="/shop">
            <input type="hidden" name="search" value={params.search ?? ""} />
            <input type="hidden" name="category" value={matchedCategory?.slug ?? ""} />
            <label className="sr-only" htmlFor="shop-sort">
              Sort
            </label>
            <select
              id="shop-sort"
              name="sort"
              defaultValue={sort}
              className="mystic-input min-h-[50px] px-4 text-sm"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </form>
        </section>

        <section className="mb-8 flex flex-wrap gap-3">
          <CategoryChip href="/shop" active={!matchedCategory}>
            All
          </CategoryChip>
          {categories.map((category) => (
            <CategoryChip
              key={category.id}
              href={`/shop?category=${encodeURIComponent(category.slug)}`}
              active={matchedCategory?.slug === category.slug}
            >
              {category.name}
            </CategoryChip>
          ))}
        </section>

        {products.length === 0 ? (
          <div className="mystic-card p-8 text-sm text-[#b8ab95]">
            No products matched your filters yet. [REPLACE LATER] Seed the `products`
            table or broaden the current search.
          </div>
        ) : (
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </section>
        )}
      </main>
    </SiteChrome>
  );
}

function CategoryChip({
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
      className={`inline-flex rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em] ${
        active
          ? "border-[#d6a85f] bg-[rgba(214,168,95,0.12)] text-[#f5eee3]"
          : "border-[rgba(214,168,95,0.18)] text-[#b8ab95] hover:text-[#f5eee3]"
      }`}
    >
      {children}
    </a>
  );
}
