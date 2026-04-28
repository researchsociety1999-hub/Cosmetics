import Link from "next/link";

/**
 * Homepage services / gifting entry points (Phase 2). UI-only links.
 */
export function HomeServicesModule() {
  return (
    <section
      aria-labelledby="services-module-heading"
      className="relative border-b border-[rgba(17,24,39,0.88)] bg-transparent py-12 md:py-16"
    >
      <div className="mystic-section-shell">
        <div className="mystique-section-surface mx-auto max-w-4xl px-6 py-8 md:px-10 md:py-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#8a8275]">Services</p>
            <h2
              id="services-module-heading"
              className="mt-3 font-literata text-2xl tracking-[0.12em] text-[#f5eee3] md:text-3xl"
            >
              Gifting &amp; routines
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#b8ab95] md:text-base">
              Gift wrapping and personalization details appear at checkout when available. Build sets
              from the shop or follow a guided routine.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2 sm:gap-5">
            <Link
              href="/shop?sort=featured"
              className="mystic-card group flex min-h-[44px] flex-col justify-center border border-[rgba(214,168,95,0.12)] p-6 transition hover:border-[rgba(214,168,95,0.22)] md:p-7"
            >
              <span className="text-[0.62rem] uppercase tracking-[0.22em] text-[#d6a85f]">
                Build a gift set
              </span>
              <span className="mt-2 font-literata text-lg tracking-[0.08em] text-[#f5eee3]">
                Curate from featured
              </span>
              <span className="mt-2 text-sm text-[#8f8576] transition group-hover:text-[#b8ab95]">
                Shop → bundle at checkout
              </span>
            </Link>
            <Link
              href="/routines"
              className="mystic-card group flex min-h-[44px] flex-col justify-center border border-[rgba(214,168,95,0.12)] p-6 transition hover:border-[rgba(214,168,95,0.22)] md:p-7"
            >
              <span className="text-[0.62rem] uppercase tracking-[0.22em] text-[#d6a85f]">
                Create a routine
              </span>
              <span className="mt-2 font-literata text-lg tracking-[0.08em] text-[#f5eee3]">
                Morning · night · weekly
              </span>
              <span className="mt-2 text-sm text-[#8f8576] transition group-hover:text-[#b8ab95]">
                Step-by-step guides
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
