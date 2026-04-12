import type {
  Category,
  Ingredient,
  JournalEntry,
  PressMention,
  Product,
  ProductVariant,
  PromoCampaign,
  Review,
} from "./types";

const now = new Date();

/**
 * Demo catalog when `ALLOW_MOCK_CATALOG=1`. Product imagery is intentionally unset so the UI
 * exercises the branded in-app placeholder. In production, set `products.image_url` to a full
 * HTTPS URL (e.g. Supabase Storage public object URL) or a site-relative path under `public/`.
 */
export const mockCategories: Category[] = [
  { id: 1, name: "Serums", slug: "serums", image_url: null },
  { id: 2, name: "Cleansers", slug: "cleansers", image_url: null },
  { id: 3, name: "Masks", slug: "masks", image_url: null },
  { id: 4, name: "Moisturizers", slug: "moisturizers", image_url: null },
  { id: 5, name: "Protect", slug: "protect", image_url: null },
];

export const mockProducts: Product[] = [
  {
    id: 1,
    name: "Celestial Glow Serum",
    description:
      "A luminous treatment serum that layers niacinamide, PDRN-inspired regeneration messaging, and hydration for bloom-skin radiance.",
    price_cents: 6800,
    sale_price_cents: 5800,
    image_url: null,
    extra_images: [],
    slug: "celestial-glow-serum",
    category_id: 1,
    sku: "MYS-SER-001",
    stock: 24,
    in_stock: true,
    is_published: true,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    key_ingredients: ["Niacinamide", "PDRN-inspired complex", "Hyaluronic acid"],
    benefits: ["Glow support", "Barrier comfort", "Plump finish"],
    routine_step: "Treat",
    skin_types: ["Dry", "Combination", "Dull"],
    volume_size_label: "30 ml · glass dropper",
  },
  {
    id: 2,
    name: "Moon Veil Cleanser",
    description:
      "A cloud-soft gel cleanser designed for the first ritual step, removing makeup and SPF while leaving skin cushioned.",
    price_cents: 4200,
    sale_price_cents: null,
    image_url: null,
    extra_images: [],
    slug: "moon-veil-cleanser",
    category_id: 2,
    sku: "MYS-CLN-002",
    stock: 41,
    in_stock: true,
    is_published: true,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    key_ingredients: ["Centella asiatica", "Panthenol", "Green tea"],
    benefits: ["Comfort cleanse", "Makeup removal", "Soft finish"],
    routine_step: "Cleanse",
    skin_types: ["Sensitive", "Dry", "Combination"],
    volume_size_label: "150 ml · pump",
  },
  {
    id: 3,
    name: "Golden Eclipse Mask",
    description:
      "A reset mask with enzymes and mineral clays for texture refinement, brightness, and a polished post-facial feel.",
    price_cents: 5400,
    sale_price_cents: null,
    image_url: null,
    extra_images: [],
    slug: "golden-eclipse-mask",
    category_id: 3,
    sku: "MYS-MSK-003",
    stock: 18,
    in_stock: true,
    is_published: true,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    key_ingredients: ["Rice enzymes", "Kaolin", "Centella asiatica"],
    benefits: ["Texture refinement", "Glow reset", "Soft-focus finish"],
    routine_step: "Treat",
    skin_types: ["Combination", "Oily", "Dull"],
    volume_size_label: "75 ml · jar",
  },
  {
    id: 4,
    name: "Noir Velvet Emulsion",
    description:
      "A featherlight moisturizer with peptides and ceramides that leaves skin cocooned, smooth, and softly reflective.",
    price_cents: 5800,
    sale_price_cents: null,
    image_url: null,
    extra_images: [],
    slug: "noir-velvet-emulsion",
    category_id: 4,
    sku: "MYS-MOI-004",
    stock: 12,
    in_stock: true,
    is_published: true,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    key_ingredients: ["Peptides", "Ceramides", "Squalane"],
    benefits: ["Moisture seal", "Bounce", "Silky finish"],
    routine_step: "Moisturize",
    skin_types: ["Dry", "Combination", "Normal"],
    volume_size_label: "50 ml · airless pump",
  },
  {
    id: 5,
    name: "Bloom Screen Essence SPF",
    description:
      "A dewy final-step protector with niacinamide and hyaluronic support, designed for luminous daily wear.",
    price_cents: 7200,
    sale_price_cents: 6400,
    image_url: null,
    extra_images: [],
    slug: "bloom-screen-essence-spf",
    category_id: 5,
    sku: "MYS-SPF-005",
    stock: 30,
    in_stock: true,
    is_published: true,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    key_ingredients: ["UV filters", "Niacinamide", "Hyaluronic acid"],
    benefits: ["Daily protection", "Glow support", "Hydration veil"],
    routine_step: "Protect",
    skin_types: ["All skin types"],
  },
  {
    id: 6,
    name: "Midnight Recovery Ampoule",
    description:
      "A concentrated evening ampoule inspired by regenerative aesthetics, built around peptides and exosome-inspired storytelling.",
    price_cents: 9200,
    sale_price_cents: 8400,
    image_url: null,
    extra_images: [],
    slug: "midnight-recovery-ampoule",
    category_id: 1,
    sku: "MYS-AMP-006",
    stock: 9,
    in_stock: true,
    is_published: true,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    key_ingredients: ["Exosome-inspired complex", "Copper peptide", "Ectoin"],
    benefits: ["Night renewal", "Bounce", "Lush texture"],
    routine_step: "Treat",
    skin_types: ["Dry", "Mature", "Combination"],
    volume_size_label: "7 × 2 ml vials",
  },
];

