import type {
  Category,
  Ingredient,
  PressMention,
  Product,
  PromoCampaign,
} from "./types";

const now = new Date();

export const mockCategories: Category[] = [
  {
    id: 1,
    name: "Serums",
    slug: "serums",
    image_url: null,
  },
  {
    id: 2,
    name: "Cleansers",
    slug: "cleansers",
    image_url: null,
  },
  {
    id: 3,
    name: "Masks",
    slug: "masks",
    image_url: null,
  },
  {
    id: 4,
    name: "Body Rituals",
    slug: "body-rituals",
    image_url: null,
  },
];

export const mockProducts: Product[] = [
  {
    id: 1,
    name: "Celestial Glow Serum",
    description:
      "A brightening serum with niacinamide, tremella mushroom, and vitamin C for a lucid, lit-from-within finish.",
    price_cents: 6800,
    sale_price_cents: 5800,
    image_url:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80",
    extra_images: null,
    slug: "celestial-glow-serum",
    category_id: 1,
    sku: "MYS-SER-001",
    stock: 24,
    in_stock: true,
    is_published: true,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  },
  {
    id: 2,
    name: "Moon Veil Cleanser",
    description:
      "A cushiony gel cleanser that lifts away makeup, SPF, and buildup without disturbing the skin barrier.",
    price_cents: 4200,
    sale_price_cents: null,
    image_url:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80",
    extra_images: null,
    slug: "moon-veil-cleanser",
    category_id: 2,
    sku: "MYS-CLN-002",
    stock: 41,
    in_stock: true,
    is_published: true,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  },
  {
    id: 3,
    name: "Golden Eclipse Mask",
    description:
      "A weekly reset mask with rice enzymes and clay to smooth texture while preserving softness and glow.",
    price_cents: 5400,
    sale_price_cents: null,
    image_url:
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80",
    extra_images: null,
    slug: "golden-eclipse-mask",
    category_id: 3,
    sku: "MYS-MSK-003",
    stock: 18,
    in_stock: true,
    is_published: true,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  },
  {
    id: 4,
    name: "Noir Velvet Body Elixir",
    description:
      "A satin body oil with squalane and camellia that leaves skin luminous, scented, and touchably soft.",
    price_cents: 5800,
    sale_price_cents: null,
    image_url:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80",
    extra_images: null,
    slug: "noir-velvet-body-elixir",
    category_id: 4,
    sku: "MYS-BDY-004",
    stock: 12,
    in_stock: true,
    is_published: true,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  },
  {
    id: 5,
    name: "Midnight Renewal Cream",
    description:
      "A peptide-rich night cream that cushions skin overnight and seals in every step of your ritual.",
    price_cents: 7200,
    sale_price_cents: 6400,
    image_url:
      "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=900&q=80",
    extra_images: null,
    slug: "midnight-renewal-cream",
    category_id: 1,
    sku: "MYS-NGT-005",
    stock: 30,
    in_stock: true,
    is_published: true,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  },
  {
    id: 6,
    name: "Ritual Discovery Set",
    description:
      "A travel-ready edit of Mystic favorites for cleansing, treating, and restoring glow on the go.",
    price_cents: 12000,
    sale_price_cents: 9800,
    image_url:
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80",
    extra_images: null,
    slug: "ritual-discovery-set",
    category_id: 1,
    sku: "MYS-SET-006",
    stock: 9,
    in_stock: true,
    is_published: true,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  },
];

export const mockIngredients: Ingredient[] = [
  {
    id: "niacinamide",
    name: "Niacinamide",
    description: "Supports clarity, tone balance, and resilient-looking skin.",
    benefits: "Brightness, barrier support, refined texture",
    source: "Vitamin B3",
  },
  {
    id: "centella-asiatica",
    name: "Centella Asiatica",
    description: "A calming botanical known for comfort and recovery.",
    benefits: "Soothing, redness support, skin recovery",
    source: "Leaf extract",
  },
  {
    id: "tremella",
    name: "Tremella Mushroom",
    description: "A hydration-focused ingredient prized for plump, dewy skin.",
    benefits: "Hydration, bounce, smoothness",
    source: "Snow mushroom extract",
  },
];

export const mockPressMentions: PressMention[] = [
  {
    id: "press-vogue",
    title: "Mystic's ritual-first skincare turns nighttime into ceremony",
    source: "Vogue Beauty Edit",
    quote:
      "Mystic delivers the kind of dark-luxe presentation that makes a routine feel like an event.",
    link: "https://example.com/press/vogue-beauty-edit",
    published_at: "2026-02-12T00:00:00.000Z",
  },
  {
    id: "press-allure",
    title: "The emerging label bringing cinematic mood to glow-driven skincare",
    source: "Allure Roundup",
    quote:
      "Every formula feels sensorial, but the packaging and story make the line especially memorable.",
    link: "https://example.com/press/allure-roundup",
    published_at: "2026-01-28T00:00:00.000Z",
  },
];

export const mockPromoCampaign: PromoCampaign = {
  id: "spring-glow",
  name: "Spring Glow Event",
  description: "Free U.S. shipping over $75 plus selected rituals on sale.",
  start_date: "2026-03-01T00:00:00.000Z",
  end_date: "2026-03-31T23:59:59.000Z",
  discount_percentage: 15,
};
