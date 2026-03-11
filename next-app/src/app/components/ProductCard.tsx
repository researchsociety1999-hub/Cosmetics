“use client”;

"use client";

import Image from "next/image";
import type { Product } from "../lib/types";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  isWishlisted?: boolean;
  isLoading?: boolean;
}

export function ProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  isLoading,
}: ProductCardProps) {
  if (isLoading) {
    return (
      <div className="mystic-card flex flex-col overflow-hidden">
        <div className="h-64 w-full mystic-skeleton" />
        <div className="space-y-3 p-5">
          <div className="h-3 w-20 mystic-skeleton" />
          <div className="h-4 w-3/4 mystic-skeleton" />
          <div className="h-3 w-full mystic-skeleton" />
          <div className="flex items-center justify-between pt-2">
            <div className="h-4 w-16 mystic-skeleton" />
            <div className="h-8 w-24 mystic-skeleton" />
          </div>
        </div>
      </div>
    );
  }

  const hasSale =
    product.sale_price_cents != null &&
    product.sale_price_cents > 0 &&
    product.sale_price_cents < product.price_cents;

  const price = (product.price_cents ?? 0) / 100;
  const salePrice = hasSale
    ? (product.sale_price_cents as number) / 100
    : null;

  const handleAdd = () => {
    if (onAddToCart) onAddToCart(product);
  };

  const handleWishlist = () => {
    if (onToggleWishlist) onToggleWishlist(product);
  };

  return (
    <article className="mystic-card flex flex-col overflow-hidden transition hover:shadow-[0_0_0_1px_rgba(214,168,95,0.5),0_24px_60px_rgba(0,0,0,0.9)] hover:translate-y-[-3px]">
      <div className="relative w-full overflow-hidden" style={{ paddingTop: "125%" }}>
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover transition duration-700 hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#111827] to-[#020617] text-xs uppercase tracking-[0.2em] text-[#4b5563]">
            Mystic
          </div>
        )}
        <button
          type="button"
          onClick={handleWishlist}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(214,168,95,0.6)] bg-black/55 text-sm text-[#f5eee3] hover:bg-[#d6a85f] hover:text-black"
          aria-label="Toggle wishlist"
        >
          {isWishlisted ? "♥" : "♡"}
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5">
        {product.category_id != null && (
          <p className="mb-1 text-[0.62rem] uppercase tracking-[0.25em] text-[#b8ab95]">
            Ritual • {product.category_id}
          </p>
        )}
        <h3 className="font-cormorant text-xl font-semibold tracking-[0.12em] text-[#f5eee3]">
          {product.name}
        </h3>
        {product.description && (
          <p className="mt-2 line-clamp-2 text-xs text-[#b8ab95]">
            {product.description}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-col">
            {hasSale && salePrice != null ? (
              <>
                <span className="text-sm font-semibold text-[#d6a85f]">
                  ${salePrice.toFixed(2)}
                </span>
                <span className="text-xs text-[#6b7280] line-through">
                  ${price.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-sm font-semibold text-[#f5eee3]">
                ${price.toFixed(2)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="mystic-button-primary px-4 py-2 text-xs uppercase tracking-[0.16em]"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
}

