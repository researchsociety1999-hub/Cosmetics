import { supabaseAdmin } from "../../lib/supabaseClient";
import type { Product, ProductVariant } from "../../lib/types";
import {
  getProductStatus,
  LOW_STOCK_THRESHOLD,
  PRODUCT_STATUS_VALUES,
  summarizeInventory,
  type ProductStatus,
} from "./productStatus";

export type ProductSortKey = "name" | "price" | "updated_at" | "stock";
export type SortDir = "asc" | "desc";

export interface ProductListFilters {
  q?: string;
  status?: ProductStatus;
  /** When true, restrict to low-stock or out-of-stock products only. */
  lowStock?: boolean;
  sortBy?: ProductSortKey;
  sortDir?: SortDir;
  limit?: number;
}

/**
 * Lightweight row shape returned to the admin list page — combines the raw
 * Supabase row with derived state so the page-level component can stay dumb.
 */
export interface AdminProductRow {
  product: Product;
  status: ProductStatus;
  stockTotal: number;
  variantCount: number;
  isOutOfStock: boolean;
  isLowStock: boolean;
  isUnknownStock: boolean;
  /** Pre-resolved category name (when the products.category_id matched the lookup map). */
  categoryName: string | null;
}

export interface ProductInventoryStats {
  totalProducts: number;
  activeProducts: number;
  draftProducts: number;
  comingSoonProducts: number;
  lowStockActive: number;
  outOfStockActive: number;
  recentlyUpdated: number;
}

const DEFAULT_LIMIT = 200;
const MAX_LIMIT = 500;
const MAX_SEARCH_LENGTH = 200;
/** Window used for the "recently updated" KPI on the overview page. */
const RECENTLY_UPDATED_WINDOW_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

const RAW_PRODUCT_SELECT =
  "id, name, slug, sku, description, price_cents, sale_price_cents, image_url, extra_images, stock, in_stock, is_published, coming_soon, category_id, volume_size_label, created_at, updated_at, product_variants ( id, product_id, variant_name, price_cents, stock, sku )";

function sanitizeSearch(value: string): string {
  return value.replace(/[,()%*]/g, "").trim().slice(0, MAX_SEARCH_LENGTH);
}

function isProductSortKey(value: string | undefined): value is ProductSortKey {
  return value === "name" || value === "price" || value === "updated_at" || value === "stock";
}

function isProductStatus(value: string | undefined): value is ProductStatus {
  if (!value) return false;
  return (PRODUCT_STATUS_VALUES as ReadonlyArray<string>).includes(value);
}

export function parseProductFiltersFromSearchParams(
  raw: Record<string, string | string[] | undefined>,
): ProductListFilters {
  function single(key: string): string | undefined {
    const v = raw[key];
    if (Array.isArray(v)) return v[0]?.trim() || undefined;
    return typeof v === "string" ? v.trim() || undefined : undefined;
  }

  const q = single("q");
  const status = single("status");
  const lowStock = single("lowStock");
  const sortBy = single("sortBy");
  const sortDir = single("sortDir");

  return {
    q: q ? q.slice(0, MAX_SEARCH_LENGTH) : undefined,
    status: isProductStatus(status) ? status : undefined,
    lowStock: lowStock === "1" || lowStock === "true",
    sortBy: isProductSortKey(sortBy) ? sortBy : "updated_at",
    sortDir: sortDir === "asc" ? "asc" : "desc",
  };
}

/**
 * Internal join row from Supabase. Variant fields can come back as either a
 * single object or an array depending on the relation cardinality — the
 * normaliser flattens both shapes.
 */
type RawAdminProductRow = Product & {
  product_variants?: ProductVariant[] | ProductVariant | null;
};

function normalizeRow(raw: RawAdminProductRow): Product {
  const variants = Array.isArray(raw.product_variants)
    ? raw.product_variants
    : raw.product_variants
      ? [raw.product_variants]
      : [];

  return {
    ...raw,
    variant_stocks: variants.map((v) => ({ stock: v?.stock ?? null })),
    extra_images: Array.isArray(raw.extra_images) ? raw.extra_images : null,
  };
}

