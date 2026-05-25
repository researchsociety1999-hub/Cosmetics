/**
 * Find every product whose `image_url` is missing (null OR empty).
 * Output feeds two consumers:
 *   - markdown report (which slugs need art)
 *   - Drive `image-finder` (which slugs to search for)
 */
import { getSupabase } from "./client.js";
import type { ImageScanReport, SupabaseProductRow } from "../../config/types.js";

export async function scanProductsMissingImages(): Promise<ImageScanReport> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("products")
    .select("id, slug, name, image_url")
    .order("ritual_order", { ascending: true, nullsFirst: false });

  if (error) throw error;

  const rows = (data ?? []) as Array<Pick<SupabaseProductRow, "id" | "slug" | "name" | "image_url">>;

  const missing = rows
    .filter((r) => !r.image_url || r.image_url.trim() === "")
    .map((r) => ({ id: r.id, slug: r.slug, name: r.name }));

  return {
    totalProducts: rows.length,
    withImages: rows.length - missing.length,
    missingImages: missing,
  };
}

/**
 * Convenience helper consumed by Drive `image-finder`: returns the SET of
 * slugs whose image_url is currently empty.
 */
export async function getSlugsMissingImages(): Promise<Set<string>> {
  const report = await scanProductsMissingImages();
  return new Set(report.missingImages.map((r) => r.slug));
}

/**
 * Single-product write-back. Used by Drive `image-finder` after picking the
 * best match for a slug. Never overwrites a non-empty image_url.
 */
export async function setProductImageIfEmpty(
  slug: string,
  imageUrl: string,
): Promise<{ wrote: boolean; reason: string }> {
  const supabase = getSupabase();

  const { data: existing, error: readErr } = await supabase
    .from("products")
    .select("id, image_url")
    .eq("slug", slug)
    .maybeSingle();
  if (readErr) throw readErr;
  if (!existing) return { wrote: false, reason: `no product with slug=${slug}` };
  if (existing.image_url && existing.image_url.trim() !== "") {
    return { wrote: false, reason: "image_url already set" };
  }

  const { error: updateErr } = await supabase
    .from("products")
    .update({ image_url: imageUrl, updated_at: new Date().toISOString() })
    .eq("id", existing.id);
  if (updateErr) throw updateErr;
  return { wrote: true, reason: "image_url written" };
}
