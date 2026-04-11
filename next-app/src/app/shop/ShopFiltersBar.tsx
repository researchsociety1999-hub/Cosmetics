"use client";

import { useRouter } from "next/navigation";
import { MysticMergedSelect } from "../components/MysticMergedSelect";
import type { ProductSort } from "../lib/queries";

type CategoryOption = { id: number; slug: string; name: string };

const SORT_OPTIONS: { label: string; value: ProductSort }[] = [
  { label: "Newest", value: "newest" },
  { label: "Price low to high", value: "price_asc" },
  { label: "Price high to low", value: "price_desc" },
  { label: "Featured", value: "featured" },
];

function buildShopHref({
  search,
  category,
  sort,
}: {
  search: string;
  category: string;
  sort: ProductSort;
}) {
  const params = new URLSearchParams();
  const trimmed = search.trim();
  if (trimmed) params.set("search", trimmed);
  if (category) params.set("category", category);
  if (sort && sort !== "newest") params.set("sort", sort);
  const query = params.toString();
  return query ? `/shop?${query}` : "/shop";
}

type ShopFiltersBarProps = {
  currentSearch: string;
  matchedCategorySlug: string;
  sort: ProductSort;
  availableCategories: CategoryOption[];
};

export function ShopFiltersBar({
  currentSearch,
  matchedCategorySlug,
  sort,
  availableCategories,
}: ShopFiltersBarProps) {
  const router = useRouter();

  function navigate(partial: { category?: string; sort?: ProductSort }) {
    router.push(
      buildShopHref({
        search: currentSearch,
        category: partial.category ?? matchedCategorySlug,
        sort: partial.sort ?? sort,
      }),
    );
  }

  const categoryOptions = [
    { value: "", label: "All categories" },
    ...availableCategories.map((c) => ({ value: c.slug, label: c.name })),
  ];

  const sortOptions = SORT_OPTIONS.map((o) => ({
    value: o.value,
    label: o.label,
  }));

  return (
    <section className="mb-8">
      <div className="mystic-glass grid gap-4 p-4 md:grid-cols-[1fr_auto_auto] md:gap-4 md:p-5">
        <form action="/shop" method="get">
          <input type="hidden" name="category" value={matchedCategorySlug} />
          <input type="hidden" name="sort" value={sort} />
          <label className="sr-only" htmlFor="shop-search">
            Search products
          </label>
          <input
            id="shop-search"
            name="search"
            defaultValue={currentSearch}
            placeholder="Search by concern, texture, or ritual step..."
            className="mystic-input mystic-input--text min-h-[54px] w-full rounded-[14px] border-[rgba(212,175,55,0.3)] bg-[rgba(0,0,0,0.88)] text-sm text-[#f6f0e6] shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_0_1px_rgba(212,175,55,0.05)] placeholder:text-[#7d7365] focus-visible:border-[rgba(232,197,110,0.5)]"
          />
        </form>

        <MysticMergedSelect
          id="shop-category"
          ariaLabel="Category"
          value={matchedCategorySlug}
          options={categoryOptions}
          onChange={(slug) => navigate({ category: slug })}
          className="min-w-[min(100%,220px)] md:min-w-[220px]"
        />

        <MysticMergedSelect
          id="shop-sort"
          ariaLabel="Sort products"
          value={sort}
          options={sortOptions}
          onChange={(nextSort) => navigate({ sort: nextSort as ProductSort })}
          className="min-w-[min(100%,200px)] md:min-w-[200px]"
        />
      </div>
    </section>
  );
}
