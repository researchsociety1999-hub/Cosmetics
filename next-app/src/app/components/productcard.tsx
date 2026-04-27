import Image from "next/image";
import Link from "next/link";
import { addToCartAction } from "../actions/cart";
import { AddToCartForm } from "./AddToCartForm";
import { ProductCardQuickView } from "./ProductCardQuickView";
import { ThemedImageFrame } from "./ThemedImageFrame";
import { WaitlistModal } from "./WaitlistModal";
import { formatMoney, getDisplayPrice, getProductPrimaryImageUrl } from "../lib/format";
import {
  getPrimaryBenefitLine,
  getSkinTypesLine,
  getTextureFinishCue,
  getVolumeSizeLabel,
  isProductPurchasable,
} from "../lib/productMerch";
import type { Product } from "../lib/types";

interface ProductCardProps {
  product: Product;
  /** Tighter type scale and padding — e.g. homepage featured quartet. */
  compact?: boolean;
  /**
   * Reserved for Phase 4 Quick View. When true, a control may render here later.
   * Default false so no dead UI until wired.
   */
  showQuickView?: boolean;
}

function pickSecondaryImageUrl(primary: string | null, extra: string[] | null | undefined): string | null {
  if (!extra?.length) return null;
  const primaryNorm = primary?.trim() ?? "";
  for (const url of extra) {
    const t = url?.trim();
    if (!t) continue;
    if (primaryNorm && t === primaryNorm) continue;
    return t;
  }
  return null;
}

function isNewArrival(createdAt: string | undefined): boolean {
  if (!createdAt) return false;
  const t = new Date(createdAt).getTime();
  if (Number.isNaN(t)) return false;
  const ageDays = (Date.now() - t) / 86400000;
  return ageDays >= 0 && ageDays <= 42;
}

