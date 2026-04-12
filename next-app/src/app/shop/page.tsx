import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import ProductCard from "../components/productcard";
import { SiteChrome } from "../components/SiteChrome";
import { getCategories, getProducts, type ProductSort } from "../lib/queries";
import { hasSupabaseEnv } from "../lib/supabaseClient";
import type { Product } from "../lib/types";

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

export const metadata: Metadata = {
  title: "Shop",
  description: "Shop the Mystique ritual collection by category.",
};

export const revalidate = 300;

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
  const [categories, filteredProducts] = await Promise.all([
    getCategories(),
    getProducts({
      search: currentIngredient ? "" : currentSearch,
      ingredientId: currentIngredient || undefined,
      sortBy: sort,
    }),
  ]);
  const availableCategories = categories;
  const matchedCategory = params.category
    ? availableCategories.find((category) => category.slug === params.category) ?? null
    : null;
  const productAssignments = assignProductsToCategories({
    categories: availableCategories,
    products: filteredProducts,
  });
  const productSections = buildProductSections({
    categories: matchedCategory ? [matchedCategory] : availableCategories,
    assignments: matchedCategory
      ? productAssignments.filter(
          (assignment) => assignment.category?.slug === matchedCategory.slug,
        )
      : productAssignments,
  });

  return (
    <SiteChrome>
      <main className="w-full px-4 py-14 md:px-6 lg:px-10 xl:px-14">
        <h1 className="sr-only">Shop</h1>
        <section className="mb-8 flex flex-wrap gap-3">
          <CategoryChip
            href={buildShopHref({
              search: currentSearch,
              ingredient: currentIngredient,
              sort,
            })}
            active={!matchedCategory}
          >
            All
          </CategoryChip>
          {availableCategories.map((category) => (
            <CategoryChip
              key={category.id}
              href={buildShopHref({
                category: category.slug,
                search: currentSearch,
                ingredient: currentIngredient,
                sort,
              })}
              active={matchedCategory?.slug === category.slug}
            >
              {category.name}
            </CategoryChip>
          ))}
        </section>

        <section className="mb-8">
          <p className="text-[0.72rem] uppercase tracking-[0.24em] text-[#b8ab95]">
            {matchedCategory
              ? `${matchedCategory.name} products`
              : "Shop by category"}
          </p>
          <p className="mt-2 text-sm text-[#8f8576]">
            {matchedCategory
              ? `Showing products from the ${matchedCategory.name} section.`
              : "Browse rituals by category."}
          </p>
        </section>

        {productSections.length === 0 ? (
          <ShopWideEmptyState
            hasSupabase={hasSupabaseEnv}
            hasActiveFilters={Boolean(
              currentSearch || currentIngredient || matchedCategory,
            )}
          />
        ) : (
          <div className="space-y-16 md:space-y-20">
            {productSections.map((section) => (
              <section
                key={section.key}
                className="space-y-6 border-t border-white/[0.04] pt-12 first:border-t-0 first:pt-0 md:space-y-7 md:pt-14 md:first:pt-0"
              >
                <div className="space-y-2">
                  <p className="text-[0.72rem] text-[#b8ab95]">
                    {section.productCount > 0 ? (
                      <>
                        <span className="tabular-nums text-[#d6c4a8]">
                          {section.productCount}
                        </span>{" "}
                        <span className="uppercase tracking-[0.24em]">
                          {section.productCount === 1 ? "product" : "products"}
                        </span>
                      </>
                    ) : (
                      <span className="uppercase tracking-[0.24em]">New arrivals soon</span>
                    )}
                  </p>
                  <h2 className="font-literata text-3xl tracking-[0.08em] text-[#f5eee3]">
                    {section.title}
                  </h2>
                </div>
                {section.products.length === 0 ? (
                  <CategoryEmptyState title={section.title} isHair={section.isHair} />
                ) : (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 md:gap-6 lg:grid-cols-3 lg:gap-7 xl:grid-cols-4 xl:gap-8 2xl:gap-9">
                    {section.products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </main>
    </SiteChrome>
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
          ? "Try clearing search, choosing All, or another category—formulas appear here as soon as they are published."
          : "New formulas will appear here as soon as they are ready. Until then, explore routines and ingredients, or write the studio for wholesale timelines."}
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

function productMatchesCategory(
  product: {
    name?: string | null;
    slug?: string | null;
    description?: string | null;
    routine_step?: string | null;
    category_id: number | null;
    category_slug?: string | null;
    category_name?: string | null;
  },
  category: { id: number; slug: string; name: string },
) {
  if (typeof product.category_id === "number" && product.category_id === category.id) {
    return true;
  }

  const normalizedSlug = product.category_slug?.trim().toLowerCase();
  if (normalizedSlug && normalizedSlug === category.slug.toLowerCase()) {
    return true;
  }

  const normalizedName = product.category_name?.trim().toLowerCase();
  if (normalizedName === category.name.toLowerCase()) {
    return true;
  }

  const haystack = [
    product.name ?? "",
    product.slug ?? "",
    product.description ?? "",
    product.routine_step ?? "",
  ]
    .join(" ")
    .toLowerCase();

  const categorySlug = category.slug.toLowerCase();
  const categoryName = category.name.toLowerCase();
  const categoryLabel = `${categorySlug} ${categoryName}`;

  const matchesAnyKeyword = (keywords: string[]) =>
    keywords.some((keyword) => haystack.includes(keyword));

  if (categoryLabel.includes("body")) {
    return matchesAnyKeyword([
      "body",
      "lotion",
      "body lotion",
      "body cream",
      "body wash",
      "body oil",
      "scrub",
      "butter",
      "hand cream",
    ]);
  }

  if (
    categoryLabel.includes("skin care") ||
    categoryLabel.includes("skincare") ||
    categoryLabel.includes("face")
  ) {
    return matchesAnyKeyword([
      "serum",
      "cleanser",
      "moistur",
      "moisturizer",
      "cream",
      "face",
      "spf",
      "sunscreen",
      "sun screen",
      "toner",
      "essence",
      "ampoule",
      "mask",
      "peptide",
      "hydrat",
    ]);
  }

  if (
    categoryLabel.includes("toner") ||
    categoryLabel.includes("accessor") ||
    categoryLabel.includes("tool")
  ) {
    return matchesAnyKeyword([
      "toner",
      "mist",
      "pad",
      "tool",
      "accessory",
      "roller",
      "gua sha",
      "brush",
      "spatula",
      "headband",
    ]);
  }

  if (categorySlug.includes("serum") || categoryName.includes("serum")) {
    return haystack.includes("serum") || haystack.includes("ampoule");
  }

  if (categorySlug.includes("cleanser") || categoryName.includes("cleanser")) {
    return haystack.includes("cleanser");
  }

  if (categorySlug.includes("mask") || categoryName.includes("mask")) {
    return haystack.includes("mask");
  }

  if (categorySlug.includes("moistur") || categoryName.includes("moistur")) {
    return (
      haystack.includes("moistur") ||
      haystack.includes("cream") ||
      haystack.includes("lotion") ||
      haystack.includes("emulsion")
    );
  }

  if (categorySlug.includes("protect") || categoryName.includes("protect")) {
    return (
      haystack.includes("spf") ||
      haystack.includes("sunscreen") ||
      haystack.includes("sun screen") ||
      haystack.includes("protect")
    );
  }

  return haystack.includes(categorySlug) || haystack.includes(categoryName);
}

function getCategoryMatchScore(
  product: {
    name?: string | null;
    slug?: string | null;
    description?: string | null;
    routine_step?: string | null;
    category_id: number | null;
    category_slug?: string | null;
    category_name?: string | null;
  },
  category: { id: number; slug: string; name: string },
) {
  if (typeof product.category_id === "number" && product.category_id === category.id) {
    return 100;
  }

  const normalizedSlug = product.category_slug?.trim().toLowerCase();
  if (normalizedSlug && normalizedSlug === category.slug.toLowerCase()) {
    return 95;
  }

  const normalizedName = product.category_name?.trim().toLowerCase();
  if (normalizedName === category.name.toLowerCase()) {
    return 90;
  }

  return productMatchesCategory(product, category) ? 10 : -1;
}

function assignProductsToCategories({
  categories,
  products,
}: {
  categories: { id: number; slug: string; name: string }[];
  products: Product[];
}) {
  return products.map((product) => {
    let bestCategory: { id: number; slug: string; name: string } | null = null;
    let bestScore = -1;

    for (const category of categories) {
      const score = getCategoryMatchScore(product, category);

      if (score > bestScore) {
        bestScore = score;
        bestCategory = score >= 0 ? category : bestCategory;
      }
    }

    return {
      product,
      category: bestScore >= 0 ? bestCategory : null,
    };
  });
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
      className={`inline-flex rounded-full border px-3.5 py-1.5 text-[0.65rem] uppercase tracking-[0.2em] backdrop-blur-sm transition md:px-4 md:py-2 md:text-xs ${
        active
          ? "border-[#d6a85f] bg-[rgba(214,168,95,0.18)] text-[#f5eee3] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
          : "border-white/12 bg-white/[0.04] text-[#b8ab95] hover:border-[rgba(214,168,95,0.28)] hover:text-[#f5eee3]"
      }`}
    >
      {children}
    </Link>
  );
}

function CategoryEmptyState({ title, isHair }: { title: string; isHair: boolean }) {
  if (isHair) {
    return (
      <div className="mystic-card relative overflow-hidden border-[rgba(214,168,95,0.2)] bg-[linear-gradient(135deg,rgba(255,255,255,0.035)_0%,rgba(214,168,95,0.07)_42%,rgba(6,8,12,0.65)_100%)] px-6 py-10 md:px-10 md:py-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full border border-[rgba(214,168,95,0.12)] opacity-50"
        />
        <p className="relative font-literata text-2xl font-medium leading-snug tracking-[0.04em] text-[#faf6ef] md:text-[1.75rem]">
          Hair care is on the way.
        </p>
        <p className="relative mt-4 max-w-lg text-sm leading-relaxed text-[#b8ab95]">
          This category is not stocked yet. Explore skin and body care now, or check back
          as we expand the line.
        </p>
        <Link
          href="/shop"
          className="relative mystic-button-secondary mt-8 inline-flex items-center justify-center px-6 py-3 text-xs uppercase tracking-[0.2em]"
        >
          View all skincare
        </Link>
      </div>
    );
  }

  return (
    <div className="mystic-card px-6 py-10 text-center text-sm leading-relaxed text-[#b8ab95] md:px-10">
      <p className="font-literata text-xl tracking-[0.08em] text-[#f5eee3] md:text-2xl">
        Nothing listed in {title} yet
      </p>
      <p className="mx-auto mt-4 max-w-md">
        Try another category or clear your search—new drops land here as soon as they are
        live in the studio.
      </p>
      <Link
        href="/shop"
        className="mystic-button-secondary mt-8 inline-flex items-center justify-center px-6 py-3 text-xs uppercase tracking-[0.2em]"
      >
        View all skincare
      </Link>
    </div>
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

function isHairCategory(category: { slug: string; name: string }) {
  const s = `${category.slug} ${category.name}`.toLowerCase();
  return s.includes("hair");
}

function buildProductSections({
  categories,
  assignments,
}: {
  categories: { id: number; slug: string; name: string }[];
  assignments: Array<{
    product: Product;
    category: { id: number; slug: string; name: string } | null;
  }>;
}) {
  const sections = categories
    .map((category) => {
      const categoryProducts = assignments
        .filter((assignment) => assignment.category?.slug === category.slug)
        .map((assignment) => assignment.product);

      return {
        key: category.slug,
        title: category.name,
        productCount: categoryProducts.length,
        products: categoryProducts,
        isHair: isHairCategory(category),
      };
    })
    .filter(
      (section) =>
        section.productCount > 0 || section.isHair,
    );

  const uncategorizedProducts = assignments
    .filter((assignment) => assignment.category === null)
    .map((assignment) => assignment.product);

  if (uncategorizedProducts.length) {
    sections.push({
      key: "uncategorized",
      title: "Uncategorized",
      productCount: uncategorizedProducts.length,
      products: uncategorizedProducts,
      isHair: false,
    });
  }

  return sections;
}
