import {
  mergeMystiqueCanonicalIngredients,
  mockCategories,
  mockIngredients,
  MYSTIQUE_CANONICAL_INGREDIENTS,
  mockJournalEntries,
  mockProductVariants,
  mockProducts,
  mockPromoCampaign,
  mockReviews,
} from "./data";
import { hasSupabaseEnv, supabase } from "./supabaseClient";
import type {
  AppliedPromo,
  Address,
  CartItem,
  CartSummary,
  Category,
  Ingredient,
  JournalEntry,
  LoyaltyProgram,
  Order,
  OrderItem,
  OrderTotals,
  OrderWithItems,
  Payment,
  PressMention,
  Product,
  ProductVariant,
  Profile,
  PromoCampaign,
  Review,
  WishlistItem,
  ShippingDetails,
} from "./types";

export type ProductSort = "price_asc" | "price_desc" | "newest" | "featured";

/**
 * Default: catalog comes **only from Supabase** (empty if env missing).
 * Set `ALLOW_MOCK_CATALOG=1` for local Playwright E2E without a database.
 */
function allowMockCatalog(): boolean {
  return (
    process.env.ALLOW_MOCK_CATALOG === "1" ||
    process.env.ALLOW_MOCK_PRODUCTS === "1"
  );
}

interface GetProductsOptions {
  categoryId?: number;
  search?: string;
  /** Canonical ingredient `id` from MYSTIQUE_CANONICAL_INGREDIENTS — strict match on key_ingredients / copy. */
  ingredientId?: string;
  sortBy?: ProductSort;
  limit?: number;
  page?: number;
}

/** Extra tokens for matching real INCI / merchandising lines to canonical spotlight ids. */
const INGREDIENT_ID_MATCH_ALIASES: Record<string, readonly string[]> = {
  "hyaluronic-acid": ["hyaluronic", "hyaluronan", "sodium hyaluronate"],
  "centella-asiatica": ["centella", "cica", "asiatica", "gotu kola"],
  niacinamide: ["niacinamide", "vitamin b3", "b3", "nicotinamide"],
  ceramides: ["ceramide", "ceramides", "ceramide np", "ceramide ap"],
  squalane: ["squalane", "squalene"],
};

function productMentionsIngredientCanonical(
  product: Product,
  def: (typeof MYSTIQUE_CANONICAL_INGREDIENTS)[number],
): boolean {
  const aliases = new Set<string>(
    [def.name, ...(INGREDIENT_ID_MATCH_ALIASES[def.id] ?? [])].map((s) =>
      s.toLowerCase(),
    ),
  );
  const keys = (product.key_ingredients ?? []).map((k) => k.toLowerCase());

  if (keys.length > 0) {
    return keys.some((k) => [...aliases].some((al) => k.includes(al)));
  }

  const blob = `${product.name ?? ""} ${product.description ?? ""}`.toLowerCase();
  return [...aliases].some((al) => blob.includes(al));
}

function filterProductsByIngredientId(
  products: Product[],
  ingredientId: string,
): Product[] {
  const def = MYSTIQUE_CANONICAL_INGREDIENTS.find(
    (row) => row.id === ingredientId.trim(),
  );
  if (!def) {
    return products;
  }
  return products.filter((product) =>
    productMentionsIngredientCanonical(product, def),
  );
}

export interface CreatePendingOrderInput {
  orderNumber: string;
  userId?: string | null;
  shippingDetails: ShippingDetails;
  cart: CartSummary;
  currency?: string;
  totals: OrderTotals;
  appliedPromo?: AppliedPromo | null;
}

function requireSupabase() {
  if (!hasSupabaseEnv || !supabase) {
    throw new Error("Supabase is not configured.");
  }

  return supabase;
}

function normalizeStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const values = value.filter((entry): entry is string => typeof entry === "string");
  return values.length ? values : null;
}

function normalizeProduct(product: Product): Product {
  const rawProduct = product as Product & {
    category?: { slug?: string | null; name?: string | null } | null;
    categories?: { slug?: string | null; name?: string | null } | null;
    category_slug?: string | null;
    category_name?: string | null;
    category_label?: string | null;
  };
  const categoryRecord = rawProduct.category ?? rawProduct.categories ?? null;
  const categorySlug =
    rawProduct.category_slug ??
    categoryRecord?.slug ??
    null;
  const categoryName =
    rawProduct.category_name ??
    rawProduct.category_label ??
    categoryRecord?.name ??
    null;

  return {
    ...product,
    extra_images: normalizeStringArray(product.extra_images),
    key_ingredients: normalizeStringArray(product.key_ingredients),
    benefits: normalizeStringArray(product.benefits),
    skin_types: normalizeStringArray(product.skin_types),
    routine_step: product.routine_step ?? null,
    category_slug: categorySlug,
    category_name: categoryName,
  };
}

