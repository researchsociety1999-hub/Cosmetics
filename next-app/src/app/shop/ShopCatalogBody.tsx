import Image from "next/image";
import Link from "next/link";
import ProductCard from "../components/productcard";
import {
  resolveMerchGroupForProduct,
  virtualMerchCategories,
} from "../lib/shopMerchGroups";
import { MYSTIQUE_CANONICAL_INGREDIENTS } from "../lib/data";
import { getProducts, type ProductSort } from "../lib/queries";
import { isProductPurchasable } from "../lib/productMerch";
import { hasSupabaseEnv } from "../lib/supabaseClient";
import type { Product } from "../lib/types";

export function ShopCatalogFallback() {
  return (
    <div className="space-y-16 md:space-y-20">
      <section className="space-y-6 border-t border-white/[0.04] pt-12 md:space-y-7 md:pt-14">
        <div className="space-y-2">
          <div className="h-3 w-24 animate-pulse rounded bg-white/[0.06]" />
          <div className="h-9 w-48 max-w-full animate-pulse rounded bg-white/[0.08]" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 md:gap-6 lg:grid-cols-3 lg:gap-7 xl:grid-cols-4 xl:gap-8 2xl:gap-9">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="mystic-card h-80 animate-pulse border border-white/[0.04]"
            />
          ))}
        </div>
      </section>
    </div>
  );
}

type ShopCatalogBodyProps = {
  sort: ProductSort;
  currentSearch: string;
  currentIngredient: string;
  matchedMerchGroup: { slug: string; name: string } | null;
  dbCategories: { id: number; slug: string; name: string }[];
};

