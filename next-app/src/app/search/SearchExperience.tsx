"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ThemedImageFrame } from "../components/ThemedImageFrame";
import { formatMoney, getProductPrimaryImageUrl } from "../lib/format";

type SearchProduct = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price_cents: number;
  sale_price_cents: number | null;
  routine_step?: string | null;
};

export function SearchExperience({
  initialQuery,
  initialProducts,
}: {
  initialQuery: string;
  initialProducts: SearchProduct[];
}) {
  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState<SearchProduct[]>(initialProducts);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const firstRenderRef = useRef(true);

  const trimmedQuery = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    setQuery(initialQuery);
    setProducts(initialProducts);
    setLoadError(null);
  }, [initialProducts, initialQuery]);

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }

    if (!trimmedQuery) {
      setProducts([]);
      const url = new URL(window.location.href);
      url.searchParams.delete("q");
      window.history.replaceState({}, "", url);
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set("q", trimmedQuery);
    window.history.replaceState({}, "", url);

    setIsLoading(true);
    setLoadError(null);
    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}`, {
          cache: "no-store",
        });
        let data: { products?: SearchProduct[]; error?: string } = {};
        try {
          data = (await response.json()) as { products?: SearchProduct[]; error?: string };
        } catch {
          data = {};
        }

        if (!response.ok) {
          setProducts([]);
          setLoadError(
            typeof data.error === "string" && data.error.trim()
              ? data.error.trim()
              : "Search is temporarily unavailable. Please try again in a moment.",
          );
          return;
        }

        setProducts(Array.isArray(data.products) ? data.products : []);
      } catch (error) {
        console.error("Search request failed", error);
        setProducts([]);
        setLoadError("We could not reach the search service. Check your connection and try again.");
      } finally {
        setIsLoading(false);
      }
    }, 220);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [trimmedQuery]);

  return (
    <section className="space-y-6">
      <div className="mystic-card flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
        <label className="w-full md:max-w-xl" htmlFor="search-query">
          <span className="sr-only">Search</span>
          <input
            id="search-query"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search rituals, concerns, or ingredients…"
            className="mystic-input w-full text-sm"
          />
        </label>
        <p className="text-xs uppercase tracking-[0.22em] text-[#b8ab95]">
          {isLoading
            ? "Searching…"
            : trimmedQuery
              ? `${products.length} result${products.length === 1 ? "" : "s"}`
              : "Type to search"}
        </p>
      </div>

      {!trimmedQuery ? (
        <div className="mystic-card p-8 text-sm text-[#b8ab95]">
          Search the collection by name, texture, ingredient, or ritual step.
        </div>
      ) : loadError ? (
        <div className="mystic-card p-8 text-sm text-[#d6a85f]" role="alert">
          {loadError}
        </div>
      ) : products.length === 0 ? (
        <div className="mystic-card p-8 text-sm text-[#b8ab95]">
          No results for &quot;{trimmedQuery}&quot;. Try a broader search, or browse the shop.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-4 xl:grid-cols-5 xl:gap-4">
          {products.map((product) => {
            const imageSrc = getProductPrimaryImageUrl(product);
            const displayPrice = formatMoney(product.sale_price_cents ?? product.price_cents);
            const slug = product.slug?.trim();
            const productHref = slug ? `/products/${slug}` : "/shop";

            return (
              <Link
                key={product.id}
                href={productHref}
                className="group mystic-card overflow-hidden p-0 transition hover:border-[rgba(214,168,95,0.32)]"
              >
                <ThemedImageFrame
                  src={imageSrc}
                  displayTitle={product.name}
                  alt={`${product.name} — Mystique`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 25vw"
                  variant="product"
                  className="aspect-[4/5]"
                  frameClassName="rounded-none"
                  imageClassName="object-cover"
                />
                <div className="space-y-2 p-5">
                  <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[#d6a85f]">
                    {product.routine_step ?? "Ritual"}
                  </p>
                  <h3 className="font-literata text-2xl tracking-[0.08em] text-[#f5eee3]">
                    {product.name}
                  </h3>
                  {product.description ? (
                    <p className="text-sm leading-relaxed text-[#b8ab95]">
                      {product.description}
                    </p>
                  ) : null}
                  <p className="pt-2 text-sm uppercase tracking-[0.22em] text-[#f0d19a]">
                    {displayPrice}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}