function sortProducts(products: Product[], sortBy: ProductSort = "newest"): Product[] {
  const sorted = [...products];

  if (sortBy === "price_asc") {
    sorted.sort((a, b) => a.price_cents - b.price_cents);
  } else if (sortBy === "price_desc") {
    sorted.sort((a, b) => b.price_cents - a.price_cents);
  } else if (sortBy === "featured") {
    sorted.sort((a, b) => (b.sale_price_cents ? 1 : 0) - (a.sale_price_cents ? 1 : 0));
  } else {
    sorted.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }

  return sorted;
}

function getMockProducts(): Product[] {
  return mockProducts.map(normalizeProduct);
}

function getMockCategories(): Category[] {
  return mockCategories;
}

function filterMockProducts(
  products: Product[],
  options: GetProductsOptions = {},
): Product[] {
  const { categoryId, search, ingredientId } = options;

  let filtered = [...products];

  if (typeof categoryId === "number") {
    filtered = filtered.filter((product) => product.category_id === categoryId);
  }

  const ing = ingredientId?.trim();
  if (ing) {
    filtered = filterProductsByIngredientId(filtered, ing);
  } else if (search?.trim()) {
    filtered = filterProductsBySearch(filtered, search.trim(), filtered.length || 24);
  }

  return filtered;
}

function paginateProducts(
  products: Product[],
  page = 1,
  limit?: number,
): Product[] {
  if (!limit) {
    return products;
  }

  const start = Math.max(page - 1, 0) * limit;
  return products.slice(start, start + limit);
}

function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Homepage “First visit” chips — normalized `?search=` value → synonym tokens for catalog match. */
function skinConcernSynonyms(normalizedQuery: string): readonly string[] | null {
  const map: Record<string, readonly string[]> = {
    dryness: [
      "hydrat",
      "moistur",
      "dry",
      "ceramide",
      "hydration",
      "dewy",
      "plump",
      "moisture",
      "barrier",
    ],
    dullness: [
      "dull",
      "bright",
      "texture",
      "radiance",
      "luminous",
      "polish",
      "refine",
      "glow reset",
    ],
    sensitivity: [
      "sensitive",
      "centella",
      "soothe",
      "comfort",
      "gentle",
      "cushion",
      "calm",
    ],
    "glow even tone": [
      "niacinamide",
      "glow",
      "even",
      "radiance",
      "luminous",
      "bright",
      "tone",
      "lumin",
      "bloom",
    ],
  };
  return map[normalizedQuery] ?? null;
}

/** Human label when `?search=` is a homepage skin-concern chip (see `skinConcernSynonyms`). */
export function getSkinConcernShopLabel(rawSearch: string): string | null {
  const key = normalizeSearchText(rawSearch);
  if (!key) {
    return null;
  }
  const labels: Record<string, string> = {
    dryness: "Dryness",
    dullness: "Dullness",
    sensitivity: "Sensitivity",
    "glow even tone": "Glow & Even tone",
  };
  return labels[key] ?? null;
}

function buildSupabaseProductSearchOr(synonyms: readonly string[]): string {
  return synonyms
    .flatMap((s) => {
      const t = `%${s.replace(/%/g, "")}%`;
      return [`name.ilike.${t}`, `description.ilike.${t}`, `slug.ilike.${t}`];
    })
    .join(",");
}

function expandSearchTerms(query: string): string[] {
  const normalizedQuery = normalizeSearchText(query);
  const terms = new Set(
    normalizedQuery
      .split(" ")
      .map((term) => term.trim())
      .filter(Boolean),
  );

  const concernSyns = skinConcernSynonyms(normalizedQuery);
  if (concernSyns) {
    for (const s of concernSyns) {
      const t = normalizeSearchText(s);
      if (t) {
        for (const part of t.split(" ")) {
          if (part) terms.add(part);
        }
      }
    }
  }

  if (normalizedQuery.includes("bloom skin")) {
    terms.add("glow");
    terms.add("radiance");
    terms.add("luminous");
    terms.add("hydration");
    terms.add("dewy");
  }

  if (terms.has("glow")) {
    terms.add("radiance");
    terms.add("luminous");
    terms.add("bright");
  }

  if (terms.has("hydrate") || terms.has("hydration")) {
    terms.add("plump");
    terms.add("dewy");
    terms.add("hyaluronic");
  }

  return [normalizedQuery, ...terms].filter(Boolean);
}

