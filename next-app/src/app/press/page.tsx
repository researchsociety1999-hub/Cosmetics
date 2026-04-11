import type { Metadata } from "next";
import Link from "next/link";
import { SiteChrome } from "../components/SiteChrome";
import { getPressMentions } from "../lib/queries";
import type { PressMention } from "../lib/types";

export const metadata: Metadata = {
  title: "Press",
  description:
    "Press room for Mystique—published coverage is listed only when we can link to the real piece.",
};

export const revalidate = 300;

export default async function PressPage() {
  const pressMentions = await getPressMentions();

  return (
    <SiteChrome>
      <main className="mystic-section-shell mystic-section">
        <header className="mb-10 max-w-3xl space-y-4">
          <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
            Press
          </p>
          <h1 className="font-literata text-4xl tracking-[0.12em] md:text-5xl">
            Press &amp; media
          </h1>
          <p className="text-sm leading-relaxed text-[#b8ab95] md:text-base">
            Coverage appears here only when we can point to the published piece. For
            assets, fact checks, or wholesale, reach the studio through{" "}
            <Link href="/contact" className="text-[#f0d19a] underline-offset-4 hover:underline">
              Contact
            </Link>
            .
          </p>
        </header>
        <div className="mb-8 flex items-center gap-3">
          <span className="mystic-pill">Credits</span>
          <div className="h-px flex-1 bg-[rgba(214,168,95,0.12)]" />
        </div>
        {pressMentions.length === 0 ? (
          <div className="mystic-card p-8 text-sm leading-relaxed text-[#b8ab95]">
            <p>
              There is no public press list here yet. When features go live, we add them
              with working outbound links—never placeholder URLs. Until then, browse the{" "}
              <Link href="/shop" className="text-[#f0d19a] underline-offset-4 hover:underline">
                collection
              </Link>{" "}
              or write{" "}
              <Link href="/contact" className="text-[#f0d19a] underline-offset-4 hover:underline">
                Contact
              </Link>{" "}
              for media requests.
            </p>
          </div>
        ) : (
          <section className="grid gap-6 lg:grid-cols-2">
            {pressMentions.map((mention) => (
              <PressMentionCard key={mention.id} mention={mention} />
            ))}
          </section>
        )}
      </main>
    </SiteChrome>
  );
}

function safePressHref(link: string | null): string | null {
  if (!link?.trim()) {
    return null;
  }
  try {
    const parsed = new URL(link);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return link;
  } catch {
    return null;
  }
}

function formatPressDate(iso: string | null): string | null {
  if (!iso?.trim()) {
    return null;
  }
  const t = Date.parse(iso);
  if (Number.isNaN(t)) {
    return null;
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(t));
}

function PressMentionCard({ mention }: { mention: PressMention }) {
  const external = safePressHref(mention.link);
  const dateLabel = formatPressDate(mention.published_at);

  return (
    <article className="mystic-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-[0.72rem] uppercase tracking-[0.26em] text-[#d6a85f]">
          {mention.source}
        </span>
        {dateLabel ? (
          <time
            dateTime={mention.published_at ?? undefined}
            className="text-[0.62rem] uppercase tracking-[0.2em] text-[#7a7265]"
          >
            {dateLabel}
          </time>
        ) : null}
      </div>
      <h2 className="mt-3 max-w-xl font-literata text-3xl tracking-[0.08em] text-[#f5eee3]">
        {mention.title}
      </h2>
      {mention.quote ? (
        <blockquote className="mt-4 border-l-2 border-[rgba(214,168,95,0.25)] pl-4 text-sm italic leading-relaxed text-[#e8dcc8]">
          &ldquo;{mention.quote}&rdquo;
        </blockquote>
      ) : null}
      {external ? (
        <a
          href={external}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex text-xs uppercase tracking-[0.2em] text-[#f0d19a] underline-offset-4 hover:underline"
        >
          Open article
        </a>
      ) : (
        <p className="mt-5 text-[0.65rem] uppercase tracking-[0.18em] text-[#7a7265]">
          Link not published
        </p>
      )}
    </article>
  );
}
