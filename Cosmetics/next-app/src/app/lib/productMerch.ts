import type { Product } from "./types";

const RITUAL_TEXTURE_LABEL: Record<string, string> = {
  Cleanse: "Gel-to-cream cleanse",
  Tone: "Mist or essence weight",
  Treat: "Serum concentrate",
  Moisturize: "Cream or emulsion",
  Protect: "Featherlight SPF finish",
};

/** Optional DB-backed line, e.g. `30 ml · glass dropper`. */
export function getVolumeSizeLabel(
  product: Pick<Product, "volume_size_label">,
  variantName?: string | null,
): string | null {
  const explicit = product.volume_size_label?.trim();
  if (explicit) {
    return explicit;
  }
  const vn = variantName?.trim();
  if (!vn) {
    return null;
  }
  if (/\d\s*(ml|mL|g|oz|fl\.?\s*oz)/i.test(vn)) {
    return vn;
  }
  return null;
}

export function getPrimaryBenefitLine(product: Pick<Product, "benefits">): string | null {
  const first = product.benefits?.find((b) => typeof b === "string" && b.trim());
  return first?.trim() ?? null;
}

export function getSkinTypesLine(
  product: Pick<Product, "skin_types">,
  maxItems = 3,
): string | null {
  const list = (product.skin_types ?? []).filter(
    (s): s is string => typeof s === "string" && s.trim().length > 0,
  );
  if (!list.length) {
    return null;
  }
  return list.slice(0, maxItems).join(" · ");
}

export function getTextureFinishCue(
  product: Pick<Product, "routine_step">,
): string | null {
  const step = product.routine_step?.trim();
  if (!step) {
    return null;
  }
  return RITUAL_TEXTURE_LABEL[step] ?? `${step} step`;
}

/**
 * Inventory source of truth (storewide):
 * - `products.in_stock` and `products.stock` are canonical for whether a SKU is purchasable.
 * - Variant-level stock (when variants exist) refines availability on the PDP, but does not
 *   override product-level "out of stock" states.
 *
 * If you later move to variant-only inventory, update this function and the PDP purchase logic
 * in `components/ProductPurchaseClient.tsx`, plus any catalog filtering using `isProductPurchasable`.
 */
export function isProductPurchasable(product: Product): boolean {
  if (product.in_stock === false) {
    return false;
  }
  if (typeof product.stock === "number" && product.stock <= 0) {
    return false;
  }
  const variantStocks = product.variant_stocks;
  if (Array.isArray(variantStocks) && variantStocks.length > 0) {
    return variantStocks.some((v) => (v?.stock ?? 0) > 0);
  }
  return true;
}

/** TEMPORARY: diagnostics only — mirrors `isProductPurchasable` and lists exclusion reasons. */
export interface ProductPurchasabilityExplanation {
  id: number;
  slug: string;
  name: string;
  purchasable: boolean;
  reasons: string[];
  fields: {
    in_stock: boolean | null;
    stock: number | null;
    variant_stocks: Array<{ stock: number | null }> | null | undefined;
    /** Not used by `isProductPurchasable`; included for log correlation. */
    coming_soon: boolean | null;
    /** Not used by `isProductPurchasable`; included for log correlation. */
    price_cents: number;
    sale_price_cents: number | null;
  };
}

export function explainProductPurchasability(
  product: Product,
): ProductPurchasabilityExplanation {
  const reasons: string[] = [];

  if (product.in_stock === false) {
    reasons.push("in_stock === false");
  }

  if (typeof product.stock === "number" && product.stock <= 0) {
    reasons.push(`typeof stock === 'number' && stock <= 0 (stock=${product.stock})`);
  }

  const variantStocks = product.variant_stocks;
  if (Array.isArray(variantStocks) && variantStocks.length > 0) {
    const anyPositive = variantStocks.some((v) => (v?.stock ?? 0) > 0);
    if (!anyPositive) {
      reasons.push(
        `variant_stocks.length=${variantStocks.length} but no variant has stock > 0 (snapshot: ${JSON.stringify(variantStocks.map((v) => v?.stock ?? null))})`,
      );
    }
  }

  const purchasable = isProductPurchasable(product);

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    purchasable,
    reasons: purchasable ? [] : reasons,
    fields: {
      in_stock: product.in_stock ?? null,
      stock: product.stock ?? null,
      variant_stocks: product.variant_stocks,
      coming_soon: product.coming_soon ?? null,
      price_cents: product.price_cents,
      sale_price_cents: product.sale_price_cents ?? null,
    },
  };
}

export function getRestockContactHref(product: Pick<Product, "slug" | "name">): string {
  const ref = product.slug?.trim() || "";
  const q = new URLSearchParams();
  q.set("topic", "restock");
  if (ref) {
    q.set("ref", ref);
  }
  return `/contact?${q.toString()}`;
}