function getProductSearchText(product: Product): string {
  return normalizeSearchText(
    [
      product.name,
      product.slug,
      product.description,
      product.routine_step,
      product.category_slug,
      product.category_name,
      ...(product.key_ingredients ?? []),
      ...(product.benefits ?? []),
      ...(product.skin_types ?? []),
    ]
      .filter((value): value is string => Boolean(value))
      .join(" "),
  );
}

function getProductSearchScore(product: Product, query: string): number {
  const haystack = getProductSearchText(product);
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery || !haystack) {
    return -1;
  }

  let score = 0;
  const searchTerms = expandSearchTerms(query);

  if (haystack.includes(normalizedQuery)) {
    score += 12;
  }

  if (normalizeSearchText(product.name).includes(normalizedQuery)) {
    score += 18;
  }

  if (normalizeSearchText(product.slug).includes(normalizedQuery)) {
    score += 14;
  }

  if (normalizeSearchText(product.description ?? "").includes(normalizedQuery)) {
    score += 10;
  }

  for (const term of searchTerms) {
    if (!term || term === normalizedQuery) {
      continue;
    }

    if (haystack.includes(term)) {
      score += 3;
    }
  }

  return score > 0 ? score : -1;
}

function filterProductsBySearch(
  products: Product[],
  query: string,
  limit = 24,
): Product[] {
  return products
    .map((product) => ({
      product,
      score: getProductSearchScore(product, query),
    }))
    .filter((entry) => entry.score >= 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return (
        new Date(b.product.created_at).getTime() -
        new Date(a.product.created_at).getTime()
      );
    })
    .slice(0, limit)
    .map((entry) => entry.product);
}

export async function getProducts(
  options: GetProductsOptions = {},
): Promise<Product[]> {
  if (!hasSupabaseEnv || !supabase) {
    if (!allowMockCatalog()) {
      return [];
    }
    const filteredProducts = filterMockProducts(getMockProducts(), options);
    return paginateProducts(
      sortProducts(filteredProducts, options.sortBy),
      options.page,
      options.limit,
    );
  }

  const { categoryId, search, ingredientId, sortBy = "newest", limit, page = 1 } =
    options;

  try {
    let query = supabase.from("products").select("*").eq("is_published", true);

    if (categoryId != null) {
      query = query.eq("category_id", categoryId);
    }

    const ing = ingredientId?.trim();
    if (ing) {
      // Ingredient mode: avoid loose `search` OR (synonym / substring) noise — filter in memory.
    } else if (search && search.trim()) {
      const normalizedForConcern = normalizeSearchText(search.trim());
      const concernSyns = skinConcernSynonyms(normalizedForConcern);
      if (concernSyns && concernSyns.length > 0) {
        query = query.or(buildSupabaseProductSearchOr(concernSyns));
      } else {
        const term = `%${search.trim()}%`;
        query = query.or(`name.ilike.${term},description.ilike.${term},slug.ilike.${term}`);
      }
    }

    if (sortBy === "price_asc") {
      query = query.order("price_cents", { ascending: true });
    } else if (sortBy === "price_desc") {
      query = query.order("price_cents", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    if (limit) {
      const from = Math.max(page - 1, 0) * limit;
      query = query.range(from, from + limit - 1);
    }

    const { data, error } = await query;
    if (error) {
      console.error("[Supabase] getProducts failed:", error.message, error);
      return paginateProducts(sortProducts([], sortBy), page, limit);
    }

    let normalizedProducts = ((data ?? []) as Product[]).map(normalizeProduct);
    if (ing) {
      normalizedProducts = filterProductsByIngredientId(normalizedProducts, ing);
    }
    return paginateProducts(sortProducts(normalizedProducts, sortBy), page, limit);
  } catch (e) {
    console.error("[Supabase] getProducts exception:", e);
    return paginateProducts(sortProducts([], sortBy), page, limit);
  }
}

export async function getProductsByIds(ids: number[]): Promise<Product[]> {
  if (!ids.length) {
    return [];
  }

  const requestedIds = new Set(ids);

  if (!hasSupabaseEnv || !supabase) {
    if (!allowMockCatalog()) {
      return [];
    }
    return getMockProducts().filter((product) => requestedIds.has(product.id));
  }

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .in("id", ids)
      .eq("is_published", true);

    if (error) {
      console.error("[Supabase] getProductsByIds failed:", error.message, error);
      return [];
    }

    const normalizedProducts = ((data ?? []) as Product[]).map(normalizeProduct);
    return normalizedProducts.filter((product) => requestedIds.has(product.id));
  } catch (e) {
    console.error("[Supabase] getProductsByIds exception:", e);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!hasSupabaseEnv || !supabase) {
    if (!allowMockCatalog()) {
      return null;
    }
    return getMockProducts().find((product) => product.slug === slug) ?? null;
  }

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_published", true)
      .eq("slug", slug)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("[Supabase] getProductBySlug failed:", error.message, error);
      return null;
    }

    return data ? normalizeProduct(data as Product) : null;
  } catch (e) {
    console.error("[Supabase] getProductBySlug exception:", e);
    return null;
  }
}

