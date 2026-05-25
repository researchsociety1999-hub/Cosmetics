/**
 * Shared TypeScript types for the entire mystique-sync pipeline.
 * Keep these *DTO-shaped* — no behaviour, just structure — so every
 * module can import without pulling in third-party clients transitively.
 */

// ─── Hero product source-of-truth ────────────────────────────────────────────

/** One row in `src/data/hero-skus.json`. */
export interface HeroProduct {
  id: number;
  name: string;
  slug: string;
  ritual_order: number;
  category: ProductCategory;
  description: string;
  price: number;
  is_published: boolean;
  /** Stored as `null` in JSON; populated by the Drive image-finder run. */
  image_url: string | null;
  /** Historical slugs we should match against when renaming in Supabase. */
  old_slugs: string[];
}

export type ProductCategory =
  | "cleanser"
  | "essence"
  | "serum"
  | "cream"
  | "sunscreen";

export interface HeroSkusFile {
  version: string;
  locked_at: string;
  products: HeroProduct[];
}

// ─── Supabase row shape (what we read back from `products`) ──────────────────

export interface SupabaseProductRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  ritual_order: number | null;
  category: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

/** Result of a single hero-rename attempt against Supabase. */
export interface HeroUpdateOutcome {
  slug: string;
  status: "updated" | "already-correct" | "not-found" | "error";
  matched_by?: string;
  previous_name?: string;
  previous_slug?: string;
  error?: string;
}

export interface HeroUpdateReport {
  outcomes: HeroUpdateOutcome[];
  updated: number;
  alreadyCorrect: number;
  notFound: number;
  errors: number;
}

export interface ImageScanReport {
  totalProducts: number;
  withImages: number;
  missingImages: Array<{ id: string; slug: string; name: string }>;
}

// ─── Notion ──────────────────────────────────────────────────────────────────

/**
 * Logical row in the Notion "Hero Product Lineup" database.
 * Property names mirror `NOTION_PRODUCT_PROPS` in modules/notion/schema.ts.
 */
export interface NotionProductRow {
  name: string;
  slug: string;
  ritualOrder: number;
  category: ProductCategory;
  price: number;
  description: string;
  published: boolean;
  imageUrl: string | null;
}

export interface NotionSyncOutcome {
  slug: string;
  status: "created" | "updated" | "unchanged" | "error";
  pageId?: string;
  error?: string;
}

export interface NotionSyncReport {
  outcomes: NotionSyncOutcome[];
  created: number;
  updated: number;
  unchanged: number;
  errors: number;
}

// ─── Google Drive ────────────────────────────────────────────────────────────

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  parents?: string[];
  resourceKey?: string;
}

export interface MoveReport {
  moved: string[];
  skipped: Array<{ file: string; reason: string }>;
  errors: Array<{ file: string; error: string }>;
}

export interface ImageMatch {
  slug: string;
  fileId: string;
  fileName: string;
  webViewLink?: string;
  /** Heuristic confidence in `[0,1]`. Higher = better fit. */
  score: number;
}

export interface ImageReport {
  matched: ImageMatch[];
  unmatched: Array<{ slug: string; reason: string }>;
  errors: Array<{ slug: string; error: string }>;
  /** Slugs whose Supabase `image_url` was written back in this run. */
  written: string[];
}

// ─── Health checks ───────────────────────────────────────────────────────────

export type ServiceName = "supabase" | "notion" | "drive";

export interface HealthCheckResult {
  service: ServiceName;
  ok: boolean;
  message: string;
  latencyMs: number;
}

// ─── Logger ──────────────────────────────────────────────────────────────────

export type LogLevel = "debug" | "info" | "warn" | "error";

// ─── Top-level run report ────────────────────────────────────────────────────

/**
 * The mega-report `mystique-sync all` (or `report`) writes to `reports/*.md`.
 * Every section is optional so partial runs still produce useful output.
 */
export interface RunReport {
  startedAt: string;
  finishedAt: string;
  dryRun: boolean;
  health?: HealthCheckResult[];
  heroUpdate?: HeroUpdateReport;
  imageScan?: ImageScanReport;
  protocolSequence?: SupabaseProductRow[];
  notionSync?: NotionSyncReport;
  driveMove?: MoveReport;
  driveImages?: ImageReport;
}
