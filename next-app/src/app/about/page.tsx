import Link from "next/link";
import type { Metadata } from "next";
import { ThemedImageFrame } from "../components/ThemedImageFrame";
import { SiteChrome } from "../components/SiteChrome";

export const metadata: Metadata = {
  title: "About",
  description:
    "Discover Mystique—California-rooted skincare with calm textures, disciplined layering, and healthy-looking radiance.",
};

export default function AboutPage() {
  return (
    <SiteChrome>
      <main className="mystic-section-shell mystic-section">
        <section className="relative overflow-hidden rounded-[34px] border border-[rgba(214,168,95,0.14)] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] px-6 py-8 shadow-[0_28px_80px_rgba(0,0,0,0.45)] md:px-10 md:py-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_22%,rgba(255,171,65,0.14),transparent_18%),radial-gradient(circle_at_82%_26%,rgba(214,168,95,0.08),transparent_24%),linear-gradient(135deg,rgba(5,6,9,0.08),rgba(5,6,9,0.42))]" />
          <div className="pointer-events-none absolute inset-y-[12%] right-[-8%] hidden w-[46%] rounded-full bg-[radial-gradient(circle,rgba(255,167,58,0.16),transparent_62%)] blur-3xl md:block" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgba(6,8,12,0),rgba(6,8,12,0.52))]" />

          <div className="relative grid items-center gap-10 md:grid-cols-[1.05fr_0.95fr]">
            <header className="max-w-3xl space-y-5">
              <p className="mystic-kicker">About</p>
              <h1 className="font-literata text-4xl tracking-[0.12em] md:text-6xl">
                Luxury ritual, reimagined.
              </h1>
              <p className="text-sm leading-relaxed text-[#b8ab95] md:text-base">
                Mystique pairs California restraint with a clear five-step routine—textures
                and finishes designed for mornings and nights you actually repeat.
              </p>
              <div className="grid gap-4 border-t border-[rgba(214,168,95,0.12)] pt-6 text-[#d8c6aa] sm:grid-cols-2">
                <div className="rounded-[22px] border border-[rgba(214,168,95,0.1)] bg-[rgba(255,255,255,0.02)] p-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#9f927f]">
                    California restraint
                  </p>
                  <p className="mt-2 text-sm">
                    Quiet palettes, clean silhouettes, and packaging that stays refined on
                    your shelf.
                  </p>
                </div>
                <div className="rounded-[22px] border border-[rgba(214,168,95,0.1)] bg-[rgba(255,255,255,0.02)] p-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#9f927f]">
                    Layered ritual
                  </p>
                  <p className="mt-2 text-sm">
                    Plush textures and layer-friendly routines shaped for daily use.
                  </p>
                </div>
              </div>
            </header>

            <div className="relative mx-auto flex w-full max-w-[560px] justify-center">
              <ThemedImageFrame
                  src="/hero-portrait-silhouette.png"
                  alt="Mystique mood study — monochrome silhouette"
                  width={560}
                  height={320}
                  priority
                  sizes="(max-width: 768px) 100vw, 560px"
                  variant="brand"
                  className="w-full"
                  frameClassName="rounded-[32px] px-4 py-6"
                  imageClassName="h-auto w-full object-contain"
                />
            </div>
          </div>
        </section>

        <section className="mt-12 grid gap-6 md:grid-cols-3">
          <article className="mystic-card p-6">
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#d6a85f]">
              Origin
            </p>
            <h2 className="mt-3 font-literata text-3xl tracking-[0.08em]">
              California-born
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#b8ab95]">
              Mystique began as a vision for skincare that pairs West Coast restraint
              with the quiet discipline of layered routines—each step earning the next.
            </p>
          </article>
          <article className="mystic-card p-6">
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#d6a85f]">
              Philosophy
            </p>
            <h2 className="mt-3 font-literata text-3xl tracking-[0.08em]">
              Skin comfort first
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#b8ab95]">
              Textures and finishes are tuned for skin that looks hydrated, calm, and
              softly lit—never stripped or overloaded.
            </p>
          </article>
          <article className="mystic-card p-6">
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#d6a85f]">
              Why Mystique
            </p>
            <h2 className="mt-3 font-literata text-3xl tracking-[0.08em]">
              Luxury you will use
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#b8ab95]">
              The mood stays cinematic, but every step stays practical—layerable formulas
              meant for real bathrooms and real schedules.
            </p>
          </article>
        </section>
        <section className="mt-12 text-center">
          <h2 className="font-literata text-3xl tracking-[0.1em] text-[#f5eee3]">
            Start where you have the most questions.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#b8ab95]">
            Shop the line, read how we choose actives on Ingredients, or write Contact for
            orders, press, and wholesale.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/shop"
              className="mystic-button-primary inline-flex items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em]"
            >
              Shop the collection
            </Link>
            <Link
              href="/ingredients"
              className="mystic-button-secondary inline-flex items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em]"
            >
              How we choose ingredients
            </Link>
          </div>
        </section>
      </main>
    </SiteChrome>
  );
}
