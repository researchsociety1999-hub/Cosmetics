import type { Metadata } from "next";
import Link from "next/link";
import { SiteChrome } from "../components/SiteChrome";

export const metadata: Metadata = {
  title: "Routines",
  description: "A Mystique ritual builder teaser for curated skin routines.",
};

export default function RoutinesPage() {
  return (
    <SiteChrome>
      <main className="mystic-section-shell mystic-section max-w-6xl">
        <header className="max-w-3xl space-y-4">
          <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
            Routines
          </p>
          <h1 className="font-literata text-4xl tracking-[0.12em] md:text-5xl">
            Not sure where to start?
          </h1>
          <p className="text-sm leading-relaxed text-[#b8ab95] md:text-base">
            Build your Mystique ritual with a simple morning or evening flow,
            then shop the collection step by step.
          </p>
        </header>

        <section className="mt-12 grid gap-6 lg:grid-cols-2">
          <RoutineCard
            title="Morning routine"
            subtitle="Protect glow, keep layers light, and finish with daily defense."
            timing="Designed for daily use before SPF."
            steps={["Cleanse", "Tone", "Treat", "Moisturize", "Protect"]}
          />
          <RoutineCard
            title="Evening routine"
            subtitle="Reset the skin, layer treatment, and seal everything in overnight."
            timing="Best for nightly recovery and richer layering."
            steps={["Double cleanse", "Tone", "Treat", "Moisturize"]}
          />
        </section>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/shop"
            className="mystic-button-primary inline-flex items-center justify-center px-6 py-3 text-xs uppercase tracking-[0.2em]"
          >
            Shop the collection
          </Link>
          <Link
            href="/ingredients"
            className="mystic-button-secondary inline-flex items-center justify-center px-6 py-3 text-xs uppercase tracking-[0.2em]"
          >
            Explore ingredients
          </Link>
        </div>
      </main>
    </SiteChrome>
  );
}

function RoutineCard({
  title,
  subtitle,
  timing,
  steps,
}: {
  title: string;
  subtitle: string;
  timing: string;
  steps: string[];
}) {
  return (
    <article className="mystic-card p-6 md:p-8">
      <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#d6a85f]">
        Starter sequence
      </p>
      <h2 className="mt-3 font-literata text-4xl tracking-[0.1em] text-[#f5eee3]">
        {title}
      </h2>
      <p className="mt-4 text-sm leading-relaxed text-[#b8ab95]">
        {subtitle}
      </p>
      <p className="mt-3 text-[0.72rem] uppercase tracking-[0.22em] text-[#d6a85f]">
        {timing}
      </p>
      <div className="mt-8 space-y-3">
        {steps.map((step, index) => (
          <div
            key={step}
            className="flex items-center gap-4 rounded-[20px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)] px-4 py-4"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(214,168,95,0.2)] text-[0.72rem] uppercase tracking-[0.16em] text-[#d6a85f]">
              {index + 1}
            </span>
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.24em] text-[#8f8371]">
                Step {index + 1}
              </p>
              <p className="mt-1 text-sm text-[#f5eee3]">{step}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link
          href="/shop"
          className="mystic-button-secondary inline-flex items-center justify-center px-5 py-2 text-[0.68rem] uppercase tracking-[0.2em]"
        >
          Shop this routine
        </Link>
        <p className="text-xs uppercase tracking-[0.2em] text-[#9f927f]">
          {steps.join(" · ")}
        </p>
      </div>
    </article>
  );
}
