"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatMoney, isSafeImageSrc } from "../lib/format";

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

const FALLBACK_PRODUCT_IMAGE =
  "https://placehold.co/600x800/1a1a1a/c9a84c?text=Mystique";

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
  const firstRenderRef = useRef(true);

  useEffect(() => {
    setQuery(initialQuery);
    setProducts(initialProducts);
  }, [initialProducts, initialQuery]);

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }

    const trimmedQuery = query.trim();

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
    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}`, {
          cache: "no-store",
        });
        const data = (await response.json()) as { products: SearchProduct[] };
        setProducts(data.products);
      } catch (error) {
        console.error("Search request failed", error);
      } finally {
        setIsLoading(false);
      }
    }, 220);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  return (
    <>
      <form className="max-w-2xl" onSubmit={(event) => event.preventDefault()}>
        <label className="sr-only" htmlFor="search-query">
          Search query
        </label>
        <input
          id="search-query"
          name="q"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search products, ingredients, or ritual steps"
          className="mystic-input w-full text-sm"
        />
      </form>

      {!query.trim() ? (
        <div className="mystic-card p-8 text-sm text-[#b8ab95]">
          Begin with a product name, ingredient, or term like &ldquo;bloom
          skin&rdquo; or &ldquo;peptides.&rdquo;
        </div>
      ) : isLoading ? (
        <div className="mystic-card p-8 text-sm text-[#b8ab95]">
          Searching the Mystique ritual catalog...
        </div>
      ) : products.length === 0 ? (
        <div className="mystic-card p-8 text-sm text-[#b8ab95]">
          No results for &ldquo;{query.trim()}&rdquo;. Try a broader search.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => {
            const displayPrice = product.sale_price_cents ?? product.price_cents;
            const imageSrc = isSafeImageSrc(product.image_url)
              ? product.image_url
              : FALLBACK_PRODUCT_IMAGE;
            return (
              <article
                key={product.id}
                className="group relative mx-auto flex h-full w-full max-w-[280px] flex-col overflow-hidden rounded-[24px] border border-[rgba(214,168,95,0.18)] bg-[#0b0e14] shadow-[0_18px_45px_rgba(0,0,0,0.45)] transition duration-500 hover:-translate-y-1 hover:border-[rgba(214,168,95,0.45)]"
              >
                <Link
                  href={`/products/${product.slug}`}
                  className="relative mx-4 mt-4 block aspect-[4/4.8] overflow-hidden rounded-[20px] bg-[#11151d]"
                >
                  <Image
                    src={imageSrc}
                    alt={`${product.name} product shot`}
                    fill
                    className="object-contain p-4 transition duration-500 group-hover:scale-[1.03] md:p-5"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  <div className="absolute left-3 top-3 rounded-full border border-[rgba(214,168,95,0.35)] bg-[rgba(6,8,12,0.82)] px-3 py-1 text-[0.62rem] uppercase tracking-[0.22em] text-[#f0d19a]">
                    {product.routine_step ?? "Ritual"}
                  </div>
                </Link>
                <div className="flex flex-1 flex-col gap-3 p-4 md:p-5">
                  <div className="space-y-2">
                    <Link
                      href={`/products/${product.slug}`}
                      className="font-cormorant text-[1.65rem] leading-tight tracking-[0.08em] text-[#f5eee3]"
                    >
                      {product.name}
                    </Link>
                    {product.description ? (
                      <p className="line-clamp-2 text-sm leading-relaxed text-[#b8ab95]">
                        {product.description}
                      </p>
                    ) : null}
                  </div>
                  <div className="mt-auto border-t border-[rgba(214,168,95,0.12)] pt-4">
                    <span className="text-xl font-semibold text-[#d6a85f]">
                      {formatMoney(displayPrice)}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
