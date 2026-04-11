import Link from "next/link";
import { addToCartAction } from "../actions/cart";
import { AddToCartForm } from "./AddToCartForm";
import { ThemedImageFrame } from "./ThemedImageFrame";
import { formatMoney, getDisplayPrice, isSafeImageSrc } from "../lib/format";
import type { Product } from "../lib/types";

interface ProductCardProps {
  product: Product;
}

const FALLBACK_PRODUCT_IMAGE =
  "https://placehold.co/600x800/png?text=Mystique&bg=1a1a1a&text_color=c9a84c";

export default function ProductCard({ product }: ProductCardProps) {
  const displayPrice = getDisplayPrice(product);
  const hasSale = product.sale_price_cents != null;
  const imgSrc = isSafeImageSrc(product.image_url)
    ? product.image_url
    : FALLBACK_PRODUCT_IMAGE;

  return (
    <article className="group relative flex h-full w-full min-w-0 flex-col overflow-hidden rounded-[20px] border border-white/10 bg-[rgba(8,10,14,0.5)] shadow-[0_14px_36px_rgba(0,0,0,0.4)] backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-[rgba(214,168,95,0.35)] hover:shadow-[0_20px_48px_rgba(0,0,0,0.5)]">
      <Link
        href={`/products/${product.slug}`}
        className="relative mx-2.5 mt-2.5 block md:mx-3 md:mt-3"
      >
        <ThemedImageFrame
          src={imgSrc}
          alt={`${product.name} product shot`}
          fill
          variant="product"
          sizes="(max-width: 640px) 50vw, (max-width: 1100px) 33vw, (max-width: 1536px) 25vw, 20vw"
          className="aspect-[4/5]"
          frameClassName="rounded-[16px] bg-[rgba(0,0,0,0.2)]"
          imageClassName="object-contain p-2 transition duration-500 group-hover:scale-[1.02] md:p-3"
        />
        <div className="absolute left-2 top-2 rounded-full border border-[rgba(214,168,95,0.35)] bg-[rgba(6,8,12,0.72)] px-2.5 py-0.5 text-[0.58rem] uppercase tracking-[0.2em] text-[#f0d19a] backdrop-blur-sm">
          {product.routine_step ?? "Ritual"}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3 md:gap-2.5 md:p-3.5">
        <div className="min-w-0 space-y-1">
          <Link
            href={`/products/${product.slug}`}
            className="line-clamp-2 font-literata text-base leading-snug tracking-[0.06em] text-[#f5eee3] md:text-[1.05rem] lg:text-lg"
          >
            {product.name}
          </Link>
          {product.description ? (
            <p className="line-clamp-2 text-xs leading-relaxed text-[#a89e8c] md:text-[0.8125rem]">
              {product.description}
            </p>
          ) : null}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-white/10 pt-2.5">
          <div>
            {hasSale ? (
              <div className="flex flex-col">
                <span className="text-[0.65rem] uppercase tracking-[0.16em] text-[#8f8576] line-through">
                  {formatMoney(product.price_cents)}
                </span>
                <span className="text-lg font-semibold text-[#d6a85f]">
                  {formatMoney(displayPrice)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-semibold text-[#d6a85f]">
                {formatMoney(displayPrice)}
              </span>
            )}
          </div>

          <AddToCartForm
            action={addToCartAction}
            productId={product.id}
            redirectTo=""
            showQuantity={false}
            formClassName="contents"
            buttonClassName="rounded-full border border-[rgba(214,168,95,0.45)] bg-white/[0.04] px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#f5eee3] backdrop-blur-sm transition hover:bg-[rgba(214,168,95,0.12)]"
          />
        </div>
      </div>
    </article>
  );
}
