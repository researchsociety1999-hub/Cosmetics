import type { Product } from "./types";

const ALLOWED_IMAGE_HOSTS = [
  "images.unsplash.com",
  "via.placeholder.com",
  "placehold.co",
];

export function formatMoney(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function getDisplayPrice(product: Product): number {
  return product.sale_price_cents ?? product.price_cents;
}

export function getProductImages(product: Product): string[] {
  const images = [product.image_url, ...(product.extra_images ?? [])].filter(
    (value): value is string => Boolean(value),
  );

  return [...new Set(images)].filter(isSafeImageSrc);
}

export function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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

    return ALLOWED_IMAGE_HOSTS.includes(hostname);
  } catch {
    return false;
  }
}
