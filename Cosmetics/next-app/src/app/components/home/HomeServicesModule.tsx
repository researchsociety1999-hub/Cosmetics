import Image from "next/image";
import Link from "next/link";

/**
 * Homepage services / gifting entry points (Phase 2). UI-only links.
 */
export function HomeServicesModule() {
  return (
    <section
      aria-labelledby="services-module-heading"
      className="mystique-atmo mystique-atmo--services relative border-b border-[rgba(17,24,39,0.88)] bg-transparent py-14 md:py-20"
    >
      <div className="mystic-section-shell">
        <div
          className="relative mx-auto max-w-4xl overflow-hidden rounded-[28px] border border-[rgba(214,168,95,0.2)] shadow-[0_32px_96px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.09)] ring-1 ring-inset ring-[rgba(214,168,95,0.1)]"
          data-image-slot="home-services"
        >
          {/* Background photography — calm, luminous, slightly lifted */}
          <div className="pointer-events-none absolute inset-0 z-0">
            <Image
              src="/home-services-apothecary.png"
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 56rem"
              className="object-cover object-[50%_48%] scale-[1.02] brightness-[1.04] contrast-[0.97] saturate-[0.92] motion-reduce:scale-100"
              quality={90}
            />
          </div>
          {/* Open, welcoming top; gentle depth toward the bottom for reading comfort */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-[#0a0c12]/10 via-[#060812]/18 to-[#03050a]/58]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_120%_70%_at_50%_8%,rgba(255,248,236,0.08),transparent_52%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_90%_60%_at_50%_100%,rgba(214,168,95,0.07),transparent_50%)] mix-blend-soft-light opacity-70"
          />
          {/* Light glass veil — lets colour and light from the bottles show through */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[2] bg-[rgba(14,16,26,0.2)] backdrop-blur-[8px] [-webkit-backdrop-filter:blur(8px)] supports-[backdrop-filter]:bg-[rgba(14,16,26,0.14)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[2] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
          />

          <div className="relative z-[3] px-6 py-10 md:px-11 md:py-12">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-[0.66rem] uppercase tracking-[0.32em] text-[#e8dcc4] [text-shadow:0_1px_12px_rgba(0,0,0,0.35)]">
                Services
              </p>
              <h2
                id="services-module-heading"
                className="mt-4 font-literata text-2xl font-light tracking-[0.11em] text-[#faf6f0] [text-shadow:0_2px_20px_rgba(0,0,0,0.35)] md:text-3xl"
              >
                Gifting &amp; routines
              </h2>
              <p className="mt-4 text-sm leading-[1.75] text-[#efe8dc] [text-shadow:0_1px_14px_rgba(0,0,0,0.32)] md:text-base md:leading-[1.78]">
                Gift wrapping and personalization details appear at checkout when available. Build
                sets from the shop or follow a guided routine.
              </p>
            </div>

            <div className="mx-auto mt-12 grid max-w-3xl gap-5 sm:grid-cols-2 sm:gap-6">
              <Link
                href="/shop?sort=featured"
                className="group flex min-h-[44px] flex-col justify-center rounded-[22px] border border-[rgba(214,168,95,0.18)] bg-[rgba(255,252,246,0.07)] p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_12px_36px_rgba(0,0,0,0.18)] backdrop-blur-md transition-[border-color,box-shadow,background-color] duration-500 ease-out [-webkit-backdrop-filter:blur(10px)] hover:border-[rgba(214,168,95,0.32)] hover:bg-[rgba(255,252,246,0.11)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_18px_44px_rgba(0,0,0,0.22)] md:p-8"
              >
                <span className="text-[0.6rem] uppercase tracking-[0.26em] text-[#d4c4a8]">
                  Build a gift set
                </span>
                <span className="mt-2 font-literata text-lg font-light tracking-[0.09em] text-[#faf6f0]">
                  Curate from featured
                </span>
                <span className="mt-2 text-sm text-[#d8cfc0] transition-colors duration-500 group-hover:text-[#f0e8dc]">
                  Shop → bundle at checkout
                </span>
              </Link>
              <Link
                href="/routines"
                className="group flex min-h-[44px] flex-col justify-center rounded-[22px] border border-[rgba(214,168,95,0.18)] bg-[rgba(255,252,246,0.07)] p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_12px_36px_rgba(0,0,0,0.18)] backdrop-blur-md transition-[border-color,box-shadow,background-color] duration-500 ease-out [-webkit-backdrop-filter:blur(10px)] hover:border-[rgba(214,168,95,0.32)] hover:bg-[rgba(255,252,246,0.11)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_18px_44px_rgba(0,0,0,0.22)] md:p-8"
              >
                <span className="text-[0.6rem] uppercase tracking-[0.26em] text-[#d4c4a8]">
                  Create a routine
                </span>
                <span className="mt-2 font-literata text-lg font-light tracking-[0.09em] text-[#faf6f0]">
                  Morning · night · weekly
                </span>
                <span className="mt-2 text-sm text-[#d8cfc0] transition-colors duration-500 group-hover:text-[#f0e8dc]">
                  Step-by-step guides
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
