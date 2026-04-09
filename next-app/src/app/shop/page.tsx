import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import ProductCard from "../components/productcard";
import { SiteChrome } from "../components/SiteChrome";
import { getCategories, getProducts, type ProductSort } from "../lib/queries";
import { ShopFiltersBar } from "./ShopFiltersBar";
import type { Product } from "../lib/types";

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
  const sort = SORT_OPTIONS.some((option) => option.value === params.sort)
    ? (params.sort as ProductSort)
    : "newest";
  const currentSearch = params.search?.trim() ?? "";
  const [categories, filteredProducts] = await Promise.all([
    getCategories(),
    getProducts({
      search: currentSearch,
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

        <ShopFiltersBar
          currentSearch={currentSearch}
          matchedCategorySlug={matchedCategory?.slug ?? ""}
          sort={sort}
          availableCategories={availableCategories.map((c) => ({
            id: c.id,
            slug: c.slug,
            name: c.name,
          }))}
        />

        <section className="mb-4 flex flex-wrap gap-3">
          <CategoryChip
            href={buildShopHref({ search: currentSearch, sort })}
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
              : "Showing published Supabase products grouped by category."}
          </p>
        </section>

        {productSections.length === 0 ? (
          <div className="mystic-card p-8 text-sm text-[#b8ab95]">
            No published Supabase products were found for that search or category.
          </div>
        ) : (
          <div className="space-y-12">
            {productSections.map((section) => (
              <section
                key={section.key}
                className="space-y-5 border-t border-[rgba(214,168,95,0.1)] pt-8 first:border-t-0 first:pt-0"
              >
                <div className="space-y-2">
                  <p className="text-[0.72rem] uppercase tracking-[0.24em] text-[#b8ab95]">
                    {section.productCount} product{section.productCount === 1 ? "" : "s"}
                  </p>
                  <h2 className="font-cormorant text-3xl tracking-[0.08em] text-[#f5eee3]">
                    {section.title}
                  </h2>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {section.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </SiteChrome>
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
      className={`inline-flex rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em] ${
        active
          ? "border-[#d6a85f] bg-[rgba(214,168,95,0.12)] text-[#f5eee3]"
          : "border-[rgba(214,168,95,0.18)] text-[#b8ab95] hover:text-[#f5eee3]"
      }`}
    >
      {children}
    </Link>
  );
}

function buildShopHref({
  category,
  search,
  sort,
}: {
  category?: string;
  search?: string;
  sort?: ProductSort;
}) {
  const params = new URLSearchParams();

  if (category) {
    params.set("category", category);
  }

  if (search) {
    params.set("search", search);
  }

  if (sort && sort !== "newest") {
    params.set("sort", sort);
  }

  const query = params.toString();
  return query ? `/shop?${query}` : "/shop";
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
      };
    })
    .filter((section) => section.productCount > 0);

  const uncategorizedProducts = assignments
    .filter((assignment) => assignment.category === null)
    .map((assignment) => assignment.product);

  if (uncategorizedProducts.length) {
    sections.push({
      key: "uncategorized",
      title: "Uncategorized",
      productCount: uncategorizedProducts.length,
      products: uncategorizedProducts,
    });
  }

  return sections;
}
