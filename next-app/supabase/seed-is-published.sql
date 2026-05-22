-- seed-is-published.sql
-- Sprint 1: Audit & enable is_published for all in-stock products.
-- Run in Supabase SQL editor. Review the SELECT first, then run the UPDATE.
-- Column names match the live schema: `stock` (integer), `in_stock` (boolean).

-- STEP 1: Preview all products and their current publish state
SELECT id, name, slug, is_published, in_stock, stock
FROM products
ORDER BY name;

-- STEP 2: Publish products that are in stock (stock > 0 AND in_stock = true)
UPDATE products
SET is_published = true
WHERE stock > 0
  AND in_stock = true
  AND is_published = false;

-- STEP 3: Confirm results
SELECT id, name, is_published, in_stock, stock
FROM products
ORDER BY is_published DESC, name;
