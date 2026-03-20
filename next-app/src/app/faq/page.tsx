import type { Metadata } from "next";
import { SiteChrome } from "../components/SiteChrome";
import { mockFaqs } from "../lib/data";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about shipping, layering, returns, and Mystique rituals.",
};

export default function FaqPage() {
  return (
    <SiteChrome>
      <main className="mx-auto max-w-4xl px-4 py-14 md:px-6">
        <header className="mb-10 space-y-4">
          <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
            FAQ
          </p>
          <h1 className="font-cormorant text-4xl tracking-[0.12em] md:text-5xl">
            Questions, answered softly.
          </h1>
        </header>
        <div className="space-y-4">
          {mockFaqs.map((item) => (
            <details key={item.question} className="mystic-card p-5">
              <summary className="cursor-pointer list-none font-cormorant text-2xl tracking-[0.06em] text-[#f5eee3]">
                {item.question}
              </summary>
              <p className="mt-4 text-sm leading-relaxed text-[#b8ab95]">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </main>
    </SiteChrome>
  );
}
