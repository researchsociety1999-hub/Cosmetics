import type { Metadata } from "next";
import Link from "next/link";
import { SiteChrome } from "../components/SiteChrome";
import { getJournalEntries } from "../lib/queries";

export const metadata: Metadata = {
  title: "Journal",
  description: "Mystique journal entries on ritual layering, bloom skin, and ingredient storytelling.",
};

export default async function JournalPage() {
  const entries = await getJournalEntries();

  return (
    <SiteChrome>
      <main className="mx-auto max-w-6xl px-4 py-14 md:px-6">
        <header className="mb-10 max-w-3xl space-y-4">
          <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
            Journal
          </p>
          <h1 className="font-cormorant text-4xl tracking-[0.12em] md:text-5xl">
            Ritual notes, ingredient primers, and glow philosophy.
          </h1>
        </header>
        <div className="grid gap-6 md:grid-cols-2">
          {entries.map((entry) => (
            <article key={entry.slug} className="mystic-card p-6">
              <p className="text-[0.72rem] uppercase tracking-[0.22em] text-[#d6a85f]">
                {entry.category} • {entry.readTime}
              </p>
              <h2 className="mt-3 font-cormorant text-3xl tracking-[0.08em]">
                {entry.title}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[#b8ab95]">
                {entry.excerpt}
              </p>
              <Link
                href={`/journal/${entry.slug}`}
                className="mt-6 inline-flex text-xs uppercase tracking-[0.2em] text-[#f0d19a]"
              >
                Read entry [REPLACE LATER]
              </Link>
            </article>
          ))}
        </div>
      </main>
    </SiteChrome>
  );
}