async function getCategoryLookup(): Promise<Map<number, string>> {
  if (!supabaseAdmin) return new Map();
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("id, name");
  if (error || !data) return new Map();
  const map = new Map<number, string>();
  for (const row of data as Array<{ id: number; name: string | null }>) {
    if (typeof row.id === "number" && row.name) {
      map.set(row.id, row.name);
    }
  }
  return map;
}

function applyClientSort(rows: AdminProductRow[], filters: ProductListFilters): AdminProductRow[] {
  const dir = filters.sortDir === "asc" ? 1 : -1;
  const byPrice = (r: AdminProductRow) =>
    r.product.sale_price_cents ?? r.product.price_cents ?? 0;
  const byUpdated = (r: AdminProductRow) => {
    const v = r.product.updated_at ?? r.product.created_at;
    return v ? new Date(v).getTime() : 0;
  };

  const sorted = [...rows];
  switch (filters.sortBy) {
    case "name":
      sorted.sort((a, b) => a.product.name.localeCompare(b.product.name) * dir);
      break;
    case "price":
      sorted.sort((a, b) => (byPrice(a) - byPrice(b)) * dir);
      break;
    case "stock":
      sorted.sort((a, b) => (a.stockTotal - b.stockTotal) * dir);
      break;
    case "updated_at":
    default:
      sorted.sort((a, b) => (byUpdated(a) - byUpdated(b)) * dir);
      break;
  }
  return sorted;
}

/**
 * Returns the filtered + sorted product list for the admin Products page.
 *
 * Uses Supabase service-role so unpublished / coming-soon rows are visible.
 * Status, low-stock, and sort-by-stock are derived in memory because they
 * depend on cross-table aggregates that PostgREST can't filter on directly
 * (matches the same pattern the catalog query uses on the storefront side).
 */
export async function getProductsForAdminFiltered(
  filters: ProductListFilters,
): Promise<AdminProductRow[]> {
  if (!supabaseAdmin) return [];

  const limit = Math.min(Math.max(1, filters.limit ?? DEFAULT_LIMIT), MAX_LIMIT);

  let query = supabaseAdmin
    .from("products")
    .select(RAW_PRODUCT_SELECT)
    .limit(limit);

  if (filters.q) {
    const term = sanitizeSearch(filters.q);
    if (term) {
      const pattern = `%${term}%`;
      const orClauses = [
        `name.ilike.${pattern}`,
        `slug.ilike.${pattern}`,
        `sku.ilike.${pattern}`,
      ];
      const asInt = Number.parseInt(term, 10);
      if (Number.isFinite(asInt)) {
        orClauses.push(`id.eq.${asInt}`);
      }
      query = query.or(orClauses.join(","));
    }
  }

  // SQL-side sort for native columns; stock + status-derived sorts run in-memory below.
  if (filters.sortBy === "name") {
    query = query.order("name", { ascending: filters.sortDir === "asc" });
  } else if (filters.sortBy === "price") {
    query = query.order("price_cents", { ascending: filters.sortDir === "asc" });
  } else if (filters.sortBy === "updated_at" || !filters.sortBy) {
    query = query.order("updated_at", { ascending: filters.sortDir === "asc", nullsFirst: false });
  }

  const [productsResult, categoryMap] = await Promise.all([
    query,
    getCategoryLookup(),
  ]);

  if (productsResult.error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[admin products] list fetch failed:", productsResult.error.message);
    }
    return [];
  }

  const rawRows = (productsResult.data ?? []) as RawAdminProductRow[];
  const normalized = rawRows.map(normalizeRow);

  const enriched: AdminProductRow[] = normalized.map((product) => {
    const inv = summarizeInventory(product);
    return {
      product,
      status: getProductStatus(product),
      stockTotal: inv.totalStock,
      variantCount: inv.variantCount,
      isOutOfStock: inv.isOutOfStock,
      isLowStock: inv.isLowStock,
      isUnknownStock: inv.isUnknown,
      categoryName:
        product.category_id != null
          ? categoryMap.get(product.category_id) ?? null
          : null,
    };
  });

  let filtered = enriched;
  if (filters.status) {
    filtered = filtered.filter((row) => row.status === filters.status);
  }
  if (filters.lowStock) {
    filtered = filtered.filter(
      (row) => !row.isUnknownStock && (row.isLowStock || row.isOutOfStock),
    );
  }

  // Stock sort is always client-side (sum is across joined rows).
  if (filters.sortBy === "stock") {
    return applyClientSort(filtered, filters);
  }
  return filtered;
}

