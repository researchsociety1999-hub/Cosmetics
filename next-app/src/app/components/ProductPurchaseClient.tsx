"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { addToCartAction } from "../actions/cart";
import { AddToCartForm } from "./AddToCartForm";
import { PurchaseTrustFootnote } from "./PurchaseTrustFootnote";
import { RatingSummaryText, StarRow } from "./StarRating";
import { formatMoney, getUnitPriceCents } from "../lib/format";
import { getRestockContactHref } from "../lib/productMerch";
import type { Product, ProductVariant } from "../lib/types";

type ProductPurchaseClientProps = {
  product: Product;
  variants: ProductVariant[];
  /** When set, shows compact rating near buy actions (must reflect real `reviews` rows). */
  reviewSummary?: { count: number; average: number } | null;
};

export function ProductPurchaseClient({
  product,
  variants,
  reviewSummary,
}: ProductPurchaseClientProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [userPickedVariantId, setUserPickedVariantId] = useState<number | null>(null);
  const [sticky, setSticky] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const defaultVariantId = useMemo(() => {
    if (!variants.length) return null;
    const firstAvailable =
      variants.find((v) => (v.stock ?? 0) > 0) ?? variants[0];
    return firstAvailable?.id ?? null;
  }, [variants]);

  const selectedVariantId = useMemo(() => {
    if (
      userPickedVariantId != null &&
      variants.some((v) => v.id === userPickedVariantId)
    ) {
      return userPickedVariantId;
    }
    return defaultVariantId;
  }, [userPickedVariantId, defaultVariantId, variants]);

  useEffect(() => {
    const node = anchorRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setSticky(!entry?.isIntersecting);
      },
      { threshold: 0.15, rootMargin: "-64px 0px 0px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const selectedVariant = useMemo(
    () =>
      selectedVariantId == null
        ? null
        : (variants.find((v) => v.id === selectedVariantId) ?? null),
    [selectedVariantId, variants],
  );

  const unitCents = getUnitPriceCents(product, selectedVariant);
  const baseList = product.price_cents;
  const showStrike =
    product.sale_price_cents != null &&
    selectedVariant?.price_cents == null &&
    unitCents < baseList;

  const browseSimilarHref = useMemo(() => {
    const slug = product.category_slug?.trim();
    return slug
      ? `/shop?category=${encodeURIComponent(slug)}`
      : "/shop";
  }, [product.category_slug]);

  const restockHref = useMemo(() => getRestockContactHref(product), [product]);

  const purchasable = useMemo(() => {
    if (variants.length > 0) {
      if (!selectedVariant) {
        return false;
      }
      return (selectedVariant.stock ?? 0) > 0;
    }
    if (product.in_stock === false) {
      return false;
    }
    if (typeof product.stock === "number" && product.stock <= 0) {
      return false;
    }
    return true;
  }, [product.in_stock, product.stock, selectedVariant, variants.length]);

  const stockLabel = (() => {
    if (!purchasable) {
      return "Currently unavailable";
    }
    if (variants.length > 0 && selectedVariant) {
      const s = selectedVariant.stock ?? 0;
      return s > 8 ? "In stock" : "Low stock";
    }
    if (typeof product.stock === "number" && product.stock > 5) {
      return "In stock";
    }
    return "Low stock";
  })();

  const variantIdForCart =
    variants.length > 0 && selectedVariant ? selectedVariant.id : undefined;

  const primaryButtonClass =
    "mystic-button-primary inline-flex min-h-[50px] w-full items-center justify-center px-6 py-3 text-xs uppercase tracking-[0.22em] disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto sm:flex-1";
  const secondaryButtonClass =
    "inline-flex min-h-[50px] w-full items-center justify-center rounded-full border border-[rgba(214,168,95,0.45)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#f5eee3] transition hover:bg-[rgba(214,168,95,0.12)] disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto sm:flex-1";

  return (
    <>
      <div ref={anchorRef} id="product-purchase-block" className="space-y-6">
        <div className="mystic-card flex flex-wrap items-end justify-between gap-4 p-5">
          <div className="flex flex-col gap-1">
            {showStrike ? (
              <>
                <span className="text-sm text-[#b8ab95] line-through">
                  {formatMoney(baseList)}
                </span>
                <span className="text-3xl font-semibold text-[#d6a85f]">
                  {formatMoney(unitCents)}
                </span>
              </>
            ) : (
              <span className="text-3xl font-semibold text-[#d6a85f]">
                {formatMoney(unitCents)}
              </span>
            )}
            <span className="text-[0.65rem] uppercase tracking-[0.2em] text-[#b8ab95]">
              Prices in USD · Taxes at checkout
            </span>
          </div>
          <span
            className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.22em] ${
              purchasable
                ? "border-[rgba(214,168,95,0.18)] text-[#f5eee3]"
                : "border-[rgba(180,80,80,0.35)] text-[#e8a0a0]"
            }`}
          >
            {stockLabel}
          </span>
        </div>

        {!purchasable ? (
          <div className="mystic-card space-y-4 border border-[rgba(214,168,95,0.15)] bg-[rgba(214,168,95,0.04)] p-5 text-sm leading-relaxed text-[#b8ab95]">
            <p className="font-literata text-base tracking-[0.06em] text-[#f5eee3]">
              Out of stock for now
            </p>
            <p>
              Ask for a restock note or browse a similar formula—we reply when this option
              is back, or help you pivot.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href={restockHref}
                className="mystic-button-primary inline-flex min-h-[48px] items-center justify-center px-6 py-2.5 text-center text-[0.65rem] uppercase tracking-[0.2em]"
              >
                Email for restock
              </Link>
              <Link
                href={browseSimilarHref}
                className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-[rgba(214,168,95,0.45)] px-6 py-2.5 text-center text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#f5eee3] transition hover:bg-[rgba(214,168,95,0.12)]"
              >
                Browse similar
              </Link>
            </div>
          </div>
        ) : null}

        {variants.length > 0 ? (
          <div className="space-y-3">
            <p className="text-[0.72rem] uppercase tracking-[0.24em] text-[#b8ab95]">
              Choose your finish
            </p>
            <div className="flex flex-wrap gap-2">
              {variants.map((v) => {
                const active = selectedVariantId === v.id;
                const oos = (v.stock ?? 0) <= 0;
                return (
                  <button
                    key={v.id}
                    type="button"
                    disabled={oos}
                    onClick={() => setUserPickedVariantId(v.id)}
                    className={`rounded-full border px-4 py-2 text-left text-[0.72rem] uppercase tracking-[0.14em] transition ${
                      active
                        ? "border-[rgba(214,168,95,0.65)] bg-[rgba(214,168,95,0.12)] text-[#f5eee3]"
                        : oos
                          ? "cursor-not-allowed border-[rgba(90,90,90,0.4)] text-[#666]"
                          : "border-[rgba(214,168,95,0.25)] text-[#b8ab95] hover:border-[rgba(214,168,95,0.45)]"
                    }`}
                  >
                    {v.variant_name}
                    {oos ? " · Not available" : ""}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {reviewSummary && reviewSummary.count > 0 ? (
          <a
            href="#reviews"
            className="mystic-card flex flex-wrap items-center gap-3 p-4 text-sm transition hover:border-[rgba(214,168,95,0.35)]"
          >
            <StarRow rating={reviewSummary.average} />
            <RatingSummaryText
              average={reviewSummary.average}
              count={reviewSummary.count}
            />
            <span className="text-[0.62rem] uppercase tracking-[0.2em] text-[#d6a85f]">
              Read reviews
            </span>
          </a>
        ) : (
          <p className="text-[0.68rem] leading-relaxed text-[#7a7265]">
            Published reviews appear here as soon as shoppers leave them for this product.
          </p>
        )}

        <div className="mystic-card space-y-5 p-5">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-[#b8ab95]">
              Quantity
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={quantity}
              onChange={(e) => {
                const n = Math.max(
                  1,
                  Math.min(10, Math.floor(Number(e.target.value) || 1)),
                );
                setQuantity(n);
              }}
              className="mystic-input w-24 text-sm"
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <AddToCartForm
              action={addToCartAction}
              productId={product.id}
              variantId={variantIdForCart}
              redirectTo="cart"
              buttonLabel="Add to bag"
              showQuantity={false}
              controlledQuantity={quantity}
              disabled={!purchasable}
              formClassName="flex flex-1 flex-col justify-end"
              buttonClassName={primaryButtonClass}
            />
            <AddToCartForm
              action={addToCartAction}
              productId={product.id}
              variantId={variantIdForCart}
              redirectTo="checkout"
              buttonLabel="Buy now"
              showQuantity={false}
              controlledQuantity={quantity}
              disabled={!purchasable}
              formClassName="flex flex-1 flex-col justify-end"
              buttonClassName={secondaryButtonClass}
            />
          </div>
          <p className="text-center text-[0.65rem] uppercase tracking-[0.18em] text-[#7a7265]">
            Secure checkout · Major cards &amp; Apple Pay where available
          </p>
        </div>

        <PurchaseTrustFootnote />
      </div>

      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-[rgba(214,168,95,0.15)] bg-[rgba(6,8,12,0.92)] px-4 py-3 backdrop-blur-md transition-opacity duration-300 lg:hidden ${
          sticky ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!sticky}
      >
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[#b8ab95]">
              {product.name}
            </p>
            <p className="font-literata text-xl text-[#d6a85f]">
              {formatMoney(unitCents)}
            </p>
          </div>
          <AddToCartForm
            action={addToCartAction}
            productId={product.id}
            variantId={variantIdForCart}
            redirectTo=""
            buttonLabel="Bag"
            showQuantity={false}
            controlledQuantity={quantity}
            disabled={!purchasable}
            formClassName="flex"
            buttonClassName="mystic-button-primary inline-flex min-h-[44px] min-w-[100px] items-center justify-center px-5 py-2 text-[0.65rem] uppercase tracking-[0.2em] disabled:opacity-45"
          />
        </div>
      </div>
    </>
  );
}
