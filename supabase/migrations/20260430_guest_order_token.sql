-- Guest order token: safe, unguessable tracking link for unauthenticated orders.
--
-- A random UUID is generated in application code (checkoutOrders.ts) at the moment
-- a guest order is created and stored here. The /order/[guestToken] page uses a
-- server-side service-role lookup keyed by this column — no RLS change required.
--
-- Run with:  supabase db push  OR paste into the Supabase SQL editor.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS guest_token UUID DEFAULT NULL;

-- Partial unique index: fast O(log n) lookup, nulls never collide.
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_guest_token
  ON public.orders (guest_token)
  WHERE guest_token IS NOT NULL;

COMMENT ON COLUMN public.orders.guest_token IS
  'Random UUID generated at checkout for guest (unauthenticated) orders. Used as a hard-to-guess token for the read-only /order/[token] status page. NULL for authenticated orders where user_id IS NOT NULL.';
