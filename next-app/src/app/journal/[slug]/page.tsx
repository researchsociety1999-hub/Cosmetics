import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteChrome } from "../../components/SiteChrome";
import { getJournalEntries } from "../../lib/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = (await getJournalEntries()).find((item) => item.slug === slug);

  if (!entry) {
    return { title: "Journal entry not found" };
  }

  return {
    title: entry.title,
    description: entry.excerpt,
  };
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
      <main className="mx-auto max-w-4xl px-4 py-14 md:px-6">
        <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
          {entry.category}
        </p>
        <h1 className="mt-4 font-cormorant text-5xl tracking-[0.12em]">
          {entry.title}
        </h1>
        <article className="mystic-card mt-10 p-8 text-sm leading-relaxed text-[#b8ab95] md:text-base">
          <p className="text-base text-[#d8c6aa]">{entry.excerpt}</p>
          <div className="mt-8 space-y-8">
            {(entry.content ?? []).map((section) => (
              <section key={section.heading}>
                <h2 className="font-cormorant text-3xl tracking-[0.08em] text-[#f5eee3]">
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
      </main>
    </SiteChrome>
  );
}
