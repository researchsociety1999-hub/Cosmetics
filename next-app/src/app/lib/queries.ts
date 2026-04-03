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
  CartSummary,
  Category,
  Ingredient,
  JournalEntry,
  LoyaltyProgram,
  Order,
  OrderItem,
  OrderTotals,
  OrderWithItems,
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

interface GetProductsOptions {
  categoryId?: number;
  search?: string;
  sortBy?: ProductSort;
  limit?: number;
  page?: number;
}

export interface CreatePendingOrderInput {
  orderNumber: string;
  userId?: string | null;
  shippingDetails: ShippingDetails;
  cart: CartSummary;
  currency?: string;
  totals: OrderTotals;
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
  return {
    ...product,
    extra_images: normalizeStringArray(product.extra_images),
    key_ingredients: normalizeStringArray(product.key_ingredients),
    benefits: normalizeStringArray(product.benefits),
    skin_types: normalizeStringArray(product.skin_types),
    routine_step: product.routine_step ?? null,
  };
}

function mergeProducts(primary: Product[], fallback: Product[]): Product[] {
  const merged = new Map<string, Product>();

  fallback.forEach((product) => {
    merged.set(product.slug, normalizeProduct(product));
  });

  primary.forEach((product) => {
    merged.set(product.slug, normalizeProduct(product));
  });

  return Array.from(merged.values());
}

function mergeCategories(primary: Category[], fallback: Category[]): Category[] {
  const merged = new Map<string, Category>();

  fallback.forEach((category) => {
    merged.set(category.slug, category);
  });

  primary.forEach((category) => {
    merged.set(category.slug, category);
  });

  return Array.from(merged.values());
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

function filterMockProductsUnpaginated(options: GetProductsOptions = {}): Product[] {
  const { limit, page, ...rest } = options;
  void limit;
  void page;
  return filterMockProducts(rest);
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
    if (error) {
      return filterMockProducts(options);
    }

    return paginateProducts(
      sortProducts(
        mergeProducts(
          (data ?? []) as Product[],
          filterMockProductsUnpaginated(options),
        ),
        sortBy,
      ),
      page,
      limit,
    );
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

    const fallbackProducts = mockProducts.filter((product) => ids.includes(product.id));

    if (error) {
      return fallbackProducts.map(normalizeProduct);
    }

    return mergeProducts((data ?? []) as Product[], fallbackProducts);
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

    if (error) {
      return mockProducts.find((product) => product.slug === slug) ?? null;
    }

    return data
      ? normalizeProduct(data as Product)
      : mockProducts.find((product) => product.slug === slug) ?? null;
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

    if (error) {
      return mockCategories;
    }

    return mergeCategories((data ?? []) as Category[], mockCategories);
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
}: CreatePendingOrderInput): Promise<Order> {
  const client = requireSupabase();

  const orderInsert = {
    order_number: orderNumber,
    user_id: userId,
    email: shippingDetails.email,
    status: "pending",
    currency,
    subtotal_cents: cart.subtotalCents,
    shipping_cents: totals.shippingAmount,
    discount_cents: 0,
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
