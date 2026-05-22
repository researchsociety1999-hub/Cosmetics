-- seed-is-published.sql
-- Sprint 1: Audit & enable is_published for all in-stock products.
-- Run in Supabase SQL editor. Review the SELECT first, then run the UPDATE.

-- STEP 1: Preview which products will be published
SELECT id, name, slug, is_published, stock_quantity
FROM products
ORDER BY name;

-- STEP 2: Publish products that have stock (stock_quantity > 0)
-- Adjust the WHERE clause to match your actual stock column name if different.
UPDATE products
SET is_published = true
WHERE stock_quantity > 0
  AND is_published = false;

-- STEP 3: Confirm results
SELECT id, name, is_published, stock_quantity
FROM products
ORDER BY is_published DESC, name;
