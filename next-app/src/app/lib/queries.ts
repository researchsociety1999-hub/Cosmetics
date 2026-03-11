import { supabase } from "./supabaseClient";
import type {
  Product,
  ProductVariant,
  Category,
  Review,
  PromoyCampaign,
  PressMention,
  Ingredient,
  CartItem,
  Order,
  Address,
  WishlistItem,
  LoyaltyProgram,
} from "./types";

type ProductSort = "price_asc" | "price_desc" | "newest";

interface GetProductsOptions {
  categoryId?: number;
  search?: string;
  sortBy?: ProductSort;
}

export async function getProducts(
  options: GetProductsOptions = {},
): Promise<Product[]> {
  const { categoryId, search, sortBy } = options;

  let query = supabase
    .from("products")
    .select("*")
    .eq("is_published", true) as any;

  if (categoryId != null) {
    query = query.eq("category_id", categoryId);
  }

  if (search && search.trim().length > 0) {
    const term = `%${search.trim()}%`;
    query = query.or(
      `name.ilike.${term},description.ilike.${term}`,
    );
  }

  if (sortBy === "price_asc") {
    query = query.order("price_cents", { ascending: true });
  } else if (sortBy === "price_desc") {
    query = query.order("price_cents", { ascending: false });
  } else if (sortBy === "newest") {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) {
    console.error("getProducts error", error);
    return [];
  }
  return (data ?? []) as Product[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("getProductBySlug error", error);
    return null;
  }
  return (data as Product) ?? null;
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("getCategories error", error);
    return [];
  }
  return (data ?? []) as Category[];
}

export async function getProductVariants(
  productId: number,
): Promise<ProductVariant[]> {
  const { data, error } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId);

  if (error) {
    console.error("getProductVariants error", error);
    return [];
  }
  return (data ?? []) as ProductVariant[];
}

export async function getProductReviews(
  productId: number,
): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getProductReviews error", error);
    return [];
  }
  return (data ?? []) as Review[];
}

export async function getActivePromo(): Promise<PromoyCampaign | null> {
  const today = new Date().toISOString();

  const { data, error } = await supabase
    .from("promo_campaigns")
    .select("*")
    .lte("start_date", today)
    .gte("end_date", today)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("getActivePromo error", error);
    return null;
  }

  return (data as PromoyCampaign) ?? null;
}

export async function getPressmentions(): Promise<PressMention[]> {
  const { data, error } = await supabase
    .from("press_mentions")
    .select("*")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("getPressmentions error", error);
    return [];
  }
  return (data ?? []) as PressMention[];
}

export async function getIngredients(): Promise<Ingredient[]> {
  const { data, error } = await supabase
    .from("ingredients")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("getIngredients error", error);
    return [];
  }
  return (data ?? []) as Ingredient[];
}

export async function getCartItems(userId: string): Promise<CartItem[]> {
  const { data, error } = await supabase
    .from("cart_items")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("getCartItems error", error);
    return [];
  }
  return (data ?? []) as CartItem[];
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getUserOrders error", error);
    return [];
  }
  return (data ?? []) as Order[];
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("getOrderById error", error);
    return null;
  }
  return (data as Order) ?? null;
}

export async function getUserAddresses(
  userId: string,
): Promise<Address[]> {
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false });

  if (error) {
    console.error("getUserAddresses error", error);
    return [];
  }
  return (data ?? []) as Address[];
}

export async function getUserWishlist(
  userId: string,
): Promise<WishlistItem[]> {
  const { data, error } = await supabase
    .from("wishlists")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("getUserWishlist error", error);
    return [];
  }
  return (data ?? []) as WishlistItem[];
}

export async function getLoyaltyProgram(
  userId: string,
): Promise<LoyaltyProgram | null> {
  const { data, error } = await supabase
    .from("loyalty_program")
    .select("*")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("getLoyaltyProgram error", error);
    return null;
  }
  return (data as LoyaltyProgram) ?? null;
}

