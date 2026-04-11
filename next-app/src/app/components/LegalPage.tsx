import { SiteChrome } from "./SiteChrome";

export async function LegalPage({
  eyebrow,
  title,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  sections: Array<{
    heading: string;
    paragraphs: string[];
  }>;
}) {
  return (
    <SiteChrome>
      <main className="mystic-section-shell mystic-section w-full max-w-3xl">
        <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
          {eyebrow}
        </p>
        <h1 className="mt-4 font-literata text-4xl tracking-[0.12em] text-[#f5eee3] md:text-5xl">
          {title}
        </h1>
        <div className="mystic-card mt-8 space-y-8 p-6 text-sm leading-relaxed text-[#b8ab95] md:p-8 md:text-base">
          <p className="text-[#d8c6aa]">{intro}</p>
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-literata text-3xl tracking-[0.08em] text-[#f5eee3]">
                {section.heading}
              </h2>
              <div className="mt-4 space-y-4">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </SiteChrome>
  );
}