/** Demo variants when Supabase is off — e.g. Bloom Screen SPF (id 5) shade-style options */
export const mockProductVariants: ProductVariant[] = [
  {
    id: 501,
    product_id: 5,
    variant_name: "Universal sheer",
    price_cents: null,
    price: null,
    stock: 22,
    sku: "MYS-SPF-005-U",
  },
  {
    id: 502,
    product_id: 5,
    variant_name: "Glow tint — light",
    price_cents: null,
    price: null,
    stock: 14,
    sku: "MYS-SPF-005-L",
  },
  {
    id: 503,
    product_id: 5,
    variant_name: "Glow tint — medium",
    price_cents: null,
    price: null,
    stock: 0,
    sku: "MYS-SPF-005-M",
  },
  {
    id: 601,
    product_id: 6,
    variant_name: "Standard",
    price_cents: null,
    price: null,
    stock: 20,
    sku: "MYS-AMP-006-STD",
  },
  {
    id: 602,
    product_id: 6,
    variant_name: "Intensive",
    price_cents: 9800,
    price: null,
    stock: 6,
    sku: "MYS-AMP-006-INT",
  },
];

/**
 * Canonical spotlight actives—same order and ids for `/`, `/ingredients`, and `getIngredients`
 * merge (Supabase rows override copy when `id` matches).
 */
export const MYSTIQUE_CANONICAL_INGREDIENTS: Ingredient[] = [
  {
    id: "niacinamide",
    name: "Niacinamide",
    description:
      "A multi-tasking vitamin we use for clarity, refined texture, and barrier-friendly polish in daily rituals.",
    benefits: "Brightness, clarity, barrier support",
    source: "Vitamin B3",
  },
  {
    id: "hyaluronic-acid",
    name: "Hyaluronic Acid",
    description:
      "A humectant network that draws and holds water so skin reads supple, dewy, and comfortable under layers.",
    benefits: "Hydration, bounce, smoothness",
    source: "Humectant",
  },
  {
    id: "centella-asiatica",
    name: "Centella Asiatica",
    description:
      "A calming botanical we lean on when skin needs quiet recovery—comfort-first, never harsh.",
    benefits: "Soothing, recovery, softness",
    source: "Leaf extract",
  },
  {
    id: "ceramides",
    name: "Ceramides",
    description:
      "Skin-identical lipids that help reinforce the barrier so moisture stays in and stress stays out.",
    benefits: "Barrier comfort, moisture retention, resilience",
    source: "Skin-identical lipid",
  },
  {
    id: "squalane",
    name: "Squalane",
    description:
      "A weightless emollient that seals without slipperiness—silk at the surface, breathable underneath.",
    benefits: "Silky slip, soft finish, weightless seal",
    source: "Emollient",
  },
];

/** @deprecated Use MYSTIQUE_CANONICAL_INGREDIENTS — kept as alias for imports. */
export const mockIngredients: Ingredient[] = MYSTIQUE_CANONICAL_INGREDIENTS;

