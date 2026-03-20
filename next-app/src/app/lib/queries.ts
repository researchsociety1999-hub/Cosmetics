import {
  mockCategories,
  mockIngredients,
  mockJournalEntries,
  mockPressMentions,
  mockProducts,
  mockPromoCampaign,
  mockReviews,
} from "./data";
import { hasSupabaseEnv, supabase } from "./supabaseClient";
import type {
  Address,
  CartItem,
  Category,
  Ingredient,
  JournalEntry,
  LoyaltyProgram,
  Order,
  PressMention,
  Product,
  ProductVariant,
  Profile,
  PromoCampaign,
  Review,
  WishlistItem,
} from "./types";

export type ProductSort = "price_asc" | "price_desc" | "newest" | "featured";

interface GetProductsOptions {
  categoryId?: number;
  search?: string;
  sortBy?: ProductSort;
  limit?: number;
  page?: number;
}

function normalizeStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const values = value.filter((entry): entry is string => typeof entry === "string");
  return values.length ? values : null;
}

function normalizeProduct(product: Product): Product {
  return {
    ...product,
    extra_images: normalizeStringArray(product.extra_images),
    key_ingredients: normalizeStringArray(product.key_ingredients),
    benefits: normalizeStringArray(product.benefits),
    skin_types: normalizeStringArray(product.skin_types),
    routine_step: product.routine_step ?? null,
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

function filterMockProducts(options: GetProductsOptions = {}): Product[] {
  const { categoryId, search, sortBy, limit, page } = options;
  let products = [...mockProducts]
    .filter((product) => product.is_published)
    .map(normalizeProduct);

  if (categoryId != null) {
    products = products.filter((product) => product.category_id === categoryId);
  }

  if (search && search.trim()) {
    const term = search.trim().toLowerCase();
    products = products.filter((product) => {
      return (
        product.name.toLowerCase().includes(term) ||
        product.slug.toLowerCase().includes(term) ||
        (product.description ?? "").toLowerCase().includes(term) ||
        (product.key_ingredients ?? []).some((item) =>
          item.toLowerCase().includes(term),
        )
      );
    });
  }

  return paginateProducts(sortProducts(products, sortBy), page, limit);
}

export async function getProducts(
  options: GetProductsOptions = {},
): Promise<Product[]> {
  if (!hasSupabaseEnv || !supabase) {
    return filterMockProducts(options);
  }

  const { categoryId, search, sortBy = "newest", limit, page = 1 } = options;

  try {
    let query = supabase.from("products").select("*").eq("is_published", true);

    if (categoryId != null) {
      query = query.eq("category_id", categoryId);
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query = query.or(`name.ilike.${term},description.ilike.${term},slug.ilike.${term}`);
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
    if (error || !data?.length) {
      return filterMockProducts(options);
    }

    return (data as Product[]).map(normalizeProduct);
  } catch {
    return filterMockProducts(options);
  }
}

export async function getProductsByIds(ids: number[]): Promise<Product[]> {
  if (!ids.length) {
    return [];
  }

  if (!hasSupabaseEnv || !supabase) {
    return mockProducts
      .filter((product) => ids.includes(product.id))
      .map(normalizeProduct);
  }

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .in("id", ids)
      .eq("is_published", true);

    if (error || !data?.length) {
      return mockProducts
        .filter((product) => ids.includes(product.id))
        .map(normalizeProduct);
    }

    return (data as Product[]).map(normalizeProduct);
  } catch {
    return mockProducts
      .filter((product) => ids.includes(product.id))
      .map(normalizeProduct);
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!hasSupabaseEnv || !supabase) {
    return mockProducts.find((product) => product.slug === slug) ?? null;
  }

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return mockProducts.find((product) => product.slug === slug) ?? null;
    }

    return normalizeProduct(data as Product);
  } catch {
    return mockProducts.find((product) => product.slug === slug) ?? null;
  }
}

export async function getRelatedProducts(
  product: Product,
  limit = 4,
): Promise<Product[]> {
  const products = await getProducts({
    categoryId: product.category_id ?? undefined,
    sortBy: "featured",
  });

  return products.filter((item) => item.id !== product.id).slice(0, limit);
}

export async function getCategories(): Promise<Category[]> {
  if (!hasSupabaseEnv || !supabase) {
    return mockCategories;
  }

  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (error || !data?.length) {
      return mockCategories;
    }

    return data as Category[];
  } catch {
    return mockCategories;
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
    return [];
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

export async function getProductReviews(productId: number): Promise<Review[]> {
  if (!hasSupabaseEnv || !supabase) {
    return mockReviews.filter((review) => review.product_id === productId);
  }

  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (error || !data?.length) {
      return mockReviews.filter((review) => review.product_id === productId);
    }

    return data as Review[];
  } catch {
    return mockReviews.filter((review) => review.product_id === productId);
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
    return mockPressMentions;
  }

  try {
    const { data, error } = await supabase
      .from("press_mentions")
      .select("*")
      .order("published_at", { ascending: false });

    if (error || !data?.length) {
      return mockPressMentions;
    }

    return data as PressMention[];
  } catch {
    return mockPressMentions;
  }
}

export async function getIngredients(): Promise<Ingredient[]> {
  if (!hasSupabaseEnv || !supabase) {
    return mockIngredients;
  }

  try {
    const { data, error } = await supabase
      .from("ingredients")
      .select("*")
      .order("name", { ascending: true });

    if (error || !data?.length) {
      return mockIngredients;
    }

    return data as Ingredient[];
  } catch {
    return mockIngredients;
  }
}

export async function searchProducts(query: string): Promise<Product[]> {
  return getProducts({ search: query, sortBy: "featured", limit: 24 });
}

export async function getJournalEntries(): Promise<JournalEntry[]> {
  return mockJournalEntries;
}

export async function getCartItems(_userId: string): Promise<CartItem[]> {
  return [];
}

export async function getUserOrders(_userId: string): Promise<Order[]> {
  return [];
}

export async function getOrderById(_orderId: string): Promise<Order | null> {
  return null;
}

export async function getUserAddresses(_userId: string): Promise<Address[]> {
  return [];
}

export async function getUserWishlist(_userId: string): Promise<WishlistItem[]> {
  return [];
}

export async function getLoyaltyProgram(
  _userId: string,
): Promise<LoyaltyProgram | null> {
  return null;
}

export async function getProfile(_userId: string): Promise<Profile | null> {
  return null;
}
