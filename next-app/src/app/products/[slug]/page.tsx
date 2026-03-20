import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { addToCartAction } from "../../actions/cart";
import ProductCard from "../../components/productcard";
import { SiteChrome } from "../../components/SiteChrome";
import { formatMoney, getDisplayPrice, getProductImages } from "../../lib/format";
import {
  getProductBySlug,
  getProductReviews,
  getRelatedProducts,
} from "../../lib/queries";

export const revalidate = 300;

const FALLBACK_PRODUCT_IMAGE =
  "https://placehold.co/600x800/1a1a1a/c9a84c?text=Mystique";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product not found" };
  }

  return {
    title: product.name,
    description:
      product.description ??
      "A Mystique ritual skincare product designed for bloom-skin radiance.",
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
        <main className="mx-auto max-w-4xl px-4 py-14 md:px-6">
          <section className="mystic-card p-8 text-center">
            <p className="text-[0.72rem] uppercase tracking-[0.28em] text-[#b8ab95]">
              Product not found
            </p>
            <h1 className="mt-4 font-cormorant text-4xl tracking-[0.12em] text-[#f5eee3]">
              We couldn&apos;t find that ritual.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-[#b8ab95]">
              The product for slug &quot;{slug}&quot; is not available right now.
              Browse the full collection to keep exploring Mystique.
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

  console.log("[ProductPage] slug lookup", { slug, found: product.slug });

  const [relatedProductsResult, reviewsResult] = await Promise.all([
    getRelatedProducts(product, 4),
    getProductReviews(product.id),
  ]);

  const relatedProducts = Array.isArray(relatedProductsResult)
    ? relatedProductsResult
    : [];
  const reviews = Array.isArray(reviewsResult) ? reviewsResult : [];
  const images = getProductImages(product);
  const galleryImages = images.length ? images : [FALLBACK_PRODUCT_IMAGE];
  const hasSale = product.sale_price_cents != null;
  const benefits = Array.isArray(product.benefits) ? product.benefits : [];
  const keyIngredients = Array.isArray(product.key_ingredients)
    ? product.key_ingredients
    : [];
  const skinTypes = Array.isArray(product.skin_types) ? product.skin_types : [];
  const description = product.description ?? "";
  const productName = product.name ?? "Mystique product";
  const routineStep = product.routine_step ?? "Ritual";
  const stockLabel =
    typeof product.stock === "number" && product.stock > 5
      ? "In stock"
      : "Low stock";

  return (
    <SiteChrome>
      <main className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] border border-[rgba(214,168,95,0.18)] bg-[#0d1118]">
              <Image
                src={galleryImages[0]}
                alt={`${productName} hero image`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {galleryImages.length > 1 ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {galleryImages.slice(1).map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className="relative aspect-square overflow-hidden rounded-[18px] border border-[rgba(214,168,95,0.14)] bg-[#0d1118]"
                  >
                    <Image
                      src={image}
                      alt={`${productName} alternate image`}
                      fill
                      className="object-cover"
                      sizes="25vw"
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-8">
            <div>
              <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
                {routineStep} step
              </p>
              <h1 className="mt-3 font-cormorant text-5xl tracking-[0.12em] text-[#f5eee3]">
                {productName}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#b8ab95]">
                {description}
              </p>
            </div>

            <div className="mystic-card flex flex-wrap items-center gap-5 p-5">
              <div className="flex flex-col">
                {hasSale ? (
                  <>
                    <span className="text-sm text-[#b8ab95] line-through">
                      {formatMoney(product.price_cents)}
                    </span>
                    <span className="text-3xl font-semibold text-[#d6a85f]">
                      {formatMoney(getDisplayPrice(product))}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-semibold text-[#d6a85f]">
                    {formatMoney(product.price_cents)}
                  </span>
                )}
              </div>
              <span className="rounded-full border border-[rgba(214,168,95,0.18)] px-4 py-2 text-xs uppercase tracking-[0.22em] text-[#f5eee3]">
                {stockLabel}
              </span>
            </div>

            <form action={addToCartAction} className="mystic-card space-y-5 p-6">
              <input type="hidden" name="productId" value={product.id} />
              <input type="hidden" name="redirectTo" value="cart" />
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-[#b8ab95]">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  defaultValue="1"
                  name="quantity"
                  className="mystic-input w-24 text-sm"
                />
              </div>
              <button
                type="submit"
                className="mystic-button-primary inline-flex min-h-[50px] items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em]"
              >
                Add to cart
              </button>
            </form>

            <div className="grid gap-4 md:grid-cols-2">
              <InfoBlock title="Benefits" items={benefits} />
              <InfoBlock title="Key ingredients" items={keyIngredients} />
              <InfoBlock
                title="How to use"
                items={[
                  `Use during the ${routineStep.toLowerCase()} step.`,
                  "Layer after lighter textures and before heavier creams.",
                ]}
              />
              <InfoBlock title="Skin types" items={skinTypes} />
            </div>
          </div>
        </section>

        <section className="mt-16">
          <header className="mb-8">
            <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
              Reviews
            </p>
            <h2 className="mt-3 font-cormorant text-3xl tracking-[0.12em]">
              Early product notes
            </h2>
          </header>
          <div className="grid gap-5 md:grid-cols-2">
            {reviews.length ? (
              reviews.map((review) => (
                <article key={review.id} className="mystic-card p-5">
                  <p className="text-sm text-[#d6a85f]">{"*".repeat(review.rating)}</p>
                  <p className="mt-3 text-sm leading-relaxed text-[#b8ab95]">
                    {review.comment ?? ""}
                  </p>
                </article>
              ))
            ) : (
              <article className="mystic-card p-5 text-sm text-[#b8ab95]">
                No reviews yet for this ritual.
              </article>
            )}
          </div>
        </section>

        {relatedProducts.length ? (
          <section className="mt-16">
            <header className="mb-8">
              <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
                Related products
              </p>
              <h2 className="mt-3 font-cormorant text-3xl tracking-[0.12em]">
                Continue the ritual
              </h2>
            </header>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </SiteChrome>
  );
}

function InfoBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="mystic-card p-5">
      <h2 className="font-cormorant text-2xl tracking-[0.1em] text-[#f5eee3]">
        {title}
      </h2>
      {items.length ? (
        <ul className="mt-4 space-y-2 text-sm text-[#b8ab95]">
          {items.map((item, index) => (
            <li key={`${title}-${index}`}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-[#b8ab95]">Details coming soon.</p>
      )}
    </article>
  );
}
