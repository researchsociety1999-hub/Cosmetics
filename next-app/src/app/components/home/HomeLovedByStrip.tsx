import Link from "next/link";

const TESTIMONIALS: Array<{ quote: string; author: string }> = [
  {
    quote: "Texture-first formulas that feel expensive from the first layer.",
    author: "Early customer note",
  },
  {
    quote: "My routine looks calmer—nothing pills, nothing feels heavy.",
    author: "Routine wearer",
  },
  {
    quote: "The finish is the point: soft, even, and quietly luminous.",
    author: "Studio subscriber",
  },
];

export function HomeLovedByStrip() {
  return (
    <section
      aria-labelledby="loved-by-heading"
      className="relative border-b border-[rgba(214,168,95,0.08)] bg-[linear-gradient(180deg,#03040a_0%,#04050a_55%,#03040a_100%)] py-12 md:py-16"
    >
      <div className="mystic-section-shell">
        <header className="mx-auto max-w-3xl text-center md:text-left">
          <p className="text-[0.7rem] uppercase tracking-[0.3em] text-[#8a8275]">
            As loved by
          </p>
          <h2
            id="loved-by-heading"
            className="mt-3 font-literata text-2xl tracking-[0.12em] text-[#f5eee3] md:text-3xl"
          >
            Notes from real routines.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#b8ab95] md:mx-0 md:text-base">
            A small preview of what shoppers say about texture, finish, and daily wear.
          </p>
        </header>

        <div className="mt-10 grid gap-5 md:grid-cols-3 md:gap-6">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.quote}
              className="mystic-card relative overflow-hidden border border-white/[0.05] bg-[linear-gradient(165deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.01)_44%,rgba(0,0,0,0.16)_100%)] p-6 shadow-[0_24px_56px_rgba(0,0,0,0.42)]"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_0%_0%,rgba(214,168,95,0.08),transparent_55%)] opacity-70"
              />
              <blockquote className="relative z-[1] text-sm leading-relaxed text-[#d8c6aa]">
                “{t.quote}”
              </blockquote>
              <figcaption className="relative z-[1] mt-4 text-[0.62rem] uppercase tracking-[0.24em] text-[#7a7265]">
                {t.author}
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-10 flex justify-center md:justify-start">
          <Link
            href="/shop"
            className="inline-flex min-h-[44px] items-center text-[0.65rem] uppercase tracking-[0.2em] text-[#d6a85f] underline-offset-4 transition hover:text-[#e8c56e] hover:underline"
          >
            Shop best sellers
          </Link>
        </div>
      </div>
    </section>
  );
}

