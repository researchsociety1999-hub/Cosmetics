-- seed-press-mentions.sql
-- Sprint 2: Insert press mention rows for the Press page.
-- Assumes a press_mentions table with these columns.
-- Run: CREATE TABLE IF NOT EXISTS press_mentions section below first if the table doesn't exist.

-- Create table if it doesn't exist yet
CREATE TABLE IF NOT EXISTS press_mentions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publication TEXT NOT NULL,
  logo_url    TEXT,
  quote       TEXT NOT NULL,
  article_url TEXT,
  published_at DATE NOT NULL,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Seed rows (replace article_url and logo_url with real ones when available)
INSERT INTO press_mentions (publication, quote, article_url, published_at, sort_order)
VALUES
  (
    'Vogue',
    '"The brand redefining clean beauty for a new generation — effortless, effective, and beautifully minimal."',
    NULL,
    '2025-03-01',
    1
  ),
  (
    'Byrdie',
    '"We tested every serum in this category and Mystique stood out for its texture, ingredient transparency, and results."',
    NULL,
    '2025-05-15',
    2
  ),
  (
    'Refinery29',
    '"A cult favourite in the making. If you care about what goes on your skin, this is where to start."',
    NULL,
    '2025-06-20',
    3
  ),
  (
    'Into The Gloss',
    '"Understated packaging that does exactly what it promises. Mystique City is serious skincare without the noise."',
    NULL,
    '2025-08-10',
    4
  );

-- Confirm
SELECT * FROM press_mentions ORDER BY sort_order;
