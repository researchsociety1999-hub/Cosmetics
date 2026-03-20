import Image from "next/image";
import Link from "next/link";
import { addToCartAction } from "../actions/cart";
import { formatMoney, getDisplayPrice, isSafeImageSrc } from "../lib/format";
import type { Product } from "../lib/types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const displayPrice = getDisplayPrice(product);
  const hasSale = product.sale_price_cents != null;
  const imgSrc = isSafeImageSrc(product.image_url) ? product.image_url : null;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[24px] border border-[rgba(214,168,95,0.18)] bg-[#0b0e14] shadow-[0_18px_45px_rgba(0,0,0,0.45)] transition duration-500 hover:-translate-y-1 hover:border-[rgba(214,168,95,0.45)]">
      <Link href={`/products/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-[#11151d]">
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={`${product.name} product shot`}
            fill
            className="object-cover transition duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl text-[#d6a85f]/30">
            M
          </div>
        )}
        <div className="absolute left-3 top-3 rounded-full border border-[rgba(214,168,95,0.35)] bg-[rgba(6,8,12,0.82)] px-3 py-1 text-[0.62rem] uppercase tracking-[0.22em] text-[#f0d19a]">
          {product.routine_step ?? "Ritual"}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="space-y-2">
          <Link
            href={`/products/${product.slug}`}
            className="font-cormorant text-2xl tracking-[0.08em] text-[#f5eee3]"
          >
            {product.name}
          </Link>
          <p className="line-clamp-3 text-sm leading-relaxed text-[#b8ab95]">
            {product.description ?? "[REPLACE LATER] Product description"}
          </p>
        </div>

        <div className="mt-auto flex items-end justify-between gap-4 border-t border-[rgba(214,168,95,0.12)] pt-4">
          <div>
            {hasSale ? (
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-[0.18em] text-[#b8ab95] line-through">
                  {formatMoney(product.price_cents)}
                </span>
                <span className="text-2xl font-semibold text-[#d6a85f]">
                  {formatMoney(displayPrice)}
                </span>
              </div>
            ) : (
              <span className="text-2xl font-semibold text-[#d6a85f]">
                {formatMoney(displayPrice)}
              </span>
            )}
          </div>

          <form action={addToCartAction}>
            <input type="hidden" name="productId" value={product.id} />
            <button
              type="submit"
              className="rounded-full border border-[rgba(214,168,95,0.45)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f5eee3] transition hover:bg-[rgba(214,168,95,0.14)]"
            >
              Add to cart
            </button>
          </form>
        </div>
      </div>
    </article>
  );
}
