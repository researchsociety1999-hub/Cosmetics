import { mockFaqs } from "./data";
import { getProductBySlug, getProducts } from "./queries";
import type { Product } from "./types";

export interface ChatPageContext {
  pathname: string;
  pageTitle?: string;
  productSlug?: string;
}

export interface SafeProductContext {
  name: string;
  slug: string;
  description?: string;
  key_ingredients?: string[];
  benefits?: string[];
  routine_step?: string;
  skin_types?: string[];
  category_name?: string;
}

export interface SafeFaqSnippet {
  question: string;
  answer: string;
}

export interface ChatContextBundle {
  page: ChatPageContext;
  product: SafeProductContext | null;
  faqSnippets: SafeFaqSnippet[];
  catalogSummary: string | null;
}

const MAX_FAQ_SNIPPETS = 5;
const MAX_CATALOG_ITEMS = 12;

/**
 * Always-present routine FAQ snippets injected into every chat context.
 * These ensure the model has branded routine guidance regardless of which
 * page the user is on — critical for the top knowledge-gap query
 * "Build my routine" (100% error rate when upstream was down).
 */
const ROUTINE_FAQ_SNIPPETS: SafeFaqSnippet[] = [
  {
    question: "How do I build a morning skincare routine?",
    answer:
      "A Mystique morning ritual: (1) Gentle cleanse, (2) Hydrating serum or essence, " +
      "(3) Moisturiser suited to your skin type, (4) SPF 30–50 — always the final step. " +
      "Layer thinnest to thickest texture and let each step absorb for 30 seconds before the next.",
  },
  {
    question: "How do I build an evening skincare routine?",
    answer:
      "A Mystique evening ritual: (1) First cleanse — remove SPF and makeup with a cleansing balm or micellar water, " +
      "(2) Second cleanse — water-based for a clean canvas, " +
      "(3) Treatment serum (retinol, peptides, or AHA/BHA — alternate if combining), " +
      "(4) Eye cream, (5) Richer night moisturiser or sleeping mask to support overnight renewal.",
  },
  {
    question: "What weekly treatments should I add to my routine?",
    answer:
      "Once or twice a week: a chemical exfoliant (AHA for glow, BHA for congestion). " +
      "Once a week: a targeted mask — hydrating, clay, or brightening depending on your concern. " +
      "Always follow with moisturiser after exfoliating.",
  },
  {
    question: "How do I layer skincare products correctly?",
    answer:
      "Apply in order of thinnest to thickest texture: toners and essences first, " +
      "then serums, then moisturiser, then oils or balms as the final seal. " +
      "In the morning, SPF is always last. Wait 30–60 seconds between active ingredients.",
  },
  {
    question: "What routine is best for my skin type?",
    answer:
      "Oily/combination: lightweight gel textures, skip heavy occlusives in AM. " +
      "Dry/dehydrated: add a hydrating serum layer, use richer creams. " +
      "Sensitive: fragrance-free formulas, introduce one new product at a time, always patch-test. " +
      "Normal: flexible — adjust texture weight seasonally.",
  },
];

/** Strip product records to customer-safe fields only. */
export function toSafeProductContext(
  product: Product | null | undefined,
): SafeProductContext | null {
  if (!product?.slug || !product.name) return null;

  return {
    name: product.name,
    slug: product.slug,
    description: product.description?.slice(0, 600) ?? undefined,
    key_ingredients: product.key_ingredients?.slice(0, 8) ?? undefined,
    benefits: product.benefits?.slice(0, 6) ?? undefined,
    routine_step: product.routine_step ?? undefined,
    skin_types: product.skin_types?.slice(0, 6) ?? undefined,
    category_name: product.category_name ?? undefined,
  };
}

function getSafeFaqSnippets(pathname: string): SafeFaqSnippet[] {
  const normalized = pathname.toLowerCase();

  const prioritized =
    normalized.includes("/faq") || normalized.includes("/contact")
      ? mockFaqs
      : mockFaqs.filter((item) =>
          /sensitive|right for me|shipping|return/i.test(item.question),
        );

  return prioritized.slice(0, MAX_FAQ_SNIPPETS).map((item) => ({
    question: item.question,
    answer: item.answer.slice(0, 480),
  }));
}

