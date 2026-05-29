import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageContainer } from "../../components/PageContainer";
import { PageHeader } from "../../components/PageHeader";
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
      <PageContainer as="main" variant="narrow">
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
        <PageHeader eyebrow={entry.category} title={entry.title} />
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
      </PageContainer>
    </SiteChrome>
  );
}
