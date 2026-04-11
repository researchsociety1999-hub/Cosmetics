import type { Metadata } from "next";
import Link from "next/link";
import { SiteChrome } from "../components/SiteChrome";
import { getJournalEntries } from "../lib/queries";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Essays and guides from Mystique—layering rituals, ingredient literacy, and the quiet art of caring for your skin.",
};

export default async function JournalPage() {
  const entries = await getJournalEntries();
  const labelByCategory: Record<string, string> = {
    Ritual: "Ritual",
    Science: "Ingredient",
    Glow: "Guide",
    Routine: "Guide",
  };

  return (
    <SiteChrome>
      <main className="mystic-section-shell mystic-section">
        <header className="mb-10 max-w-3xl space-y-4">
          <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
            Journal
          </p>
          <h1 className="font-literata text-4xl tracking-[0.12em] md:text-5xl">
            Rituals, guides, and glow notes.
          </h1>
          <p className="text-sm leading-relaxed text-[#b8ab95] md:text-base">
            This is where Mystique keeps its routines, ingredient guides, and
            skincare notes for building a more polished ritual.
          </p>
        </header>
        {entries.length === 0 ? (
          <div className="mystic-card p-8 text-sm leading-relaxed text-[#b8ab95]">
            <p>
              The next essays are in edit. When they publish, you will find ritual
              walk-throughs, ingredient deep dives, and the occasional field note from
              the Mystique studio.
            </p>
            <Link
              href="/shop"
              className="mystic-button-secondary mt-6 inline-flex items-center justify-center px-6 py-3 text-xs uppercase tracking-[0.2em]"
            >
              Shop the collection
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {entries.map((entry) => (
              <article key={entry.slug} className="mystic-card p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="mystic-pill !px-3 !py-1.5 !text-[0.62rem] !tracking-[0.24em]">
                    {labelByCategory[entry.category] ?? "Guide"}
                  </span>
                  <p className="text-[0.72rem] uppercase tracking-[0.22em] text-[#d6a85f]">
                    {entry.category} | {entry.readTime}
                  </p>
                </div>
                <h2 className="mt-3 font-literata text-3xl tracking-[0.08em]">
                  {entry.title}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-[#b8ab95]">
                  {entry.excerpt}
                </p>
                <Link
                  href={`/journal/${entry.slug}`}
                  className="mt-6 inline-flex text-xs uppercase tracking-[0.2em] text-[#f0d19a]"
                >
                  Continue reading
                </Link>
              </article>
            ))}
          </div>
        )}

        {entries.length > 0 ? (
          <section className="mt-14 border-t border-[rgba(214,168,95,0.12)] pt-10">
            <p className="text-[0.72rem] uppercase tracking-[0.24em] text-[#d6a85f]">
              Wear it home
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#b8ab95]">
              When you are ready to translate a ritual from the page into your shelf, the
              shop keeps the same edit—nothing loud, everything considered.
            </p>
            <Link
              href="/shop"
              className="mystic-button-secondary mt-6 inline-flex items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em]"
            >
              Shop the collection
            </Link>
          </section>
        ) : null}
      </main>
    </SiteChrome>
  );
}
