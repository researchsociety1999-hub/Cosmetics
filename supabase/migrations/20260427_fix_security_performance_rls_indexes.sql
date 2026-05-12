-- ============================================================
-- MIGRATION: fix_security_performance_rls_indexes
-- Applied: 2026-04-27
-- Fixes:
--   1. Revoke public EXECUTE on SECURITY DEFINER functions
--   2. Fix mutable search_path on functions
--   3. Drop duplicate/conflicting RLS policies
--   4. Optimize auth.uid() → (select auth.uid()) for performance
--   5. Add missing RLS policies for 15 tables
--   6. Drop duplicate index on orders
--   7. Add 20 missing FK indexes
-- ============================================================

-- ============================================================
-- 1. SECURITY: Revoke public EXECUTE on SECURITY DEFINER functions
-- ============================================================
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon, authenticated;

-- Fix mutable search_path on functions
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.update_updated_at() SET search_path = public;

-- ============================================================
-- 2. RLS POLICIES: Drop duplicate/conflicting existing policies
-- ============================================================
DROP POLICY IF EXISTS "Public can read published products" ON public.products;
DROP POLICY IF EXISTS "Public read published products" ON public.products;
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
DROP POLICY IF EXISTS "Users can update/delete own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Block direct writes to order_items" ON public.order_items;
DROP POLICY IF EXISTS "Block direct writes to payments" ON public.payments;

-- ============================================================
-- 3. RLS POLICIES: Rebuild with (select auth.uid()) optimization
-- ============================================================

-- addresses
DROP POLICY IF EXISTS "Users can manage own addresses" ON public.addresses;
CREATE POLICY "Users can manage own addresses" ON public.addresses
  FOR ALL TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- cart_items
DROP POLICY IF EXISTS "Users manage own cart" ON public.cart_items;
CREATE POLICY "Users manage own cart" ON public.cart_items
  FOR ALL TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- orders
DROP POLICY IF EXISTS "Users view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update own pending orders" ON public.orders;
CREATE POLICY "Users view own orders" ON public.orders
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can update own pending orders" ON public.orders
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id AND status = 'pending')
  WITH CHECK ((select auth.uid()) = user_id);

-- order_items
DROP POLICY IF EXISTS "Users view own order items" ON public.order_items;
CREATE POLICY "Users view own order items" ON public.order_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = (select auth.uid())
    )
  );

-- payments
DROP POLICY IF EXISTS "Users view own payments" ON public.payments;
CREATE POLICY "Users view own payments" ON public.payments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = payments.order_id
      AND orders.user_id = (select auth.uid())
    )
  );

-- reviews
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can read reviews" ON public.reviews;
CREATE POLICY "Anyone can read reviews" ON public.reviews
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated users can create reviews" ON public.reviews
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update or delete own reviews" ON public.reviews
  FOR ALL TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================
-- 4. RLS POLICIES: Add missing policies (tables with RLS but no policies)
-- ============================================================

-- profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- wishlists
CREATE POLICY "Users manage own wishlist" ON public.wishlists
  FOR ALL TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- loyalty_program
CREATE POLICY "Users view own loyalty" ON public.loyalty_program
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

-- newsletter_subscribers
CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscribers
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- promo_codes
CREATE POLICY "Authenticated users can read active promo codes" ON public.promo_codes
  FOR SELECT TO authenticated
  USING (is_active = true);

-- promo_campaigns
CREATE POLICY "Public can read promo campaigns" ON public.promo_campaigns
  FOR SELECT TO anon, authenticated USING (true);

-- product_ingredients
CREATE POLICY "Public can read product ingredients" ON public.product_ingredients
  FOR SELECT TO anon, authenticated USING (true);

-- order_status_history
CREATE POLICY "Users view own order status history" ON public.order_status_history
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_status_history.order_id
      AND orders.user_id = (select auth.uid())
    )
  );

-- returns
CREATE POLICY "Users can view own returns" ON public.returns
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.order_items oi
      JOIN public.orders o ON o.id = oi.order_id
      WHERE oi.id = returns.order_item_id
      AND o.user_id = (select auth.uid())
    )
  );
CREATE POLICY "Users can request returns" ON public.returns
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.order_items oi
      JOIN public.orders o ON o.id = oi.order_id
      WHERE oi.id = returns.order_item_id
      AND o.user_id = (select auth.uid())
    )
  );

-- analytics_events
CREATE POLICY "Users can insert own analytics events" ON public.analytics_events
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can view own analytics events" ON public.analytics_events
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

-- referrals
CREATE POLICY "Users view own referrals" ON public.referrals
  FOR SELECT TO authenticated
  USING (
    (select auth.uid()) = referrer_user_id
    OR (select auth.uid()) = referred_user_id
  );
CREATE POLICY "Users can create referrals" ON public.referrals
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = referrer_user_id);

-- sales_channels
CREATE POLICY "Public can read sales channels" ON public.sales_channels
  FOR SELECT TO anon, authenticated USING (true);

-- NOTE: admin_users, inventory_logs, channel_orders intentionally
-- have NO policies — access restricted to service role only.

-- ============================================================
-- 5. PERFORMANCE: Drop duplicate index on orders
-- ============================================================
DROP INDEX IF EXISTS public.orders_order_number_idx;

-- ============================================================
-- 6. PERFORMANCE: Add missing FK indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_admin_users_auth_user_id ON public.admin_users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_bundle_items_bundle_id ON public.bundle_items(bundle_id);
CREATE INDEX IF NOT EXISTS idx_bundle_items_product_id ON public.bundle_items(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_variant_id ON public.cart_items(variant_id);
CREATE INDEX IF NOT EXISTS idx_channel_orders_channel_id ON public.channel_orders(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_orders_order_id ON public.channel_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_product_id ON public.inventory_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON public.order_items(variant_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON public.order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_changed_by ON public.order_status_history(changed_by);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_product_ingredients_ingredient_id ON public.product_ingredients(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id ON public.referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_user_id ON public.referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_returns_order_item_id ON public.returns(order_item_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
