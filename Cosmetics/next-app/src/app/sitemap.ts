import type { MetadataRoute } from "next";
import { getConfiguredSiteUrl } from "./lib/siteUrl";
import { hasSupabaseEnv, supabase } from "./lib/supabaseClient";

const STATIC_PATHS = [
  "",
  "/shop",
  "/search",
  "/about",
  "/contact",
  "/faq",
  "/journal",
  "/routines",
  "/ingredients",
  "/press",
  "/careers",
  "/privacy",
  "/terms",
  "/cookies",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const root = getConfiguredSiteUrl();
  const fallbackModified = new Date();

  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${root}${path}`,
    lastModified: fallbackModified,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.6,
  }));

  if (hasSupabaseEnv && supabase) {
    const { data, error } = await supabase
      .from("products")
      .select("slug, updated_at")
      .eq("is_published", true);

    if (!error && data) {
      for (const row of data) {
        const slug = typeof row.slug === "string" ? row.slug.trim() : "";
        if (!slug) {
          continue;
        }

        const updatedRaw = row.updated_at;
        const lastModified =
          typeof updatedRaw === "string" && updatedRaw
            ? new Date(updatedRaw)
            : fallbackModified;

        entries.push({
          url: `${root}/products/${slug}`,
          lastModified,
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    }
  }

  return entries;
}
