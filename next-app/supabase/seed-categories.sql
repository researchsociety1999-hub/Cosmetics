-- seed-categories.sql
-- Sprint 2: Seed category rows for the shop filter.
-- Assumes a categories table. Create it if it doesn't exist.

CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO categories (name, slug, description, sort_order)
VALUES
  ('All',        'all',        'Browse all products',                    0),
  ('Serums',     'serums',     'Targeted treatments and active serums',  1),
  ('Moisturisers', 'moisturisers', 'Hydration and barrier support',      2),
  ('Cleansers',  'cleansers',  'Gentle daily cleansing',                 3),
  ('Eye Care',   'eye-care',   'Targeted eye treatments',                4),
  ('Sets',       'sets',       'Curated product bundles',                5)
ON CONFLICT (slug) DO NOTHING;

-- Confirm
SELECT * FROM categories ORDER BY sort_order;
