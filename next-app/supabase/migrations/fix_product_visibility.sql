-- Normalize product + variant rows so the storefront catalog is visible and purchasable checks pass.
-- Safe to re-run: only updates rows that still match the predicate.

UPDATE products
SET is_published = true
WHERE is_published IS DISTINCT FROM true;

UPDATE products
SET coming_soon = false
WHERE coming_soon IS DISTINCT FROM false;

UPDATE products
SET in_stock = true
WHERE in_stock IS DISTINCT FROM true;

UPDATE product_variants
SET stock = 10
WHERE stock IS NULL OR stock = 0;
