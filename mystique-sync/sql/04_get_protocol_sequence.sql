-- ─────────────────────────────────────────────────────────────────────────────
-- 04_get_protocol_sequence.sql
-- Function that returns the published Mystique ritual in canonical order.
-- Consumed by the storefront ("Daily Protocol" rail) and by mystique-sync's
-- `supabase:protocol` command.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_protocol_sequence()
RETURNS TABLE (
  id            uuid,
  name          text,
  slug          text,
  description   text,
  price         numeric,
  image_url     text,
  ritual_order  integer,
  category      text,
  is_published  boolean,
  created_at    timestamptz,
  updated_at    timestamptz
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
    SELECT p.id,
           p.name,
           p.slug,
           p.description,
           p.price,
           p.image_url,
           p.ritual_order,
           p.category,
           p.is_published,
           p.created_at,
           p.updated_at
      FROM public.products p
     WHERE p.is_published = true
     ORDER BY p.ritual_order ASC NULLS LAST,
              p.created_at  ASC;
END;
$$;

COMMENT ON FUNCTION public.get_protocol_sequence() IS
  'Returns published products ordered by ritual_order (1..N). Nulls sort last; ties broken by created_at.';

-- Allow the anon + authenticated roles to call this through PostgREST.
GRANT EXECUTE ON FUNCTION public.get_protocol_sequence() TO anon, authenticated;

-- Verification: list the ritual in order.
SELECT ritual_order, category, name, slug, is_published
  FROM public.get_protocol_sequence();

-- Export the same payload as a single JSON array (handy for the CLI).
SELECT json_agg(row_to_json(seq)) AS protocol_sequence_json
  FROM public.get_protocol_sequence() AS seq;
