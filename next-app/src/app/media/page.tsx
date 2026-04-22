import type { Metadata } from "next";
import Link from "next/link";
import { SiteChrome } from "../components/SiteChrome";
import { buildPageMetadata } from "../lib/seo";

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: "Media",
    description:
      "Press resources and brand information for editors and collaborators.",
    canonicalPath: "/media",
  }),
};

export default function MediaPage() {
  return (
    <SiteChrome>
      <main className="mystic-section-shell mystic-section">
        <header className="mystic-panel p-8 md:p-10">
          <p className="text-[0.7rem] uppercase tracking-[0.3em] text-[#8a8275]">
            Media
          </p>
          <h1 className="mt-4 font-literata text-4xl tracking-[0.12em] text-[#f5eee3] md:text-5xl">
            Press &amp; resources
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#b8ab95] md:text-base">
            For press inquiries, imagery requests, and brand notes, use the contact page for
            now. A full press kit can be added here when assets are final.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="mystic-button-primary inline-flex min-h-[48px] items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em]"
            >
              Contact
            </Link>
            <Link
              href="/about"
              className="mystic-button-secondary inline-flex min-h-[48px] items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em]"
            >
              About Mystique
            </Link>
          </div>
        </header>
      </main>
    </SiteChrome>
  );
}

