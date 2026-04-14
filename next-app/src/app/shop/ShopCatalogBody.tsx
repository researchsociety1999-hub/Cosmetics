import Link from "next/link";
import ProductCard from "../components/productcard";
import { getProducts, type ProductSort } from "../lib/queries";
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
  matchedCategory: { id: number; slug: string; name: string } | null;
  availableCategories: { id: number; slug: string; name: string }[];
};

export async function ShopCatalogBody({
  sort,
  currentSearch,
  currentIngredient,
  matchedCategory,
  availableCategories,
}: ShopCatalogBodyProps) {
  const filteredProducts = await getProducts({
    search: currentIngredient ? "" : currentSearch,
    ingredientId: currentIngredient || undefined,
    sortBy: sort,
  });

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

  if (productSections.length === 0) {
    return (
      <ShopWideEmptyState
        hasSupabase={hasSupabaseEnv}
        hasActiveFilters={Boolean(
          currentSearch || currentIngredient || matchedCategory,
        )}
      />
    );
  }

  return (
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
