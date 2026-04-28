"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { addToCartAction } from "../actions/cart";
import { AddToCartForm } from "./AddToCartForm";
import { formatMoney, getDisplayPrice, getProductPrimaryImageUrl } from "../lib/format";
import { isProductPurchasable } from "../lib/productMerch";
import type { Product } from "../lib/types";
import { acquireOverlayLock, trapTabKey } from "../lib/a11yOverlay";

function collectGalleryUrls(product: Product): string[] {
  const primary = getProductPrimaryImageUrl(product);
  const out: string[] = [];
  if (primary) out.push(primary);
  for (const raw of product.extra_images ?? []) {
    const u = raw?.trim();
    if (!u || out.includes(u)) continue;
    out.push(u);
  }
  return out.slice(0, 6);
}

type QuickViewDialogProps = {
  product: Product;
  open: boolean;
  onClose: () => void;
};

export function QuickViewDialog({ product, open, onClose }: QuickViewDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const urls = collectGalleryUrls(product);
  const [activeIdx, setActiveIdx] = useState(0);
  const overlayRef = useRef<ReturnType<typeof acquireOverlayLock> | null>(null);

  useEffect(() => {
    if (!open) return;
    const id = window.requestAnimationFrame(() => {
      setActiveIdx(0);
    });
    return () => window.cancelAnimationFrame(id);
  }, [open, product.id]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const main = document.getElementById("main-content");
    const footer = document.querySelector("footer");
    const backToTop = document.querySelector<HTMLElement>('button[aria-label="Back to top"]');
    const cookieBanner = document.querySelector<HTMLElement>('[aria-label="Cookie consent"]');

    if (open) {
      overlayRef.current?.release();
      overlayRef.current = acquireOverlayLock({
        inertTargets: [main, footer as HTMLElement | null, backToTop, cookieBanner],
      });
      return () => {
        overlayRef.current?.release();
        overlayRef.current = null;
      };
    }
  }, [open]);

  useEffect(() => {
    if (!open || typeof window === "undefined") return;
    const id = window.requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      panel.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(id);
  }, [open]);

  const trapTab = useCallback((e: KeyboardEvent) => {
    const panel = panelRef.current;
    if (!panel) return;
    trapTabKey(e, panel);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      trapTab(e);
    }
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [open, onClose, trapTab]);

  if (!open || typeof document === "undefined") return null;

  const displayPrice = getDisplayPrice(product);
  const hasSale = product.sale_price_cents != null;
  const slug = product.slug?.trim();
  const productHref = slug ? `/products/${slug}` : "/shop";
  const canBuy = isProductPurchasable(product);
  const heroSrc = urls[activeIdx] ?? urls[0] ?? null;
  const benefits = (product.benefits ?? []).filter(Boolean).slice(0, 5);

  return createPortal(
    <>
      {/* Pointer dismiss; keyboard users close with Escape (handled below). */}
      <div
        className="fixed inset-0 z-[100] bg-black/65"
        aria-hidden
        onClick={onClose}
      />
      <div
        className="pointer-events-none fixed inset-0 z-[101] flex items-end justify-center sm:items-center sm:p-4"
        role="presentation"
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className="pointer-events-auto flex max-h-[min(92dvh,52rem)] w-full max-w-lg flex-col rounded-t-[22px] border border-[rgba(214,168,95,0.18)] bg-[rgba(4,5,10,0.98)] shadow-[0_-24px_80px_rgba(0,0,0,0.55)] outline-none sm:max-h-[85vh] sm:rounded-[22px] sm:shadow-[0_28px_80px_rgba(0,0,0,0.55)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3 border-b border-[rgba(214,168,95,0.1)] px-4 py-3 sm:px-5 sm:py-4">
            <h2
              id={titleId}
              className="min-w-0 flex-1 font-literata text-lg leading-snug tracking-[0.08em] text-[#f5eee3] sm:text-xl"
            >
              {product.name}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 min-w-[44px] shrink-0 items-center justify-center rounded-full border border-white/10 text-[#b8ab95] transition hover:border-[rgba(214,168,95,0.3)] hover:text-[#f5eee3]"
              aria-label="Close quick view"
            >
              ×
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-3 pt-3 sm:px-5 sm:pb-4 sm:pt-4">
            <div className="relative aspect-[4/5] w-full max-w-md overflow-hidden rounded-[16px] border border-white/[0.06] bg-[rgba(0,0,0,0.35)] sm:mx-auto">
              {heroSrc ? (
                <Image
                  src={heroSrc}
                  alt={`${product.name} — product photo`}
                  fill
                  sizes="(max-width:640px) 90vw, 28rem"
                  className="object-cover object-center"
                />
              ) : (
                <div className="flex h-full min-h-[12rem] items-center justify-center text-sm text-[#8f8576]">
                  No image
                </div>
              )}
            </div>

            {urls.length > 1 ? (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1 sm:mx-auto sm:max-w-md">
                {urls.map((src, i) => (
                  <button
                    key={`${src}-${i}`}
                    type="button"
                    onClick={() => setActiveIdx(i)}
                    aria-label={`Photo ${i + 1} of ${urls.length} for ${product.name}`}
                    aria-pressed={i === activeIdx}
                    className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border transition motion-reduce:transition-none ${
                      i === activeIdx
                        ? "border-[rgba(214,168,95,0.55)] ring-1 ring-[rgba(214,168,95,0.25)]"
                        : "border-white/10 hover:border-[rgba(214,168,95,0.28)]"
                    }`}
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : null}

            <div className="mt-4 space-y-1">
              <span className="sr-only">Price</span>
              {hasSale ? (
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-sm text-[#8f8576] line-through">
                    <span className="sr-only">Original price </span>
                    {formatMoney(product.price_cents)}
                  </span>
                  <span className="text-xl font-semibold tabular-nums text-[#d6a85f]">
                    <span className="sr-only">Sale price </span>
                    {formatMoney(displayPrice)}
                  </span>
                </div>
              ) : (
                <span className="text-xl font-semibold tabular-nums text-[#d6a85f]">
                  {formatMoney(displayPrice)}
                </span>
              )}
            </div>

            {product.description ? (
              <p className="mt-3 text-sm leading-relaxed text-[#b8ab95]">{product.description}</p>
            ) : null}

            {benefits.length > 0 ? (
              <div className="mt-4">
                <h3 className="text-[0.62rem] uppercase tracking-[0.22em] text-[#8a8275]">Key benefits</h3>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-[#c9bcaa]">
                  {benefits.map((b, i) => (
                    <li key={`${i}-${b.slice(0, 24)}`}>{b}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <Link
              href={productHref}
              className="mt-5 inline-flex min-h-[44px] items-center text-[0.65rem] uppercase tracking-[0.2em] text-[#d6a85f] underline-offset-4 hover:underline"
              onClick={onClose}
            >
              Full product details
            </Link>
          </div>

          <div className="shrink-0 border-t border-[rgba(214,168,95,0.12)] bg-[linear-gradient(180deg,rgba(4,5,10,0.96),rgba(2,3,6,0.99))] px-4 py-3 sm:px-5 sm:py-4">
            {canBuy ? (
              <AddToCartForm
                action={addToCartAction}
                productId={product.id}
                redirectTo=""
                buttonLabel="Add to bag"
                showQuantity={false}
                formClassName="flex flex-col gap-3"
                buttonClassName="mystic-button-primary flex min-h-[48px] w-full items-center justify-center rounded-full px-6 py-3 text-[0.62rem] uppercase tracking-[0.22em]"
              />
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-center text-sm text-[#b8ab95]">Currently unavailable online.</p>
                <Link
                  href={productHref}
                  onClick={onClose}
                  className="mystic-button-secondary flex min-h-[48px] w-full items-center justify-center rounded-full px-6 py-3 text-[0.62rem] uppercase tracking-[0.22em]"
                >
                  View product &amp; restock options
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
