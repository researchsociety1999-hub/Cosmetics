import { getConfiguredSiteUrl } from "./siteUrl";

function toAbsoluteUrl(url: string): string {
  const trimmed = String(url ?? "").trim();
  if (!trimmed) return getConfiguredSiteUrl();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const base = getConfiguredSiteUrl();
  return `${base}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
}

export type BreadcrumbItem = { name: string; href: string };

export function buildBreadcrumbListJsonLd(items: BreadcrumbItem[]) {
  const origin = getConfiguredSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${origin}${item.href}`,
    })),
  } as const;
}

export type ProductJsonLdInput = {
  name: string;
  description?: string | null;
  slug: string;
  sku?: string | null;
  imageUrls?: string[];
  brandName?: string;
  priceCents?: number | null;
  currency?: string;
  inStock?: boolean;
};

export function buildProductJsonLd(input: ProductJsonLdInput) {
  const priceNumber =
    typeof input.priceCents === "number" ? input.priceCents / 100 : null;
  const url = toAbsoluteUrl(`/products/${input.slug}`);
  const images = (input.imageUrls ?? []).map(toAbsoluteUrl).filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    ...(input.description ? { description: input.description } : {}),
    ...(input.sku ? { sku: input.sku } : {}),
    ...(images.length > 0 ? { image: images } : {}),
    brand: {
      "@type": "Brand",
      name: input.brandName ?? "Mystique",
    },
    ...(priceNumber != null
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: input.currency ?? "USD",
            price: String(priceNumber.toFixed(2)),
            url,
            availability: input.inStock
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          },
        }
      : {}),
  } as const;
}