/**
 * Fetches one product with its variants for the detail page. Returns null on
 * "not found" so the page can render a notFound(). Uses service-role so
 * unpublished/coming-soon products remain editable from admin.
 */
export async function getProductForAdminById(
  id: number,
): Promise<{ product: Product; variants: ProductVariant[]; categoryName: string | null } | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from("products")
    .select(RAW_PRODUCT_SELECT)
    .eq("id", id)
    .limit(1)
    .maybeSingle();

  if (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[admin products] detail fetch failed:", error.message);
    }
    return null;
  }
  if (!data) return null;

  const raw = data as RawAdminProductRow;
  const variantsRaw = Array.isArray(raw.product_variants)
    ? raw.product_variants
    : raw.product_variants
      ? [raw.product_variants]
      : [];

  const product = normalizeRow(raw);

  let categoryName: string | null = null;
  if (typeof product.category_id === "number") {
    const { data: catRow } = await supabaseAdmin
      .from("categories")
      .select("name")
      .eq("id", product.category_id)
      .limit(1)
      .maybeSingle();
    if (catRow && typeof (catRow as { name?: unknown }).name === "string") {
      categoryName = (catRow as { name: string }).name;
    }
  }

  return { product, variants: variantsRaw, categoryName };
}

/**
 * Counts used by both the Products page summary cards and the /admin overview.
 * Single pass over the same row set we list — keeps the page to one query.
 */
export function computeInventoryStats(rows: AdminProductRow[]): ProductInventoryStats {
  const stats: ProductInventoryStats = {
    totalProducts: rows.length,
    activeProducts: 0,
    draftProducts: 0,
    comingSoonProducts: 0,
    lowStockActive: 0,
    outOfStockActive: 0,
    recentlyUpdated: 0,
  };

  const cutoff = Date.now() - RECENTLY_UPDATED_WINDOW_MS;
  for (const row of rows) {
    if (row.status === "active") stats.activeProducts += 1;
    else if (row.status === "draft") stats.draftProducts += 1;
    else if (row.status === "coming_soon") stats.comingSoonProducts += 1;

    if (row.status === "active") {
      if (row.isOutOfStock) stats.outOfStockActive += 1;
      else if (row.isLowStock) stats.lowStockActive += 1;
    }

    const updatedRaw = row.product.updated_at ?? row.product.created_at;
    if (updatedRaw) {
      const ts = new Date(updatedRaw).getTime();
      if (Number.isFinite(ts) && ts >= cutoff) {
        stats.recentlyUpdated += 1;
      }
    }
  }

  return stats;
}

/**
 * Lightweight overview-only fetch — same query as the list page (no filters)
 * but trimmed to inventory-relevant fields. Reused by `getAdminOverview`.
 */
export async function getInventoryStatsForOverview(): Promise<ProductInventoryStats> {
  const rows = await getProductsForAdminFiltered({
    sortBy: "updated_at",
    sortDir: "desc",
    limit: DEFAULT_LIMIT,
  });
  return computeInventoryStats(rows);
}

export { LOW_STOCK_THRESHOLD };
