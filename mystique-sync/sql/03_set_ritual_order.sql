-- ─────────────────────────────────────────────────────────────────────────────
-- 03_set_ritual_order.sql
-- Ensure the `category` column exists, then assign ritual_order (1..5) and
-- category to each of the 5 locked hero SKUs.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS category TEXT;

-- (Optional but cheap) index used by the protocol-sequence ordering scan.
CREATE INDEX IF NOT EXISTS products_ritual_order_idx
  ON public.products (ritual_order)
  WHERE is_published = true;

BEGIN;

UPDATE public.products
   SET ritual_order = 1,
       category     = 'cleanser',
       updated_at   = now()
 WHERE slug = 'soft-reset-cleansing-gel';

UPDATE public.products
   SET ritual_order = 2,
       category     = 'essence',
       updated_at   = now()
 WHERE slug = 'calm-layer-toning-essence';

UPDATE public.products
   SET ritual_order = 3,
       category     = 'serum',
       updated_at   = now()
 WHERE slug = 'hydrating-serum';

UPDATE public.products
   SET ritual_order = 4,
       category     = 'cream',
       updated_at   = now()
 WHERE slug = 'barrier-replenish-cream';

UPDATE public.products
   SET ritual_order = 5,
       category     = 'sunscreen',
       updated_at   = now()
 WHERE slug = 'light-veil-spf-50-fluid';

COMMIT;

-- Verification ────────────────────────────────────────────────────────────────
SELECT ritual_order, category, name, slug, is_published
  FROM public.products
 WHERE slug IN (
        'soft-reset-cleansing-gel',
        'calm-layer-toning-essence',
        'hydrating-serum',
        'barrier-replenish-cream',
        'light-veil-spf-50-fluid'
       )
 ORDER BY ritual_order ASC NULLS LAST;
