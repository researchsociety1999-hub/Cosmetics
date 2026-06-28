-- ============================================================
-- MIGRATION: press_mentions_rls
-- Applied: 2026-06-28
-- Fix: press_mentions table had no RLS policy defined.
--      With RLS enabled and no SELECT policy, all reads were
--      silently blocked (PostgREST returns an empty array).
-- ============================================================

-- Enable RLS in case it wasn't already on
ALTER TABLE public.press_mentions ENABLE ROW LEVEL SECURITY;

-- Allow public (anon + authenticated) to read all press mentions.
-- Writes are intentionally restricted to service role only.
DROP POLICY IF EXISTS "Public can read press mentions" ON public.press_mentions;
CREATE POLICY "Public can read press mentions" ON public.press_mentions
  FOR SELECT TO anon, authenticated USING (true);
