/**
 * Push the 5 locked hero products into the Notion "Hero Product Lineup" DB.
 *
 * Behaviour:
 *   - For each HERO_SKU: query the DB by Slug rich_text equality.
 *   - If a page exists → diff fields; update only if changed.
 *   - If no page exists → create one.
 *   - Honour `--dry-run` (logs the plan without calling Notion writes).
 *   - Concurrency capped by `SYNC_CONCURRENCY` env var.
 */
import { getNotion } from "./client.js";
import { NOTION_PRODUCT_PROPS } from "./schema.js";
import { HERO_SKUS } from "../../config/constants.js";
import { getProtocolSequence } from "../supabase/protocol.js";
import { loadEnv } from "../../config/env.js";
import { log } from "../../utils/logger.js";
import { createLimiter } from "../../utils/rate-limit.js";
import type {
  HeroProduct,
  NotionProductRow,
  NotionSyncOutcome,
  NotionSyncReport,
} from "../../config/types.js";
import type { Client as NotionClient } from "@notionhq/client";

// ─── Property builders ───────────────────────────────────────────────────────

type NotionPropertyMap = Record<string, unknown>;

function buildProperties(row: NotionProductRow): NotionPropertyMap {
  const props: NotionPropertyMap = {
    Name:        { title:     [{ type: "text", text: { content: row.name } }] },
    Slug:        { rich_text: [{ type: "text", text: { content: row.slug } }] },
    RitualOrder: { number: row.ritualOrder },
    Category:    { select: { name: row.category } },
    Price:       { number: row.price },
    Description: { rich_text: [{ type: "text", text: { content: row.description } }] },
    Published:   { checkbox: row.published },
    ImageURL:    { url: row.imageUrl ?? null },
  };
  // Defensive: drop properties we don't have schema entries for. Keeps the
  // Notion API from rejecting payloads if someone removes a prop in Notion.
  for (const k of Object.keys(props)) {
    if (!(k in NOTION_PRODUCT_PROPS)) delete props[k];
  }
  return props;
}

/**
 * Pull existing page property values into a plain object we can diff
 * against a fresh build. Returns null for any unrecognised property.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function readPropertyValue(prop: any): unknown {
  if (!prop || typeof prop !== "object") return null;
  switch (prop.type) {
    case "title":     return (prop.title?.[0]?.plain_text ?? "") as string;
    case "rich_text": return (prop.rich_text?.[0]?.plain_text ?? "") as string;
    case "number":    return prop.number ?? null;
    case "select":    return prop.select?.name ?? null;
    case "checkbox":  return Boolean(prop.checkbox);
    case "url":       return prop.url ?? null;
    default:          return null;
  }
}

function readPageAsRow(page: { properties: Record<string, unknown> }): NotionProductRow {
  const p = page.properties;
  return {
    name:        String(readPropertyValue(p.Name) ?? ""),
    slug:        String(readPropertyValue(p.Slug) ?? ""),
    ritualOrder: Number(readPropertyValue(p.RitualOrder) ?? 0),
    category:    (readPropertyValue(p.Category) as NotionProductRow["category"]) ?? "cleanser",
    price:       Number(readPropertyValue(p.Price) ?? 0),
    description: String(readPropertyValue(p.Description) ?? ""),
    published:   Boolean(readPropertyValue(p.Published)),
    imageUrl:    (readPropertyValue(p.ImageURL) as string | null) ?? null,
  };
}

function rowsEqual(a: NotionProductRow, b: NotionProductRow): boolean {
  return (
    a.name === b.name &&
    a.slug === b.slug &&
    a.ritualOrder === b.ritualOrder &&
    a.category === b.category &&
    a.price === b.price &&
    a.description === b.description &&
    a.published === b.published &&
    (a.imageUrl ?? null) === (b.imageUrl ?? null)
  );
}

// ─── Page lookup ─────────────────────────────────────────────────────────────

async function findPageBySlug(
  notion: NotionClient,
  databaseId: string,
  slug: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any | null> {
  const res = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: "Slug",
      rich_text: { equals: slug },
    },
    page_size: 1,
  });
  return res.results[0] ?? null;
}

// ─── Build target row from HERO_SKUS + live Supabase image_url ───────────────

/**
 * Build the NotionProductRow for one hero product. If Supabase already has
 * an `image_url` for this slug, prefer it over the (likely null) JSON value.
 */
