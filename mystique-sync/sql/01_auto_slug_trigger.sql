-- ─────────────────────────────────────────────────────────────────────────────
-- 01_auto_slug_trigger.sql
-- Auto-generate `products.slug` from `products.name` on INSERT/UPDATE when the
-- slug is null or empty. Idempotent — safe to re-run.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.generate_slug_from_name()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  candidate TEXT;
BEGIN
  -- Only generate when slug is missing. Never overwrite an explicit slug.
  IF NEW.slug IS NULL OR length(btrim(NEW.slug)) = 0 THEN
    IF NEW.name IS NULL OR length(btrim(NEW.name)) = 0 THEN
      -- Nothing to slugify; leave NEW.slug as-is (will fail NOT NULL if any).
      RETURN NEW;
    END IF;

    -- 1) lowercase
    candidate := lower(NEW.name);
    -- 2) collapse runs of non-alphanumerics into a single hyphen
    candidate := regexp_replace(candidate, '[^a-z0-9]+', '-', 'g');
    -- 3) trim leading / trailing hyphens
    candidate := btrim(candidate, '-');

    NEW.slug := candidate;
  END IF;

  RETURN NEW;
END;
$$;

-- Re-create the trigger cleanly so this file is idempotent.
DROP TRIGGER IF EXISTS auto_slug_trigger ON public.products;

CREATE TRIGGER auto_slug_trigger
BEFORE INSERT OR UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.generate_slug_from_name();

-- Sanity check: try a synthetic name -> slug conversion in a NOTICE.
DO $$
DECLARE
  s TEXT;
BEGIN
  s := btrim(regexp_replace(lower('  Soft Reset!! Cleansing  Gel '), '[^a-z0-9]+', '-', 'g'), '-');
  RAISE NOTICE 'auto_slug_trigger installed. Sample slug for "Soft Reset!! Cleansing  Gel" = %', s;
END $$;
