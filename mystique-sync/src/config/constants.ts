/**
 * Static, brand-locked configuration. These values are intentionally
 * source-controlled (never read from env) because they describe the
 * *shape* of Mystique's catalog, not deployment particulars.
 */
import heroSkusFile from "../data/hero-skus.json" with { type: "json" };
import type { HeroProduct, HeroSkusFile, ProductCategory } from "./types.js";

const _source = heroSkusFile as HeroSkusFile;

/** The 5 hero products, in ritual order (1..5). Treat as readonly. */
export const HERO_SKUS: readonly HeroProduct[] = Object.freeze(
  [..._source.products].sort((a, b) => a.ritual_order - b.ritual_order),
);

/** SKU JSON file's locked version + timestamp — surfaces in reports. */
export const HERO_SKUS_VERSION = _source.version;
export const HERO_SKUS_LOCKED_AT = _source.locked_at;

/**
 * Top-level Google Drive folder names (already created at the Drive root).
 * The numeric prefix is significant for sort order in the Drive UI.
 */
export const DRIVE_TOP_FOLDERS = [
  "01_Master-System",
  "02_Product-System",
  "03_Content-and-Campaigns",
  "04_Platform-and-Tech",
  "05_Business-and-Legal",
  "06_References",
  "99_Archive-Legacy",
] as const;

export type DriveTopFolder = (typeof DRIVE_TOP_FOLDERS)[number];

/**
 * 12 remaining loose files in My Drive root → target folder under the
 * organized structure above.
 *
 * `match` rules:
 *   - exact   → file `name` equals the search string (default)
 *   - prefix  → file `name` starts with the search string (handy for Docs
 *               whose UI title sometimes differs from the file name)
 */
export interface FileMove {
  file: string;
  target: DriveTopFolder;
  match: "exact" | "prefix";
}

export const FILE_MOVES: readonly FileMove[] = Object.freeze([
  { file: "01_The_Manifesto_Doc",                   target: "01_Master-System",       match: "prefix" },
  { file: "07_Mystique_Brand_Motives_and_Language", target: "01_Master-System",       match: "prefix" },
  { file: "01_Mystique_Content_Magazine_IA",        target: "03_Content-and-Campaigns", match: "prefix" },
  { file: "01_Platform_Tech_Stack",                 target: "04_Platform-and-Tech",   match: "prefix" },
  { file: "01_Website_Audit_Report",                target: "04_Platform-and-Tech",   match: "prefix" },
  { file: "02_AI_Image_Prompt_Log",                 target: "04_Platform-and-Tech",   match: "prefix" },
  { file: "02_Implementation_Report",               target: "04_Platform-and-Tech",   match: "prefix" },
  { file: "01_LLC_Registration",                    target: "05_Business-and-Legal",  match: "prefix" },
  { file: "02_Bank_Transfer_Records",               target: "05_Business-and-Legal",  match: "prefix" },
  { file: "03_Tax_Returns",                         target: "05_Business-and-Legal",  match: "prefix" },
  { file: "08_Untitled_General_Doc",                target: "05_Business-and-Legal",  match: "prefix" },
  { file: "Colab Notebooks",                        target: "06_References",          match: "exact"  },
]);

/**
 * Which Drive folder to scan when looking for the hero image of each SKU.
 * All 5 currently live under `02_Product-System` per brief.
 */
export const PRODUCT_IMAGE_FOLDERS: Readonly<
  Record<HeroProduct["slug"], DriveTopFolder>
> = Object.freeze({
  "soft-reset-cleansing-gel":   "02_Product-System",
  "calm-layer-toning-essence":  "02_Product-System",
  "hydrating-serum":            "02_Product-System",
  "barrier-replenish-cream":    "02_Product-System",
  "light-veil-spf-50-fluid":    "02_Product-System",
});

/** Image MIME types we accept as a product hero (Drive returns these). */
export const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

/** Drive Google Apps "image-ish" alternate mime — kept for completeness. */
export const DRIVE_FOLDER_MIME = "application/vnd.google-apps.folder" as const;

/** Filename keyword bag used to score image candidates against each slug. */
export const PRODUCT_KEYWORD_HINTS: Readonly<
  Record<HeroProduct["slug"], readonly string[]>
> = Object.freeze({
  "soft-reset-cleansing-gel":  ["soft", "reset", "cleansing", "cleanser", "gel"],
  "calm-layer-toning-essence": ["calm", "layer", "toning", "toner", "essence"],
  "hydrating-serum":           ["hydrating", "hydration", "serum"],
  "barrier-replenish-cream":   ["barrier", "replenish", "cream", "moisturizer"],
  "light-veil-spf-50-fluid":   ["light", "veil", "spf", "50", "sunscreen", "fluid"],
});

/** Confidence threshold below which an image match is rejected. */
export const IMAGE_MATCH_MIN_SCORE = 0.25;

/** Compile-time invariant guard — TS will fail if categories drift from types. */
type _CategoriesCovered = ProductCategory extends
  | "cleanser" | "essence" | "serum" | "cream" | "sunscreen"
  ? true
  : false;
const _CATEGORIES_OK: _CategoriesCovered = true;
void _CATEGORIES_OK;