const RITUAL_STEPS = ["Cleanse", "Tone", "Treat", "Moisturize", "Protect"] as const;

export async function getRelatedProducts(
  product: Product,
  limit = 6,
): Promise<Product[]> {
  const pool = await getProducts({ sortBy: "newest", limit: 64 });
  const others = pool.filter((item) => item.id !== product.id);
  if (!others.length) {
    return [];
  }

  const stepIdx = RITUAL_STEPS.indexOf(
    (product.routine_step ?? "") as (typeof RITUAL_STEPS)[number],
  );

  const sameCat = (p: Product) =>
    typeof p.category_id === "number" &&
    typeof product.category_id === "number" &&
    p.category_id === product.category_id;

  const stepIndex = (p: Product) =>
    RITUAL_STEPS.indexOf((p.routine_step ?? "") as (typeof RITUAL_STEPS)[number]);

  const score = (p: Product) => {
    let s = 0;
    if (sameCat(p)) {
      s += 6;
    }
    if (p.routine_step && p.routine_step === product.routine_step) {
      s += 4;
    }
    const pi = stepIndex(p);
    if (stepIdx >= 0 && pi >= 0) {
      const dist = Math.abs(pi - stepIdx);
      if (dist === 1) {
        s += 3;
      } else if (dist === 2) {
        s += 1;
      }
    }
    if (p.sale_price_cents != null) {
      s += 0.5;
    }
    return s;
  };

  return [...others]
    .sort((a, b) => {
      const ds = score(b) - score(a);
      if (ds !== 0) {
        return ds;
      }
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    })
    .slice(0, limit);
}

/**
 * Suggested companions for "Complete the ritual" — other ritual steps first (same category when possible).
 */
export async function getRoutineCompanionProducts(
  product: Product,
  limit = 3,
): Promise<Product[]> {
  const catalog = await getProducts({ sortBy: "newest", limit: 48 });
  const others = catalog.filter((p) => p.id !== product.id);
  const sameCategory = (id: number | null) =>
    typeof id === "number" && id === product.category_id;

  const stepOrder = (step: string | null | undefined) => {
    const idx = RITUAL_STEPS.indexOf(
      (step ?? "") as (typeof RITUAL_STEPS)[number],
    );
    return idx >= 0 ? idx : 99;
  };

  const pickForStep = (
    step: (typeof RITUAL_STEPS)[number],
    pool: Product[],
  ): Product | null => {
    const matchCat = pool.find(
      (p) => p.routine_step === step && sameCategory(p.category_id),
    );
    if (matchCat) {
      return matchCat;
    }
    return pool.find((p) => p.routine_step === step) ?? null;
  };

  const picked: Product[] = [];
  const used = new Set<number>([product.id]);

  for (const step of RITUAL_STEPS) {
    if (step === product.routine_step) {
      continue;
    }
    if (picked.length >= limit) {
      break;
    }
    const pool = others.filter((p) => !used.has(p.id));
    const next = pickForStep(step, pool);
    if (next) {
      picked.push(next);
      used.add(next.id);
    }
  }

  if (picked.length < limit) {
    const rest = others
      .filter((p) => !used.has(p.id))
      .sort(
        (a, b) =>
          sameCategory(a.category_id) === sameCategory(b.category_id)
            ? stepOrder(a.routine_step) - stepOrder(b.routine_step)
            : sameCategory(a.category_id)
              ? -1
              : sameCategory(b.category_id)
                ? 1
                : 0,
      );
    for (const p of rest) {
      if (picked.length >= limit) {
        break;
      }
      picked.push(p);
    }
  }

  return picked.slice(0, limit);
}

