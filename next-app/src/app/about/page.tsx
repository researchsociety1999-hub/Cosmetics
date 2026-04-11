import Link from "next/link";
import type { Metadata } from "next";
import { ThemedImageFrame } from "../components/ThemedImageFrame";
import { SiteChrome } from "../components/SiteChrome";

export const metadata: Metadata = {
  title: "About",
  description: "The California-born Mystique brand story: ritual, bloom skin, and clean science storytelling.",
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
                Mystique blends California restraint with Mystique Beauty ritual to create
                skincare that feels atmospheric, polished, and easy to live with.
              </p>
              <div className="grid gap-4 border-t border-[rgba(214,168,95,0.12)] pt-6 text-[#d8c6aa] sm:grid-cols-2">
                <div className="rounded-[22px] border border-[rgba(214,168,95,0.1)] bg-[rgba(255,255,255,0.02)] p-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#9f927f]">
                    California restraint
                  </p>
                  <p className="mt-2 text-sm">
                    Quiet luxury, clean silhouettes, and a softened editorial mood.
                  </p>
                </div>
                <div className="rounded-[22px] border border-[rgba(214,168,95,0.1)] bg-[rgba(255,255,255,0.02)] p-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#9f927f]">
                    Mystique Beauty ritual
                  </p>
                  <p className="mt-2 text-sm">
                    Plush textures and layer-friendly routines shaped for daily use.
                  </p>
                </div>
              </div>
            </header>

            <div className="relative mx-auto flex w-full max-w-[560px] justify-center">
              <ThemedImageFrame
                  src="/Photo%20Mar%2019%202026,%204%2022%2015%20PM.png"
                  alt="Mystique brand artwork"
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
              Mystique began as a vision for skincare that brings West Coast restraint
              into conversation with the layering logic of Korean beauty.
            </p>
          </article>
          <article className="mystic-card p-6">
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#d6a85f]">
              Philosophy
            </p>
            <h2 className="mt-3 font-literata text-3xl tracking-[0.08em]">
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
            <h2 className="mt-3 font-literata text-3xl tracking-[0.08em]">
              Usable dark luxury
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#b8ab95]">
              The world feels editorial and cinematic, but the routines stay practical,
              layerable, and designed for everyday use.
            </p>
          </article>
        </section>
        <section className="mt-12 text-center">
          <h2 className="font-literata text-3xl tracking-[0.1em] text-[#f5eee3]">
            Ready to start your ritual?
          </h2>
          <div className="mt-6">
            <Link
              href="/shop"
              className="mystic-button-primary inline-flex items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em]"
            >
              Shop the collection
            </Link>
          </div>
        </section>
      </main>
    </SiteChrome>
  );
}
