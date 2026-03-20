import type {
  Category,
  Ingredient,
  JournalEntry,
  PressMention,
  Product,
  PromoCampaign,
  Review,
} from "./types";

const now = new Date();
const fallbackProductImage =
  "https://placehold.co/600x800/1a1a1a/c9a84c?text=Mystique";

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
    image_url: fallbackProductImage,
    extra_images: [
      fallbackProductImage,
      fallbackProductImage,
    ],
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
  },
  {
    id: 2,
    name: "Moon Veil Cleanser",
    description:
      "A cloud-soft gel cleanser designed for the first ritual step, removing makeup and SPF while leaving skin cushioned.",
    price_cents: 4200,
    sale_price_cents: null,
    image_url: fallbackProductImage,
    extra_images: [
      fallbackProductImage,
    ],
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
  },
  {
    id: 3,
    name: "Golden Eclipse Mask",
    description:
      "A reset mask with enzymes and mineral clays for texture refinement, brightness, and a polished post-facial feel.",
    price_cents: 5400,
    sale_price_cents: null,
    image_url: fallbackProductImage,
    extra_images: [
      fallbackProductImage,
    ],
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
  },
  {
    id: 4,
    name: "Noir Velvet Emulsion",
    description:
      "A featherlight moisturizer with peptides and ceramides that leaves skin cocooned, smooth, and softly reflective.",
    price_cents: 5800,
    sale_price_cents: null,
    image_url: fallbackProductImage,
    extra_images: [
      fallbackProductImage,
    ],
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
  },
  {
    id: 5,
    name: "Bloom Screen Essence SPF",
    description:
      "A dewy final-step protector with niacinamide and hyaluronic support, designed for luminous daily wear.",
    price_cents: 7200,
    sale_price_cents: 6400,
    image_url: fallbackProductImage,
    extra_images: [
      fallbackProductImage,
    ],
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
    image_url: fallbackProductImage,
    extra_images: [
      fallbackProductImage,
    ],
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
  },
];

export const mockIngredients: Ingredient[] = [
  {
    id: "pdrn",
    name: "PDRN-inspired renewal",
    description:
      "Used in the Mystique story as a cue for next-generation skin recovery and glow support.",
    benefits: "Bounce, rested look, renewal-minded ritual copy",
    source: "Biotech-inspired",
  },
  {
    id: "peptides",
    name: "Peptides",
    description:
      "Signal-support ingredients chosen for smoother, more resilient-looking skin over time.",
    benefits: "Firm-feel support, softness, bounce",
    source: "Lab-crafted",
  },
  {
    id: "centella-asiatica",
    name: "Centella Asiatica",
    description:
      "A calming botanical prized in K-beauty routines for comfort and post-stress softness.",
    benefits: "Soothing, redness support, recovery",
    source: "Leaf extract",
  },
  {
    id: "hyaluronic-acid",
    name: "Hyaluronic acid",
    description:
      "A hydration anchor that helps skin appear supple, dewy, and bloom-finished.",
    benefits: "Hydration, plumpness, smoothness",
    source: "Humectant",
  },
  {
    id: "niacinamide",
    name: "Niacinamide",
    description:
      "A staple active for clarity, tone balance, and a polished visible finish.",
    benefits: "Brightness, barrier support, refined texture",
    source: "Vitamin B3",
  },
];

export const mockPressMentions: PressMention[] = [
  {
    id: "press-vogue",
    title: "Mystique turns the evening routine into cinematic ritual",
    source: "Vogue Beauty Edit",
    quote:
      "The line feels luxurious, modern, and unusually coherent in both product story and visual language.",
    link: "https://example.com/press/vogue-beauty-edit",
    published_at: "2026-02-12T00:00:00.000Z",
  },
  {
    id: "press-allure",
    title: "A California-born K-beauty label with a dark-luxe point of view",
    source: "Allure Roundup",
    quote:
      "Mystique leans into bloom skin, plush textures, and regenerative-science storytelling without losing elegance.",
    link: "https://example.com/press/allure-roundup",
    published_at: "2026-01-28T00:00:00.000Z",
  },
];

export const mockPromoCampaign: PromoCampaign = {
  id: "spring-glow",
  name: "Spring glow event",
  description: "Free U.S. shipping over $75 and selected rituals up to 15% off.",
  start_date: "2026-03-01T00:00:00.000Z",
  end_date: "2026-03-31T23:59:59.000Z",
  discount_percentage: 15,
};

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
      "Mystique feels editorial and ritualistic without becoming impractical. It’s polished in the best way.",
  },
];

export const mockFaqs = [
  {
    question: "How long does shipping take?",
    answer: "Most U.S. orders arrive within 3 to 5 business days. [REPLACE LATER]",
  },
  {
    question: "What is your returns policy?",
    answer: "Returns are accepted within 30 days on eligible unopened items. [REPLACE LATER]",
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
  },
  {
    slug: "pdrn-101",
    title: "PDRN 101: Why Regenerative Storytelling Is Everywhere",
    excerpt:
      "A grounded primer on the language behind modern skin-renewal categories.",
    category: "Science",
    readTime: "5 min read",
  },
  {
    slug: "bloom-skin-guide",
    title: "The Bloom Skin Guide",
    excerpt:
      "How to build a routine that looks hydrated, refined, and softly radiant rather than shiny.",
    category: "Glow",
    readTime: "6 min read",
  },
  {
    slug: "layering-essence-serum",
    title: "How to Layer Essence, Serum, and Cream",
    excerpt:
      "The easiest way to stack hydration and treatment without overwhelming the skin.",
    category: "Routine",
    readTime: "3 min read",
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
