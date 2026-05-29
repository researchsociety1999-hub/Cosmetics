"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useId, useState } from "react";
import { ThemedImageFrame } from "./ThemedImageFrame";

type ProductGalleryProps = {
  productName: string;
  heroSrc: string | null;
  thumbs: string[];
};

/**
 * PDP image gallery + click-to-zoom lightbox.
 *
 * The hero image is wrapped in a button that opens a fullscreen lightbox.
 * The shared `layoutId` lets Framer Motion smoothly animate the image
 * from its in-grid position to the fullscreen overlay and back.
 *
 * Closes on:
 *   - Escape key
 *   - Click on the backdrop (anywhere outside the image)
 *   - Click on the close button
 */
export function ProductGallery({
  productName,
  heroSrc,
  thumbs,
}: ProductGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const reactId = useId();
  // Unique per-instance so multiple galleries on a page wouldn't cross-animate.
  const layoutId = `pdp-hero-${reactId}`;

  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    // Prevent background scroll while the lightbox is open.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <div className="space-y-4">
      <motion.button
        type="button"
        layoutId={heroSrc ? layoutId : undefined}
        onClick={() => {
          if (heroSrc) setIsOpen(true);
        }}
        disabled={!heroSrc}
        aria-label={
          heroSrc
            ? `Open enlarged photo of ${productName}`
            : `${productName} photo unavailable`
        }
        className="group block w-full rounded-[28px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(214,168,95,0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04050a] disabled:cursor-default"
        style={{ cursor: heroSrc ? "zoom-in" : "default" }}
      >
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
      </motion.button>

      {thumbs.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {thumbs.map((image, index) => (
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

      <AnimatePresence>
        {isOpen && heroSrc ? (
          <motion.div
            key="pdp-lightbox-backdrop"
            className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(2,3,8,0.92)] p-4 backdrop-blur-md md:p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label={`${productName} enlarged photo`}
          >
            <motion.div
              layoutId={layoutId}
              className="relative w-full max-w-3xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[28px] shadow-[0_30px_80px_rgba(0,0,0,0.65)]">
                <Image
                  src={heroSrc}
                  alt={`${productName} hero image enlarged`}
                  fill
                  sizes="(max-width: 1024px) 90vw, 768px"
                  className="object-cover"
                  priority
                  quality={92}
                />
              </div>
            </motion.div>
            <button
              type="button"
              onClick={close}
              aria-label="Close enlarged image"
              className="absolute right-4 top-4 z-[201] inline-flex h-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-sm transition hover:border-white/40 hover:bg-black/60 md:right-6 md:top-6"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 fill-none stroke-current"
                aria-hidden="true"
              >
                <path
                  d="M6 6l12 12M18 6L6 18"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
