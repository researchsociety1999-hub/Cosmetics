-- ============================================================
-- MIGRATION: payments_rls_insert
-- Applied: 2026-06-28
-- Fix: payments table only had a SELECT policy for authenticated
--      users. The webhook / service role creates payment rows
--      via service role (bypasses RLS), but there was no INSERT
--      policy for the authenticated path used in some flows.
--      Add an explicit service-role-only note + anon INSERT guard.
-- ============================================================

-- Block direct INSERT from anon to prevent abuse
DROP POLICY IF EXISTS "Block anon writes to payments" ON public.payments;
CREATE POLICY "Block anon writes to payments" ON public.payments
  FOR INSERT TO anon
  WITH CHECK (false);

-- Authenticated users cannot directly insert payment rows either;
-- all payment creation goes through the service role webhook.
DROP POLICY IF EXISTS "Block authenticated direct writes to payments" ON public.payments;
CREATE POLICY "Block authenticated direct writes to payments" ON public.payments
  FOR INSERT TO authenticated
  WITH CHECK (false);
