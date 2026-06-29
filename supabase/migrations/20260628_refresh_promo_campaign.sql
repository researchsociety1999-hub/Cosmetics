-- ============================================================
-- MIGRATION: refresh_promo_campaign
-- Applied: 2026-06-28
-- Fix: The spring-glow promo campaign expired 2026-03-31.
--      Replace with a current summer campaign valid through
--      end of Q3 2026. Also seeds categories, products,
--      variants, and ingredients so the catalog is non-empty.
--
-- Column sources (types.ts):
--   PromoCampaign  : id, name, description, start_date, end_date, discount_percentage
--   Category       : id, name, slug, image_url
--   Product        : id, name, description, price_cents, sale_price_cents,
--                    image_url, extra_images, slug, category_id, sku,
--                    stock, in_stock, is_published,
--                    key_ingredients, benefits, routine_step, skin_types,
--                    volume_size_label, created_at, updated_at
--   ProductVariant : id, product_id, variant_name, price_cents, price, stock, sku
--   Ingredient     : id, name, description, benefits, source
-- ============================================================

-- -------------------------------------------------------
-- 1. Refresh promo campaign
-- -------------------------------------------------------
DELETE FROM public.promo_campaigns WHERE id = 'spring-glow';

INSERT INTO public.promo_campaigns
  (id, name, description, start_date, end_date, discount_percentage)
VALUES
  (
    'summer-ritual-2026',
    'Summer Ritual Event',
    'Free U.S. shipping over $75 and selected rituals up to 15% off.',
    '2026-06-01T00:00:00.000Z',
    '2026-09-30T23:59:59.000Z',
    15
  )
ON CONFLICT (id) DO UPDATE SET
  name                = EXCLUDED.name,
  description         = EXCLUDED.description,
  start_date          = EXCLUDED.start_date,
  end_date            = EXCLUDED.end_date,
  discount_percentage = EXCLUDED.discount_percentage;

-- -------------------------------------------------------
-- 2. Seed categories
-- -------------------------------------------------------
INSERT INTO public.categories (id, name, slug, image_url) VALUES
  (1, 'Serums',       'serums',       NULL),
  (2, 'Cleansers',    'cleansers',    NULL),
  (3, 'Masks',        'masks',        NULL),
  (4, 'Moisturizers', 'moisturizers', NULL),
  (5, 'Protect',      'protect',      NULL)
ON CONFLICT (id) DO UPDATE SET
  name      = EXCLUDED.name,
  slug      = EXCLUDED.slug,
  image_url = EXCLUDED.image_url;

