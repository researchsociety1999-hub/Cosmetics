-- ─────────────────────────────────────────────────────────────────────────────
-- 02_update_hero_skus.sql
-- Rename the 5 hero SKUs to their locked names + slugs.
--
-- INVARIANT: this script MUST NOT modify is_published, price, description, or
-- image_url. It only writes `name`, `slug`, and `updated_at`. The auto_slug
-- trigger from 01_auto_slug_trigger.sql is harmless here because we set slug
-- explicitly (non-empty), so the trigger's "missing slug" branch is skipped.
-- ─────────────────────────────────────────────────────────────────────────────

BEGIN;

-- 1) Cleanser ─────────────────────────────────────────────────────────────────
UPDATE public.products
   SET name = 'Soft Reset Cleansing Gel',
       slug = 'soft-reset-cleansing-gel',
       updated_at = now()
 WHERE slug <> 'soft-reset-cleansing-gel'
   AND (
        slug IN ('face-cleanser', 'cleanser')
     OR name ILIKE '%cleanser%'
     OR name ILIKE '%cleansing%'
   );

-- 2) Toning Essence ───────────────────────────────────────────────────────────
UPDATE public.products
   SET name = 'Calm Layer Toning Essence',
       slug = 'calm-layer-toning-essence',
       updated_at = now()
 WHERE slug <> 'calm-layer-toning-essence'
   AND (
        slug IN ('toner', 'essence')
     OR name ILIKE '%toner%'
     OR name ILIKE '%toning%'
     OR name ILIKE '%essence%'
   );

-- 3) Hydrating Serum ──────────────────────────────────────────────────────────
UPDATE public.products
   SET name = 'Hydrating Serum',
       slug = 'hydrating-serum',
       updated_at = now()
 WHERE slug <> 'hydrating-serum'
   AND (
        slug IN ('serum', 'hydrating')
     OR name ILIKE '%serum%'
     OR name ILIKE '%hydrating%'
   );

-- 4) Barrier Replenish Cream ──────────────────────────────────────────────────
UPDATE public.products
   SET name = 'Barrier Replenish Cream',
       slug = 'barrier-replenish-cream',
       updated_at = now()
 WHERE slug <> 'barrier-replenish-cream'
   AND (
        slug IN ('moisturizer', 'cream', 'replenish')
     OR name ILIKE '%moisturizer%'
     OR name ILIKE '%cream%'
     OR name ILIKE '%replenish%'
     OR name ILIKE '%barrier%'
   );

-- 5) Light Veil SPF 50 Fluid ──────────────────────────────────────────────────
UPDATE public.products
   SET name = 'Light Veil SPF 50 Fluid',
       slug = 'light-veil-spf-50-fluid',
       updated_at = now()
 WHERE slug <> 'light-veil-spf-50-fluid'
   AND (
        slug IN ('spf', 'sunscreen', 'light-veil')
     OR name ILIKE '%spf%'
     OR name ILIKE '%sunscreen%'
     OR name ILIKE '%light veil%'
   );

COMMIT;

-- Verification ────────────────────────────────────────────────────────────────
SELECT name, slug, is_published, ritual_order
  FROM public.products
 WHERE slug IN (
        'soft-reset-cleansing-gel',
        'calm-layer-toning-essence',
        'hydrating-serum',
        'barrier-replenish-cream',
        'light-veil-spf-50-fluid'
       )
 ORDER BY ritual_order NULLS LAST, slug;
