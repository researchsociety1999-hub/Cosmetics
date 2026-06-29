-- ============================================================
-- MIGRATION: restock_variants
-- Applied: 2026-06-28
-- Fix: MYS-SPF-005-M (Glow tint — medium) had stock=0 and was
--      filtered out of the catalog by the out-of-stock guard.
--      Restock to 8. Also bumps Midnight Recovery Ampoule
--      product-level stock (9 → 20).
--
-- These UPDATEs are safe to re-run (idempotent WHERE clauses).
-- They are also covered by the seed in refresh_promo_campaign.sql
-- via ON CONFLICT DO UPDATE, so running both is harmless.
-- ============================================================

-- Restock SPF medium tint variant
UPDATE public.product_variants
  SET stock = 8
  WHERE sku = 'MYS-SPF-005-M'
    AND stock < 8;

-- Restock Midnight Recovery Ampoule product-level stock
UPDATE public.products
  SET stock    = 20,
      in_stock = true,
      updated_at = NOW()
  WHERE sku = 'MYS-AMP-006'
    AND stock < 20;
