-- ============================================================
-- MIGRATION: refresh_promo_campaign
-- Applied: 2026-06-28
-- Fix: The spring-glow promo campaign expired 2026-03-31.
--      Replace with a current summer campaign valid through
--      end of Q3 2026. Also seeds categories + products so
--      Stripe checkout functions without mock data.
-- ============================================================

-- -------------------------------------------------------
-- 1. Refresh promo campaign
-- -------------------------------------------------------
DELETE FROM public.promo_campaigns WHERE id = 'spring-glow';

INSERT INTO public.promo_campaigns (id, name, description, start_date, end_date, discount_percentage)
VALUES (
  'summer-ritual-2026',
  'Summer Ritual Event',
  'Free U.S. shipping over $75 and selected rituals up to 15% off.',
  '2026-06-01T00:00:00.000Z',
  '2026-09-30T23:59:59.000Z',
  15
)
ON CONFLICT (id) DO UPDATE SET
  name               = EXCLUDED.name,
  description        = EXCLUDED.description,
  start_date         = EXCLUDED.start_date,
  end_date           = EXCLUDED.end_date,
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
-- -------------------------------------------------------
INSERT INTO public.products (
  id, name, description, price_cents, sale_price_cents,
  image_url, extra_images, slug, category_id, sku,
  stock, in_stock, is_published,
  key_ingredients, benefits, routine_step, skin_types, volume_size_label
) VALUES
  (
    1,
    'Celestial Glow Serum',
    'A luminous treatment serum with niacinamide and hyaluronic support—layer-friendly, with a finish that reads soft, even, and well hydrated.',
    6800, 5800, NULL, '{}',
    'celestial-glow-serum', 1, 'MYS-SER-001',
    24, true, true,
    ARRAY['Niacinamide','Peptide blend','Hyaluronic acid'],
    ARRAY['Glow support','Barrier comfort','Plump finish'],
    'Treat', ARRAY['Dry','Combination','Dull'],
    '30 ml · glass dropper'
  ),
  (
    2,
    'Moon Veil Cleanser',
    'A cloud-soft gel cleanser designed for the first ritual step, removing makeup and SPF while leaving skin cushioned.',
    4200, NULL, NULL, '{}',
    'moon-veil-cleanser', 2, 'MYS-CLN-002',
    41, true, true,
    ARRAY['Centella asiatica','Panthenol','Green tea'],
    ARRAY['Comfort cleanse','Makeup removal','Soft finish'],
    'Cleanse', ARRAY['Sensitive','Dry','Combination'],
    '150 ml · pump'
  ),
  (
    3,
    'Golden Eclipse Mask',
    'A reset mask with enzymes and mineral clays for texture refinement, brightness, and a polished post-facial feel.',
    5400, NULL, NULL, '{}',
    'golden-eclipse-mask', 3, 'MYS-MSK-003',
    18, true, true,
    ARRAY['Rice enzymes','Kaolin','Centella asiatica'],
    ARRAY['Texture refinement','Glow reset','Soft-focus finish'],
    'Treat', ARRAY['Combination','Oily','Dull'],
    '75 ml · jar'
  ),
  (
    4,
    'Noir Velvet Emulsion',
    'A featherlight moisturizer with peptides and ceramides that leaves skin cocooned, smooth, and softly reflective.',
    5800, NULL, NULL, '{}',
    'noir-velvet-emulsion', 4, 'MYS-MOI-004',
    12, true, true,
    ARRAY['Peptides','Ceramides','Squalane'],
    ARRAY['Moisture seal','Bounce','Silky finish'],
    'Moisturize', ARRAY['Dry','Combination','Normal'],
    '50 ml · airless pump'
  ),
  (
    5,
    'Bloom Screen Essence SPF',
    'A dewy final-step protector with niacinamide and hyaluronic support, designed for luminous daily wear.',
    7200, 6400, NULL, '{}',
    'bloom-screen-essence-spf', 5, 'MYS-SPF-005',
    30, true, true,
    ARRAY['UV filters','Niacinamide','Hyaluronic acid'],
    ARRAY['Daily protection','Glow support','Hydration veil'],
    'Protect', ARRAY['All skin types'],
    NULL
  ),
  (
    6,
    'Midnight Recovery Ampoule',
    'A concentrated evening ampoule with peptides and calming support actives—rich texture for overnight comfort and a smooth morning feel.',
    9200, 8400, NULL, '{}',
    'midnight-recovery-ampoule', 1, 'MYS-AMP-006',
    9, true, true,
    ARRAY['Peptide complex','Copper peptide','Ectoin'],
    ARRAY['Night renewal','Bounce','Lush texture'],
    'Treat', ARRAY['Dry','Mature','Combination'],
    '7 × 2 ml vials'
  )
