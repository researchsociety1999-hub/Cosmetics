/**
 * Scan the configured product-image folders for the best matching image per
 * hero SKU, then (optionally) write the chosen URL back to Supabase's
 * `products.image_url` for any product still missing one.
 *
 * Scoring (per candidate file name):
 *   + 0.45 if file contains the slug verbatim (most decisive signal)
 *   +  0.1 per keyword from PRODUCT_KEYWORD_HINTS that appears in the name
 *   + 0.05 if file contains the product's category
 *   – 0.20 if name is generic ("untitled", "image", "img_", "screenshot")
 * Final score clamped to [0, 1]. Candidates below IMAGE_MATCH_MIN_SCORE are
 * dropped to avoid binding random art to a product.
 *
 * Honours `dryRun`:
 *   - true  → score & report only, no Supabase writes
 *   - false → write_back to `products.image_url` IF AND ONLY IF the row's
 *             current image_url is null/empty (never clobbers existing art).
 */
import { getDrive, type DriveAPI } from "./client.js";
import { getSupabase } from "../supabase/client.js";
import { setProductImageIfEmpty } from "../supabase/image-scanner.js";
import {
  HERO_SKUS,
  IMAGE_MATCH_MIN_SCORE,
  IMAGE_MIME_TYPES,
  PRODUCT_IMAGE_FOLDERS,
  PRODUCT_KEYWORD_HINTS,
} from "../../config/constants.js";
import { loadEnv } from "../../config/env.js";
import { log } from "../../utils/logger.js";
import { createLimiter } from "../../utils/rate-limit.js";
import type {
  DriveFile,
  HeroProduct,
  ImageMatch,
  ImageReport,
} from "../../config/types.js";

// ─── Scoring ────────────────────────────────────────────────────────────────

const GENERIC_TOKENS = ["untitled", "image", "img_", "screenshot", "copy of"];

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "") // drop extension
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function scoreCandidate(file: DriveFile, product: HeroProduct): number {
  const haystack = normalize(file.name);
  if (!haystack) return 0;

  let score = 0;

  // Direct slug match — the most reliable signal.
  if (haystack.includes(product.slug.replace(/-/g, " "))) score += 0.45;

  // Keyword bag.
  const hints = PRODUCT_KEYWORD_HINTS[product.slug] ?? [];
  for (const hint of hints) {
    if (haystack.includes(hint.toLowerCase())) score += 0.1;
  }

  // Category bonus.
  if (haystack.includes(product.category)) score += 0.05;

  // Penalize generic, low-information names.
  for (const token of GENERIC_TOKENS) {
    if (haystack.includes(token)) {
      score -= 0.2;
      break;
    }
  }

  return Math.max(0, Math.min(1, score));
}

interface ScoredCandidate extends ImageMatch {
  webContentLink?: string;
}

function pickBest(product: HeroProduct, files: DriveFile[]): ScoredCandidate | null {
  let best: ScoredCandidate | null = null;
  for (const file of files) {
    if (!IMAGE_MIME_TYPES.includes(file.mimeType as typeof IMAGE_MIME_TYPES[number])) continue;
    const score = scoreCandidate(file, product);
    if (score < IMAGE_MATCH_MIN_SCORE) continue;
    if (!best || score > best.score) {
      best = {
        slug: product.slug,
        fileId: file.id,
        fileName: file.name,
        score,
      };
    }
  }
  return best;
}

// ─── Folder cache + listing ─────────────────────────────────────────────────

async function listImagesInFolder(
  drive: DriveAPI,
  folderId: string,
): Promise<DriveFile[]> {
  const mimeClause = IMAGE_MIME_TYPES.map((m) => `mimeType = '${m}'`).join(" or ");
  const q = `'${folderId}' in parents and trashed = false and (${mimeClause})`;
  return drive.listFiles({ q, pageSize: 200, orderBy: "modifiedTime desc" });
}

async function buildWebLink(drive: DriveAPI, fileId: string): Promise<string | undefined> {
  try {
    const meta = await drive.raw.files.get({
      fileId,
      fields: "webViewLink",
      supportsAllDrives: true,
    });
    return meta.data.webViewLink ?? undefined;
  } catch {
    return undefined;
  }
}

// ─── Entry point ────────────────────────────────────────────────────────────

