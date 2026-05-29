/**
 * Admin-side derivation of product status + inventory state.
 *
 * The products table doesn't carry an explicit `status` enum — instead it uses
 * three boolean-ish columns (`is_published`, `coming_soon`, `in_stock`). This
 * module collapses those into the three buckets the admin UI shows:
 *
 *   - active        → live on the storefront (`is_published === true` and not coming_soon)
 *   - coming_soon   → marketed but not buyable yet (`coming_soon === true`)
 *   - draft         → everything else (`is_published` null/false)
 *
 * Inventory state is derived from variant stock when joined, falling back to
 * the legacy `products.stock` column so partial-schema rows still render.
 */
import type { Product } from "../../lib/types";

export type ProductStatus = "active" | "draft" | "coming_soon";

export const PRODUCT_STATUS_VALUES: ReadonlyArray<ProductStatus> = [
  "active",
  "draft",
  "coming_soon",
];

export interface ProductStatusTone {
  bg: string;
  text: string;
  label: string;
}

const STATUS_TONES: Record<ProductStatus, ProductStatusTone> = {
  active: {
    bg: "bg-emerald-500/15 ring-1 ring-inset ring-emerald-500/30",
    text: "text-emerald-300",
    label: "Active",
  },
  draft: {
    bg: "bg-zinc-500/15 ring-1 ring-inset ring-zinc-500/30",
    text: "text-zinc-300",
    label: "Draft",
  },
  coming_soon: {
    bg: "bg-amber-500/15 ring-1 ring-inset ring-amber-500/30",
    text: "text-amber-200",
    label: "Coming soon",
  },
};

const FALLBACK_TONE: ProductStatusTone = {
  bg: "bg-zinc-500/15 ring-1 ring-inset ring-zinc-500/30",
  text: "text-zinc-300",
  label: "Unknown",
};

export function getProductStatus(product: Pick<Product, "is_published" | "coming_soon">): ProductStatus {
  if (product.coming_soon === true) return "coming_soon";
  if (product.is_published === true) return "active";
  return "draft";
}

export function getProductStatusTone(status: ProductStatus | null | undefined): ProductStatusTone {
  if (status && status in STATUS_TONES) {
    return STATUS_TONES[status];
  }
  return FALLBACK_TONE;
}

/**
 * Default low-stock threshold. The schema has no per-product threshold field,
 * so we apply a single house rule and keep it tweakable from one place.
 */
export const LOW_STOCK_THRESHOLD = 10;

export interface InventorySummary {
  /** Sum of variant stock when variants exist; otherwise the product's own `stock` column. */
  totalStock: number;
  /** How many variants are stocked at all (only set when variant data is joined). */
  variantCount: number;
  /** True when there is zero sellable stock anywhere. */
  isOutOfStock: boolean;
  /** True when total stock is non-zero but at or below the threshold. */
  isLowStock: boolean;
  /** True when we couldn't tell either way (no stock field, no variants). Render as "—". */
  isUnknown: boolean;
}

type ProductWithVariants = Pick<Product, "stock" | "in_stock" | "variant_stocks">;

export function summarizeInventory(product: ProductWithVariants): InventorySummary {
  const variants = product.variant_stocks;
  const hasVariants = Array.isArray(variants) && variants.length > 0;

  if (hasVariants) {
    const totalStock = variants!.reduce(
      (sum, v) => sum + (typeof v.stock === "number" ? v.stock : 0),
      0,
    );
    return {
      totalStock,
      variantCount: variants!.length,
      isOutOfStock: totalStock === 0,
      isLowStock: totalStock > 0 && totalStock <= LOW_STOCK_THRESHOLD,
      isUnknown: false,
    };
  }

  // No variants joined: fall back to product.stock, then product.in_stock as a
  // last-resort flag. If neither is set, mark unknown so the UI can show "—".
  if (typeof product.stock === "number") {
    const totalStock = product.stock;
    return {
      totalStock,
      variantCount: 0,
      isOutOfStock: totalStock === 0,
      isLowStock: totalStock > 0 && totalStock <= LOW_STOCK_THRESHOLD,
      isUnknown: false,
    };
  }

  if (product.in_stock === false) {
    return {
      totalStock: 0,
      variantCount: 0,
      isOutOfStock: true,
      isLowStock: false,
      isUnknown: false,
    };
  }

  return {
    totalStock: 0,
    variantCount: 0,
    isOutOfStock: false,
    isLowStock: false,
    isUnknown: true,
  };
}

/** Inclusive price range across variant prices, falling back to product price_cents. */
export function getPriceRangeCents(
  product: Pick<Product, "price_cents" | "sale_price_cents">,
  variants: ReadonlyArray<{ price_cents: number | null }> | null | undefined,
): { min: number; max: number } {
  const variantPrices = (variants ?? [])
    .map((v) => v.price_cents)
    .filter((cents): cents is number => typeof cents === "number" && cents > 0);

  const productPrice = product.sale_price_cents ?? product.price_cents;

  if (variantPrices.length === 0) {
    return { min: productPrice, max: productPrice };
  }

  return {
    min: Math.min(productPrice, ...variantPrices),
    max: Math.max(productPrice, ...variantPrices),
  };
}