ON CONFLICT (id) DO UPDATE SET
  name               = EXCLUDED.name,
  description        = EXCLUDED.description,
  price_cents        = EXCLUDED.price_cents,
  sale_price_cents   = EXCLUDED.sale_price_cents,
  slug               = EXCLUDED.slug,
  category_id        = EXCLUDED.category_id,
  sku                = EXCLUDED.sku,
  stock              = EXCLUDED.stock,
  in_stock           = EXCLUDED.in_stock,
  is_published       = EXCLUDED.is_published,
  key_ingredients    = EXCLUDED.key_ingredients,
  benefits           = EXCLUDED.benefits,
  routine_step       = EXCLUDED.routine_step,
  skin_types         = EXCLUDED.skin_types,
  volume_size_label  = EXCLUDED.volume_size_label;

-- -------------------------------------------------------
-- 4. Seed product variants
-- -------------------------------------------------------
INSERT INTO public.product_variants (id, product_id, variant_name, price_cents, stock, sku) VALUES
  -- Bloom Screen Essence SPF (product 5)
  (501, 5, 'Universal sheer',     NULL, 22, 'MYS-SPF-005-U'),
  (502, 5, 'Glow tint — light',   NULL, 14, 'MYS-SPF-005-L'),
  (503, 5, 'Glow tint — medium',  NULL,  0, 'MYS-SPF-005-M'),
  -- Midnight Recovery Ampoule (product 6)
  (601, 6, 'Standard',            NULL, 20, 'MYS-AMP-006-STD'),
  (602, 6, 'Intensive',           9800,  6, 'MYS-AMP-006-INT')
ON CONFLICT (id) DO UPDATE SET
  variant_name = EXCLUDED.variant_name,
  price_cents  = EXCLUDED.price_cents,
  stock        = EXCLUDED.stock,
  sku          = EXCLUDED.sku;

-- -------------------------------------------------------
-- 5. Seed canonical ingredients
-- -------------------------------------------------------
INSERT INTO public.ingredients (id, name, description, benefits, source) VALUES
  ('niacinamide',      'Niacinamide',       'A multi-tasking vitamin we use for clarity, refined texture, and barrier-friendly polish in daily rituals.',                  'Brightness, clarity, barrier support',            'Vitamin B3'),
  ('hyaluronic-acid',  'Hyaluronic Acid',   'A humectant network that draws and holds water so skin reads supple, dewy, and comfortable under layers.',                    'Hydration, bounce, smoothness',                   'Humectant'),
  ('centella-asiatica','Centella Asiatica',  'A calming botanical we lean on when skin needs quiet recovery—comfort-first, never harsh.',                                   'Soothing, recovery, softness',                    'Leaf extract'),
  ('ceramides',        'Ceramides',          'Skin-identical lipids that help reinforce the barrier so moisture stays in and stress stays out.',                             'Barrier comfort, moisture retention, resilience',  'Skin-identical lipid'),
  ('squalane',         'Squalane',           'A weightless emollient that seals without slipperiness—silk at the surface, breathable underneath.',                          'Silky slip, soft finish, weightless seal',         'Emollient')
ON CONFLICT (id) DO UPDATE SET
  name        = EXCLUDED.name,
  description = EXCLUDED.description,
  benefits    = EXCLUDED.benefits,
  source      = EXCLUDED.source;