export async function getCategories(): Promise<Category[]> {
  if (!hasSupabaseEnv || !supabase) {
    if (!allowMockCatalog()) {
      return [];
    }
    return getMockCategories();
  }

  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("[Supabase] getCategories failed:", error.message, error);
      return [];
    }

    return (data ?? []) as Category[];
  } catch (e) {
    console.error("[Supabase] getCategories exception:", e);
    return [];
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const categories = await getCategories();
  return categories.find((category) => category.slug === slug) ?? null;
}

export async function getProductVariants(
  productId: number,
): Promise<ProductVariant[]> {
  if (!hasSupabaseEnv || !supabase) {
    if (!allowMockCatalog()) {
      return [];
    }
    return mockProductVariants.filter((v) => v.product_id === productId);
  }

  try {
    const { data, error } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", productId);

    if (error) {
      return [];
    }

    return (data ?? []) as ProductVariant[];
  } catch {
    return [];
  }
}

export async function getProductVariantsByIds(
  ids: number[],
): Promise<ProductVariant[]> {
  if (!ids.length || !hasSupabaseEnv || !supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("product_variants")
      .select("*")
      .in("id", ids);

    if (error) {
      return [];
    }

    return (data ?? []) as ProductVariant[];
  } catch {
    return [];
  }
}

export async function getProductReviews(productId: number): Promise<Review[]> {
  const mockForProduct = () =>
    allowMockCatalog()
      ? mockReviews.filter((review) => review.product_id === productId)
      : [];

  if (!hasSupabaseEnv || !supabase) {
    return mockForProduct();
  }

  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Supabase] getProductReviews failed:", error.message, error);
      return [];
    }

    return (data ?? []) as Review[];
  } catch (e) {
    console.error("[Supabase] getProductReviews exception:", e);
    return [];
  }
}

export async function getActivePromo(): Promise<PromoCampaign | null> {
  if (!hasSupabaseEnv || !supabase) {
    return mockPromoCampaign;
  }

  const today = new Date().toISOString();

  try {
    const { data, error } = await supabase
      .from("promo_campaigns")
      .select("*")
      .lte("start_date", today)
      .gte("end_date", today)
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return mockPromoCampaign;
    }

    return data as PromoCampaign;
  } catch {
    return mockPromoCampaign;
  }
}

export async function getPressMentions(): Promise<PressMention[]> {
  if (!hasSupabaseEnv || !supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("press_mentions")
      .select("*")
      .order("published_at", { ascending: false });

    if (error || !data?.length) {
      return [];
    }

    return data as PressMention[];
  } catch {
    return [];
  }
}

export async function getIngredients(): Promise<Ingredient[]> {
  if (!hasSupabaseEnv || !supabase) {
    return mockIngredients;
  }

  try {
    const { data, error } = await supabase.from("ingredients").select("*");

    if (error || !data?.length) {
      return mockIngredients;
    }

    return mergeMystiqueCanonicalIngredients(data as Ingredient[]);
  } catch {
    return mockIngredients;
  }
}

export async function searchProducts(query: string): Promise<Product[]> {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return [];
  }

  const sourceProducts =
    hasSupabaseEnv && supabase
      ? await getProducts({ sortBy: "featured" })
      : allowMockCatalog()
        ? mockProducts.map(normalizeProduct)
        : [];

  return filterProductsBySearch(sourceProducts, normalizedQuery, 24);
}

export async function getJournalEntries(): Promise<JournalEntry[]> {
  return mockJournalEntries;
}

export async function getCartItems(userId: string): Promise<CartItem[]> {
  void userId;
  return [];
}

export async function getUserOrders(_userId: string): Promise<Order[]> {
  if (!hasSupabaseEnv || !supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", _userId)
      .order("created_at", { ascending: false });

    if (error) {
      return [];
    }

    return (data ?? []) as Order[];
  } catch {
    return [];
  }
}

export async function getOrderById(_orderId: string): Promise<Order | null> {
  if (!hasSupabaseEnv || !supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", _orderId)
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data as Order;
  } catch {
    return null;
  }
}

export async function getUserAddresses(userId: string): Promise<Address[]> {
  void userId;
  return [];
}

export async function getUserWishlist(userId: string): Promise<WishlistItem[]> {
  void userId;
  return [];
}

export async function getLoyaltyProgram(
  userId: string,
): Promise<LoyaltyProgram | null> {
  void userId;
  return null;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  void userId;
  return null;
}

