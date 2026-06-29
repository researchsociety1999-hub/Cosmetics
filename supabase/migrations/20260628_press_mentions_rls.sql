-- ============================================================
-- MIGRATION: press_mentions_rls
-- Applied: 2026-06-28
-- Fix: press_mentions table had no SELECT RLS policy defined.
--      With RLS enabled and no SELECT policy, PostgREST returns
--      an empty array for every read — no error, just silence.
-- Schema ref: PressMention { id, title, source, quote, link, published_at }
-- ============================================================

ALTER TABLE public.press_mentions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read press mentions" ON public.press_mentions;
CREATE POLICY "Public can read press mentions" ON public.press_mentions
  FOR SELECT TO anon, authenticated USING (true);
