"use client";

import Link from "next/link";

const HOME_RITUAL_RHYTHMS: {
  label: string;
  title: string;
  href: string;
  linkLabel: string;
  washClassName: string;
}[] = [
  {
    label: "Morning",
    title: "Daylight Ritual",
    href: "/routines#morning-ritual",
    linkLabel: "Morning routine",
    washClassName:
      "bg-[radial-gradient(ellipse_90%_70%_at_18%_12%,rgba(255,186,120,0.22),transparent_55%),radial-gradient(circle_at_92%_78%,rgba(214,168,95,0.12),transparent_42%),linear-gradient(195deg,rgba(28,22,18,0.95)_0%,rgba(6,7,12,1)_55%,rgb(4,5,10)_100%)]",
  },
  {
    label: "Night",
    title: "Recovery Ritual",
    href: "/routines#night-ritual",
    linkLabel: "Night routine",
    washClassName:
      "bg-[radial-gradient(ellipse_85%_65%_at_82%_8%,rgba(120,140,220,0.18),transparent_52%),radial-gradient(circle_at_12%_70%,rgba(214,168,95,0.08),transparent_45%),linear-gradient(205deg,rgba(10,12,24,1)_0%,rgba(4,5,10,1)_58%,rgb(3,4,8)_100%)]",
  },
  {
    label: "Weekly",
    title: "Reset Ritual",
    href: "/routines#weekly-ritual",
    linkLabel: "Weekly routine",
    washClassName:
      "bg-[radial-gradient(ellipse_95%_60%_at_50%_0%,rgba(214,168,95,0.16),transparent_50%),radial-gradient(circle_at_30%_90%,rgba(255,140,90,0.07),transparent_48%),linear-gradient(185deg,rgba(14,12,18,1)_0%,rgba(5,6,11,1)_50%,rgb(4,5,10)_100%)]",
  },
];

function SectionIntro({
  title,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <header className="mb-10 flex flex-col gap-6 md:mb-[4.5rem] md:flex-row md:items-end md:justify-between md:gap-10">
      <div className="relative max-w-2xl space-y-3.5 md:space-y-5 md:pl-1">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-1 top-1 hidden h-[calc(100%-0.25rem)] w-px bg-gradient-to-b from-[rgba(214,168,95,0.22)] via-[rgba(214,168,95,0.08)] to-transparent md:block"
        />
        <h2 className="font-literata text-3xl font-light leading-[1.18] tracking-[0.12em] text-[#f5eee3] md:text-[2.35rem] md:leading-[1.15]">
          {title}
        </h2>
      </div>
      {ctaHref && ctaLabel ? (
        <Link
          href={ctaHref}
          className="inline-flex min-h-[44px] items-center justify-center self-start border border-[rgba(214,168,95,0.2)] bg-transparent px-6 py-2.5 text-[0.64rem] uppercase tracking-[0.26em] text-[#b5a896] backdrop-blur-sm transition-[border-color,color,background-color] duration-500 ease-out hover:border-[rgba(214,168,95,0.32)] hover:bg-[rgba(214,168,95,0.06)] hover:text-[#e8dfd2] motion-reduce:transition-none md:self-auto"
        >
          {ctaLabel}
        </Link>
      ) : null}
    </header>
  );
}

export function HomeRitualStrip() {
  return (
    <section className="mystic-section mystique-atmo mystique-atmo--rituals relative border-b border-[rgba(214,168,95,0.06)] bg-transparent py-20 md:py-32">
      <div className="mystic-section-shell">
        <div className="mystique-section-surface px-6 py-10 md:px-11 md:py-12">
          <SectionIntro
            title="Our Rituals"
            ctaHref="/routines"
            ctaLabel="See routine steps"
          />
          <div className="mx-auto grid max-w-5xl items-start gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3 lg:gap-8">
            {HOME_RITUAL_RHYTHMS.map((ritual) => (
              <article
                key={ritual.label}
                className="group relative isolate flex h-auto flex-col justify-start overflow-hidden mystic-card shadow-[0_20px_48px_rgba(0,0,0,0.38)] ring-1 ring-inset ring-[rgba(212,175,55,0.055)] transition-[box-shadow,transform] duration-700 ease-out hover:shadow-[0_26px_60px_rgba(0,0,0,0.44)] hover:ring-[rgba(212,175,55,0.09)]"
              >
                <div className="pointer-events-none absolute inset-0">
                  <div
                    aria-hidden
                    className={`absolute inset-0 opacity-90 transition-opacity duration-700 ease-out group-hover:opacity-[0.98] ${ritual.washClassName}`}
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,5,10,0.5)_0%,rgba(4,5,10,0.72)_38%,rgba(4,5,10,0.92)_72%,rgb(4,5,10)_100%)]"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(214,168,95,0.12),transparent_55%)] opacity-80 mix-blend-soft-light"
                  />
                </div>
                <div className="relative z-10 flex flex-col gap-5 p-6 md:gap-6 md:p-7">
                  <div className="space-y-2.5">
                    <p className="text-[0.6rem] uppercase tracking-[0.3em] text-[#c9b896] drop-shadow-[0_1px_10px_rgba(0,0,0,0.65)]">
                      {ritual.label}
                    </p>
                    <h3 className="font-literata text-[1.4rem] font-light tracking-[0.09em] text-[#f5eee3] drop-shadow-[0_2px_20px_rgba(0,0,0,0.6)] md:text-[1.52rem]">
                      {ritual.title}
                    </h3>
                  </div>
                  <Link
                    href={ritual.href}
                    className="inline-flex min-h-[44px] w-fit items-center text-[0.58rem] uppercase tracking-[0.24em] text-[#b5a078] underline-offset-[6px] transition-[color] duration-500 ease-out hover:text-[#d4c4a4] hover:underline"
                  >
                    {ritual.linkLabel}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
