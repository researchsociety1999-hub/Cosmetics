-- seed-reviews.sql
-- Sprint 1: Insert sample review rows for product review display.
-- Replace the product_id values with real IDs from your products table.
-- Run: SELECT id, name FROM products; to get real product IDs.

INSERT INTO reviews (product_id, author_name, rating, title, body, is_published, created_at)
VALUES
  (
    (SELECT id FROM products LIMIT 1 OFFSET 0),
    'Anika S.',
    5,
    'Genuinely transformed my routine',
    'I have tried so many serums but this one actually works. My skin has never felt this hydrated after just two weeks.',
    true,
    NOW() - INTERVAL '14 days'
  ),
  (
    (SELECT id FROM products LIMIT 1 OFFSET 0),
    'Mira L.',
    5,
    'Worth every penny',
    'The texture is light and absorbs instantly. No sticky residue, no breakouts. This is my holy grail product.',
    true,
    NOW() - INTERVAL '7 days'
  ),
  (
    (SELECT id FROM products LIMIT 1 OFFSET 1),
    'Jordan K.',
    4,
    'Great formula, subtle scent',
    'Loved the ingredients list — mostly clean and recognisable. The scent is gentle and fades quickly. Only minor thing is the pump could dispense a bit more.',
    true,
    NOW() - INTERVAL '5 days'
  ),
  (
    (SELECT id FROM products LIMIT 1 OFFSET 1),
    'Priya T.',
    5,
    'My skin is glowing',
    'Been using this for three weeks and the difference in my skin tone is visible. My partner even noticed without me saying anything.',
    true,
    NOW() - INTERVAL '2 days'
  );

-- Confirm inserts
SELECT r.id, p.name AS product_name, r.author_name, r.rating, r.title, r.is_published
FROM reviews r
JOIN products p ON r.product_id = p.id
ORDER BY r.created_at DESC;
