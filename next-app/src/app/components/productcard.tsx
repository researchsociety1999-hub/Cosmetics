import Link from "next/link";
import { addToCartAction } from "../actions/cart";
import { AddToCartForm } from "./AddToCartForm";
import { ThemedImageFrame } from "./ThemedImageFrame";
import { formatMoney, getDisplayPrice, getProductPrimaryImageUrl } from "../lib/format";
import {
  getPrimaryBenefitLine,
  getRestockContactHref,
  getSkinTypesLine,
  getTextureFinishCue,
  getVolumeSizeLabel,
  isProductPurchasable,
} from "../lib/productMerch";
import type { Product } from "../lib/types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const displayPrice = getDisplayPrice(product);
  const hasSale = product.sale_price_cents != null;
  const imgSrc = getProductPrimaryImageUrl(product);
  const slug = product.slug?.trim();
  const productHref = slug ? `/products/${slug}` : "/shop";
  const canQuickAdd = isProductPurchasable(product);
  const skinLine = getSkinTypesLine(product, 2);
  const benefitLine = getPrimaryBenefitLine(product);
  const textureLine = getTextureFinishCue(product);
  const sizeLine = getVolumeSizeLabel(product, null);
  const scanParts = [skinLine, benefitLine, textureLine, sizeLine].filter(
    Boolean,
  ) as string[];
  const scanLine =
    scanParts.length > 0 ? scanParts.slice(0, 3).join(" · ") : null;

  return (
    <article className="group relative flex h-full w-full min-w-0 flex-col overflow-hidden rounded-[22px] bg-gradient-to-b from-[rgba(16,18,26,0.52)] via-[rgba(8,10,14,0.2)] to-[rgba(4,5,9,0.06)] shadow-[0_10px_36px_rgba(0,0,0,0.28)] ring-1 ring-inset ring-white/[0.05] backdrop-blur-md transition duration-500 ease-out hover:-translate-y-1 hover:from-[rgba(20,22,32,0.58)] hover:via-[rgba(10,12,18,0.32)] hover:to-[rgba(6,7,11,0.12)] hover:shadow-[0_18px_52px_rgba(0,0,0,0.38)] hover:ring-[rgba(214,168,95,0.12)]">
      <Link
        href={productHref}
        className="relative mx-3 mt-3 block md:mx-3.5 md:mt-3.5"
      >
        <ThemedImageFrame
          src={imgSrc}
          displayTitle={product.name}
          alt={`${product.name} — Mystique`}
          fill
          variant="product"
          sizes="(max-width: 640px) 50vw, (max-width: 1100px) 33vw, (max-width: 1536px) 25vw, 20vw"
          className="aspect-[4/5]"
          frameClassName="rounded-[17px] bg-[rgba(0,0,0,0.18)] ring-1 ring-inset ring-white/[0.04]"
          imageClassName="object-cover transition duration-700 ease-out group-hover:scale-[1.015]"
        />
        <div className="absolute left-2.5 top-2.5 rounded-full bg-[rgba(6,8,12,0.55)] px-2.5 py-0.5 text-[0.58rem] uppercase tracking-[0.2em] text-[#e8d4b0] shadow-[0_0_20px_rgba(0,0,0,0.35)] ring-1 ring-inset ring-[rgba(214,168,95,0.18)] backdrop-blur-sm">
          {product.routine_step ?? "Ritual"}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2.5 p-3.5 md:gap-3 md:p-4">
        <div className="min-w-0 space-y-1">
          <Link
            href={productHref}
            className="line-clamp-2 font-literata text-base leading-snug tracking-[0.06em] text-[#f5eee3] md:text-[1.05rem] lg:text-lg"
          >
            {product.name}
          </Link>
          {scanLine ? (
            <p className="line-clamp-2 text-[0.68rem] leading-relaxed text-[#c9bcaa] md:text-[0.72rem]">
              {scanLine}
            </p>
          ) : product.description ? (
            <p className="line-clamp-2 text-xs leading-relaxed text-[#a89e8c] md:text-[0.8125rem]">
              {product.description}
            </p>
          ) : null}
        </div>

        <div className="mt-auto space-y-3 pt-1">
          <div
            aria-hidden
            className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.1] to-transparent"
          />
          <div className="flex items-end justify-between gap-3">
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

          {canQuickAdd ? (
            <AddToCartForm
              action={addToCartAction}
              productId={product.id}
              redirectTo=""
              buttonLabel="Add to bag"
              showQuantity={false}
              formClassName="contents"
              buttonClassName="rounded-full border border-[rgba(214,168,95,0.45)] bg-white/[0.04] px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#f5eee3] backdrop-blur-sm transition hover:bg-[rgba(214,168,95,0.12)]"
            />
          ) : (
            <div className="flex shrink-0 flex-col items-end gap-1 text-right">
              <span className="text-[0.58rem] uppercase tracking-[0.18em] text-[#8f8576]">
                Unavailable
              </span>
              <Link
                href={getRestockContactHref(product)}
                className="rounded-full border border-[rgba(214,168,95,0.35)] px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#f0d19a] transition hover:bg-[rgba(214,168,95,0.1)]"
              >
                Restock note
              </Link>
            </div>
          )}
          </div>
        </div>
      </div>
    </article>
  );
}
