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
      className="relative border-b border-[rgba(214,168,95,0.08)] bg-transparent py-6 md:py-7"
    >
      <div className="mystic-section-shell">
        <ul className="flex flex-wrap items-start justify-center gap-x-8 gap-y-5 text-center sm:gap-x-12 md:gap-x-16">
          {items.map((item) => (
            <li
              key={item.title}
              className="flex min-w-[9.5rem] max-w-[13rem] flex-col gap-0.5 border-l border-[rgba(214,168,95,0.12)] pl-5 first:border-l-0 first:pl-0 sm:min-w-[10rem]"
            >
              <span className="text-[0.62rem] uppercase tracking-[0.22em] text-[#d6c4a0]">
                {item.title}
              </span>
              <span className="text-[0.65rem] leading-snug text-[#A89060]">
                {item.hint}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
