import type { Metadata } from "next";
import Link from "next/link";
import { SiteChrome } from "../components/SiteChrome";
import { buildPageMetadata } from "../lib/seo";

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: "Stockists",
    description:
      "Where to find Mystique in-store and online. Updates are added as partners go live.",
    canonicalPath: "/stockists",
  }),
};

export default function StockistsPage() {
  return (
    <SiteChrome>
      <main className="mystic-section-shell mystic-section">
        <header className="mystic-panel p-8 md:p-10">
          <p className="text-[0.7rem] uppercase tracking-[0.3em] text-[#8a8275]">
            Stockists
          </p>
          <h1 className="mt-4 font-literata text-4xl tracking-[0.12em] text-[#f5eee3] md:text-5xl">
            Find Mystique
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#b8ab95] md:text-base">
            Mystique is primarily available online. Retail partners will be listed here as
            they’re confirmed.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="mystic-button-primary inline-flex min-h-[48px] items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em]"
            >
              Shop online
            </Link>
            <Link
              href="/contact"
              className="mystic-button-secondary inline-flex min-h-[48px] items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em]"
            >
              Stockist inquiry
            </Link>
          </div>
        </header>
      </main>
    </SiteChrome>
  );
}