export interface FindImageOptions {
  dryRun: boolean;
  /** If true, only emit matches for products whose Supabase image_url is empty. */
  onlyMissing?: boolean;
}

export async function findProductImages(
  drive: DriveAPI = getDrive(),
  supabaseClient: ReturnType<typeof getSupabase> = getSupabase(),
  options: FindImageOptions = { dryRun: false },
): Promise<ImageReport> {
  const scoped = log.scope("drive:image-finder");
  const limit = createLimiter();
  const root = loadEnv().driveRootFolderId ?? "root";

  // Pre-resolve all unique folder names → folder IDs.
  const folderIdByName = new Map<string, string>();
  for (const name of new Set(Object.values(PRODUCT_IMAGE_FOLDERS))) {
    const folder = await drive.findFolder({ name, parentId: root });
    if (!folder) {
      scoped.warn(`Folder "${name}" not found — slugs mapped to it will be unmatched.`);
      continue;
    }
    folderIdByName.set(name, folder.id);
  }

  // List images in each folder once and cache by folder ID.
  const filesByFolder = new Map<string, DriveFile[]>();
  for (const [, folderId] of folderIdByName.entries()) {
    if (filesByFolder.has(folderId)) continue;
    try {
      const files = await listImagesInFolder(drive, folderId);
      filesByFolder.set(folderId, files);
    } catch (err) {
      scoped.error(
        `Failed to list folder ${folderId}:`,
        err instanceof Error ? err.message : String(err),
      );
      filesByFolder.set(folderId, []);
    }
  }

  // Optionally pre-load which slugs are still missing an image in Supabase,
  // so we can either filter or simply annotate writes.
  let missingSet = new Set<string>();
  try {
    const { data, error } = await supabaseClient
      .from("products")
      .select("slug, image_url");
    if (error) throw error;
    for (const row of (data ?? []) as Array<{ slug: string; image_url: string | null }>) {
      if (!row.image_url || row.image_url.trim() === "") missingSet.add(row.slug);
    }
  } catch (err) {
    scoped.warn(
      "Could not pre-fetch missing image_url set; will still attempt safe writes.",
      err instanceof Error ? err.message : String(err),
    );
    missingSet = new Set(HERO_SKUS.map((p) => p.slug)); // be permissive
  }

  const report: ImageReport = {
    matched: [],
    unmatched: [],
    errors: [],
    written: [],
  };

  const tasks = HERO_SKUS.map((product) =>
    limit(async () => {
      try {
        if (options.onlyMissing && !missingSet.has(product.slug)) {
          report.unmatched.push({
            slug: product.slug,
            reason: "image_url already set in Supabase (skipped)",
          });
          return;
        }

        const folderName = PRODUCT_IMAGE_FOLDERS[product.slug];
        if (!folderName) {
          report.unmatched.push({
            slug: product.slug,
            reason: `slug not present in PRODUCT_IMAGE_FOLDERS`,
          });
          return;
        }
        const folderId = folderIdByName.get(folderName);
        if (!folderId) {
          report.unmatched.push({
            slug: product.slug,
            reason: `folder "${folderName}" missing`,
          });
          return;
        }

        const files = filesByFolder.get(folderId) ?? [];
        const best = pickBest(product, files);
        if (!best) {
          report.unmatched.push({
            slug: product.slug,
            reason: `no candidate ≥ score ${IMAGE_MATCH_MIN_SCORE} in folder "${folderName}"`,
          });
          return;
        }

        best.webViewLink = await buildWebLink(drive, best.fileId);
        report.matched.push(best);
        scoped.success(
          `${product.slug} → ${best.fileName} (score ${best.score.toFixed(2)})`,
        );

        // Optional write-back. We never overwrite an existing image_url.
        if (!options.dryRun && missingSet.has(product.slug) && best.webViewLink) {
          const result = await setProductImageIfEmpty(product.slug, best.webViewLink);
          if (result.wrote) {
            report.written.push(product.slug);
            scoped.success(`Wrote image_url for ${product.slug}`);
          } else {
            scoped.info(`Skip Supabase write for ${product.slug}: ${result.reason}`);
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        scoped.error(`${product.slug}: ${message}`);
        report.errors.push({ slug: product.slug, error: message });
      }
    }),
  );

  await Promise.all(tasks);
  return report;
}
