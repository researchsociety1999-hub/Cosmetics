"use client";

import Link from "next/link";
import type { JournalEntry } from "../../lib/types";

const JOURNAL_CATEGORY_PILL: Record<string, string> = {
  Ritual: "Ritual",
  Science: "Science",
  Glow: "Glow",
  Routine: "Routine",
};

export function HomeJournal({ entries }: { entries: JournalEntry[] }) {
  const preview = entries.slice(0, 3);

  return (
    <section className="mystic-section border-b border-[rgba(17,24,39,0.9)] bg-transparent py-16 md:py-28 lg:py-32">
      <div className="mystic-section-shell">
        <header className="mb-16 flex max-w-4xl flex-col gap-8 border-b border-[rgba(214,168,95,0.07)] pb-14 sm:mb-[4.5rem] sm:flex-row sm:items-end sm:justify-between sm:gap-12 sm:pb-16 md:mb-20 md:max-w-none md:pb-[4.5rem]">
          <div className="space-y-4 md:space-y-6">
            <p className="text-[0.66rem] uppercase tracking-[0.36em] text-[#7d7568]">
              Journal
            </p>
            <h2 className="max-w-xl font-literata text-[clamp(1.625rem,3.6vw,2.375rem)] font-light leading-[1.22] tracking-[0.11em] text-[#f2ebe4]">
              Skincare reads, written with care.
            </h2>
          </div>
          {/* Ghost CTA — subordinate to hero primary action */}
          <Link
            href="/journal"
            className="inline-flex min-h-[44px] shrink-0 self-start items-center border border-[rgba(214,168,95,0.14)] bg-[rgba(2,3,6,0.28)] px-6 py-2.5 text-[0.62rem] uppercase tracking-[0.28em] text-[#b5a896] backdrop-blur-sm transition-[border-color,color,background-color] duration-500 ease-out hover:border-[rgba(214,168,95,0.24)] hover:bg-[rgba(2,3,6,0.38)] hover:text-[#e8dfd2] sm:self-auto motion-reduce:transition-none"
          >
            View all
          </Link>
        </header>
        {preview.length === 0 ? (
          <div className="mystic-card max-w-2xl border border-[rgba(214,168,95,0.12)] p-8 text-sm leading-[1.7] text-[#a99e8e]">
            <p>
              New pieces will appear here as the library grows. Until then, browse the full{" "}
              <Link href="/journal" className="text-[#d6c4a0] underline-offset-4 transition hover:text-[#e8d5b0] hover:underline">
                journal
              </Link>{" "}
              or explore the{" "}
              <Link href="/shop" className="text-[#d6c4a0] underline-offset-4 transition hover:text-[#e8d5b0] hover:underline">
                shop
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="mystique-section-surface mx-auto grid max-w-6xl gap-12 px-6 py-10 sm:gap-14 md:grid-cols-2 md:gap-x-12 md:gap-y-16 md:px-11 md:py-12 lg:grid-cols-3 lg:gap-x-14">
            {preview.map((entry) => (
              <Link
                key={entry.slug}
                href={`/journal/${entry.slug}`}
                className="group relative block rounded-[var(--mystic-radius-card)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(212,175,55,0.4)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04050a]"
              >
                <article className="relative flex h-full min-h-[15.5rem] flex-col overflow-hidden rounded-[var(--mystic-radius-card)] border border-[rgba(214,168,95,0.09)] bg-[linear-gradient(168deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.01)_42%,rgba(0,0,0,0.14)_100%)] px-8 py-9 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-[border-color,box-shadow,transform] duration-700 ease-out before:pointer-events-none before:absolute before:inset-0 before:rounded-[var(--mystic-radius-card)] before:bg-[radial-gradient(ellipse_90%_70%_at_0%_0%,rgba(214,168,95,0.055),transparent_55%)] before:opacity-50 group-hover:-translate-y-px group-hover:border-[rgba(214,168,95,0.18)] group-hover:shadow-[0_28px_56px_rgba(0,0,0,0.38)] md:min-h-[16rem] md:px-9 md:py-10">
                  <p className="text-[0.6rem] uppercase tracking-[0.26em] text-[#7d7568]">
                    <span className="text-[#b5a892]">
                      {JOURNAL_CATEGORY_PILL[entry.category] ?? entry.category}
                    </span>
                    <span className="mx-2.5 inline-block text-[rgba(214,168,95,0.22)]">&middot;</span>
                    <span className="font-medium tabular-nums tracking-[0.18em]">
                      {entry.readTime}
                    </span>
                  </p>
                  <div
                    aria-hidden
                    className="mt-5 h-px w-10 bg-gradient-to-r from-[rgba(214,168,95,0.35)] via-[rgba(214,168,95,0.1)] to-transparent"
                  />
                  <h3 className="mt-6 text-balance font-literata text-[clamp(1.2rem,2.4vw,1.45rem)] leading-[1.35] tracking-[0.06em] text-[#f5f0ea] transition group-hover:text-[#faf7f3]">
                    {entry.title}
                  </h3>
                  <p className="mt-4 line-clamp-3 text-[0.8125rem] leading-[1.55] text-[#8f867a]">
                    {entry.excerpt}
                  </p>
                  <div className="mt-auto flex items-center justify-between gap-3 pt-10">
                    <span className="text-[0.58rem] uppercase tracking-[0.22em] text-[#9d8f78] transition group-hover:text-[#c9b896]">
                      Essay
                    </span>
                    <span
                      aria-hidden
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(214,168,95,0.14)] text-[0.75rem] text-[rgba(214,168,95,0.55)] transition duration-300 group-hover:border-[rgba(214,168,95,0.28)] group-hover:text-[rgba(214,168,95,0.9)]"
                    >
                      &rarr;
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
