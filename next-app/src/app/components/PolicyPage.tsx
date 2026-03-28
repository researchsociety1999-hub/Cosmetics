import type { ReactNode } from "react";
import { SiteChrome } from "./SiteChrome";

type PolicySection = {
  heading: string;
  body: ReactNode;
};

export async function PolicyPage({
  eyebrow,
  title,
  intro,
  updatedOn,
  sections,
}: {
  eyebrow: string;
  title: string;
  intro: ReactNode;
  updatedOn: string;
  sections: PolicySection[];
}) {
  return (
    <SiteChrome>
      <main className="mx-auto max-w-5xl px-4 py-14 md:px-6">
        <header className="max-w-3xl space-y-5">
          <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
            {eyebrow}
          </p>
          <h1 className="font-cormorant text-4xl tracking-[0.12em] text-[#f5eee3] md:text-5xl">
            {title}
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-[#cdbfa9] md:text-base">
            {intro}
          </p>
          <div className="inline-flex rounded-full border border-[rgba(214,168,95,0.18)] bg-[rgba(255,255,255,0.03)] px-4 py-2 text-[0.72rem] uppercase tracking-[0.22em] text-[#d6a85f]">
            Last updated {updatedOn}
          </div>
        </header>

        <section className="mt-10 space-y-6">
          {sections.map((section) => (
            <article key={section.heading} className="mystic-card p-6 md:p-8">
              <h2 className="font-cormorant text-2xl tracking-[0.1em] text-[#f5eee3]">
                {section.heading}
              </h2>
              <div className="mt-4 space-y-4 text-sm leading-7 text-[#cdbfa9] md:text-base">
                {section.body}
              </div>
            </article>
          ))}
        </section>
      </main>
    </SiteChrome>
  );
}
