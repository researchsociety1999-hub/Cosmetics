import Link from "next/link";

const PILL_CLASS =
  "inline-flex min-h-[44px] items-center justify-center rounded-full border border-[rgba(214,168,95,0.14)] bg-[rgba(255,255,255,0.02)] px-4 py-2.5 text-center text-[0.58rem] font-medium uppercase tracking-[0.22em] text-[#c9bcaa] transition-[border-color,background-color,color] duration-500 ease-out hover:border-[rgba(214,168,95,0.26)] hover:bg-[rgba(214,168,95,0.04)] hover:text-[#e8dfd2] sm:px-5 sm:text-[0.6rem] sm:tracking-[0.24em]";

/**
 * Homepage guided discovery (Phase 2). Anchor id for future header “Need help choosing?” link.
 */
export function HomeGuidedDiscovery() {
  return (
    <section
      id="guided-discovery"
      aria-labelledby="guided-discovery-heading"
      className="mystique-atmo mystique-atmo--discovery relative border-b border-[rgba(17,24,39,0.85)] bg-transparent py-14 md:py-20"
    >
      <div className="mystic-section-shell">
        <div className="mystique-section-surface px-6 py-10 md:px-11 md:py-12">
          <div className="mx-auto max-w-3xl text-center md:text-left">
            <p className="text-[0.66rem] uppercase tracking-[0.34em] text-[#7d7368]">
              Guided discovery
            </p>
            <h2
              id="guided-discovery-heading"
              className="mt-4 font-literata text-2xl font-light tracking-[0.11em] text-[#f5eee3] md:text-3xl"
            >
              Choose by what matters to you.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-[1.75] text-[#a99e8c] md:mx-0 md:text-base md:leading-[1.78]">
              Jump into the shop with a starting filter—no quiz, just calm direction.
            </p>
          </div>

          <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-12 lg:grid-cols-4">
            <div className="space-y-3.5">
              <h3 className="text-[0.62rem] uppercase tracking-[0.26em] text-[#9a8f82]">Skin type</h3>
              <ul className="flex flex-wrap gap-2">
                <li>
                  <Link href="/shop?search=dryness" className={PILL_CLASS}>
                    Dry
                  </Link>
                </li>
                <li>
                  <Link href="/shop?search=sensitivity" className={PILL_CLASS}>
                    Sensitive
                  </Link>
                </li>
                <li>
                  <Link href="/shop?search=combination" className={PILL_CLASS}>
                    Combination
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3.5">
              <h3 className="text-[0.62rem] uppercase tracking-[0.26em] text-[#9a8f82]">Concern</h3>
              <ul className="flex flex-wrap gap-2">
                <li>
                  <Link href="/shop?search=dullness" className={PILL_CLASS}>
                    Dullness
                  </Link>
                </li>
                <li>
                  <Link href="/shop?search=glow-even-tone" className={PILL_CLASS}>
                    Even tone
                  </Link>
                </li>
                <li>
                  <Link href="/shop?search=barrier" className={PILL_CLASS}>
                    Barrier
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3.5">
              <h3 className="text-[0.62rem] uppercase tracking-[0.26em] text-[#9a8f82]">Finish</h3>
              <ul className="flex flex-wrap gap-2">
                <li>
                  <Link href="/shop?search=dewy" className={PILL_CLASS}>
                    Dewy
                  </Link>
                </li>
                <li>
                  <Link href="/shop?search=matte" className={PILL_CLASS}>
                    Natural matte
                  </Link>
                </li>
                <li>
                  <Link href="/shop?search=satin" className={PILL_CLASS}>
                    Satin
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3.5">
              <h3 className="text-[0.62rem] uppercase tracking-[0.26em] text-[#9a8f82]">Routine goal</h3>
              <ul className="flex flex-wrap gap-2">
                <li>
                  <Link href="/routines#morning-ritual" className={PILL_CLASS}>
                    Morning calm
                  </Link>
                </li>
                <li>
                  <Link href="/routines#night-ritual" className={PILL_CLASS}>
                    Night repair
                  </Link>
                </li>
                <li>
                  <Link href="/shop?sort=newest" className={PILL_CLASS}>
                    New arrivals
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
