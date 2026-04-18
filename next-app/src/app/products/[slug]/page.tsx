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
          <section className="mystic-panel p-8 text-center md:p-10">
            <p className="text-[0.72rem] uppercase tracking-[0.28em] text-[#d6a85f]">
              Unavailable
            </p>
            <h1 className="mt-4 font-literata text-4xl tracking-[0.12em] text-[#f5eee3]">
              We couldn&apos;t find that ritual.
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#b8ab95]">
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

  const howToLines = getProductHowToUse(product);
  const accordionItems = buildProductAccordionItems({
    productName,
    benefits,
    keyIngredients,
    skinTypes,
    routineStep,
    howToLines,
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
            A ritual, clearly explained
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#b8ab95]">
            Each product page spells out who it’s for, what you can expect, and where it
            belongs in cleanse-to-SPF. Our ingredient notes are educational and meant to help
            you shop thoughtfully—they aren’t medical advice.
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

        <section
          id="reviews"
          className="mt-16 scroll-mt-[max(6rem,env(safe-area-inset-top,0px))] lg:mt-20"
        >
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
              <article className="mystic-panel col-span-full p-6 text-sm leading-relaxed text-[#b8ab95] md:col-span-2">
                <p className="text-[0.65rem] uppercase tracking-[0.24em] text-[#d6a85f]">
                  Early days
                </p>
                <p className="mt-3 font-literata text-xl tracking-[0.08em] text-[#f5eee3]">
                  No reviews yet
                </p>
                <p className="mt-3 max-w-xl text-[#a89a88]">
                  When shoppers share texture, finish, and wear-time notes, they will appear
                  here in plain language.
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

/** Adds a short “why it’s here” note when the catalog only lists a plain name. */
function enrichIngredientCatalogLine(raw: string): string {
  const t = raw.trim();
  if (!t || /\s—\s/.test(t)) {
    return t;
  }
  const lower = t.toLowerCase();
  const notes: Record<string, string> = {
    niacinamide: "helps refine the look of tone and texture with barrier-minded comfort",
    peptides: "support bounce and a smoother-feeling surface",
    "peptide blend": "supports bounce and a smoother-feeling surface",
    ceramides: "reinforce the barrier so moisture stays where it belongs",
    "centella asiatica": "soothes and steadies skin that looks stressed",
    "hyaluronic acid": "draws and holds water for a supple, cushioned feel",
    squalane: "seals without weight for a silky, breathable finish",
    "green tea": "antioxidant comfort for skin exposed to daily stressors",
    "rice enzymes": "gentle refinement for texture and brightness",
    kaolin: "helps lift excess oil while the ritual still feels composed",
    panthenol: "comfort-first conditioning after cleansing",
    ectoin: "helps skin feel resilient in dry or taxing air",
    "uv filters": "broad-spectrum protection as part of your morning seal",
    "copper peptide": "recovery-minded support for overnight comfort",
    "peptide complex": "layers with other steps for a rested-looking finish",
  };

  if (notes[lower]) {
    return `${t} — ${notes[lower]}`;
  }
  for (const [key, note] of Object.entries(notes)) {
    if (lower.includes(key)) {
      return `${t} — ${note}`;
    }
  }
  return t;
}

function getProductIngredients(product: {
  key_ingredients?: string[] | null;
  description: string | null;
  routine_step?: string | null;
}): string[] {
  if (Array.isArray(product.key_ingredients) && product.key_ingredients.length) {
    return product.key_ingredients.map(enrichIngredientCatalogLine);
  }

  const desc = (product.description ?? "").toLowerCase();
  const inferred: string[] = [];

  if (desc.includes("niacinamide")) {
    inferred.push(
      "Niacinamide — helps refine the look of tone and texture with barrier-minded comfort",
    );
  }
  if (desc.includes("peptide")) {
    inferred.push("Peptides — support bounce and a smoother-feeling surface");
  }
  if (desc.includes("ceramide")) {
    inferred.push("Ceramides — reinforce the barrier so moisture stays where it belongs");
  }
  if (desc.includes("centella")) {
    inferred.push("Centella asiatica — soothes and steadies skin that looks stressed");
  }
  if (desc.includes("hyaluronic")) {
    inferred.push("Hyaluronic acid — draws and holds water for a supple feel");
  }
  if (desc.includes("squalane")) {
    inferred.push("Squalane — seals without weight for a silky finish");
  }
  if (desc.includes("green tea")) {
    inferred.push("Green tea — antioxidant comfort for daily exposure");
  }

  if (inferred.length) {
    return inferred;
  }

  if (product.routine_step === "Cleanse") {
    return [
      "Mild surfactants — lift sunscreen and buildup without stripping",
      "Botanicals and humectants — keep the cleanse soft and skin-comforting",
      "Barrier-minded hydrators — leave the canvas ready for the next layer",
    ];
  }

  if (product.routine_step === "Tone") {
    return [
      "Humectants — refresh moisture after cleansing",
      "Botanicals — comfort-first conditioning before treatment",
      "Light conditioners — create slip so serums absorb evenly",
    ];
  }

  if (product.routine_step === "Treat") {
    return [
      "Targeted actives — chosen for tone, texture, or glow (see packaging for specifics)",
      "Hydration partners — keep strong steps feeling balanced",
      "Texture agents — elegant spread so the layer sits cleanly under cream",
    ];
  }

  if (product.routine_step === "Moisturize") {
    return [
      "Lipids and ceramides — help skin feel cushioned and held together",
      "Emollients — refine the surface so makeup or SPF glides on evenly",
      "Humectants — lock water in for a pliant, comfortable finish",
    ];
  }

  if (product.routine_step === "Protect") {
    return [
      "Broad-spectrum UV filters — your daytime shield, per labeled SPF",
      "Hydrating and finish ingredients — luminous wear without a heavy cast (varies by formula)",
      "Antioxidant support — complements SPF as part of a sun-smart ritual",
    ];
  }

  return [
    "Humectants and conditioners — everyday comfort and slip",
    "Texture agents — chosen for a refined, layer-friendly feel",
    "Full INCI — always on your carton when you need the complete list",
  ];
}

function isBodySunscreenLotion(name: string): boolean {
  const n = name.toLowerCase();
  return (
    n.includes("body") &&
    n.includes("lotion") &&
    (n.includes("spf") || n.includes("sun") || n.includes("sunscreen"))
  );
}

function getProductHowToUse(product: {
  slug?: string | null;
  name?: string | null;
  routine_step?: string | null;
  category_name?: string | null;
}): string[] {
  const slug = (product.slug ?? "").trim();
  const displayName = product.name ?? "this ritual";

  const bySlug: Record<string, string[]> = {
    "celestial-glow-serum": [
      "Cleanse, then (optionally) tone—skin should feel clean and dry.",
      "Dispense 2–3 drops; press and sweep across face and neck.",
      "Wait 20–30 seconds, then layer moisturizer. In the morning, finish with SPF.",
    ],
    "moon-veil-cleanser": [
      "On dry or damp skin, massage in slow circles to lift sunscreen and makeup.",
      "Add lukewarm water to emulsify, then rinse until nothing remains.",
      "Pat dry and move into toner or treatment—lightest to richest.",
    ],
    "golden-eclipse-mask": [
      "On clean, dry skin, apply an even layer—avoid the eye area unless the label allows otherwise.",
      "Rest for the time on packaging; mist lightly if the mask begins to feel tight.",
      "Rinse with lukewarm water, then continue with serum and moisturizer.",
    ],
    "noir-velvet-emulsion": [
      "After serums, smooth over face and neck while skin still holds a trace of moisture.",
      "Use light upward strokes; give it a minute before sunscreen or makeup.",
      "Morning: end with SPF. Evening: add a richer cream on top if your skin asks for more.",
    ],
    "bloom-screen-essence-spf": [
      "As the last step of your morning ritual, apply generously—about two finger-lengths for face and neck—15 minutes before sun.",
      "Reapply every two hours outdoors, and after swimming, sweating, or toweling.",
      "Treat SPF as part of a sun-smart day: hats, shade, and mindful exposure.",
    ],
    "midnight-recovery-ampoule": [
      "After cleansing and serums, warm the product between palms.",
      "Press into face and neck; linger where skin feels tight or depleted.",
      "Seal with moisturizer. Evenings only unless your carton says otherwise.",
    ],
  };

  if (slug && bySlug[slug]) {
    return bySlug[slug];
  }

  const step = (product.routine_step ?? "").trim();
  const name = (product.name ?? "").toLowerCase();

  if (isBodySunscreenLotion(name)) {
    return [
      "On clean, dry skin, smooth an even layer over exposed areas—arms, legs, and anywhere the sun reaches.",
      "Allow a moment to set before dressing; reapply every two hours when you’re outdoors, and after swimming or toweling.",
      "Pair with shade and cover-ups on peak days; SPF supports your ritual—it doesn’t replace mindful sun habits.",
    ];
  }

  if (step === "Cleanse") {
    return [
      `Begin with damp skin. Massage ${displayName} in slow circles to lift oil, SPF, and the day.`,
      "Rinse with lukewarm water; pat dry with a soft towel—no rubbing.",
      "Continue from lightest to richest: tone (if you use one), treat, moisturize, then SPF when it’s morning.",
    ];
  }
  if (step === "Tone") {
    return [
      "After cleansing, sweep or press onto skin with palms or a soft pad—no dragging.",
      "Pause a few seconds so humectants can sink in before treatment.",
      "Follow with serum and moisturizer while skin still feels supple, not tight.",
    ];
  }
  if (step === "Treat") {
    return [
      `On clean, dry skin, apply ${displayName} where you want tone, texture, or glow support—see packaging for amount.`,
      "New to actives? Introduce slowly (fewer nights per week), then build as skin stays comfortable.",
      "Layer moisturizer on top; in the morning, always finish with SPF when using actives.",
    ];
  }
  if (step === "Moisturize") {
    return [
      `After serums, smooth ${displayName} over face and neck—press extra into cheeks or anywhere that feels dry.`,
      "Give it a minute before SPF or makeup so layers don’t pill.",
      "Use a little more in dry seasons, a little less in humid weather.",
    ];
  }
  if (step === "Protect") {
    return [
      `Each morning, apply ${displayName} generously as your final step before makeup—follow the labeled SPF and reapplication guidance.`,
      "Reapply through the day when you’re outside continuously, after swimming, or after heavy sweating.",
      "Combine with hats, sleeves, and shade so protection feels effortless, not forced.",
    ];
  }

  if (name.includes("mask")) {
    return [
      "Apply an even layer to clean skin, avoiding eyes and lips unless the label invites you closer.",
      "Rest for the time indicated; rinse or remove as the formula directs.",
      "Follow with serum, then moisturizer, to seal the reset.",
    ];
  }

  return [
    "Follow the order on your carton—thin textures first, richer ones last—so each step has room to work.",
    "If you’re sensitive or stacking new actives, patch test and add one new product at a time.",
    "Store closed, away from heat and direct light. Your packaging notes PAO (period after opening).",
  ];
}
