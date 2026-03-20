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
      <main className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <header className="mb-10 max-w-3xl space-y-4">
          <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
            Press
          </p>
          <h1 className="font-cormorant text-4xl tracking-[0.12em] md:text-5xl">
            As seen through the lens of beauty editors.
          </h1>
        </header>
        <section className="grid gap-6 lg:grid-cols-2">
          {pressMentions.map((mention) => (
            <article key={mention.id} className="mystic-card p-6">
              <p className="text-[0.72rem] uppercase tracking-[0.26em] text-[#d6a85f]">
                {mention.source}
              </p>
              <h2 className="mt-3 font-cormorant text-3xl tracking-[0.08em] text-[#f5eee3]">
                {mention.title}
              </h2>
              {mention.quote ? (
                <p className="mt-4 text-sm italic leading-relaxed text-[#f5eee3]">
                  "{mention.quote}"
                </p>
              ) : null}
            </article>
          ))}
        </section>
      </main>
    </SiteChrome>
  );
}
