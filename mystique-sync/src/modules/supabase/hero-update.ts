/**
 * Apply the 5 locked hero-SKU renames to the live Supabase `products` table.
 *
 * Mirrors `sql/02_update_hero_skus.sql` and `sql/03_set_ritual_order.sql`,
 * but runs through PostgREST so we can:
 *   - report row-by-row outcomes
 *   - honour `--dry-run`
 *   - protect against accidentally clobbering price / description / image_url
 *
 * The function NEVER writes to: is_published, price, description, image_url.
 * It writes: name, slug, ritual_order, category, updated_at.
 */
import { getSupabase } from "./client.js";
import { HERO_SKUS } from "../../config/constants.js";
import { log } from "../../utils/logger.js";
import type {
  HeroProduct,
  HeroUpdateOutcome,
  HeroUpdateReport,
  SupabaseProductRow,
} from "../../config/types.js";

/**
 * Try to locate the existing Supabase row that should *become* this hero
 * product. Search order:
 *   1. exact match on the locked slug (already-correct case)
 *   2. exact match on any old slug
 *   3. case-insensitive name match against keyword bag (last resort)
 */
async function findExistingRow(
  product: HeroProduct,
): Promise<{ row: SupabaseProductRow | null; matchedBy: string | null }> {
  const supabase = getSupabase();

  // 1) target slug already present?
  const { data: exact, error: exactErr } = await supabase
    .from("products")
    .select("*")
    .eq("slug", product.slug)
    .maybeSingle();
  if (exactErr && exactErr.code !== "PGRST116") throw exactErr;
  if (exact) return { row: exact as SupabaseProductRow, matchedBy: `slug=${product.slug}` };

  // 2) any historical slug?
  if (product.old_slugs.length > 0) {
    const { data: legacy, error: legacyErr } = await supabase
      .from("products")
      .select("*")
      .in("slug", [...product.old_slugs])
      .limit(1);
    if (legacyErr) throw legacyErr;
    if (legacy && legacy.length > 0) {
      const row = legacy[0] as SupabaseProductRow;
      return { row, matchedBy: `old_slug=${row.slug}` };
    }
  }

  // 3) name-keyword fallback. We OR together ILIKE conditions so a single
  //    query handles the brief's varied keyword sets.
  const orClauses = buildIlikeClauses(product);
  if (orClauses.length === 0) return { row: null, matchedBy: null };

  const { data: nameMatches, error: nameErr } = await supabase
    .from("products")
    .select("*")
    .or(orClauses.join(","))
    .limit(1);
  if (nameErr) throw nameErr;
  if (nameMatches && nameMatches.length > 0) {
    const row = nameMatches[0] as SupabaseProductRow;
    return { row, matchedBy: `name~"${row.name}"` };
  }
  return { row: null, matchedBy: null };
}

/**
 * Build PostgREST `.or()` filter strings (URL-safe but unquoted commas
 * because supabase-js handles the encoding for us).
 */
function buildIlikeClauses(product: HeroProduct): string[] {
  const wordsByCategory: Record<HeroProduct["category"], string[]> = {
    cleanser:  ["cleanser", "cleansing"],
    essence:   ["toner", "toning", "essence"],
    serum:     ["serum", "hydrating"],
    cream:     ["moisturizer", "cream", "replenish", "barrier"],
    sunscreen: ["spf", "sunscreen", "light veil"],
  };
  const words = wordsByCategory[product.category];
  return words.map((w) => `name.ilike.%${w}%`);
}

/** Compare what's already there vs what we want to write. */
function diffNeedsUpdate(
  current: SupabaseProductRow,
  target: HeroProduct,
): { needs: boolean; changes: Partial<SupabaseProductRow> } {
  const changes: Partial<SupabaseProductRow> = {};
  if (current.name !== target.name)                changes.name         = target.name;
  if (current.slug !== target.slug)                changes.slug         = target.slug;
  if (current.ritual_order !== target.ritual_order) changes.ritual_order = target.ritual_order;
  if (current.category !== target.category)        changes.category     = target.category;
  return { needs: Object.keys(changes).length > 0, changes };
}

export async function applyHeroUpdates(
  options: { dryRun: boolean } = { dryRun: false },
): Promise<HeroUpdateReport> {
  const supabase = getSupabase();
  const scoped = log.scope("supabase:hero-update");
  const outcomes: HeroUpdateOutcome[] = [];

  for (const product of HERO_SKUS) {
    try {
      const { row, matchedBy } = await findExistingRow(product);

      if (!row) {
        scoped.warn(`No row matched ${product.slug}`);
        outcomes.push({ slug: product.slug, status: "not-found" });
        continue;
      }

      const { needs, changes } = diffNeedsUpdate(row, product);
      if (!needs) {
        scoped.info(`${product.slug} already correct (id=${row.id})`);
        outcomes.push({
          slug: product.slug,
          status: "already-correct",
          matched_by: matchedBy ?? undefined,
          previous_name: row.name,
          previous_slug: row.slug,
        });
        continue;
      }

      if (options.dryRun) {
        scoped.info(
          `[dry-run] would update id=${row.id}`,
          `${row.slug} → ${product.slug}`,
          changes,
        );
        outcomes.push({
          slug: product.slug,
          status: "updated",
          matched_by: matchedBy ?? undefined,
          previous_name: row.name,
          previous_slug: row.slug,
        });
        continue;
      }

      // CRITICAL: we intentionally do NOT include is_published, price,
      // description, or image_url in the payload. Those values stay intact.
      const payload = {
        ...changes,
        updated_at: new Date().toISOString(),
      };

      const { error: updateErr } = await supabase
        .from("products")
        .update(payload)
        .eq("id", row.id);

      if (updateErr) throw updateErr;

      scoped.success(`Updated ${row.slug} → ${product.slug}`);
      outcomes.push({
        slug: product.slug,
        status: "updated",
        matched_by: matchedBy ?? undefined,
        previous_name: row.name,
        previous_slug: row.slug,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      scoped.error(`Failed for ${product.slug}: ${message}`);
      outcomes.push({ slug: product.slug, status: "error", error: message });
    }
  }

  return {
    outcomes,
    updated:        outcomes.filter((o) => o.status === "updated").length,
    alreadyCorrect: outcomes.filter((o) => o.status === "already-correct").length,
    notFound:       outcomes.filter((o) => o.status === "not-found").length,
    errors:         outcomes.filter((o) => o.status === "error").length,
  };
}
