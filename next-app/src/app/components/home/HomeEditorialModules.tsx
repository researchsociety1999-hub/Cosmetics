import Link from "next/link";

/**
 * Homepage editorial commerce blocks (Phase 2). Layout-only; no new assets.
 */
export function HomeEditorialModules() {
  return (
    <section
      aria-labelledby="editorial-modules-heading"
      className="mystic-section relative border-b border-[rgba(214,168,95,0.08)] bg-[#04050a]"
    >
      <div className="mystic-section-shell space-y-16 md:space-y-20">
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
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
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
          <div
            aria-hidden
            className="mystic-card relative min-h-[14rem] overflow-hidden border border-white/[0.06] bg-[linear-gradient(165deg,rgba(24,20,16,0.9)_0%,rgba(8,9,14,0.95)_45%,rgb(4,5,10)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] md:min-h-[18rem]"
          />
        </div>

        {/* Asymmetric: tall left, two stacked right */}
        <div className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-8">
          <div
            aria-hidden
            className="mystic-card relative min-h-[20rem] overflow-hidden border border-white/[0.06] bg-[linear-gradient(195deg,rgba(18,22,32,0.95)_0%,rgba(6,7,12,1)_55%,rgb(3,4,8)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] md:min-h-[24rem]"
          />
          <div className="flex flex-col gap-6">
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
