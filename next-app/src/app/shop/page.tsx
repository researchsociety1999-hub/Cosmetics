import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { SiteChrome } from "../components/SiteChrome";
import {
  countProductsByMerchGroup,
  resolveMerchFilterFromCategoryParam,
  SHOP_MERCH_GROUPS,
} from "../lib/shopMerchGroups";
import { getCategories, getProducts, type ProductSort } from "../lib/queries";
import { buildPageMetadata } from "../lib/seo";
import { ShopCatalogBody, ShopCatalogFallback } from "./ShopCatalogBody";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  category?: string;
  search?: string;
  /** Canonical spotlight id — see MYSTIQUE_CANONICAL_INGREDIENTS / getProducts `ingredientId`. */
  ingredient?: string;
  sort?: ProductSort;
  page?: string;
}>;

const SORT_OPTIONS: { label: string; value: ProductSort }[] = [
  { label: "Newest", value: "newest" },
  { label: "Price low to high", value: "price_asc" },
  { label: "Price high to low", value: "price_desc" },
  { label: "Featured", value: "featured" },
];

function firstQueryString(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return String(value[0] ?? "").trim();
  }
  return String(value ?? "").trim();
}

// export const revalidate = 30; // omitted: conflicts with force-dynamic (always fresh catalog)

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const params = await searchParams;

  const category = firstQueryString(params.category);
  const ingredient = firstQueryString(params.ingredient).toLowerCase();

  const canonicalParams = new URLSearchParams();
  if (category) canonicalParams.set("category", category);
  if (ingredient) canonicalParams.set("ingredient", ingredient);

  const query = canonicalParams.toString();
  const canonicalPath = query ? (`/shop?${query}` as const) : "/shop";

  return buildPageMetadata({
    title: "Shop skincare",
    description:
      "Browse Mystique by category—serums, cleansers, masks, moisturizers, and daily protection with clear ritual steps.",
    canonicalPath,
  });
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const sort = SORT_OPTIONS.some((option) => option.value === params.sort)
    ? (params.sort as ProductSort)
    : "newest";
  const currentSearch = firstQueryString(params.search);
  const currentIngredient = firstQueryString(params.ingredient).toLowerCase();
  const [dbCategories, catalogForMerchCounts] = await Promise.all([
    getCategories(),
    getProducts({ sortBy: "newest", excludeComingSoon: true }),
  ]);
  const merchCounts = countProductsByMerchGroup(catalogForMerchCounts, dbCategories);
  const visibleMerchGroups = SHOP_MERCH_GROUPS.filter(
    (group) => (merchCounts[group.slug] ?? 0) > 0,
  );
  const matchedMerchGroup = resolveMerchFilterFromCategoryParam(
    firstQueryString(params.category),
    dbCategories,
  );

  return (
    <SiteChrome>
      <main className="mx-auto w-full max-w-[110rem] px-4 pb-16 md:px-6 md:pb-20 lg:px-10 xl:px-14">
        <h1 className="sr-only">Shop</h1>
        <section className="mb-6 flex flex-wrap gap-2.5 md:mb-7 md:gap-3">
          <CategoryChip
            href={buildShopHref({
              search: currentSearch,
              ingredient: currentIngredient,
              sort,
            })}
            active={!matchedMerchGroup}
          >
            All
          </CategoryChip>
          {visibleMerchGroups.map((group) => (
            <CategoryChip
              key={group.slug}
              href={buildShopHref({
                category: group.slug,
                search: currentSearch,
                ingredient: currentIngredient,
                sort,
              })}
              active={matchedMerchGroup?.slug === group.slug}
            >
              {group.label}
            </CategoryChip>
          ))}
        </section>

        <section className="mb-2 mystic-card flex flex-col gap-3 p-4 sm:flex-row sm:items-end sm:gap-4 md:mb-2.5 md:p-5">
          <form
            method="get"
            action="/shop"
            className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center"
          >
            {matchedMerchGroup ? (
              <input type="hidden" name="category" value={matchedMerchGroup.slug} />
            ) : null}
            {currentIngredient ? (
              <input type="hidden" name="ingredient" value={currentIngredient} />
            ) : null}
            {sort !== "newest" ? <input type="hidden" name="sort" value={sort} /> : null}
            <label className="sr-only" htmlFor="shop-search">
              Search shop
            </label>
            <input
              id="shop-search"
              name="search"
              type="search"
              defaultValue={currentSearch}
              placeholder="Search rituals…"
              className="mystic-input min-h-[44px] w-full flex-1 text-sm sm:max-w-md"
            />
            <button
              type="submit"
              className="mystic-button-secondary shrink-0 px-5 py-2.5 text-[0.62rem] uppercase tracking-[0.2em]"
            >
              Find
            </button>
          </form>
        </section>

        <section className="mb-10 md:mb-12">
          <p className="text-[0.66rem] uppercase tracking-[0.32em] text-[#8f8475]">
            {matchedMerchGroup
              ? `${matchedMerchGroup.name}`
              : "Shop the collection"}
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-[1.7] text-[#7d7368]">
            {matchedMerchGroup
              ? `Filtered to ${matchedMerchGroup.name.toLowerCase()}. Choose All to see the full collection.`
              : "Each chip groups related categories so you can explore a focused slice of the collection."}
          </p>
        </section>

        <Suspense fallback={<ShopCatalogFallback />}>
          <ShopCatalogBody
            sort={sort}
            currentSearch={currentSearch}
            currentIngredient={currentIngredient}
            matchedMerchGroup={matchedMerchGroup}
            dbCategories={dbCategories}
            // Reuse the catalog already fetched for merch-group counts when the
            // default unfiltered/newest view is requested — avoids a second
            // full-catalog round trip to Supabase (lower TTFB on /shop).
            prefetchedNewestCatalog={catalogForMerchCounts}
          />
        </Suspense>
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
    <Link
      href={href}
      prefetch={false}
      className={`inline-flex min-h-[44px] items-center rounded-full border px-3.5 py-2 text-[0.62rem] uppercase tracking-[0.26em] backdrop-blur-sm transition-[border-color,background-color,color] duration-500 ease-out md:px-4 md:py-2 md:text-[0.65rem] ${
        active
          ? "border-[rgba(214,168,95,0.32)] bg-[rgba(214,168,95,0.1)] text-[#ebe4d8] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
          : "border-white/[0.08] bg-white/[0.025] text-[#9a8f82] hover:border-[rgba(214,168,95,0.16)] hover:text-[#d4cbc0]"
      }`}
    >
      {children}
    </Link>
  );
}

function buildShopHref({
  category,
  search,
  ingredient,
  sort,
}: {
  category?: string;
  search?: string;
  ingredient?: string;
  sort?: ProductSort;
}) {
  const params = new URLSearchParams();

  if (category) {
    params.set("category", category);
  }

  if (search) {
    params.set("search", search);
  }

  if (ingredient) {
    params.set("ingredient", ingredient);
  }

  if (sort && sort !== "newest") {
    params.set("sort", sort);
  }

  const query = params.toString();
  return query ? `/shop?${query}` : "/shop";
}