function buildTargetRow(
  product: HeroProduct,
  liveImageUrlBySlug: Map<string, string | null>,
): NotionProductRow {
  return {
    name:        product.name,
    slug:        product.slug,
    ritualOrder: product.ritual_order,
    category:    product.category,
    price:       product.price,
    description: product.description,
    published:   product.is_published,
    imageUrl:    liveImageUrlBySlug.get(product.slug) ?? product.image_url ?? null,
  };
}

// ─── Entry point ─────────────────────────────────────────────────────────────

export interface SyncOptions {
  dryRun: boolean;
  /** Override the DB id; otherwise NOTION_HERO_PRODUCT_DB_ID from env is used. */
  databaseId?: string;
}

export async function syncNotionProducts(options: SyncOptions): Promise<NotionSyncReport> {
  const scoped = log.scope("notion:sync");
  const env = loadEnv();
  const databaseId = options.databaseId ?? env.notionHeroProductDbId;
  if (!databaseId) {
    throw new Error(
      "NOTION_HERO_PRODUCT_DB_ID is not set. Add it to .env or pass --database-id.",
    );
  }

  const notion = getNotion();
  const limit = createLimiter();

  // Best-effort fetch of live image_url from Supabase. If Supabase is down,
  // we proceed with the JSON's (null) values — the sync still works.
  const liveImageUrlBySlug = new Map<string, string | null>();
  try {
    const protocol = await getProtocolSequence();
    for (const r of protocol) liveImageUrlBySlug.set(r.slug, r.image_url);
  } catch (err) {
    scoped.warn(
      "Could not read live image_url from Supabase; falling back to JSON values.",
      err instanceof Error ? err.message : String(err),
    );
  }

  const tasks = HERO_SKUS.map((product) =>
    limit(async (): Promise<NotionSyncOutcome> => {
      const target = buildTargetRow(product, liveImageUrlBySlug);
      try {
        const existing = await findPageBySlug(notion, databaseId, product.slug);

        if (existing) {
          const current = readPageAsRow(existing);
          if (rowsEqual(current, target)) {
            scoped.info(`${product.slug} unchanged`);
            return { slug: product.slug, status: "unchanged", pageId: existing.id };
          }
          if (options.dryRun) {
            scoped.info(`[dry-run] would update page ${existing.id} for ${product.slug}`);
            return { slug: product.slug, status: "updated", pageId: existing.id };
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await notion.pages.update({
            page_id: existing.id,
            properties: buildProperties(target) as any,
          });
          scoped.success(`Updated page for ${product.slug}`);
          return { slug: product.slug, status: "updated", pageId: existing.id };
        }

        if (options.dryRun) {
          scoped.info(`[dry-run] would create page for ${product.slug}`);
          return { slug: product.slug, status: "created" };
        }
        const created = await notion.pages.create({
          parent: { type: "database_id", database_id: databaseId },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          properties: buildProperties(target) as any,
        });
        scoped.success(`Created page for ${product.slug}`);
        return { slug: product.slug, status: "created", pageId: created.id };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        scoped.error(`${product.slug}: ${message}`);
        return { slug: product.slug, status: "error", error: message };
      }
    }),
  );

  const outcomes = await Promise.all(tasks);

  return {
    outcomes,
    created:   outcomes.filter((o) => o.status === "created").length,
    updated:   outcomes.filter((o) => o.status === "updated").length,
    unchanged: outcomes.filter((o) => o.status === "unchanged").length,
    errors:    outcomes.filter((o) => o.status === "error").length,
  };
}
