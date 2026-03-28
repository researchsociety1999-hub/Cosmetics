import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

export function LegalPage({
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
    <div className="min-h-screen bg-[#06080c] text-[#f5eee3]">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-14 md:px-6">
        <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
          {eyebrow}
        </p>
        <h1 className="mt-4 font-cormorant text-4xl tracking-[0.12em] text-[#f5eee3] md:text-5xl">
          {title}
        </h1>
        <div className="mystic-card mt-8 space-y-8 p-6 text-sm leading-relaxed text-[#b8ab95] md:text-base">
          <p className="text-[#d8c6aa]">{intro}</p>
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-cormorant text-3xl tracking-[0.08em] text-[#f5eee3]">
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
      <Footer />
    </div>
  );
}
