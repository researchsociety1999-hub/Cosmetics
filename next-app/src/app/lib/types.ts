export interface Product {
  id: number;
  name: string;
  description: string | null;
  price_cents: number;
  sale_price_cents: number | null;
  image_url: string | null;
  extra_images: string[] | null;
  slug: string;
  category_id: number | null;
  sku: string | null;
  stock: number | null;
  in_stock: boolean | null;
  is_published: boolean | null;
  created_at: string;
  updated_at: string | null;
  key_ingredients?: string[] | null;
  benefits?: string[] | null;
  routine_step?: string | null;
  skin_types?: string[] | null;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  variant_name: string;
  price_cents: number | null;
  price: number | null;
  stock: number | null;
  sku: string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: number;
  variant_id: number | null;
  quantity: number;
  created_at: string;
  updated_at: string | null;
}

export interface CartCookieItem {
  productId: number;
  quantity: number;
  variantId?: number | null;
}

export interface CartLine {
  product: Product;
  quantity: number;
  variantId: number | null;
  unitPriceCents: number;
  lineTotalCents: number;
}

export interface CartSummary {
  items: CartCookieItem[];
  lines: CartLine[];
  itemCount: number;
  subtotalCents: number;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  subtotal_cents: number;
  shipping_cents: number;
  discount_cents: number;
  total_cents: number;
  shipping_address_id: number | null;
  billing_address_id: number | null;
  payment_intent_id: string | null;
  tracking_number: string | null;
  estimated_delivery: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: number;
  variant_id: number | null;
  quantity: number;
  price_cents_at_time: number;
}

export interface Address {
  id: number;
  user_id: string;
  type: string | null;
  full_name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string | null;
  is_default: boolean | null;
}

export type ProfileRole = "customer" | "admin";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: ProfileRole;
  phone: string | null;
}

export interface Review {
  id: string;
  product_id: number;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: number;
}

export type CouponDiscountType = "percentage" | "fixed";

export interface Coupon {
  id: string;
  code: string;
  discount_type: CouponDiscountType;
  discount_value: number;
  min_order_cents: number | null;
  max_uses: number | null;
  uses_count: number | null;
  expires_at: string | null;
  is_active: boolean | null;
}

export type LoyaltyTier = "Bronze" | "Silver" | "Gold";

export interface LoyaltyProgram {
  user_id: string;
  points: number;
  tier: LoyaltyTier;
}

export interface PressMention {
  id: string;
  title: string;
  source: string;
  quote: string | null;
  link: string | null;
  published_at: string | null;
}

export interface Ingredient {
  id: string;
  name: string;
  description: string | null;
  benefits: string | null;
  source: string | null;
}

export interface PromoCampaign {
  id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  discount_percentage: number | null;
}

export interface AnalyticsEvent {
  id: string;
  user_id: string | null;
  event_type: string;
  event_data: unknown | null;
  occurred_at: string;
}

export interface JournalEntry {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  content?: Array<{
    heading: string;
    paragraphs: string[];
  }>;
}
