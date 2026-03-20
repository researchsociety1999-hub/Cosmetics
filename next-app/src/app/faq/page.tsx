import type { Metadata } from "next";
import { SiteChrome } from "../components/SiteChrome";
import { mockFaqs } from "../lib/data";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about shipping, layering, returns, and Mystique rituals.",
};

export default function FaqPage() {
  const faqCopy: Record<string, { question: string; answer: string }> = {
    "How long does shipping take?": {
      question: "How quickly will my order arrive?",
      answer: "Most U.S. orders arrive within 3 to 5 business days, and we’ll always aim to keep the ritual moving smoothly.",
    },
    "What is your returns policy?": {
      question: "Can I return my order?",
      answer: "Yes. Eligible unopened items can be returned within 30 days, so you can shop with a little more ease.",
    },
    "How should I layer the ritual?": {
      question: "What order should I use my products in?",
      answer: "Start with cleanse, then tone, treat, and moisturize. In the morning, finish with your daily protection step.",
    },
    "Which formulas suit sensitive skin?": {
      question: "Which products are best for sensitive skin?",
      answer: "Look first for centella, peptides, and hydration-focused textures. If your skin is reactive, patch testing is still the best place to begin.",
    },
  };

  return (
    <SiteChrome>
      <main className="mystic-section-shell mystic-section max-w-4xl">
        <header className="mb-10 max-w-3xl space-y-4">
          <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
            FAQ
          </p>
          <h1 className="font-cormorant text-4xl tracking-[0.12em] md:text-5xl">
            Questions, answered softly.
          </h1>
          <p className="text-sm leading-relaxed text-[#b8ab95] md:text-base">
            Shipping, returns, layering order, and brand basics collected in one
            place so the storefront feels easy to navigate.
          </p>
        </header>
        <div className="space-y-4">
          {mockFaqs.map((item) => (
            <details key={item.question} className="mystic-card group p-5 md:p-6">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-cormorant text-[1.75rem] tracking-[0.06em] text-[#f5eee3]">
                <span>{faqCopy[item.question]?.question ?? item.question}</span>
                <span className="mt-1 text-base text-[#d6a85f] transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-4 border-t border-[rgba(214,168,95,0.12)] pt-4 text-sm leading-relaxed text-[#b8ab95]">
                {faqCopy[item.question]?.answer ?? item.answer}
              </p>
            </details>
          ))}
        </div>
      </main>
    </SiteChrome>
  );
}
