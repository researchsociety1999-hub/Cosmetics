import type { Metadata } from "next";
import Link from "next/link";
import { SiteChrome } from "../components/SiteChrome";
import { getJournalEntries } from "../lib/queries";

export const metadata: Metadata = {
  title: "Skincare journal",
  description:
    "Essays on layering, key actives, and building a skincare ritual that stays realistic day to day.",
};

const JOURNAL_CATEGORY_PILL: Record<string, string> = {
  Ritual: "Ritual",
  Science: "Science",
  Glow: "Glow",
  Routine: "Routine",
};

export default async function JournalPage() {
  const entries = await getJournalEntries();

  return (
    <SiteChrome>
      <main className="mystic-section-shell mystic-section !py-[5.25rem] md:!py-28">
        <nav
          className="mb-8 flex flex-wrap items-center gap-2 text-[0.68rem] uppercase tracking-[0.2em] text-[#7a7265]"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="transition hover:text-[#d6a85f]">
            Home
          </Link>
          <span aria-hidden>/</span>
          <span className="text-[#b8ab95]">Journal</span>
        </nav>
        <header className="mb-14 max-w-3xl space-y-5 border-b border-[rgba(214,168,95,0.09)] pb-12 md:mb-16 md:space-y-6 md:pb-14">
          <p className="text-[0.7rem] uppercase tracking-[0.34em] text-[#8a8275]">
            Journal
          </p>
          <h1 className="font-literata text-[clamp(2rem,4.5vw,3rem)] font-normal leading-[1.15] tracking-[0.1em] text-[#f2ebe1]">
            Skincare reads, written with care.
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-[#9a9185] md:text-[0.9375rem]">
            Essays on layering, ingredients, and routines—each piece opens on its own page.
          </p>
        </header>
        {entries.length === 0 ? (
          <div className="mystic-card border border-[rgba(214,168,95,0.12)] p-8 text-sm leading-[1.7] text-[#a99e8e]">
            <p>
              New essays are added here over time. For textures you can use today, start
              in the shop or on routines—this space stays focused on longer reads.
            </p>
            <Link
              href="/shop"
              className="mystic-button-secondary mt-6 inline-flex items-center justify-center px-6 py-3 text-xs uppercase tracking-[0.2em]"
            >
              Browse the shop
            </Link>
          </div>
        ) : (
          <div className="mx-auto grid max-w-6xl gap-10 sm:gap-12 md:grid-cols-2 md:gap-x-10 md:gap-y-14">
            {entries.map((entry) => (
              <Link
                key={entry.slug}
                href={`/journal/${entry.slug}`}
                className="group relative block rounded-[var(--mystic-radius-card)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(212,175,55,0.4)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04050a]"
              >
                <article className="relative flex h-full min-h-[17rem] flex-col overflow-hidden rounded-[var(--mystic-radius-card)] border border-[rgba(214,168,95,0.1)] bg-[linear-gradient(168deg,rgba(255,255,255,0.035)_0%,rgba(255,255,255,0.012)_42%,rgba(0,0,0,0.14)_100%)] px-7 py-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-[border-color,box-shadow,transform] duration-500 ease-out before:pointer-events-none before:absolute before:inset-0 before:rounded-[var(--mystic-radius-card)] before:bg-[radial-gradient(ellipse_90%_70%_at_0%_0%,rgba(214,168,95,0.07),transparent_55%)] before:opacity-60 group-hover:-translate-y-0.5 group-hover:border-[rgba(214,168,95,0.24)] group-hover:shadow-[0_32px_64px_rgba(0,0,0,0.42)] md:min-h-[18rem] md:px-8 md:py-9">
                  <p className="text-[0.6rem] uppercase tracking-[0.26em] text-[#7d7568]">
                    <span className="text-[#b5a892]">
                      {JOURNAL_CATEGORY_PILL[entry.category] ?? entry.category}
                    </span>
                    <span className="mx-2.5 inline-block text-[rgba(214,168,95,0.22)]">·</span>
                    <span className="font-medium tabular-nums tracking-[0.18em]">
                      {entry.readTime}
                    </span>
                  </p>
                  <div
                    aria-hidden
                    className="mt-5 h-px w-10 bg-gradient-to-r from-[rgba(214,168,95,0.35)] via-[rgba(214,168,95,0.1)] to-transparent"
                  />
                  <h2 className="mt-6 text-balance font-literata text-[clamp(1.25rem,2.6vw,1.65rem)] leading-[1.3] tracking-[0.06em] text-[#f5f0ea] transition group-hover:text-[#faf7f3]">
                    {entry.title}
                  </h2>
                  <p className="mt-4 line-clamp-2 text-[0.8125rem] leading-[1.55] text-[#8f867a]">
                    {entry.excerpt}
                  </p>
                  <div className="mt-auto flex items-center justify-between gap-3 pt-8">
                    <span className="text-[0.58rem] uppercase tracking-[0.22em] text-[#9d8f78] transition group-hover:text-[#c9b896]">
                      Open essay
                    </span>
                    <span
                      aria-hidden
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(214,168,95,0.14)] text-[0.75rem] text-[rgba(214,168,95,0.55)] transition duration-300 group-hover:border-[rgba(214,168,95,0.28)] group-hover:text-[rgba(214,168,95,0.9)]"
                    >
                      →
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}

        {entries.length > 0 ? (
          <section className="mt-16 border-t border-[rgba(214,168,95,0.12)] pt-12">
            <p className="text-[0.72rem] uppercase tracking-[0.26em] text-[#c9b896]">
              Shop the edit
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-[1.65] text-[#a99e8e]">
              When you are ready to buy, the same restraint you read about shows up in the
              formulas we stock—clear steps, honest texture notes.
            </p>
            <Link
              href="/shop"
              className="mystic-button-secondary mt-6 inline-flex items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em]"
            >
              Go to shop
            </Link>
          </section>
        ) : null}
      </main>
    </SiteChrome>
  );
}
