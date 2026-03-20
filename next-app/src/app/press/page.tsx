import type { Metadata } from "next";
import { SiteChrome } from "../components/SiteChrome";
import { getPressMentions } from "../lib/queries";

export const metadata: Metadata = {
  title: "Press",
  description: "Editorial mentions and press highlights for Mystique.",
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
          <h1 className="font-cormorant text-4xl tracking-[0.12em] md:text-5xl">
            Featured In
          </h1>
          <p className="text-sm leading-relaxed text-[#b8ab95] md:text-base">
            Editorial mentions that place Mystique inside a premium beauty conversation:
            ritual-led skincare, refined textures, and a darker luxury point of view.
          </p>
        </header>
        <div className="mb-8 flex items-center gap-3">
          <span className="mystic-pill">Editorial notes</span>
          <div className="h-px flex-1 bg-[rgba(214,168,95,0.12)]" />
        </div>
        <section className="grid gap-6 lg:grid-cols-2">
          {pressMentions.map((mention) => (
            <article key={mention.id} className="mystic-card p-6">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[0.72rem] uppercase tracking-[0.26em] text-[#d6a85f]">
                  {mention.source}
                </span>
                <span className="rounded-full border border-[rgba(214,168,95,0.16)] px-3 py-1 text-[0.62rem] uppercase tracking-[0.22em] text-[#cdbca1]">
                  Beauty editorial
                </span>
              </div>
              <h2 className="mt-3 max-w-xl font-cormorant text-3xl tracking-[0.08em] text-[#f5eee3]">
                {mention.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#b8ab95]">
                A beauty-editor perspective on Mystique’s ritual textures, premium finish,
                and bloom-skin point of view.
              </p>
              {mention.quote ? (
                <p className="mt-4 text-sm italic leading-relaxed text-[#f5eee3]">
                  &ldquo;{mention.quote}&rdquo;
                </p>
              ) : null}
            </article>
          ))}
        </section>
      </main>
    </SiteChrome>
  );
}
