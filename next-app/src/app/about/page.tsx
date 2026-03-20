import type { Metadata } from "next";
import { SiteChrome } from "../components/SiteChrome";

export const metadata: Metadata = {
  title: "About",
  description: "The California-born Mystique brand story: ritual, bloom skin, and clean science storytelling.",
};

export default function AboutPage() {
  return (
    <SiteChrome>
      <main className="mx-auto max-w-6xl px-4 py-14 md:px-6">
        <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">About</p>
        <h1 className="mt-4 font-cormorant text-5xl tracking-[0.12em]">
          California luxury with a mystical K-beauty edge.
        </h1>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <article className="mystic-card p-6">
            <h2 className="font-cormorant text-3xl tracking-[0.08em]">Our point of view</h2>
            <p className="mt-4 text-sm leading-relaxed text-[#b8ab95]">
              Mystique was imagined as a California-born ritual skincare house
              where dark minimalism, Korean beauty layering, and regenerative
              science storytelling live in one coherent visual world.
            </p>
          </article>
          <article className="mystic-card p-6">
            <h2 className="font-cormorant text-3xl tracking-[0.08em]">Bloom skin first</h2>
            <p className="mt-4 text-sm leading-relaxed text-[#b8ab95]">
              Every texture and product story is built around skin that looks
              hydrated, refined, and softly illuminated rather than glossy or overdone.
            </p>
          </article>
        </div>
      </main>
    </SiteChrome>
  );
}