async function buildCatalogSummary(
  page: ChatPageContext,
  product: SafeProductContext | null,
): Promise<string | null> {
  const pathname = page.pathname.toLowerCase();
  const needsCatalog =
    pathname.startsWith("/shop") ||
    pathname.startsWith("/products") ||
    pathname.startsWith("/routines") ||
    pathname === "/" ||
    Boolean(product);

  if (!needsCatalog) return null;

  try {
    const products = await getProducts({
      limit: MAX_CATALOG_ITEMS,
      excludeComingSoon: true,
      excludeOutOfStock: true,
    });

    if (!products.length) return null;

    const lines = products.map((p) => {
      const step = p.routine_step ? ` · ${p.routine_step}` : "";
      const category = p.category_name ? ` (${p.category_name})` : "";
      return `- ${p.name}${category}${step}`;
    });

    return `Published catalog snapshot (public):\n${lines.join("\n")}`;
  } catch {
    return null;
  }
}

/**
 * Assemble approved context for the chat model.
 * Supabase-backed product lookup can be extended here without changing the API route.
 */
export async function getChatContext(
  pageContext: ChatPageContext,
  clientProductContext?: SafeProductContext | null,
): Promise<ChatContextBundle> {
  const page: ChatPageContext = {
    pathname: pageContext.pathname.slice(0, 200),
    pageTitle: pageContext.pageTitle?.slice(0, 200),
    productSlug: pageContext.productSlug?.slice(0, 120),
  };

  let product = sanitizeClientProductContext(clientProductContext);

  if (!product && page.productSlug) {
    const fromDb = await getProductBySlug(page.productSlug);
    product = toSafeProductContext(fromDb);
  }

  const faqSnippets = getSafeFaqSnippets(page.pathname);
  const catalogSummary = await buildCatalogSummary(page, product);

  return { page, product, faqSnippets, catalogSummary };
}

/** Reject unexpected fields from the client and enforce size limits. */
export function sanitizeClientProductContext(
  input: SafeProductContext | null | undefined,
): SafeProductContext | null {
  if (!input?.slug || !input.name) return null;

  return {
    name: input.name.slice(0, 120),
    slug: input.slug.slice(0, 120),
    description: input.description?.slice(0, 600),
    key_ingredients: input.key_ingredients?.slice(0, 8),
    benefits: input.benefits?.slice(0, 6),
    routine_step: input.routine_step?.slice(0, 40),
    skin_types: input.skin_types?.slice(0, 6),
    category_name: input.category_name?.slice(0, 80),
  };
}

export function formatContextForPrompt(bundle: ChatContextBundle): string {
  const sections: string[] = [];

  sections.push(
    `Current page: ${bundle.page.pathname}` +
      (bundle.page.pageTitle ? `\nPage title: ${bundle.page.pageTitle}` : ""),
  );

  if (bundle.product) {
    const p = bundle.product;
    sections.push(
      [
        "Product in view:",
        `Name: ${p.name}`,
        `Slug: ${p.slug}`,
        p.category_name ? `Category: ${p.category_name}` : null,
        p.routine_step ? `Routine step: ${p.routine_step}` : null,
        p.skin_types?.length ? `Skin types: ${p.skin_types.join(", ")}` : null,
        p.key_ingredients?.length
          ? `Key ingredients: ${p.key_ingredients.join(", ")}`
          : null,
        p.benefits?.length ? `Benefits: ${p.benefits.join(", ")}` : null,
        p.description ? `Description: ${p.description}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  // Always inject routine FAQ snippets first — they cover the top knowledge-gap
  // query ("Build my routine") regardless of which page the user is on.
  sections.push(
    "Routine guidance (always available):\n" +
      ROUTINE_FAQ_SNIPPETS.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join(
        "\n\n",
      ),
  );

  if (bundle.faqSnippets.length) {
    sections.push(
      "Approved FAQ snippets:\n" +
        bundle.faqSnippets
          .map((f) => `Q: ${f.question}\nA: ${f.answer}`)
          .join("\n\n"),
    );
  }

  if (bundle.catalogSummary) {
    sections.push(bundle.catalogSummary);
  }

  return sections.join("\n\n---\n\n");
}
