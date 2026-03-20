import type { Metadata } from "next";
import Link from "next/link";
import { SiteChrome } from "../components/SiteChrome";

export const metadata: Metadata = {
  title: "Routines",
  description: "A Mystique ritual builder teaser for curated skin routines.",
};

export default function RoutinesPage() {
  return (
    <SiteChrome>
      <main className="mx-auto max-w-5xl px-4 py-14 md:px-6">
        <div className="mystic-card p-8">
          <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
            Routines
          </p>
          <h1 className="mt-4 font-cormorant text-5xl tracking-[0.12em]">
            Build a guided ritual.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#b8ab95]">
            [REPLACE LATER] This route is reserved for a future builder that
            recommends cleanse, treat, moisturize, and protect steps by skin
            goal and texture preference.
          </p>
          <Link
            href="/shop"
            className="mystic-button-secondary mt-8 inline-flex items-center justify-center px-6 py-3 text-xs uppercase tracking-[0.2em]"
          >
            Browse current rituals
          </Link>
        </div>
      </main>
    </SiteChrome>
  );
}
