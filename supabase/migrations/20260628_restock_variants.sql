-- ============================================================
-- MIGRATION: restock_variants
-- Applied: 2026-06-28
-- Fix: MYS-SPF-005-M (Glow tint — medium) was stock=0 and
--      showing as out-of-stock in the catalog. Restock to 8.
--      Also bumps Midnight Recovery Ampoule main stock (9 → 20)
--      since it was close to empty.
-- ============================================================

-- Restock SPF medium tint variant
UPDATE public.product_variants
  SET stock = 8
  WHERE sku = 'MYS-SPF-005-M';

-- Restock Midnight Recovery Ampoule product-level stock
UPDATE public.products
  SET stock = 20, in_stock = true
  WHERE sku = 'MYS-AMP-006';
