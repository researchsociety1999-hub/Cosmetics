"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

type ThemedImageFrameProps = {
  /** Remote or absolute `/public` path. `null` shows the branded placeholder only. */
  src: string | null;
  alt: string;
  /** Product name (or short line) on the in-app placeholder when `src` is missing or fails to load. */
  displayTitle?: string;
  sizes: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  frameClassName?: string;
  imageClassName?: string;
  variant?: "brand" | "product" | "thumb";
};

function BrandedImagePlaceholder({
  title,
  compact,
  label,
}: {
  title?: string;
  compact?: boolean;
  label: string;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      data-image-slot="product-placeholder"
      className={`pointer-events-none absolute inset-0 z-[6] flex flex-col items-center justify-center bg-[linear-gradient(165deg,rgba(26,28,36,0.98),rgba(8,9,12,1))] px-3 text-center ${
        compact ? "py-2" : "py-6"
      }`}
    >
      <span className="text-[0.58rem] uppercase tracking-[0.38em] text-[#d6a85f]/90">
        Mystique
      </span>
      {title ? (
        <span
          className={`mt-2 line-clamp-3 font-literata tracking-[0.12em] text-[#f5eee3] ${
            compact ? "text-xs" : "text-base md:text-lg"
          }`}
        >
          {title}
        </span>
      ) : (
        <span className="mt-2 font-literata text-2xl tracking-[0.24em] text-[#d6a85f]/75">M</span>
      )}
      <span
        aria-hidden
        className="mt-4 h-px w-12 bg-[linear-gradient(90deg,transparent,rgba(214,168,95,0.55),transparent)]"
      />
    </div>
  );
}

export function ThemedImageFrame({
  src,
  alt,
  displayTitle,
  sizes,
  priority = false,
  fill = false,
  width,
  height,
  className = "",
  frameClassName = "",
  imageClassName = "",
  variant = "product",
}: ThemedImageFrameProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setFailed(false);
    }, 0);
    return () => window.clearTimeout(t);
  }, [src]);

  const handleError = useCallback(() => {
    setFailed(true);
  }, []);

  const showPlaceholder = !src || failed;
  const showImage = Boolean(src) && !failed;
  const resolvedSrc = src ?? "";
  const quality = variant === "thumb" ? 78 : variant === "product" ? 88 : 82;
  const compactPlaceholder = variant === "thumb";

  return (
    <div
      data-image-slot={src ? undefined : `product:${(displayTitle ?? "unknown").toLowerCase().replace(/\s+/g, "-")}`}
      className={`mystique-image-frame mystique-image-frame--${variant} relative ${className}`}
    >
      <span aria-hidden="true" className="mystique-image-frame__aura" />
      <span aria-hidden="true" className="mystique-image-frame__glow" />
      <span aria-hidden="true" className="mystique-image-frame__particle mystique-image-frame__particle--1" />
      <span aria-hidden="true" className="mystique-image-frame__particle mystique-image-frame__particle--2" />
      <span aria-hidden="true" className="mystique-image-frame__particle mystique-image-frame__particle--3" />
      <span aria-hidden="true" className="mystique-image-frame__particle mystique-image-frame__particle--4" />
      <span
        className={`mystique-image-frame__surface relative block h-full min-h-0 w-full ${frameClassName}`}
      >
        <span aria-hidden="true" className="mystique-image-frame__shade" />
        <span aria-hidden="true" className="mystique-image-frame__vignette" />
        {showImage ? (
          <Image
            src={resolvedSrc}
            alt={alt}
            priority={priority}
            fill={fill}
            width={fill ? undefined : width}
            height={fill ? undefined : height}
            sizes={sizes}
            quality={quality}
            loading={priority ? undefined : "lazy"}
            onError={handleError}
            className={`mystique-image-frame__image ${imageClassName}`}
          />
        ) : null}
        {showPlaceholder ? (
          <BrandedImagePlaceholder
            title={displayTitle}
            compact={compactPlaceholder}
            label={alt}
          />
        ) : null}
      </span>
    </div>
  );
}
