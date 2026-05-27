/**
 * Theme classifier for chat messages.
 *
 * Keep this rule-based on purpose: themes are operator-facing buckets, not a
 * model task. Each theme is a list of lowercase keywords / phrases. To tune
 * coverage, edit the keyword arrays — no other code change needed. The
 * matching order below mirrors the priority operators care about (specific
 * commerce intents first, generic chatter last).
 */

export type ChatTheme =
  | "product_question"
  | "shipping_tracking"
  | "returns_refund"
  | "recommendation"
  | "ingredients_suitability"
  | "price_promotion"
  | "other";

export const CHAT_THEME_LABELS: Record<ChatTheme, string> = {
  product_question: "Product question",
  shipping_tracking: "Shipping / tracking",
  returns_refund: "Returns / refund",
  recommendation: "Recommendation",
  ingredients_suitability: "Ingredients / suitability",
  price_promotion: "Price / promotion",
  other: "Other",
};

export const CHAT_THEME_VALUES: ReadonlyArray<ChatTheme> = [
  "product_question",
  "shipping_tracking",
  "returns_refund",
  "recommendation",
  "ingredients_suitability",
  "price_promotion",
  "other",
];

interface ThemeRule {
  theme: ChatTheme;
  /** Lowercase substrings the message must contain at least one of. */
  keywords: ReadonlyArray<string>;
}

const RULES: ReadonlyArray<ThemeRule> = [
  {
    theme: "shipping_tracking",
    keywords: [
      "shipping",
      "ship to",
      "shipped",
      "delivery",
      "deliver",
      "tracking",
      "track my",
      "track order",
      "where is my order",
      "where's my order",
      "carrier",
      "package",
      "parcel",
      "courier",
      "eta",
      "arrive",
      "arrival",
      "delay",
      "delayed",
      "order status",
      "lost package",
    ],
  },
  {
    theme: "returns_refund",
    keywords: [
      "return",
      "returning",
      "refund",
      "refunded",
      "exchange",
      "warranty",
      "money back",
      "cancel order",
      "cancel my order",
      "damaged",
      "broken",
      "wrong item",
      "wrong product",
    ],
  },
  {
    theme: "price_promotion",
    keywords: [
      "price",
      "cost",
      "how much",
      "discount",
      "promo",
      "promotion",
      "coupon",
      "code",
      "sale",
      "deal",
      "cheaper",
      "expensive",
      "free shipping",
      "bundle",
      "offer",
    ],
  },
  {
    theme: "ingredients_suitability",
    keywords: [
      "ingredient",
      "ingredients",
      "contain",
      "contains",
      "fragrance",
      "fragrance free",
      "paraben",
      "sulfate",
      "alcohol",
      "vegan",
      "cruelty",
      "cruelty-free",
      "pregnan",
      "breastfeed",
      "nursing",
      "sensitive skin",
      "allergy",
      "allergic",
      "patch test",
      "rosacea",
      "eczema",
      "retinol",
      "niacinamide",
      "hyaluronic",
      "ceramide",
      "centella",
      "vitamin c",
      "spf",
      "sunscreen safe",
      "fragrance-free",
    ],
  },
  {
    theme: "recommendation",
    keywords: [
      "recommend",
      "recommendation",
      "suggest",
      "what should i",
      "which one",
      "which product",
      "best for",
      "good for",
      "routine",
      "ritual",
      "morning routine",
      "evening routine",
      "night routine",
      "build a routine",
      "help me choose",
      "help me pick",
      "for my skin",
      "dry skin",
      "oily skin",
      "combination skin",
      "acne",
      "dullness",
      "dehydrated",
      "wrinkle",
    ],
  },
  {
    theme: "product_question",
    keywords: [
      "how do i use",
      "how to use",
      "how often",
      "instructions",
      "directions",
      "apply",
      "application",
      "before or after",
      "with serum",
      "with moisturizer",
      "how long",
      "result",
      "results",
      "what does",
      "what is the",
      "tell me about",
      "size",
      "volume",
      "ml",
      "oz",
      "smell",
      "scent",
      "texture",
      "consistency",
    ],
  },
];

/**
 * Classify a single user message. Walks the rule list in priority order;
 * first match wins. Falls back to `other` when nothing matches.
 */
export function classifyChatTheme(message: string | null | undefined): ChatTheme {
  if (!message) return "other";
  const normalized = message.toLowerCase();
  for (const rule of RULES) {
    for (const kw of rule.keywords) {
      if (normalized.includes(kw)) return rule.theme;
    }
  }
  return "other";
}