export function mergeMystiqueCanonicalIngredients(
  fromDb: Ingredient[],
): Ingredient[] {
  const canonicalIds = new Set(
    MYSTIQUE_CANONICAL_INGREDIENTS.map((row) => row.id),
  );
  const byId = new Map(fromDb.map((row) => [row.id, row]));
  const ordered = MYSTIQUE_CANONICAL_INGREDIENTS.map(
    (canonical) => byId.get(canonical.id) ?? canonical,
  );
  const extras = fromDb
    .filter((row) => !canonicalIds.has(row.id))
    .sort((a, b) => a.name.localeCompare(b.name));
  return [...ordered, ...extras];
}

/**
 * Reserved for fixtures; the live Press page loads only from Supabase `press_mentions`.
 * Do not add fictional outlets or example.com URLs here—empty is better than false proof.
 */
export const mockPressMentions: PressMention[] = [];

export const mockPromoCampaign: PromoCampaign = {
  id: "spring-glow",
  name: "Spring glow event",
  description: "Free U.S. shipping over $75 and selected rituals up to 15% off.",
  start_date: "2026-03-01T00:00:00.000Z",
  end_date: "2026-03-31T23:59:59.000Z",
  discount_percentage: 15,
};

/** Not used on the homepage (intentionally—avoid fabricated social proof). */
export const mockTestimonials = [
  {
    name: "Ava K.",
    title: "Night ritual devotee",
    quote:
      "My skin looks rested, plush, and expensive by morning. The textures alone feel like a full ritual.",
  },
  {
    name: "Lena S.",
    title: "Combination skin",
    quote:
      "Everything layers beautifully. Nothing pills, and the finish is exactly that bloom-skin look I wanted.",
  },
  {
    name: "Mia R.",
    title: "Sensitive skin focus",
    quote:
      "The cleanser and centella-led formulas make my routine feel calm, not corrective.",
  },
  {
    name: "Sophie T.",
    title: "Luxury beauty collector",
    quote:
      "Mystique feels editorial and ritualistic without becoming impractical. It's polished in the best way.",
  },
];

export const mockFaqs = [
  {
    question: "What does U.S. shipping cost?",
    answer:
      "Shipping rates follow the same rules shown at checkout: standard U.S. delivery is complimentary on qualifying orders, with a flat rate below that threshold.",
  },
  {
    question: "How long does shipping take?",
    answer: "Most U.S. orders arrive within 3 to 5 business days with tracking sent as soon as your order ships.",
  },
  {
    question: "What is your returns policy?",
    answer: "Returns are accepted within 30 days on eligible unopened items in their original condition.",
  },
  {
    question: "How should I layer the ritual?",
    answer: "Cleanse, tone, treat, moisturize, then protect in the morning.",
  },
  {
    question: "Which formulas suit sensitive skin?",
    answer: "Look for centella, peptides, and hydration-focused textures. Patch testing is always recommended.",
  },
];

