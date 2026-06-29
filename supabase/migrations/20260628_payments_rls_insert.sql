-- ============================================================
-- MIGRATION: payments_rls_insert
-- Applied: 2026-06-28
-- Fix: payments table had no INSERT policy. Adding explicit
--      block for anon and authenticated roles — all payment
--      creation must go through the service-role webhook only.
--
-- The existing SELECT policy from 20260427 is preserved:
--   "Users view own payments" FOR SELECT TO authenticated
--
-- NOTE: service role bypasses RLS entirely, so the webhook
--       can still INSERT without needing an explicit policy.
-- ============================================================

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Block direct INSERT from anon
DROP POLICY IF EXISTS "Block anon writes to payments" ON public.payments;
CREATE POLICY "Block anon writes to payments" ON public.payments
  FOR INSERT TO anon
  WITH CHECK (false);

-- Block direct INSERT from authenticated users
-- (all payment rows are created by the Stripe webhook via service role)
DROP POLICY IF EXISTS "Block authenticated direct writes to payments" ON public.payments;
CREATE POLICY "Block authenticated direct writes to payments" ON public.payments
  FOR INSERT TO authenticated
  WITH CHECK (false);