export async function ShopCatalogBody({
  sort,
  currentSearch,
  currentIngredient,
  matchedMerchGroup,
  dbCategories,
}: ShopCatalogBodyProps) {
  const filteredProducts = await getProducts({
    search: currentIngredient ? "" : currentSearch,
    ingredientId: currentIngredient || undefined,
    sortBy: sort,
  });

  const productAssignments = assignProductsToMerchGroups(
    filteredProducts,
    dbCategories,
  );
  const virtual = virtualMerchCategories();
  const categoriesForSections = matchedMerchGroup
    ? virtual.filter((c) => c.slug === matchedMerchGroup.slug)
    : virtual;
  const assignmentsForSections = matchedMerchGroup
    ? productAssignments.filter(
        (a) => a.category.slug === matchedMerchGroup.slug,
      )
    : productAssignments;

  const productSections = buildProductSections({
    categories: categoriesForSections,
    assignments: assignmentsForSections,
  });

  const ingredientBanner = currentIngredient ? (
    <ShopIngredientFilterBanner
      ingredientId={currentIngredient}
      matchedMerchGroupSlug={matchedMerchGroup?.slug}
      currentSearch={currentSearch}
      sort={sort}
    />
  ) : null;

  if (productSections.length === 0) {
    return (
      <div className="space-y-8">
        {ingredientBanner}
        <ShopWideEmptyState
          hasSupabase={hasSupabaseEnv}
          hasActiveFilters={Boolean(
            currentSearch || currentIngredient || matchedMerchGroup,
          )}
        />
      </div>
    );
  }

  return (
    <div className="space-y-16 md:space-y-20">
      {ingredientBanner}
      {productSections.map((section) => (
        <section
          key={section.key}
          className="space-y-6 border-t border-white/[0.04] pt-12 first:border-t-0 first:pt-0 md:space-y-7 md:pt-14 md:first:pt-0"
        >
          <div className="space-y-2">
            <p className="text-[0.72rem] text-[#b8ab95]">
              <span className="tabular-nums text-[#d6c4a8]">
                {section.productCount}
              </span>{" "}
              <span className="uppercase tracking-[0.24em]">
                {section.productCount === 1 ? "product" : "products"}
              </span>
            </p>
            <h2 className="font-literata text-3xl tracking-[0.08em] text-[#f5eee3]">
              {section.title}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 md:gap-6 lg:grid-cols-3 lg:gap-7 xl:grid-cols-4 xl:gap-8 2xl:gap-9">
            {[...section.products]
              .sort((a, b) => Number(isProductPurchasable(b)) - Number(isProductPurchasable(a)))
              .map((product) => (
              <ProductCard key={product.id} product={product} showQuickView />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function ShopWideEmptyState({
  hasSupabase,
  hasActiveFilters,
}: {
  hasSupabase: boolean;
  hasActiveFilters: boolean;
}) {
  if (!hasSupabase) {
    return (
      <div className="mystic-card space-y-4 p-8 text-sm leading-relaxed text-[#b9aa8f]">
        <p className="font-literata text-xl tracking-[0.08em] text-[#f6f0e6]">
          The shop is temporarily unavailable.
        </p>
        <p>
          We can&apos;t show the catalog right now. Please try again in a little while,
          or visit another section of the site. If this keeps happening, use{" "}
          <Link href="/contact" className="text-[#e8c56e] underline-offset-4 hover:underline">
            Contact
          </Link>{" "}
          and we&apos;ll help from our side.
        </p>
      </div>
    );
  }

  return (
    <div className="mystic-card space-y-4 p-8 text-sm leading-relaxed text-[#b8ab95]">
      <p className="font-literata text-xl tracking-[0.08em] text-[#f5eee3]">
        {hasActiveFilters
          ? "No products match those filters yet."
          : "New arrivals are on the way."}
      </p>
      <p>
        {hasActiveFilters
          ? "Try clearing search, choosing All, or another category—matching products will show here when they are available."
          : "The collection updates as new formulas arrive. In the meantime, explore routines and ingredients, or reach out for wholesale questions."}
      </p>
      <div className="flex flex-wrap gap-3 pt-2">
        <Link
          href="/shop"
          className="mystic-button-secondary inline-flex items-center justify-center px-5 py-2.5 text-[0.65rem] uppercase tracking-[0.2em]"
        >
          View all
        </Link>
        <Link
          href="/routines"
          className="mystic-button-secondary inline-flex items-center justify-center px-5 py-2.5 text-[0.65rem] uppercase tracking-[0.2em]"
        >
          Routines
        </Link>
        <Link
          href="/journal"
          className="mystic-button-secondary inline-flex items-center justify-center px-5 py-2.5 text-[0.65rem] uppercase tracking-[0.2em]"
        >
          Journal
        </Link>
      </div>
    </div>
  );
}

function shopHrefClearIngredient(opts: {
  categorySlug?: string | null;
  search: string;
  sort: ProductSort;
}) {
  const params = new URLSearchParams();
  if (opts.categorySlug) params.set("category", opts.categorySlug);
  const s = opts.search.trim();
  if (s) params.set("search", s);
  if (opts.sort && opts.sort !== "newest") params.set("sort", opts.sort);
  const query = params.toString();
  return query ? `/shop?${query}` : "/shop";
}

function ShopIngredientFilterBanner({
  ingredientId,
  matchedMerchGroupSlug,
  currentSearch,
  sort,
}: {
  ingredientId: string;
  matchedMerchGroupSlug?: string | null;
  currentSearch: string;
  sort: ProductSort;
}) {
  const row = MYSTIQUE_CANONICAL_INGREDIENTS.find(
    (r) => r.id === ingredientId.trim().toLowerCase(),
  );
  if (!row?.imageSrc) return null;

  const clearHref = shopHrefClearIngredient({
    categorySlug: matchedMerchGroupSlug,
    search: currentSearch,
    sort,
  });
  const poster = row.imagePresentation === "poster";

  return (
    <section
      aria-labelledby={`shop-ingredient-${row.id}-heading`}
      className="mb-2 overflow-hidden rounded-[22px] border border-white/[0.06] bg-gradient-to-br from-[rgba(18,20,28,0.55)] via-[rgba(8,10,16,0.35)] to-[rgba(4,5,10,0.25)] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.28)] sm:p-6 md:mb-4"
    >
      <div className="flex flex-col items-stretch gap-6 sm:flex-row sm:items-center md:gap-8">
        <div
          className={`relative mx-auto shrink-0 overflow-hidden rounded-[1.125rem] border border-white/[0.08] bg-[#07080e] shadow-[0_12px_36px_rgba(0,0,0,0.45)] ${
            poster
              ? "aspect-[3/5] w-full max-w-[10.5rem]"
              : "aspect-square w-full max-w-[7.5rem]"
          }`}
        >
          <Image
            src={row.imageSrc}
            alt=""
            fill
            sizes={
              poster
                ? "(max-width:640px) 90vw, 10.5rem"
                : "(max-width:640px) 90vw, 7.5rem"
            }
            className={
              poster
                ? "object-cover object-[50%_42%]"
                : "object-cover object-center"
            }
          />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <p className="text-[0.68rem] uppercase tracking-[0.26em] text-[#b8ab95]">
            Filtered by active
          </p>
          <h2
            id={`shop-ingredient-${row.id}-heading`}
            className={
              poster
                ? "sr-only"
                : "font-literata text-2xl tracking-[0.08em] text-[#f5eee3] sm:text-3xl"
            }
          >
            {row.name}
          </h2>
          {row.description ? (
            <p className="text-sm leading-relaxed text-[#b8ab95]">
              {row.description}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1 text-[0.65rem] uppercase tracking-[0.2em]">
            <Link
              href={`/ingredients#${row.id}`}
              className="text-[#d6a85f] underline-offset-4 hover:underline"
            >
              Full ingredient note
            </Link>
            <Link
              href={clearHref}
              className="text-[#a99e8e] underline-offset-4 transition hover:text-[#d6a85f] hover:underline"
            >
              Show all products
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function assignProductsToMerchGroups(
  products: Product[],
  dbCategories: { id: number; slug: string; name: string }[],
): Array<{
  product: Product;
  category: { id: number; slug: string; name: string };
}> {
  const virtual = virtualMerchCategories();
  const fallback = virtual.find((v) => v.slug === "skincare") ?? virtual[0];
  return products.map((product) => {
    const slug = resolveMerchGroupForProduct(product, dbCategories);
    const category = virtual.find((v) => v.slug === slug) ?? fallback;
    return { product, category };
  });
}

function buildProductSections({
  categories,
  assignments,
}: {
  categories: { id: number; slug: string; name: string }[];
  assignments: Array<{
    product: Product;
    category: { id: number; slug: string; name: string };
  }>;
}) {
  const sections = categories
    .map((category) => {
      const categoryProducts = assignments
        .filter((assignment) => assignment.category.slug === category.slug)
        .map((assignment) => assignment.product);

      return {
        key: category.slug,
        title: category.name,
        productCount: categoryProducts.length,
        products: categoryProducts,
      };
    })
    .filter((section) => section.productCount > 0);

  return sections;
}
