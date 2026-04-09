"use client";

import type { ProductSort } from "../lib/queries";

type CategoryOption = { id: number; slug: string; name: string };

const SORT_OPTIONS: { label: string; value: ProductSort }[] = [
  { label: "Newest", value: "newest" },
  { label: "Price low to high", value: "price_asc" },
  { label: "Price high to low", value: "price_desc" },
  { label: "Featured", value: "featured" },
];

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
  function submitParentForm(event: React.ChangeEvent<HTMLSelectElement>) {
    event.currentTarget.form?.requestSubmit();
  }

  return (
    <section className="mb-8 grid gap-4 border-b border-[rgba(214,168,95,0.1)] pb-6 md:grid-cols-[1fr_auto_auto]">
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
          placeholder="Search serums, bloom skin, peptides..."
          className="mystic-input mystic-input--text min-h-[54px] w-full bg-[rgba(255,255,255,0.03)] text-sm"
        />
      </form>
      <form action="/shop" method="get">
        <input type="hidden" name="search" value={currentSearch} />
        <input type="hidden" name="sort" value={sort} />
        <label className="sr-only" htmlFor="shop-category">
          Category
        </label>
        <select
          id="shop-category"
          name="category"
          defaultValue={matchedCategorySlug}
          onChange={submitParentForm}
          className="mystic-input mystic-select min-h-[54px] min-w-[200px] bg-[rgba(255,255,255,0.03)] px-4 pr-10 text-sm"
        >
          <option value="">All categories</option>
          {availableCategories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </form>
      <form action="/shop" method="get">
        <input type="hidden" name="search" value={currentSearch} />
        <input type="hidden" name="category" value={matchedCategorySlug} />
        <label className="sr-only" htmlFor="shop-sort">
          Sort
        </label>
        <select
          id="shop-sort"
          name="sort"
          defaultValue={sort}
          onChange={submitParentForm}
          className="mystic-input mystic-select min-h-[54px] min-w-[180px] bg-[rgba(255,255,255,0.03)] px-4 pr-10 text-sm"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </form>
    </section>
  );
}
