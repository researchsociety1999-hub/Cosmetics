-- add-volume-size-label-migration.sql
-- Adds volume_size_label column to products table for PDP display.
-- Safe to run multiple times (uses IF NOT EXISTS pattern via DO block).

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products'
      AND column_name = 'volume_size_label'
  ) THEN
    ALTER TABLE products ADD COLUMN volume_size_label TEXT;
    COMMENT ON COLUMN products.volume_size_label IS 'Human-readable size label shown on PDP, e.g. "30ml", "1 fl oz", "Full Size"';
  END IF;
END $$;

-- After running, populate your existing products:
-- UPDATE products SET volume_size_label = '30ml' WHERE slug = 'your-product-slug';

-- Verify
SELECT id, name, volume_size_label FROM products ORDER BY name;
