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
      <main className="mystic-section-shell mystic-section">
        <header className="mb-12 max-w-3xl space-y-5">
          <p className="text-[0.75rem] uppercase tracking-[0.3em] text-[#b8ab95]">
            Journal
          </p>
          <h1 className="font-literata text-4xl tracking-[0.1em] text-[#f2ebe1] md:text-5xl">
            Skincare reads, written with care.
          </h1>
          <p className="text-base leading-[1.65] text-[#a99e8e] md:text-[1.05rem]">
            Essays on layering, key ingredients, and routines that stay realistic—aligned
            with how we merchandise the shop.
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
          <div className="grid gap-8 md:grid-cols-2 md:gap-9">
            {entries.map((entry) => (
              <article
                key={entry.slug}
                className="group relative flex flex-col overflow-hidden rounded-[var(--mystic-radius-card)] border border-[rgba(214,168,95,0.13)] bg-[linear-gradient(165deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.01)_48%,rgba(0,0,0,0.12)_100%)] p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-[border-color,box-shadow,transform] duration-500 ease-out before:pointer-events-none before:absolute before:inset-0 before:rounded-[var(--mystic-radius-card)] before:opacity-0 before:shadow-[0_0_48px_rgba(214,168,95,0.07)] before:transition-opacity before:duration-500 hover:-translate-y-0.5 hover:border-[rgba(214,168,95,0.32)] hover:shadow-[0_28px_56px_rgba(0,0,0,0.5)] hover:before:opacity-100 md:p-8"
              >
                <div className="flex items-center justify-between gap-4 border-b border-[rgba(214,168,95,0.11)] pb-5">
                  <span className="mystic-pill !border-[rgba(214,168,95,0.22)] !px-3.5 !py-1.5 !text-[0.58rem] !tracking-[0.28em]">
                    {JOURNAL_CATEGORY_PILL[entry.category] ?? entry.category}
                  </span>
                  <span className="shrink-0 font-medium tabular-nums text-[0.65rem] uppercase tracking-[0.22em] text-[#7d7366]">
                    {entry.readTime}
                  </span>
                </div>
                <h2 className="mt-6 text-balance font-literata text-[clamp(1.35rem,3.2vw,2rem)] leading-[1.16] tracking-[0.04em] text-[#f4efe6] md:mt-7">
                  {entry.title}
                </h2>
                <p className="mt-4 flex-1 text-[0.9375rem] leading-[1.7] text-[#9c9183] md:text-[0.96875rem]">
                  {entry.excerpt}
                </p>
                <Link
                  href={`/journal/${entry.slug}`}
                  className="mt-8 flex w-full items-center justify-between gap-3 border-t border-[rgba(214,168,95,0.08)] pt-6 text-[0.6rem] uppercase tracking-[0.24em] text-[#b8a888] transition group-hover:border-[rgba(214,168,95,0.16)] group-hover:text-[#e3d4bc]"
                >
                  <span className="underline-offset-[5px] group-hover:underline">Read the essay</span>
                  <span
                    aria-hidden
                    className="text-[0.85rem] text-[rgba(214,168,95,0.45)] transition duration-300 group-hover:translate-x-0.5 group-hover:text-[rgba(214,168,95,0.85)]"
                  >
                    →
                  </span>
                </Link>
              </article>
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