export default function ProductCard({
  product,
  compact = false,
  showQuickView = false,
}: ProductCardProps) {
  const displayPrice = getDisplayPrice(product);
  const hasSale = product.sale_price_cents != null;
  const imgSrc = getProductPrimaryImageUrl(product);
  const secondarySrc = pickSecondaryImageUrl(imgSrc, product.extra_images);
  const showNewBadge = isNewArrival(product.created_at);
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

  const imgSizes = compact
    ? "(max-width: 640px) 42vw, (max-width: 1024px) 22vw, 13rem"
    : "(max-width: 640px) 50vw, (max-width: 1100px) 33vw, (max-width: 1536px) 25vw, 20vw";

  const mediaRadius = compact ? "rounded-[14px]" : "rounded-[17px]";
  const mediaAspect = compact ? "aspect-square sm:aspect-[4/5]" : "aspect-[4/5]";
  const linkPad = compact ? "mx-2 mt-2 sm:mx-2.5 sm:mt-2.5" : "mx-3 mt-3 md:mx-3.5 md:mt-3.5";

  return (
    <article
      className={
        compact
          ? "group relative flex h-full w-full min-w-0 flex-col overflow-hidden rounded-[18px] bg-gradient-to-b from-[rgba(16,18,26,0.52)] via-[rgba(8,10,14,0.2)] to-[rgba(4,5,9,0.06)] shadow-[0_8px_28px_rgba(0,0,0,0.26)] ring-1 ring-inset ring-white/[0.05] backdrop-blur-md transition duration-500 ease-out [@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-0.5 hover:from-[rgba(20,22,32,0.58)] hover:via-[rgba(10,12,18,0.32)] hover:to-[rgba(6,7,11,0.12)] [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_14px_40px_rgba(0,0,0,0.34)] hover:ring-[rgba(214,168,95,0.1)] focus-within:ring-[rgba(214,168,95,0.14)] motion-reduce:transition-none"
          : "group relative flex h-full w-full min-w-0 flex-col overflow-hidden rounded-[22px] bg-gradient-to-b from-[rgba(16,18,26,0.52)] via-[rgba(8,10,14,0.2)] to-[rgba(4,5,9,0.06)] shadow-[0_10px_36px_rgba(0,0,0,0.28)] ring-1 ring-inset ring-white/[0.05] backdrop-blur-md transition duration-500 ease-out [@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-1 hover:from-[rgba(20,22,32,0.58)] hover:via-[rgba(10,12,18,0.32)] hover:to-[rgba(6,7,11,0.12)] [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_18px_52px_rgba(0,0,0,0.38)] hover:ring-[rgba(214,168,95,0.12)] focus-within:ring-[rgba(214,168,95,0.16)] motion-reduce:transition-none"
      }
    >
      <Link
        href={productHref}
        className={`relative block overflow-hidden ${mediaRadius} ${linkPad} outline-none ring-offset-2 ring-offset-[#05070d] focus-visible:ring-1 focus-visible:ring-[rgba(212,175,55,0.45)]`}
      >
        <div className={`relative w-full overflow-hidden ${mediaRadius} ${mediaAspect}`}>
          <ThemedImageFrame
            src={imgSrc}
            displayTitle={product.name}
            alt={`${product.name} — Mystique`}
            fill
            variant="product"
            sizes={imgSizes}
            className="absolute inset-0 h-full min-h-0 w-full"
            frameClassName={
              compact
                ? "rounded-[14px] bg-[rgba(0,0,0,0.18)] ring-1 ring-inset ring-white/[0.04]"
                : "rounded-[17px] bg-[rgba(0,0,0,0.18)] ring-1 ring-inset ring-white/[0.04]"
            }
            imageClassName="object-cover transition duration-700 ease-out motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-[1.03] group-focus-within:scale-[1.02]"
          />
          {secondarySrc ? (
            <div
              aria-hidden
              className={`absolute inset-0 z-[8] ${mediaRadius} opacity-0 transition-opacity duration-500 ease-out motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100 group-focus-within:opacity-100`}
            >
              <Image
                src={secondarySrc}
                alt=""
                fill
                sizes={imgSizes}
                quality={88}
                loading="lazy"
                className={`object-cover object-center ${mediaRadius}`}
              />
            </div>
          ) : null}
          <div
            className={
              compact
                ? "pointer-events-none absolute left-2 top-2 z-[12] rounded-full bg-[rgba(6,8,12,0.55)] px-2 py-0.5 text-[0.5rem] uppercase tracking-[0.18em] text-[#e8d4b0] shadow-[0_0_16px_rgba(0,0,0,0.35)] ring-1 ring-inset ring-[rgba(214,168,95,0.18)] backdrop-blur-sm sm:text-[0.52rem]"
                : "pointer-events-none absolute left-2.5 top-2.5 z-[12] rounded-full bg-[rgba(6,8,12,0.55)] px-2.5 py-0.5 text-[0.58rem] uppercase tracking-[0.2em] text-[#e8d4b0] shadow-[0_0_20px_rgba(0,0,0,0.35)] ring-1 ring-inset ring-[rgba(214,168,95,0.18)] backdrop-blur-sm"
            }
          >
            {product.routine_step ?? "Ritual"}
          </div>
          {showNewBadge ? (
            <div
              className={
                compact
                  ? "pointer-events-none absolute right-2 top-2 z-[12] rounded-full border border-[rgba(214,168,95,0.28)] bg-[rgba(4,5,10,0.72)] px-2 py-0.5 text-[0.48rem] font-semibold uppercase tracking-[0.2em] text-[#e8c56e] backdrop-blur-sm"
                  : "pointer-events-none absolute right-2.5 top-2.5 z-[12] rounded-full border border-[rgba(214,168,95,0.28)] bg-[rgba(4,5,10,0.72)] px-2.5 py-0.5 text-[0.52rem] font-semibold uppercase tracking-[0.2em] text-[#e8c56e] backdrop-blur-sm"
              }
            >
              New
            </div>
          ) : null}
        </div>
      </Link>

      <div
        className={
          compact
            ? "flex flex-1 flex-col gap-1 p-2 sm:gap-2 sm:p-3"
            : "flex flex-1 flex-col gap-2.5 p-3.5 md:gap-3 md:p-4"
        }
      >
        <div className="min-w-0 space-y-1 sm:space-y-1.5">
          <Link
            href={productHref}
            className={
              compact
                ? "line-clamp-2 font-literata text-[0.8125rem] font-medium leading-snug tracking-[0.05em] text-[#f5eee3] sm:text-[0.875rem] md:text-[0.9375rem]"
                : "line-clamp-2 font-literata text-base font-medium leading-snug tracking-[0.06em] text-[#f5eee3] md:text-[1.05rem] lg:text-lg"
            }
          >
            {product.name}
          </Link>
          {scanLine ? (
            <p
              className={
                compact
                  ? "line-clamp-2 text-[0.6rem] leading-relaxed text-[#c9bcaa] sm:text-[0.62rem]"
                  : "line-clamp-2 text-[0.68rem] leading-relaxed text-[#c9bcaa] md:text-[0.72rem]"
              }
            >
              {scanLine}
            </p>
          ) : product.description ? (
            <p
              className={
                compact
                  ? "line-clamp-2 text-[0.62rem] leading-relaxed text-[#a89e8c] sm:text-[0.65rem]"
                  : "line-clamp-2 text-xs leading-relaxed text-[#a89e8c] md:text-[0.8125rem]"
              }
            >
              {product.description}
            </p>
          ) : null}
        </div>

        <div className={compact ? "mt-auto space-y-2 pt-0.5" : "mt-auto space-y-3 pt-1"}>
          <div
            aria-hidden
            className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.1] to-transparent"
          />
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <div className="min-w-0">
              <span className="sr-only">Price</span>
              {hasSale ? (
                <div className="flex flex-col gap-0.5">
                  <span
                    className={
                      compact
                        ? "text-[0.55rem] uppercase tracking-[0.14em] text-[#8f8576] line-through"
                        : "text-[0.65rem] uppercase tracking-[0.16em] text-[#8f8576] line-through"
                    }
                  >
                    {formatMoney(product.price_cents)}
                  </span>
                  <span
                    className={
                      compact
                        ? "text-sm font-semibold tabular-nums tracking-[0.02em] text-[#d6a85f] sm:text-[0.9375rem]"
                        : "text-lg font-semibold tabular-nums tracking-[0.02em] text-[#d6a85f]"
                    }
                  >
                    {formatMoney(displayPrice)}
                  </span>
                </div>
              ) : (
                <span
                  className={
                    compact
                      ? "text-sm font-semibold tabular-nums tracking-[0.02em] text-[#d6a85f] sm:text-[0.9375rem]"
                      : "text-lg font-semibold tabular-nums tracking-[0.02em] text-[#d6a85f]"
                  }
                >
                  {formatMoney(displayPrice)}
                </span>
              )}
            </div>

            <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-2">
              {showQuickView ? (
                <ProductCardQuickView product={product} compact={compact} />
              ) : null}
              {canQuickAdd ? (
                <AddToCartForm
                  action={addToCartAction}
                  productId={product.id}
                  redirectTo=""
                  buttonLabel="Add to bag"
                  showQuantity={false}
                  formClassName="contents"
                  buttonClassName={
                    compact
                      ? "relative inline-flex min-h-[40px] items-center justify-center rounded-full border border-[rgba(214,168,95,0.38)] bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_55%,rgba(0,0,0,0)_100%)] px-2.5 py-1.5 text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-[#f5eee3] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm transition duration-300 ease-out hover:border-[rgba(214,168,95,0.52)] hover:bg-[linear-gradient(180deg,rgba(214,168,95,0.10)_0%,rgba(255,255,255,0.03)_55%,rgba(0,0,0,0)_100%)] hover:shadow-[0_10px_26px_rgba(0,0,0,0.35)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(212,175,55,0.4)] sm:min-h-[44px] sm:px-3 sm:text-[0.58rem] sm:tracking-[0.16em]"
                      : "relative inline-flex min-h-[44px] items-center justify-center rounded-full border border-[rgba(214,168,95,0.38)] bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_55%,rgba(0,0,0,0)_100%)] px-3 py-2 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[#f5eee3] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm transition duration-300 ease-out hover:border-[rgba(214,168,95,0.52)] hover:bg-[linear-gradient(180deg,rgba(214,168,95,0.10)_0%,rgba(255,255,255,0.03)_55%,rgba(0,0,0,0)_100%)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.38)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(212,175,55,0.4)]"
                  }
                />
              ) : (
                <div className="flex flex-col items-end gap-1 text-right">
                  <span className="text-[0.58rem] uppercase tracking-[0.18em] text-[#8f8576]">
                    Out of stock
                  </span>
                  <WaitlistModal
                    productName={product.name}
                    productSlug={product.slug}
                    triggerLabel="Get restock note"
                    triggerClassName={
                      compact
                        ? "rounded-full border border-[rgba(214,168,95,0.35)] px-2 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.12em] text-[#f0d19a] transition hover:bg-[rgba(214,168,95,0.1)] sm:px-2.5 sm:py-1.5 sm:text-[0.58rem]"
                        : "rounded-full border border-[rgba(214,168,95,0.35)] px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#f0d19a] transition hover:bg-[rgba(214,168,95,0.1)]"
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
