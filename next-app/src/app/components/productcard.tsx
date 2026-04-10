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
    <article className="group relative mx-auto flex h-full w-full max-w-[280px] flex-col overflow-hidden rounded-[24px] border border-[rgba(214,168,95,0.18)] bg-[#0b0e14] shadow-[0_18px_45px_rgba(0,0,0,0.45)] transition duration-500 hover:-translate-y-1 hover:border-[rgba(214,168,95,0.45)]">
      <Link
        href={`/products/${product.slug}`}
        className="relative mx-4 mt-4 block"
      >
        <ThemedImageFrame
          src={imgSrc}
          alt={`${product.name} product shot`}
          fill
          variant="product"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="aspect-[4/4.8]"
          frameClassName="rounded-[20px]"
          imageClassName="object-contain p-4 transition duration-500 group-hover:scale-[1.03] md:p-5"
        />
        <div className="absolute left-3 top-3 rounded-full border border-[rgba(214,168,95,0.35)] bg-[rgba(6,8,12,0.82)] px-3 py-1 text-[0.62rem] uppercase tracking-[0.22em] text-[#f0d19a]">
          {product.routine_step ?? "Ritual"}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4 md:p-5">
        <div className="space-y-2">
          <Link
            href={`/products/${product.slug}`}
            className="font-literata text-[1.65rem] leading-tight tracking-[0.08em] text-[#f5eee3]"
          >
            {product.name}
          </Link>
          {product.description ? (
            <p className="line-clamp-2 text-sm leading-relaxed text-[#b8ab95]">
              {product.description}
            </p>
          ) : null}
        </div>

        <div className="mt-auto flex items-end justify-between gap-4 border-t border-[rgba(214,168,95,0.12)] pt-4">
          <div>
            {hasSale ? (
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-[0.18em] text-[#b8ab95] line-through">
                  {formatMoney(product.price_cents)}
                </span>
                <span className="text-xl font-semibold text-[#d6a85f]">
                  {formatMoney(displayPrice)}
                </span>
              </div>
            ) : (
              <span className="text-xl font-semibold text-[#d6a85f]">
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
            buttonClassName="rounded-full border border-[rgba(214,168,95,0.45)] px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#f5eee3] transition hover:bg-[rgba(214,168,95,0.14)]"
          />
        </div>
      </div>
    </article>
  );
}
