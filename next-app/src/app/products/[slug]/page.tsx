import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "../../components/productcard";
import {
  ProductDetailAccordions,
  buildProductAccordionItems,
} from "../../components/ProductDetailAccordions";
import { ProductMerchQuickFacts } from "../../components/ProductMerchQuickFacts";
import { ProductPurchaseClient } from "../../components/ProductPurchaseClient";
import { RatingSummaryText, StarRow } from "../../components/StarRating";
import { SiteChrome } from "../../components/SiteChrome";
import { ThemedImageFrame } from "../../components/ThemedImageFrame";
import { getProductImages, truncateMetaDescription } from "../../lib/format";
import { isProductPurchasable } from "../../lib/productMerch";
import {
  getProductBySlug,
  getProductReviews,
  getProductVariants,
  getRelatedProducts,
  getRoutineCompanionProducts,
} from "../../lib/queries";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product not found",
      description:
        "That Mystique product is not in the current collection. Browse the shop for formulas in stock.",
      robots: { index: false, follow: true },
    };
  }

  const productName = product.name ?? "Mystique";
  const fallbackDescription =
    "A Mystique ritual skincare formula—layered textures, calm radiance, California-born restraint.";
  const description =
    truncateMetaDescription(product.description) ?? fallbackDescription;
  const images = getProductImages(product);
  const ogImage = images[0];
  const canonicalPath = `/products/${product.slug?.trim() ?? slug}`;

  return {
    title: productName,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: productName,
      description,
      url: canonicalPath,
      siteName: "Mystique",
      type: "website",
      ...(ogImage
        ? {
            images: [
              {
                url: ogImage,
                alt: `${productName} — Mystique`,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: productName,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return (
      <SiteChrome>
        <main className="w-full px-4 py-14 md:px-6 lg:px-10 xl:px-14">
          <section className="mystic-card p-8 text-center">
            <p className="text-[0.72rem] uppercase tracking-[0.28em] text-[#b8ab95]">
              Unavailable
            </p>
            <h1 className="mt-4 font-literata text-4xl tracking-[0.12em] text-[#f5eee3]">
              We couldn&apos;t find that ritual.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-[#b8ab95]">
              This ritual is not available right now. Return to the collection to
              continue exploring Mystique.
            </p>
            <div className="mt-8">
              <Link
                href="/shop"
                className="mystic-button-primary inline-flex items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em]"
              >
                Shop the collection
              </Link>
            </div>
          </section>
        </main>
      </SiteChrome>
    );
  }

  const [relatedProductsResult, reviewsResult, variants, routineProducts] =
    await Promise.all([
      getRelatedProducts(product, 6),
      getProductReviews(product.id),
      getProductVariants(product.id),
      getRoutineCompanionProducts(product, 3),
    ]);

  const relatedProducts = Array.isArray(relatedProductsResult)
    ? relatedProductsResult
    : [];
  const reviews = Array.isArray(reviewsResult) ? reviewsResult : [];
  const images = getProductImages(product);
  const heroSrc = images[0] ?? null;
  const galleryThumbs = images.slice(1);
  const benefits = getProductBenefits(product);
  const keyIngredients = getProductIngredients(product);
  const skinTypes = Array.isArray(product.skin_types) ? product.skin_types : [];
  const description = product.description ?? "";
  const productName = product.name ?? "Mystique product";
  const routineStep = product.routine_step ?? "Ritual";

  const categoryHref = product.category_slug
    ? `/shop?category=${encodeURIComponent(product.category_slug)}`
    : "/shop";

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const accordionItems = buildProductAccordionItems({
    benefits,
    keyIngredients,
    skinTypes,
    routineStep,
  });

  const routineIds = new Set(routineProducts.map((p) => p.id));
  const relatedFiltered = relatedProducts.filter((p) => !routineIds.has(p.id));
  const routinePurchasable = routineProducts.filter(isProductPurchasable);
  const relatedPurchasable = relatedFiltered.filter(isProductPurchasable);

  return (
    <SiteChrome>
      <main className="w-full px-4 pb-28 pt-10 md:px-6 lg:px-10 lg:pb-14 lg:pt-14 xl:px-14">
        <nav
          className="mb-8 flex flex-wrap items-center gap-2 text-[0.68rem] uppercase tracking-[0.2em] text-[#7a7265]"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-[#d6a85f]">
            Home
          </Link>
          <span aria-hidden>/</span>
          <Link href="/shop" className="hover:text-[#d6a85f]">
            Shop
          </Link>
          {product.category_name ? (
            <>
              <span aria-hidden>/</span>
              <Link href={categoryHref} className="hover:text-[#d6a85f]">
                {product.category_name}
              </Link>
            </>
          ) : null}
          <span aria-hidden>/</span>
          <span className="text-[#b8ab95]">{productName}</span>
        </nav>

        <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <ThemedImageFrame
              src={heroSrc}
              displayTitle={productName}
              alt={`${productName} hero image`}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              variant="product"
              className="aspect-[4/5]"
              frameClassName="rounded-[28px]"
              imageClassName="object-cover"
            />
            {galleryThumbs.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {galleryThumbs.map((image, index) => (
                  <ThemedImageFrame
                    key={`${image}-${index}`}
                    src={image}
                    displayTitle={productName}
                    alt={`${productName} alternate image ${index + 2}`}
                    fill
                    sizes="25vw"
                    variant="thumb"
                    className="aspect-square"
                    frameClassName="rounded-[18px]"
                    imageClassName="object-cover"
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-6 lg:space-y-8">
            <div>
              <div className="flex flex-wrap items-center gap-3 text-[0.72rem] uppercase tracking-[0.24em] text-[#b8ab95]">
                <Link
                  href={categoryHref}
                  className="hover:text-[#d6a85f]"
                >
                  {product.category_name ?? "Collection"}
                </Link>
                <span className="text-[#4a4035]">·</span>
                <span>{routineStep}</span>
              </div>
              <h1 className="mt-3 font-literata text-4xl tracking-[0.1em] text-[#f5eee3] md:text-5xl">
                {productName}
              </h1>
              <ProductMerchQuickFacts product={product} variants={variants} />
              {reviews.length > 0 ? (
                <a
                  href="#reviews"
                  className="mt-4 inline-flex items-center gap-2 text-sm text-[#b8ab95] transition hover:text-[#d6a85f]"
                >
                  <StarRow rating={avgRating} />
                  <RatingSummaryText average={avgRating} count={reviews.length} />
                </a>
              ) : null}
              {benefits.length > 0 ? (
                <ul className="mt-6 space-y-2 border-l-2 border-[rgba(214,168,95,0.25)] pl-4 text-sm leading-relaxed text-[#c9bcaa]">
                  {benefits.slice(0, 5).map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              ) : null}
              {description ? (
                <p className="mt-6 text-base leading-relaxed text-[#b8ab95]">
                  {description}
                </p>
              ) : null}
            </div>

            <ProductPurchaseClient
              product={product}
              variants={variants}
              reviewSummary={
                reviews.length > 0
                  ? { count: reviews.length, average: avgRating }
                  : null
              }
            />
          </div>
        </section>

        <section className="mt-16 lg:mt-20">
          <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
            The formula
          </p>
          <h2 className="mt-3 font-literata text-3xl tracking-[0.12em] text-[#f5eee3]">
            Claims you can check
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#b8ab95]">
            Every product page spells out who it is for, what it does, and where it sits in
            cleanse-to-SPF. Formulas are developed with input from independent skincare
            science advisors—education only, not medical advice.
          </p>
          <div className="mt-8 max-w-3xl">
            <ProductDetailAccordions items={accordionItems} />
          </div>
        </section>

        {routinePurchasable.length > 0 ? (
          <section className="mt-16 lg:mt-20">
            <header className="mb-8 max-w-2xl">
              <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
                Complete the ritual
              </p>
              <h2 className="mt-3 font-literata text-3xl tracking-[0.12em]">
                Pair with these steps
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#b8ab95]">
                Add the missing steps—each pick is chosen to complement this product&apos;s
                place in your routine.
              </p>
            </header>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-4 xl:gap-4">
              {routinePurchasable.map((item, index) => (
                <div key={item.id} className="relative">
                  <span className="absolute left-3 top-3 z-10 rounded-full border border-[rgba(214,168,95,0.35)] bg-[rgba(6,8,12,0.85)] px-3 py-1 text-[0.62rem] uppercase tracking-[0.2em] text-[#f0d19a]">
                    Step {index + 1}
                  </span>
                  <ProductCard product={item} />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section id="reviews" className="mt-16 scroll-mt-28 lg:mt-20">
          <header className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
                Reviews
              </p>
              <h2 className="mt-3 font-literata text-3xl tracking-[0.12em]">
                Customer reviews
              </h2>
            </div>
            {reviews.length > 0 ? (
              <p className="text-sm text-[#b8ab95]">
                <StarRow rating={avgRating} />{" "}
                <span className="ml-1">
                  <RatingSummaryText average={avgRating} count={reviews.length} />
                </span>
              </p>
            ) : null}
          </header>
          <p className="mb-6 max-w-2xl text-xs leading-relaxed text-[#7a7265]">
            Shoppers focus on texture, finish, and how formulas wear day to day—written in
            plain language.
          </p>
          <div className="grid gap-5 md:grid-cols-2">
            {reviews.length ? (
              reviews.map((review) => (
                <article key={review.id} className="mystic-card p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <StarRow rating={review.rating} />
                    <time
                      className="text-[0.65rem] uppercase tracking-[0.14em] text-[#7a7265]"
                      dateTime={review.created_at}
                    >
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }).format(new Date(review.created_at))}
                    </time>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[#b8ab95]">
                    {review.comment ?? ""}
                  </p>
                </article>
              ))
            ) : (
              <article className="mystic-card p-5 text-sm leading-relaxed text-[#b8ab95]">
                <p className="font-literata text-lg tracking-[0.08em] text-[#f5eee3]">
                  No reviews yet
                </p>
                <p className="mt-3 text-[#8f8576]">
                  When shoppers leave reviews, they will appear here.
                </p>
              </article>
            )}
          </div>
        </section>

        {relatedPurchasable.length ? (
          <section className="mt-16 lg:mt-20">
            <header className="mb-8">
              <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
                You may also like
              </p>
              <h2 className="mt-3 font-literata text-3xl tracking-[0.12em]">
                Pairs well with
              </h2>
            </header>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5 xl:gap-4">
              {relatedPurchasable.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </SiteChrome>
  );
}

function getProductBenefits(product: {
  benefits?: string[] | null;
  description: string | null;
  routine_step?: string | null;
}): string[] {
  if (Array.isArray(product.benefits) && product.benefits.length) {
    return product.benefits;
  }

  if (product.routine_step === "Cleanse") {
    return [
      "Removes buildup gently",
      "Supports a soft, comfortable finish",
      "Preps skin for the rest of the ritual",
    ];
  }

  if (product.routine_step === "Tone") {
    return [
      "Rebalances after cleansing",
      "Primes skin for serums and creams",
      "Keeps the canvas soft and receptive",
    ];
  }

  if (product.routine_step === "Treat") {
    return [
      "Targets tone and texture",
      "Layers well under moisturizer",
      "Supports a luminous finish",
    ];
  }

  if (product.routine_step === "Moisturize") {
    return [
      "Locks in hydration",
      "Helps skin feel smooth and cushioned",
      "Leaves a refined, silky finish",
    ];
  }

  if (product.routine_step === "Protect") {
    return [
      "Helps shield skin during the day",
      "Supports comfortable daily wear",
      "Adds hydration without heaviness",
    ];
  }

  return product.description
    ? [
        "Supports a polished routine",
        "Designed for comfortable daily use",
        "Builds a smoother-looking finish",
      ]
    : [];
}

function getProductIngredients(product: {
  key_ingredients?: string[] | null;
  description: string | null;
  routine_step?: string | null;
}): string[] {
  if (Array.isArray(product.key_ingredients) && product.key_ingredients.length) {
    return product.key_ingredients;
  }

  const desc = (product.description ?? "").toLowerCase();
  const inferred: string[] = [];

  if (desc.includes("niacinamide")) inferred.push("Niacinamide");
  if (desc.includes("peptide")) inferred.push("Peptides");
  if (desc.includes("ceramide")) inferred.push("Ceramides");
  if (desc.includes("centella")) inferred.push("Centella asiatica");
  if (desc.includes("hyaluronic")) inferred.push("Hyaluronic acid");
  if (desc.includes("squalane")) inferred.push("Squalane");
  if (desc.includes("green tea")) inferred.push("Green tea");

  if (inferred.length) {
    return inferred;
  }

  if (product.routine_step === "Cleanse") {
    return [
      "Calming botanical extracts",
      "Barrier-supporting hydrators",
      "Gentle cleansing agents",
    ];
  }

  if (product.routine_step === "Tone") {
    return [
      "Humectant support",
      "Comfort-first botanicals",
      "Lightweight conditioning agents",
    ];
  }

  if (product.routine_step === "Treat") {
    return [
      "Glow-supporting actives",
      "Hydration-support complex",
      "Texture-refining ingredients",
    ];
  }

  if (product.routine_step === "Moisturize") {
    return [
      "Barrier-supporting lipids",
      "Comforting emollients",
      "Smoothing hydrators",
    ];
  }

  if (product.routine_step === "Protect") {
    return [
      "Broad-spectrum UV filters",
      "Hydrating support ingredients",
      "Skin-comforting finish enhancers",
    ];
  }

  return [];
}
