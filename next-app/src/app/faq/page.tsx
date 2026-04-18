import type { Metadata } from "next";
import Link from "next/link";
import { SiteChrome } from "../components/SiteChrome";
import { mockFaqs } from "../lib/data";
import { FaqHashSync } from "./FaqHashSync";

type FaqItem = (typeof mockFaqs)[number];

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Shipping, returns, sensitive skin, international orders, and how to choose a formula—clear answers for Mystique shoppers.",
};

function FaqAccordion({ item }: { item: FaqItem }) {
  return (
    <details name="faq" className="mystic-card group p-5 md:p-6">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-literata text-[1.75rem] tracking-[0.06em] text-[#f6f0e6] transition-colors hover:text-[#faf6ef] [&::-webkit-details-marker]:hidden [&::marker]:content-none">
        <span>{item.question}</span>
        <span className="mt-1 text-base text-[#e8c56e] transition group-open:rotate-45">+</span>
      </summary>
      <p className="mt-4 border-t border-[rgba(212,175,55,0.14)] pt-4 text-sm leading-relaxed text-[#b9aa8f]">
        {item.answer}
      </p>
    </details>
  );
}

export default function FaqPage() {
  /** Shipping + returns must sit in one #shipping-and-returns target; other FAQs follow in original order. */
  const shippingAndReturns: FaqItem[] = [mockFaqs[0], mockFaqs[4]];
  const otherFaqs: FaqItem[] = mockFaqs.slice(1, 4);

  return (
    <SiteChrome>
      <FaqHashSync />
      <main className="mystic-section-shell mystic-section">
        <header id="faq-top" className="mb-10 max-w-3xl scroll-mt-[max(5.5rem,env(safe-area-inset-top,0px))] space-y-4">
          <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
            FAQ
          </p>
          <h1 className="font-literata text-4xl tracking-[0.12em] md:text-5xl">
            Questions, answered softly.
          </h1>
          <p className="text-sm leading-relaxed text-[#b8ab95] md:text-base">
            Shipping, returns, sensitive skin, and how to choose a formula—plain
            language, no filler. For order-specific help, use Contact so we can look up
            your details.
          </p>
        </header>
        <div className="space-y-4">
          <section
            id="shipping-and-returns"
            className="scroll-mt-[max(5.5rem,env(safe-area-inset-top,0px))] space-y-4"
          >
            {shippingAndReturns.map((item) => (
              <FaqAccordion key={item.question} item={item} />
            ))}
          </section>
          {otherFaqs.map((item) => (
            <FaqAccordion key={item.question} item={item} />
          ))}
        </div>

        <section className="mt-14 border-t border-[rgba(212,175,55,0.14)] pt-10">
          <p className="text-[0.72rem] uppercase tracking-[0.24em] text-[#d4af37]">
            Still unsure?
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#b8ab95]">
            If your question is specific to an order, ingredient sensitivity, or press,
            the fastest path is a direct note—we reply within one to two business days.
          </p>
          <Link
            href="/contact"
            className="mystic-button-secondary mt-6 inline-flex items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em]"
          >
            Contact us
          </Link>
        </section>
      </main>
    </SiteChrome>
  );
}
