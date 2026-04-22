"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ProductCard from "../components/productcard";
import type { Product } from "../lib/types";

export function SearchExperience({
  initialQuery,
  initialProducts,
}: {
  initialQuery: string;
  initialProducts: Product[];
}) {
  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState<Product[]>(initialProducts);
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
        let data: { products?: Product[]; error?: string } = {};
        try {
          data = (await response.json()) as { products?: Product[]; error?: string };
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
        <p
          className="text-xs uppercase tracking-[0.22em] text-[#b8ab95]"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {isLoading
            ? "Searching…"
            : trimmedQuery
              ? `${products.length} result${products.length === 1 ? "" : "s"}`
              : "Type to search"}
        </p>
      </div>

      {!trimmedQuery ? (
        <div className="mystic-panel p-8 text-sm leading-relaxed text-[#b8ab95] md:p-10">
          <p className="text-[0.65rem] uppercase tracking-[0.24em] text-[#7a7265]">Browse</p>
          <p className="mt-3 text-[#c9bcaa]">
            Search the collection by name, texture, ingredient, or ritual step.
          </p>
        </div>
      ) : loadError ? (
        <div className="mystic-panel p-8 text-sm leading-relaxed text-[#d6a85f] md:p-10" role="alert">
          {loadError}
        </div>
      ) : products.length === 0 ? (
        <div className="mystic-panel p-8 text-sm leading-relaxed text-[#b8ab95] md:p-10">
          <p className="text-[0.65rem] uppercase tracking-[0.24em] text-[#7a7265]">No matches</p>
          <p className="mt-3 text-[#c9bcaa]">
            Nothing for &quot;{trimmedQuery}&quot; yet—try a shorter term or browse the shop.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-4 xl:grid-cols-5 xl:gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} showQuickView />
          ))}
        </div>
      )}
    </section>
  );
}
