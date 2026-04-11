import type { Product, ProductVariant } from "./types";

/**
 * Hostnames allowed in `image_url` / gallery URLs (must align with `next.config.js` `images.remotePatterns`).
 * Add comma-separated hostnames in `NEXT_PUBLIC_IMAGE_REMOTE_HOSTS` for a custom CDN (exact hostname, no protocol).
 */
const ALLOWED_IMAGE_HOSTS = [
  "images.unsplash.com",
  "via.placeholder.com",
  "placehold.co",
];

function extraAllowedImageHosts(): string[] {
  const raw = process.env.NEXT_PUBLIC_IMAGE_REMOTE_HOSTS ?? "";
  return raw
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
}

export function formatMoney(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function getDisplayPrice(product: Product): number {
  return product.sale_price_cents ?? product.price_cents;
}

/** Variant-specific price when set; otherwise product sale/base price. */
export function getUnitPriceCents(
  product: Product,
  variant: ProductVariant | null | undefined,
): number {
  if (variant && typeof variant.price_cents === "number") {
    return variant.price_cents;
  }
  return getDisplayPrice(product);
}

export function getProductImages(product: Product): string[] {
  const images = [product.image_url, ...(product.extra_images ?? [])].filter(
    (value): value is string => Boolean(value),
  );

  return [...new Set(images)].filter(isSafeImageSrc);
}

/** Primary catalog image URL, or `null` when missing / blocked — use branded placeholder in UI. */
export function getProductPrimaryImageUrl(
  product: Pick<Product, "image_url">,
): string | null {
  return isSafeImageSrc(product.image_url) ? product.image_url : null;
}

export function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** Single-line excerpt for meta tags (no HTML expected). */
export function truncateMetaDescription(
  text: string | null | undefined,
  max = 155,
): string | null {
  const t = (text ?? "").replace(/\s+/g, " ").trim();
  if (!t) {
    return null;
  }
  return t.length > max ? `${t.slice(0, max - 1).trim()}…` : t;
}

export function isSafeImageSrc(src: string | null | undefined): src is string {
  if (!src) {
    return false;
  }

  if (src.startsWith("/")) {
    return true;
  }

  try {
    const url = new URL(src);
    const hostname = url.hostname.toLowerCase();

    if (
      hostname.endsWith(".supabase.co") ||
      hostname.endsWith(".supabase.in")
    ) {
      return true;
    }

    if (ALLOWED_IMAGE_HOSTS.includes(hostname)) {
      return true;
    }

    return extraAllowedImageHosts().includes(hostname);
  } catch {
    return false;
  }
}
