import { NextResponse } from "next/server";
import { getProducts } from "../../../lib/queries";
import { isProductPurchasable } from "../../../lib/productMerch";
import { hasSupabaseEnv, supabase, supabaseAdmin } from "../../../lib/supabaseClient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Non-secret inventory snapshot for debugging.
 * - Available in development.
 * - In production, returns 404 unless `ENABLE_INVENTORY_HEALTH=1`.
 *
 * This endpoint intentionally does NOT expose keys, emails, or raw DB errors.
 */
export async function GET() {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ENABLE_INVENTORY_HEALTH !== "1"
  ) {
    return new NextResponse(null, { status: 404 });
  }

  const catalog = await getProducts({ sortBy: "newest", limit: 200 });
  const purchasable = catalog.filter(isProductPurchasable);
  const purchasableBySlug = purchasable
    .filter((p) => p.slug?.trim())
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      stock: p.stock,
      in_stock: p.in_stock,
    }));

  const notPurchasableSample = catalog
    .filter((p) => !isProductPurchasable(p))
    .slice(0, 25)
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      stock: p.stock,
      in_stock: p.in_stock,
      is_published: p.is_published,
      reason:
        p.in_stock === false
          ? "in_stock=false"
          : typeof p.stock === "number" && p.stock <= 0
            ? "stock<=0"
            : "unknown",
    }));

  // Variant mismatch check: PDP uses variant stock when variants exist, but never overrides product-level OOS.
  // This highlights products that are purchasable at product-level but may still show as OOS on PDP due to variants.
  let variantMismatch: Array<{
    productId: number;
    slug: string;
    name: string;
    variantCount: number;
    inStockVariants: number;
  }> = [];

  if (hasSupabaseEnv && (supabaseAdmin || supabase)) {
    try {
      const client = supabaseAdmin ?? supabase!;
      const ids = purchasable.map((p) => p.id);
      if (ids.length) {
        const { data } = await client
          .from("product_variants")
          .select("id,product_id,stock")
          .in("product_id", ids);

        const rows = Array.isArray(data)
          ? (data as Array<{ id: number; product_id: number; stock: number | null }>)
          : [];

        const byProduct = new Map<number, { count: number; inStock: number }>();
        for (const row of rows) {
          const current = byProduct.get(row.product_id) ?? { count: 0, inStock: 0 };
          current.count += 1;
          if ((row.stock ?? 0) > 0) current.inStock += 1;
          byProduct.set(row.product_id, current);
        }

        variantMismatch = purchasable
          .map((p) => {
            const s = byProduct.get(p.id);
            if (!s) return null; // no variants
            if (s.count > 0 && s.inStock === 0) {
              return {
                productId: p.id,
                slug: p.slug,
                name: p.name,
                variantCount: s.count,
                inStockVariants: s.inStock,
              };
            }
            return null;
          })
          .filter(Boolean) as typeof variantMismatch;
      }
    } catch {
      // Ignore variant mismatch when probing fails; endpoint still returns base purchasable list.
    }
  }

  return NextResponse.json({
    counts: {
      catalogConsidered: catalog.length,
      purchasable: purchasable.length,
      outOfStock: catalog.length - purchasable.length,
    },
    purchasable: purchasableBySlug,
    outOfStockSample: notPurchasableSample,
    variantMismatch,
    notes: [
      "Canonical purchasability uses products.in_stock and products.stock (see lib/productMerch.ts).",
      "Variant mismatch list flags SKUs purchasable at product-level but with 0 in-stock variants.",
    ],
  });
}