export async function createPendingOrder({
  orderNumber,
  userId = null,
  shippingDetails,
  cart,
  currency = "usd",
  totals,
  appliedPromo = null,
}: CreatePendingOrderInput): Promise<Order> {
  const client = requireSupabase();

  const orderInsert = {
    order_number: orderNumber,
    user_id: userId,
    email: shippingDetails.email,
    promo_code: appliedPromo?.promo.code ?? null,
    status: "pending",
    currency,
    subtotal_cents: cart.subtotalCents,
    shipping_cents: totals.shippingAmount,
    discount_cents: totals.discountAmount,
    total_cents: totals.totalAmount,
    subtotal_amount: totals.subtotalAmount,
    shipping_amount: totals.shippingAmount,
    tax_amount: totals.taxAmount,
    total_amount: totals.totalAmount,
    full_name: shippingDetails.fullName,
    address_line1: shippingDetails.addressLine1,
    address_line2: shippingDetails.addressLine2 || null,
    city: shippingDetails.city,
    state: shippingDetails.state,
    postal_code: shippingDetails.postalCode,
    country: shippingDetails.country,
  };

  const { data: order, error: orderError } = await client
    .from("orders")
    .insert(orderInsert)
    .select("*")
    .single();

  if (orderError || !order) {
    throw new Error(orderError?.message ?? "Failed to create order.");
  }

  const itemRows = cart.lines.map((line) => ({
    order_id: order.id,
    product_id: line.product.id,
    variant_id: line.variantId,
    quantity: line.quantity,
    price_cents_at_time: line.unitPriceCents,
  }));

  const { error: itemsError } = await client.from("order_items").insert(itemRows);

  if (itemsError) {
    await client.from("orders").delete().eq("id", order.id);
    throw new Error(itemsError.message);
  }

  return order as Order;
}

export async function attachStripeCheckoutSession(
  orderId: string,
  sessionId: string,
): Promise<void> {
  const client = requireSupabase();
  const { error } = await client
    .from("orders")
    .update({
      stripe_checkout_session_id: sessionId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getOrderByOrderNumber(
  orderNumber: string,
): Promise<Order | null> {
  if (!hasSupabaseEnv || !supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("order_number", orderNumber)
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data as Order;
  } catch {
    return null;
  }
}

export async function getOrderByStripeCheckoutSessionId(
  sessionId: string,
): Promise<Order | null> {
  if (!hasSupabaseEnv || !supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("stripe_checkout_session_id", sessionId)
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data as Order;
  } catch {
    return null;
  }
}

export async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  if (!hasSupabaseEnv || !supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);

    if (error) {
      return [];
    }

    return (data ?? []) as OrderItem[];
  } catch {
    return [];
  }
}

export async function getPaymentsForOrder(orderId: string): Promise<Payment[]> {
  if (!hasSupabaseEnv || !supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false });

    if (error) {
      return [];
    }

    return (data ?? []) as Payment[];
  } catch {
    return [];
  }
}

export async function getOrderWithItems(
  orderId: string,
): Promise<OrderWithItems | null> {
  const order = await getOrderById(orderId);

  if (!order) {
    return null;
  }

  const items = await getOrderItems(order.id);

  return {
    ...order,
    items,
  };
}

export async function getOrderWithItemsForUser({
  userId,
  orderId,
}: {
  userId: string;
  orderId: string;
}): Promise<OrderWithItems | null> {
  if (!hasSupabaseEnv || !supabase) {
    return null;
  }

  try {
    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();

    if (error || !order) {
      return null;
    }

    const items = await getOrderItems(orderId);

    return {
      ...(order as Order),
      items,
    };
  } catch {
    return null;
  }
}

export async function markOrderPaid({
  orderId,
  stripeCheckoutSessionId,
  stripePaymentIntentId,
}: {
  orderId: string;
  stripeCheckoutSessionId: string;
  stripePaymentIntentId: string | null;
}): Promise<Order> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("orders")
    .update({
      status: "paid",
      stripe_checkout_session_id: stripeCheckoutSessionId,
      stripe_payment_intent_id: stripePaymentIntentId,
      payment_intent_id: stripePaymentIntentId,
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to mark order paid.");
  }

  return data as Order;
}

export async function markOrderFailed(orderId: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client
    .from("orders")
    .update({
      status: "failed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function markOrderCancelled(orderId: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client
    .from("orders")
    .update({
      status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    throw new Error(error.message);
  }
}
