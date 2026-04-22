import Link from "next/link";

const PILL_CLASS =
  "inline-flex min-h-[44px] items-center justify-center rounded-full border border-[rgba(214,168,95,0.22)] bg-[rgba(255,255,255,0.03)] px-4 py-2.5 text-center text-[0.6rem] font-medium uppercase tracking-[0.18em] text-[#f0e8dc] transition hover:border-[rgba(214,168,95,0.42)] hover:bg-[rgba(214,168,95,0.06)] sm:px-5 sm:text-[0.62rem] sm:tracking-[0.2em]";

/**
 * Homepage guided discovery (Phase 2). Anchor id for future header “Need help choosing?” link.
 */
export function HomeGuidedDiscovery() {
  return (
    <section
      id="guided-discovery"
      aria-labelledby="guided-discovery-heading"
      className="relative border-b border-[rgba(17,24,39,0.85)] bg-[linear-gradient(180deg,#03040a_0%,#05070d_55%,#04050a_100%)] py-12 md:py-16"
    >
      <div className="mystic-section-shell">
        <div className="mx-auto max-w-3xl text-center md:text-left">
          <p className="text-[0.7rem] uppercase tracking-[0.3em] text-[#8a8275]">
            Guided discovery
          </p>
          <h2
            id="guided-discovery-heading"
            className="mt-3 font-literata text-2xl tracking-[0.12em] text-[#f5eee3] md:text-3xl"
          >
            Choose by what matters to you.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#b8ab95] md:mx-0 md:text-base">
            Jump into the shop with a starting filter—no quiz, just calm direction.
          </p>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <h3 className="text-[0.65rem] uppercase tracking-[0.24em] text-[#b8ab95]">Skin type</h3>
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
          <div className="space-y-3">
            <h3 className="text-[0.65rem] uppercase tracking-[0.24em] text-[#b8ab95]">Concern</h3>
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
          <div className="space-y-3">
            <h3 className="text-[0.65rem] uppercase tracking-[0.24em] text-[#b8ab95]">Finish</h3>
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
          <div className="space-y-3">
            <h3 className="text-[0.65rem] uppercase tracking-[0.24em] text-[#b8ab95]">Routine goal</h3>
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
    </section>
  );
}
