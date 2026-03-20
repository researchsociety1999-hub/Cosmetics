import type { Metadata } from "next";
import { SiteChrome } from "../components/SiteChrome";

export const metadata: Metadata = {
  title: "About",
  description: "The California-born Mystique brand story: ritual, bloom skin, and clean science storytelling.",
};

export default function AboutPage() {
  return (
    <SiteChrome>
      <main className="mystic-section-shell mystic-section max-w-6xl">
        <header className="max-w-3xl space-y-4">
          <p className="mystic-kicker">About</p>
          <h1 className="font-cormorant text-4xl tracking-[0.12em] md:text-6xl">
            Luxury ritual, reimagined.
          </h1>
          <p className="text-sm leading-relaxed text-[#b8ab95] md:text-base">
            Mystique blends California restraint with K-beauty ritual to create
            skincare that feels atmospheric, polished, and easy to live with.
          </p>
        </header>
        <section className="mt-12 grid gap-6 md:grid-cols-3">
          <article className="mystic-card p-6">
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#d6a85f]">
              Origin
            </p>
            <h2 className="mt-3 font-cormorant text-3xl tracking-[0.08em]">
              California-born
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#b8ab95]">
              Mystique began as a vision for skincare that brings West Coast restraint
              into conversation with the layering logic of Korean beauty.
            </p>
          </article>
          <article className="mystic-card p-6">
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#d6a85f]">
              Philosophy
            </p>
            <h2 className="mt-3 font-cormorant text-3xl tracking-[0.08em]">
              Bloom skin first
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#b8ab95]">
              Every texture and finish is shaped around skin that looks hydrated,
              refined, calm, and softly illuminated rather than overworked.
            </p>
          </article>
          <article className="mystic-card p-6">
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#d6a85f]">
              Why Mystique
            </p>
            <h2 className="mt-3 font-cormorant text-3xl tracking-[0.08em]">
              Usable dark luxury
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#b8ab95]">
              The world feels editorial and cinematic, but the routines stay practical,
              layerable, and designed for everyday use.
            </p>
          </article>
        </section>
      </main>
    </SiteChrome>
  );
}
