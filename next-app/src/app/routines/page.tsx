import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteChrome } from "../components/SiteChrome";
import { HOME_BRAND_IMAGES } from "../lib/homeBrandImages";

export const metadata: Metadata = {
  title: "Routines",
  description:
    "Morning, night, and weekly Mystique rituals—layer-friendly steps you can shop one at a time.",
};

export default function RoutinesPage() {
  return (
    <SiteChrome>
      <main className="mystic-section-shell mystic-section">
        <header className="relative min-h-[14rem] overflow-hidden rounded-[var(--mystic-radius-card)] border border-[rgba(214,168,95,0.14)] md:min-h-[16rem]">
          <div className="pointer-events-none absolute inset-0 min-h-[inherit]">
            <Image
              src={HOME_BRAND_IMAGES.editorial.profileMoon}
              alt=""
              fill
              sizes="(max-width:768px) 100vw, 896px"
              className="object-cover object-[center_28%] opacity-35"
              quality={82}
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-[linear-gradient(120deg,rgba(4,5,10,0.92)_0%,rgba(4,5,10,0.78)_42%,rgba(4,5,10,0.55)_100%)]"
            />
          </div>
          <div className="relative z-10 max-w-3xl space-y-4 px-6 py-10 md:px-10 md:py-12">
            <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#d8c8aa]">
              Routines
            </p>
            <h1 className="font-literata text-4xl tracking-[0.12em] text-[#f5eee3] drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)] md:text-5xl">
              Not sure where to start?
            </h1>
            <p className="text-sm leading-relaxed text-[#d4caba] md:text-base">
              Morning, night, and a weekly reset—three cadences you can follow as written or adapt
              to your skin. Shop the collection step by step from each card.
            </p>
          </div>
        </header>

        <section className="mt-12 grid gap-6 lg:grid-cols-3">
          <RoutineCard
            id="morning-ritual"
            title="Morning ritual"
            subtitle="Protect glow, keep layers light, and finish with daily defense."
            timing="Designed for daily use before SPF."
            steps={["Cleanse", "Tone", "Treat", "Moisturize", "Protect"]}
          />
          <RoutineCard
            id="night-ritual"
            title="Night ritual"
            subtitle="Reset the skin, layer treatment, and seal everything in overnight."
            timing="Best for nightly recovery and richer layering."
            steps={["Double cleanse", "Tone", "Treat", "Moisturize"]}
          />
          <RoutineCard
            id="weekly-ritual"
            title="Weekly ritual"
            subtitle="A slower pass for clarity and renewal—keep it to one or two evenings a week."
            timing="When skin can handle a little more friction and soak time."
            steps={["Cleanse", "Exfoliate or mask", "Treat", "Moisturize"]}
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
  id,
  title,
  subtitle,
  timing,
  steps,
}: {
  id?: string;
  title: string;
  subtitle: string;
  timing: string;
  steps: string[];
}) {
  return (
    <article id={id} className="mystic-card scroll-mt-28 p-6 md:p-8 lg:scroll-mt-32">
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
            key={`${index}-${step}`}
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