-- -------------------------------------------------------
-- 3. Seed products
--    Columns match Product interface exactly.
--    extra_images and array fields cast to text[].
--    coming_soon omitted (defaults to NULL / false).
-- -------------------------------------------------------
INSERT INTO public.products (
  id, name, description,
  price_cents, sale_price_cents,
  image_url, extra_images,
  slug, category_id, sku,
  stock, in_stock, is_published,
  key_ingredients, benefits, routine_step, skin_types,
  volume_size_label,
  created_at, updated_at
) VALUES
  (
    1,
    'Celestial Glow Serum',
    'A luminous treatment serum with niacinamide and hyaluronic support—layer-friendly, with a finish that reads soft, even, and well hydrated.',
    6800, 5800,
    NULL, ARRAY[]::text[],
    'celestial-glow-serum', 1, 'MYS-SER-001',
    24, true, true,
    ARRAY['Niacinamide','Peptide blend','Hyaluronic acid'],
    ARRAY['Glow support','Barrier comfort','Plump finish'],
    'treat',
    ARRAY['Dry','Combination','Dull'],
    '30 ml · glass dropper',
    NOW(), NOW()
  ),
  (
    2,
    'Moon Veil Cleanser',
    'A cloud-soft gel cleanser designed for the first ritual step, removing makeup and SPF while leaving skin cushioned.',
    4200, NULL,
    NULL, ARRAY[]::text[],
    'moon-veil-cleanser', 2, 'MYS-CLN-002',
    41, true, true,
    ARRAY['Centella asiatica','Panthenol','Green tea'],
    ARRAY['Comfort cleanse','Makeup removal','Soft finish'],
    'cleanse',
    ARRAY['Sensitive','Dry','Combination'],
    '150 ml · pump',
    NOW(), NOW()
  ),
  (
    3,
    'Golden Eclipse Mask',
    'A reset mask with enzymes and mineral clays for texture refinement, brightness, and a polished post-facial feel.',
    5400, NULL,
    NULL, ARRAY[]::text[],
    'golden-eclipse-mask', 3, 'MYS-MSK-003',
    18, true, true,
    ARRAY['Rice enzymes','Kaolin','Centella asiatica'],
    ARRAY['Texture refinement','Glow reset','Soft-focus finish'],
    'treat',
    ARRAY['Combination','Oily','Dull'],
    '75 ml · jar',
    NOW(), NOW()
  ),
  (
    4,
    'Noir Velvet Emulsion',
    'A featherlight moisturizer with peptides and ceramides that leaves skin cocooned, smooth, and softly reflective.',
    5800, NULL,
    NULL, ARRAY[]::text[],
    'noir-velvet-emulsion', 4, 'MYS-MOI-004',
    12, true, true,
    ARRAY['Peptides','Ceramides','Squalane'],
    ARRAY['Moisture seal','Bounce','Silky finish'],
    'moisturize',
    ARRAY['Dry','Combination','Normal'],
    '50 ml · airless pump',
    NOW(), NOW()
  ),
  (
    5,
    'Bloom Screen Essence SPF',
    'A dewy final-step protector with niacinamide and hyaluronic support, designed for luminous daily wear.',
    7200, 6400,
    NULL, ARRAY[]::text[],
    'bloom-screen-essence-spf', 5, 'MYS-SPF-005',
    30, true, true,
    ARRAY['UV filters','Niacinamide','Hyaluronic acid'],
    ARRAY['Daily protection','Glow support','Hydration veil'],
    'protect',
    ARRAY['All skin types'],
    NULL,
    NOW(), NOW()
  ),
  (
    6,
    'Midnight Recovery Ampoule',
    'A concentrated evening ampoule with peptides and calming support actives—rich texture for overnight comfort and a smooth morning feel.',
    9200, 8400,
    NULL, ARRAY[]::text[],
    'midnight-recovery-ampoule', 1, 'MYS-AMP-006',
    20, true, true,
    ARRAY['Peptide complex','Copper peptide','Ectoin'],
    ARRAY['Night renewal','Bounce','Lush texture'],
    'treat',
    ARRAY['Dry','Mature','Combination'],
    '7 × 2 ml vials',
    NOW(), NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  name              = EXCLUDED.name,
  description       = EXCLUDED.description,
  price_cents       = EXCLUDED.price_cents,
  sale_price_cents  = EXCLUDED.sale_price_cents,
  slug              = EXCLUDED.slug,
  category_id       = EXCLUDED.category_id,
  sku               = EXCLUDED.sku,
  stock             = EXCLUDED.stock,
  in_stock          = EXCLUDED.in_stock,
  is_published      = EXCLUDED.is_published,
  key_ingredients   = EXCLUDED.key_ingredients,
  benefits          = EXCLUDED.benefits,
  routine_step      = EXCLUDED.routine_step,
  skin_types        = EXCLUDED.skin_types,
  volume_size_label = EXCLUDED.volume_size_label,
  updated_at        = NOW();

-- -------------------------------------------------------
-- 4. Seed product variants
--    Columns: id, product_id, variant_name, price_cents, price, stock, sku
--    price (legacy float column) kept as NULL — price_cents is canonical.
-- -------------------------------------------------------
INSERT INTO public.product_variants
  (id, product_id, variant_name, price_cents, price, stock, sku)
VALUES
  (501, 5, 'Universal sheer',    NULL, NULL, 22, 'MYS-SPF-005-U'),
  (502, 5, 'Glow tint — light',  NULL, NULL, 14, 'MYS-SPF-005-L'),
  (503, 5, 'Glow tint — medium', NULL, NULL,  8, 'MYS-SPF-005-M'),
  (601, 6, 'Standard',           NULL, NULL, 20, 'MYS-AMP-006-STD'),
  (602, 6, 'Intensive',          9800, NULL,  6, 'MYS-AMP-006-INT')
ON CONFLICT (id) DO UPDATE SET
  variant_name = EXCLUDED.variant_name,
  price_cents  = EXCLUDED.price_cents,
  stock        = EXCLUDED.stock,
  sku          = EXCLUDED.sku;

-- -------------------------------------------------------
-- 5. Seed canonical ingredients
--    Columns: id (text PK), name, description, benefits, source
--    imageSrc / imagePresentation are app-only fields, not DB columns.
-- -------------------------------------------------------
INSERT INTO public.ingredients (id, name, description, benefits, source) VALUES
  ('niacinamide',
   'Niacinamide',
   'A multi-tasking vitamin we use for clarity, refined texture, and barrier-friendly polish in daily rituals.',
   'Brightness, clarity, barrier support',
   'Vitamin B3'),
  ('hyaluronic-acid',
   'Hyaluronic Acid',
   'A humectant network that draws and holds water so skin reads supple, dewy, and comfortable under layers.',
   'Hydration, bounce, smoothness',
   'Humectant'),
  ('centella-asiatica',
   'Centella Asiatica',
   'A calming botanical we lean on when skin needs quiet recovery—comfort-first, never harsh.',
   'Soothing, recovery, softness',
   'Leaf extract'),
  ('ceramides',
   'Ceramides',
   'Skin-identical lipids that help reinforce the barrier so moisture stays in and stress stays out.',
   'Barrier comfort, moisture retention, resilience',
   'Skin-identical lipid'),
  ('squalane',
   'Squalane',
   'A weightless emollient that seals without slipperiness—silk at the surface, breathable underneath.',
   'Silky slip, soft finish, weightless seal',
   'Emollient')
ON CONFLICT (id) DO UPDATE SET
  name        = EXCLUDED.name,
  description = EXCLUDED.description,
  benefits    = EXCLUDED.benefits,
  source      = EXCLUDED.source;
