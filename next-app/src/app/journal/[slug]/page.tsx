import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteChrome } from "../../components/SiteChrome";
import { getJournalEntries } from "../../lib/queries";
import { buildPageMetadata } from "../../lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = (await getJournalEntries()).find((item) => item.slug === slug);

  if (!entry) {
    return {
      ...buildPageMetadata({
        title: "Journal entry not found",
        canonicalPath: `/journal/${slug}`,
      }),
      robots: { index: false, follow: false },
    };
  }

  return buildPageMetadata({
    title: entry.title,
    description: entry.excerpt,
    canonicalPath: `/journal/${slug}`,
    openGraphType: "article",
  });
}

export default async function JournalEntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = (await getJournalEntries()).find((item) => item.slug === slug);

  if (!entry) {
    notFound();
  }

  return (
    <SiteChrome>
      <main className="w-full px-4 pb-28 pt-10 md:px-6 lg:px-10 lg:pb-14 lg:pt-14 xl:px-14">
        <nav
          className="mb-8 flex flex-wrap items-center gap-2 text-[0.68rem] uppercase tracking-[0.2em] text-[#7a7265]"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="transition hover:text-[#d6a85f]">
            Home
          </Link>
          <span aria-hidden>/</span>
          <Link href="/journal" className="transition hover:text-[#d6a85f]">
            Journal
          </Link>
          <span aria-hidden>/</span>
          <span className="max-w-[min(42ch,100%)] truncate text-[#b8ab95]" title={entry.title}>
            {entry.title}
          </span>
        </nav>
        <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
          {entry.category}
        </p>
        <h1 className="mt-4 font-literata text-5xl tracking-[0.12em]">
          {entry.title}
        </h1>
        <article className="mystic-card mt-10 p-8 text-sm leading-relaxed text-[#b8ab95] md:text-base">
          <p className="text-base text-[#d8c6aa]">{entry.excerpt}</p>
          <div className="mt-8 space-y-8">
            {(entry.content ?? []).map((section) => (
              <section key={section.heading}>
                <h2 className="font-literata text-3xl tracking-[0.08em] text-[#f5eee3]">
                  {section.heading}
                </h2>
                <div className="mt-4 space-y-4">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>

        <nav
          className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-[rgba(214,168,95,0.1)] pt-8 text-[0.68rem] uppercase tracking-[0.2em] text-[#8a8072]"
          aria-label="Journal navigation"
        >
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 transition hover:text-[#d6a85f]"
          >
            <span aria-hidden>←</span>
            All journal essays
          </Link>
          <Link href="/" className="transition hover:text-[#d6a85f]">
            Home
          </Link>
        </nav>
      </main>
    </SiteChrome>
  );
}
