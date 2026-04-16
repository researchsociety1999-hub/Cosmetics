import type { Product } from "./types";

/** Fixed shop buckets — replaces a long list of raw catalog categories in the UI. */
export const SHOP_MERCH_GROUPS = [
  { slug: "skincare", label: "Skincare & rituals" },
  { slug: "body-sun", label: "Body & sun" },
  { slug: "hair", label: "Hair care" },
  { slug: "tools", label: "Tools & accessories" },
] as const;

export type ShopMerchGroupSlug = (typeof SHOP_MERCH_GROUPS)[number]["slug"];

const MERCH_SLUG_SET = new Set<string>(SHOP_MERCH_GROUPS.map((g) => g.slug));

export function isShopMerchGroupSlug(value: string): value is ShopMerchGroupSlug {
  return MERCH_SLUG_SET.has(value);
}

export function labelForMerchSlug(slug: ShopMerchGroupSlug): string {
  return SHOP_MERCH_GROUPS.find((g) => g.slug === slug)?.label ?? slug;
}

/**
 * Map a raw `categories` row to a merchandising bucket. Order matters: tools/hair/body
 * before the skincare catch‑all.
 */
function safeLower(s: string | null | undefined): string {
  return (s ?? "").trim().toLowerCase();
}

export function resolveMerchGroupForCategory(cat: {
  slug: string | null | undefined;
  name: string | null | undefined;
}): ShopMerchGroupSlug {
  const slug = safeLower(cat.slug);
  const name = safeLower(cat.name);
  const bundle = `${slug} ${name}`;

  if (
    /\b(accessories|apparel|accessor)\b/i.test(bundle) ||
    /\btools?\s*&\s*accessories\b/i.test(bundle) ||
    /\btools?\b/i.test(name) ||
    slug.includes("accessor") ||
    slug.includes("apparel") ||
    slug.includes("tool")
  ) {
    return "tools";
  }

  if (/\bhair\b/i.test(bundle) || /scalp|shampoo|conditioner/i.test(bundle)) {
    return "hair";
  }

  if (
    /\bsun\s*&\s*body\b/i.test(name) ||
    (/\b(body|bath|hand|foot|shower)\b/i.test(bundle) &&
      !/\bface\b/i.test(bundle) &&
      !/hair/i.test(bundle))
  ) {
    return "body-sun";
  }

  if (/\bspf\b/i.test(bundle) && /\b(body|sport|beach)\b/i.test(bundle)) {
    return "body-sun";
  }

  return "skincare";
}

function inferMerchGroupFromProductCopy(product: Product): ShopMerchGroupSlug {
  const text = [
    product.name,
    product.description,
    product.category_name,
    product.category_slug,
    product.routine_step,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/accessor|apparel|tool|brush|gua|roller|headband|tote|bag|spatula/i.test(text)) {
    return "tools";
  }
  if (/hair|scalp|shampoo|conditioner/i.test(text)) {
    return "hair";
  }
  if (/\b(body|bath|shower|hand cream|foot)\b/i.test(text) && !/\bface\b/i.test(text)) {
    return "body-sun";
  }

  return "skincare";
}

export function resolveMerchGroupForProduct(
  product: Product,
  dbCategories: { id: number; slug: string; name: string }[],
): ShopMerchGroupSlug {
  const productSlugKey = safeLower(product.category_slug ?? undefined);
  const cat =
    (typeof product.category_id === "number"
      ? dbCategories.find((c) => c.id === product.category_id)
      : undefined) ??
    dbCategories.find((c) => safeLower(c.slug) === productSlugKey);

  if (cat) {
    return resolveMerchGroupForCategory(cat);
  }

  return inferMerchGroupFromProductCopy(product);
}

export function virtualMerchCategories(): {
  id: number;
  slug: ShopMerchGroupSlug;
  name: string;
}[] {
  return SHOP_MERCH_GROUPS.map((g, i) => ({
    id: -100 - i,
    slug: g.slug,
    name: g.label,
  }));
}

/** URL `?category=` — accepts a merch slug or a legacy DB category slug. */
export function resolveMerchFilterFromCategoryParam(
  categoryParam: string | undefined,
  dbCategories: { id: number; slug: string; name: string }[],
): { slug: ShopMerchGroupSlug; name: string } | null {
  const raw = categoryParam?.trim().toLowerCase();
  if (!raw || raw === "all") {
    return null;
  }
  if (isShopMerchGroupSlug(raw)) {
    return { slug: raw, name: labelForMerchSlug(raw) };
  }
  const db = dbCategories.find((c) => safeLower(c.slug) === raw);
  if (db) {
    const slug = resolveMerchGroupForCategory(db);
    return { slug, name: labelForMerchSlug(slug) };
  }
  return null;
}
