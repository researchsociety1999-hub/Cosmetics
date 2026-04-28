import Link from "next/link";

/**
 * Homepage editorial commerce blocks (Phase 2). Layout-only; no new assets.
 */
export function HomeEditorialModules() {
  return (
    <section
      aria-labelledby="editorial-modules-heading"
      className="mystic-section mystique-material mystique-material--editorial relative border-b border-[rgba(214,168,95,0.08)] bg-transparent"
    >
      <div className="mystic-section-shell space-y-10 md:space-y-20">
        <header className="mx-auto max-w-3xl text-center md:text-left">
          <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#8a8275]">Stories &amp; commerce</p>
          <h2
            id="editorial-modules-heading"
            className="mt-3 font-literata text-2xl tracking-[0.12em] text-[#f5eee3] md:text-3xl"
          >
            Editorial moments
          </h2>
        </header>

        {/* Full-width narrative */}
        <article className="mystic-card relative overflow-hidden border border-[rgba(214,168,95,0.1)] p-8 md:p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_0%_0%,rgba(214,168,95,0.08),transparent_50%),linear-gradient(180deg,rgba(8,10,16,0.5)_0%,rgba(4,5,10,0.2)_100%)]"
          />
          <div className="relative z-[1] mx-auto max-w-3xl text-center">
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#b8ab95]">Essay</p>
            <h3 className="mt-4 font-literata text-2xl tracking-[0.1em] text-[#f5eee3] md:text-[1.75rem]">
              Layering is the ritual.
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-[#b8ab95] md:text-base">
              Textures that melt in, then hold—so morning stays calm and night can recover.
            </p>
            <Link
              href="/journal"
              className="mystic-button-secondary mt-8 inline-flex min-h-[44px] items-center justify-center px-6 py-3 text-[0.62rem] uppercase tracking-[0.22em]"
            >
              Read the journal
            </Link>
          </div>
        </article>

        {/* Split: text + gradient panel */}
        <div className="mystique-section-surface grid items-center gap-10 px-7 py-8 md:px-10 md:py-10 lg:gap-14">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#8a8275]">Split</p>
            <h3 className="mt-3 font-literata text-2xl tracking-[0.1em] text-[#f2ebe4] md:text-3xl">
              Formulas built for daily return.
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-[#b8ab95] md:text-base">
              Shop by concern or ingredient—each product page spells out how it fits a routine.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-flex min-h-[44px] items-center text-[0.65rem] uppercase tracking-[0.2em] text-[#d6a85f] underline-offset-4 transition hover:text-[#e8c56e] hover:underline"
            >
              Browse the shop
            </Link>
          </div>
          {/* Visual container temporarily hidden until assets exist */}
        </div>

        {/* Asymmetric: tall left, two stacked right */}
        <div className="grid gap-6 md:gap-8">
          {/* Visual container temporarily hidden until assets exist */}
          <div className="flex flex-col gap-6 md:flex-row">
            <article className="mystic-card flex flex-1 flex-col justify-center border border-[rgba(214,168,95,0.1)] p-6 md:p-8">
              <h3 className="font-literata text-xl tracking-[0.08em] text-[#f5eee3]">
                Ingredients, translated.
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#b8ab95]">
                Short notes on what each active does—and why we reach for it.
              </p>
              <Link
                href="/ingredients"
                className="mt-5 inline-flex min-h-[44px] items-center text-[0.65rem] uppercase tracking-[0.2em] text-[#d6a85f] underline-offset-4 hover:underline"
              >
                Ingredient library
              </Link>
            </article>
            <article className="mystic-card flex flex-1 flex-col justify-center border border-[rgba(214,168,95,0.1)] p-6 md:p-8">
              <h3 className="font-literata text-xl tracking-[0.08em] text-[#f5eee3]">
                Routines you can keep.
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#b8ab95]">
                Morning, night, and weekly resets—written as steps, not trends.
              </p>
              <Link
                href="/routines"
                className="mt-5 inline-flex min-h-[44px] items-center text-[0.65rem] uppercase tracking-[0.2em] text-[#d6a85f] underline-offset-4 hover:underline"
              >
                View routines
              </Link>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