export const mockJournalEntries: JournalEntry[] = [
  {
    slug: "evening-ritual",
    title: "The Evening Ritual for Bloom Skin",
    excerpt:
      "A five-step sequence for cleansing away the day and waking up visibly luminous.",
    category: "Ritual",
    readTime: "4 min read",
    content: [
      {
        heading: "Start with a full cleanse",
        paragraphs: [
          "Evening skin usually carries sunscreen, makeup, excess oil, and the residue of a long day. Begin with a cleanser that lifts everything away without leaving the face tight or squeaky.",
          "Massage for a full minute, especially around the nose, chin, and hairline, then rinse with lukewarm water. The goal is clean skin that still feels comfortable.",
        ],
      },
      {
        heading: "Layer hydration before treatment",
        paragraphs: [
          "After cleansing, move straight into your first hydrating layer while the skin is still slightly damp. This helps the routine feel plush instead of heavy.",
          "A light essence or watery serum creates slip, supports the barrier, and makes stronger treatment steps feel more balanced.",
        ],
      },
      {
        heading: "Use treatment where it matters most",
        paragraphs: [
          "Evening is a strong time for targeted serums and ampoules. Focus on formulas that support tone, texture, brightness, and overnight comfort.",
          "Apply from the center of the face outward, then press what remains into the neck so the finish looks consistent and intentional.",
        ],
      },
      {
        heading: "Seal the routine with comfort",
        paragraphs: [
          "Finish with a moisturizer that locks in water and leaves the skin looking calm, not overloaded. This final layer is what gives bloom skin its smooth, rested finish by morning.",
          "If skin is especially dry, add a little more around the cheeks and along the jaw before bed.",
        ],
      },
    ],
  },
  {
    slug: "pdrn-101",
    title: "PDRN 101: Why Regenerative Storytelling Is Everywhere",
    excerpt:
      "A grounded primer on the language behind modern skin-renewal categories.",
    category: "Science",
    readTime: "5 min read",
    content: [
      {
        heading: "Why the term shows up so often",
        paragraphs: [
          "PDRN appears in modern skincare conversations because brands are leaning into repair-minded, regeneration-adjacent language. It signals a category centered on recovery, bounce, and skin that looks well-rested.",
          "For most shoppers, the important takeaway is not the buzzword itself, but what the formula is trying to achieve in the routine.",
        ],
      },
      {
        heading: "What to look for in practice",
        paragraphs: [
          "When you see this kind of storytelling, look at the rest of the formula. Supportive ingredients like peptides, humectants, and calming actives usually tell you more about the day-to-day experience than the headline alone.",
          "A good regenerative-style serum should still fit comfortably into the rest of your routine and leave skin feeling smoother, softer, and less stressed.",
        ],
      },
      {
        heading: "How Mystique frames it",
        paragraphs: [
          "Mystique uses this language as part of a glow-and-recovery ritual story rather than as a promise of dramatic overnight transformation.",
          "That keeps the tone aspirational while staying focused on texture, comfort, and visible polish.",
        ],
      },
    ],
  },
  {
    slug: "bloom-skin-guide",
    title: "The Bloom Skin Guide",
    excerpt:
      "How to build a routine that looks hydrated, refined, and softly radiant rather than shiny.",
    category: "Glow",
    readTime: "6 min read",
    content: [
      {
        heading: "Bloom skin is glow with restraint",
        paragraphs: [
          "Bloom skin is not about looking wet or reflective everywhere. It is a softer finish that makes skin look hydrated, even, and quietly luminous.",
          "The easiest way to get there is by balancing water, barrier support, and a final layer that smooths rather than smothers.",
        ],
      },
      {
        heading: "Choose textures that layer cleanly",
        paragraphs: [
          "Stacking too many rich products can flatten the finish and make the face feel heavy. Start with lighter hydration, then move into one focused treatment, then seal everything with a moisturizer that feels elegant on the skin.",
          "If you wear makeup, bloom skin routines should sit well underneath base products instead of causing pilling or buildup.",
        ],
      },
      {
        heading: "Protect the finish in the morning",
        paragraphs: [
          "Sunscreen matters because it helps preserve the clarity and smoothness you are building. A good SPF should look luminous but still wearable every day.",
          "Think polished radiance, not shine for the sake of shine.",
        ],
      },
    ],
  },
  {
    slug: "layering-essence-serum",
    title: "How to Layer Essence, Serum, and Cream",
    excerpt:
      "The easiest way to stack hydration and treatment without overwhelming the skin.",
    category: "Routine",
    readTime: "3 min read",
    content: [
      {
        heading: "Go from thinnest to richest",
        paragraphs: [
          "The simplest rule is still the best one: start with the lightest texture and move toward the richest. Essence usually comes first, then serum, then cream.",
          "That order keeps each layer close to the skin and helps thicker formulas seal in the steps below them.",
        ],
      },
      {
        heading: "Give each layer a few seconds",
        paragraphs: [
          "You do not need long wait times, but it helps to let each layer settle for a few seconds before moving on. This reduces pilling and makes the routine feel more intentional.",
          "If a step still feels very wet, press it in instead of immediately adding the next product.",
        ],
      },
      {
        heading: "Adjust by skin condition",
        paragraphs: [
          "On oilier days, you may only need essence and serum. On drier nights, cream becomes the step that keeps everything feeling finished and comfortable.",
          "A good routine is flexible enough to match the day instead of forcing the same amount every time.",
        ],
      },
    ],
  },
];

export const mockReviews: Review[] = [
  {
    id: "review-1",
    product_id: 1,
    user_id: "guest-1",
    rating: 5,
    comment: "Velvety, glowy, and surprisingly elegant on combination skin.",
    created_at: now.toISOString(),
  },
  {
    id: "review-2",
    product_id: 1,
    user_id: "guest-2",
    rating: 4,
    comment: "Beautiful under moisturizer and gives that bloom finish by morning.",
    created_at: now.toISOString(),
  },
];
