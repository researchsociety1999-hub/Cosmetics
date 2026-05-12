/**
 * Homepage-only trust strip (Phase 2). Static; no data fetch.
 */
export function HomeTrustStrip() {
  const items = [
    { title: "Free shipping", hint: "Calculated at checkout" },
    { title: "Easy returns", hint: "Straightforward policy" },
    { title: "Authentic products", hint: "Sourced with care" },
    { title: "Samples", hint: "When available" },
  ] as const;

  return (
    <section
      aria-label="Shopping guarantees"
      className="mystique-atmo mystique-atmo--trust relative border-b border-[rgba(214,168,95,0.06)] bg-transparent py-8 md:py-10"
    >
      <div className="mystic-section-shell">
        <ul className="flex flex-wrap items-start justify-center gap-x-10 gap-y-6 text-center sm:gap-x-14 md:gap-x-[4.5rem]">
          {items.map((item) => (
            <li
              key={item.title}
              className="flex min-w-[9.5rem] max-w-[13rem] flex-col gap-1 border-l border-[rgba(214,168,95,0.09)] pl-6 first:border-l-0 first:pl-0 sm:min-w-[10rem]"
            >
              <span className="text-[0.6rem] uppercase tracking-[0.28em] text-[#b5a896]">
                {item.title}
              </span>
              <span className="text-[0.64rem] leading-relaxed text-[#7d7368]">
                {item.hint}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
