import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "../../components/AdminShell";
import { CopyableId } from "../../components/CopyableId";
import { InventoryBadge } from "../../components/InventoryBadge";
import { ProductStatusChip } from "../../components/ProductStatusChip";
import { formatMoney, isSafeImageSrc } from "../../../lib/format";
import { getProductForAdminById } from "../../lib/productsQuery";
import {
  getPriceRangeCents,
  getProductStatus,
  LOW_STOCK_THRESHOLD,
  summarizeInventory,
} from "../../lib/productStatus";
import { requireAdminSession } from "../../lib/session";

export const metadata: Metadata = {
  title: "Product detail",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface AdminProductDetailPageProps {
  params: Promise<{ id: string }>;
}

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-[0.6rem] uppercase tracking-[0.2em] text-[#7a7265]">
        {label}
      </dt>
      <dd className="mt-1 text-[#f5eee3]">{children}</dd>
    </div>
  );
}

export default async function AdminProductDetailPage({
  params,
}: AdminProductDetailPageProps) {
  const { id } = await params;
  const parsedId = Number.parseInt(id, 10);
  await requireAdminSession(`/admin/products/${encodeURIComponent(id)}`);

  if (!Number.isFinite(parsedId)) {
    notFound();
  }

  const detail = await getProductForAdminById(parsedId);
  if (!detail) {
    notFound();
  }

  const { product, variants, categoryName } = detail;
  const status = getProductStatus(product);
  const inv = summarizeInventory(product);
  const priceRange = getPriceRangeCents(product, variants);

  // Schema gaps to surface in the "data limitations" note.
  const missingFields: string[] = [];
  if (!product.sku) missingFields.push("SKU");
  if (product.category_id == null) missingFields.push("category");
  if (!product.description) missingFields.push("description");
  if (
    typeof product.stock !== "number" &&
    (!Array.isArray(product.variant_stocks) || product.variant_stocks.length === 0)
  ) {
    missingFields.push("stock");
  }

  const galleryImages = [product.image_url, ...(product.extra_images ?? [])]
    .filter((src): src is string => Boolean(src))
    .filter((src) => isSafeImageSrc(src));

  return (
    <AdminShell pageEyebrow={product.name} pageTitle="Product detail">
      <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
        <Link
          href="/admin/products"
          className="text-[0.7rem] uppercase tracking-[0.22em] text-[#d6a85f] underline-offset-4 hover:underline"
        >
          ← Back to products
        </Link>
        <span className="text-[#7a7265]">·</span>
        <ProductStatusChip status={status} />
        <InventoryBadge
          stockTotal={inv.totalStock}
          variantCount={inv.variantCount}
          isOutOfStock={inv.isOutOfStock}
          isLowStock={inv.isLowStock}
          isUnknown={inv.isUnknown}
        />
        <span className="ml-auto text-xs text-[#7a7265]">
          Updated {formatDateTime(product.updated_at ?? product.created_at)}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section
          aria-labelledby="basics-heading"
          className="rounded-[16px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)] p-6"
        >
          <h2
            id="basics-heading"
            className="text-[0.7rem] uppercase tracking-[0.24em] text-[#b8ab95]"
          >
            Basics
          </h2>
          <dl className="mt-4 grid grid-cols-1 gap-y-4 sm:grid-cols-2">
            <DetailRow label="Name">{product.name}</DetailRow>
            <DetailRow label="Category">
              {categoryName ? (
                categoryName
              ) : (
                <span className="text-[#7a7265]">—</span>
              )}
            </DetailRow>
            <DetailRow label="ID">
              <CopyableId value={String(product.id)} label="id" visible={18} />
            </DetailRow>
            <DetailRow label="Slug">
              <CopyableId value={product.slug} label="slug" visible={22} />
            </DetailRow>
            <DetailRow label="SKU">
              {product.sku ? (
                <CopyableId value={product.sku} label="sku" visible={18} />
              ) : (
                <span className="text-[#7a7265]">—</span>
              )}
            </DetailRow>
            <DetailRow label="Volume / size">
              {product.volume_size_label ? (
                product.volume_size_label
              ) : (
                <span className="text-[#7a7265]">—</span>
              )}
            </DetailRow>
            <DetailRow label="Price">
              <span className="tabular-nums">
                {priceRange.min === priceRange.max
                  ? formatMoney(priceRange.min)
                  : `${formatMoney(priceRange.min)} – ${formatMoney(priceRange.max)}`}
              </span>
              {product.sale_price_cents != null &&
              product.sale_price_cents !== product.price_cents ? (
                <span className="ml-2 text-xs text-[#7a7265] line-through">
                  {formatMoney(product.price_cents)}
                </span>
              ) : null}
            </DetailRow>
            <DetailRow label="Created">
              <span className="text-[#b8ab95]">{formatDateTime(product.created_at)}</span>
            </DetailRow>
          </dl>

          {product.description ? (
            <div className="mt-6">
              <h3 className="text-[0.6rem] uppercase tracking-[0.2em] text-[#7a7265]">
                Description
              </h3>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#d8c6aa]">
                {product.description}
              </p>
            </div>
          ) : null}
        </section>

        <aside
          aria-labelledby="inventory-heading"
          className="rounded-[16px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)] p-6"
        >
          <h2
            id="inventory-heading"
            className="text-[0.7rem] uppercase tracking-[0.24em] text-[#b8ab95]"
          >
            Inventory
          </h2>

          {inv.isUnknown ? (
            <p className="mt-4 text-sm text-[#9a8f7a]">
              No stock data is recorded for this product yet.
            </p>
          ) : (
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-[0.6rem] uppercase tracking-[0.2em] text-[#7a7265]">
                  Total stock
                </dt>
                <dd className="font-mono tabular-nums text-[#f5eee3]">
                  {inv.totalStock.toLocaleString("en-US")}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-[0.6rem] uppercase tracking-[0.2em] text-[#7a7265]">
                  Variants
                </dt>
                <dd className="font-mono tabular-nums text-[#f5eee3]">
                  {inv.variantCount > 0
                    ? inv.variantCount.toLocaleString("en-US")
                    : "—"}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-[0.6rem] uppercase tracking-[0.2em] text-[#7a7265]">
                  Low-stock threshold
                </dt>
                <dd className="font-mono tabular-nums text-[#b8ab95]">
                  ≤ {LOW_STOCK_THRESHOLD}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-[0.6rem] uppercase tracking-[0.2em] text-[#7a7265]">
                  Storefront `in_stock`
                </dt>
                <dd className="text-[#f5eee3]">
                  {product.in_stock === true
                    ? "Yes"
                    : product.in_stock === false
                      ? "No"
                      : "—"}
                </dd>
              </div>
            </dl>
          )}
        </aside>
      </div>

      <section
        aria-labelledby="variants-heading"
        className="mt-6 rounded-[16px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)] p-6"
      >
        <h2
          id="variants-heading"
          className="text-[0.7rem] uppercase tracking-[0.24em] text-[#b8ab95]"
        >
          Variants
        </h2>
        {variants.length === 0 ? (
          <p className="mt-4 text-sm text-[#9a8f7a]">
            No variants — this product is sold as a single SKU.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-[12px] border border-[rgba(214,168,95,0.08)]">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[rgba(214,168,95,0.1)] text-[0.6rem] uppercase tracking-[0.2em] text-[#9a8f7a]">
                  <th className="px-4 py-3 font-medium">Variant</th>
                  <th className="px-4 py-3 font-medium">SKU</th>
                  <th className="px-4 py-3 font-medium text-right">Price</th>
                  <th className="px-4 py-3 font-medium text-right">Stock</th>
                </tr>
              </thead>
              <tbody className="text-[#d8c6aa]">
                {variants.map((variant) => {
                  const isOOS = (variant.stock ?? 0) <= 0;
                  const isLow =
                    !isOOS &&
                    typeof variant.stock === "number" &&
                    variant.stock <= LOW_STOCK_THRESHOLD;
                  return (
                    <tr
                      key={variant.id}
                      className="border-b border-[rgba(214,168,95,0.06)] last:border-0"
                    >
                      <td className="px-4 py-3 align-top text-[#f5eee3]">
                        {variant.variant_name || `Variant #${variant.id}`}
                      </td>
                      <td className="px-4 py-3 align-top">
                        {variant.sku ? (
                          <CopyableId
                            value={variant.sku}
                            label="sku"
                            visible={16}
                          />
                        ) : (
                          <span className="text-[#7a7265]">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 align-top text-right tabular-nums text-[#f5eee3]">
                        {typeof variant.price_cents === "number"
                          ? formatMoney(variant.price_cents)
                          : formatMoney(
                              product.sale_price_cents ?? product.price_cents,
                            )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 align-top text-right">
                        <InventoryBadge
                          stockTotal={variant.stock ?? 0}
                          isOutOfStock={isOOS}
                          isLowStock={isLow}
                          isUnknown={typeof variant.stock !== "number"}
                          size="compact"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section
        aria-labelledby="media-heading"
        className="mt-6 rounded-[16px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)] p-6"
      >
        <h2
          id="media-heading"
          className="text-[0.7rem] uppercase tracking-[0.24em] text-[#b8ab95]"
        >
          Media
        </h2>
        {galleryImages.length === 0 ? (
          <p className="mt-4 text-sm text-[#9a8f7a]">
            No images attached to this product yet.
            {product.image_url && !isSafeImageSrc(product.image_url) ? (
              <span className="ml-1 text-[#7a6b5c]">
                (URL present but host is not in the allowed list — see{" "}
                <code className="text-xs">next.config.js</code>.)
              </span>
            ) : null}
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {galleryImages.map((src, idx) => (
              <div
                key={`${src}-${idx}`}
                className="relative aspect-square overflow-hidden rounded-[10px] border border-[rgba(214,168,95,0.08)] bg-black/40"
              >
                <Image
                  src={src}
                  alt={`${product.name} image ${idx + 1}`}
                  fill
                  sizes="(min-width: 1024px) 200px, (min-width: 640px) 30vw, 45vw"
                  className="object-cover"
                  unoptimized
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {missingFields.length > 0 ? (
        <p className="mt-6 rounded-[12px] border border-[rgba(214,168,95,0.1)] bg-[rgba(214,168,95,0.04)] px-4 py-3 text-xs leading-relaxed text-[#b8ab95]">
          <span className="font-medium uppercase tracking-[0.2em] text-[#d6a85f]">
            Data limitations:
          </span>{" "}
          this product is missing {missingFields.join(", ")}. The catalog
          schema covers these fields, but they aren&apos;t populated yet for
          this row.
        </p>
      ) : null}
    </AdminShell>
  );
}
