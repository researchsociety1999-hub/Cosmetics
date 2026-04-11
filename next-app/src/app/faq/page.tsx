import type { Metadata } from "next";
import Link from "next/link";
import { SiteChrome } from "../components/SiteChrome";
import {
  FLAT_SHIPPING_CENTS,
  FREE_SHIPPING_THRESHOLD_CENTS,
} from "../lib/checkout";
import { mockFaqs } from "../lib/data";

const freeShipMinUsd = FREE_SHIPPING_THRESHOLD_CENTS / 100;
const flatShipUsd = (FLAT_SHIPPING_CENTS / 100).toFixed(2);

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Shipping cadence, returns, ritual layering, and sensitive-skin guidance—answers in plain language for Mystique customers.",
};

export default function FaqPage() {
  const faqCopy: Record<string, { question: string; answer: string }> = {
    "What does U.S. shipping cost?": {
      question: "What does U.S. shipping cost?",
      answer: `Standard U.S. delivery is $${flatShipUsd} when your order total after promotions is under $${freeShipMinUsd}. Complimentary standard shipping applies on orders of $${freeShipMinUsd} or more after promotions (before tax).`,
    },
    "How long does shipping take?": {
      question: "How quickly will my order arrive?",
      answer:
        "Most domestic orders leave our studio within two business days and arrive in three to five business days once shipped. You will receive tracking as soon as the carrier scans your parcel.",
    },
    "What is your returns policy?": {
      question: "Can I return my order?",
      answer:
        "Unopened items in original packaging may be returned within thirty days of delivery for a refund to the original payment method, subject to inspection. Opened skincare cannot be restocked—if something arrives damaged, contact us right away.",
    },
    "How should I layer the ritual?": {
      question: "What order should I use my products in?",
      answer:
        "Move from thinnest texture to richest: cleanse, tone, treat with serums or ampoules, then moisturize. In daylight, finish with protection. Wait a beat between layers so each one settles before the next.",
    },
    "Which formulas suit sensitive skin?": {
      question: "Which products are best for sensitive skin?",
      answer:
        "Reach for formulas that foreground barrier comfort—centella, peptides, panthenol, and steady hydration. Introduce one new product at a time, and patch test along the jaw for forty-eight hours when in doubt.",
    },
  };

  return (
    <SiteChrome>
      <main className="mystic-section-shell mystic-section">
        <header className="mb-10 max-w-3xl space-y-4">
          <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
            FAQ
          </p>
          <h1 className="font-literata text-4xl tracking-[0.12em] md:text-5xl">
            Straight answers, calm tone.
          </h1>
          <p className="text-sm leading-relaxed text-[#b8ab95] md:text-base">
            Shipping, returns, layering, and sensitive-skin tips—plain language, no
            filler. For order-specific help, use Contact so we can look up your details.
          </p>
        </header>
        <div className="space-y-4">
          {mockFaqs.map((item) => (
            <details
              key={item.question}
              name="faq"
              className="mystic-card group p-5 md:p-6"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-literata text-[1.75rem] tracking-[0.06em] text-[#f5eee3] [&::-webkit-details-marker]:hidden [&::marker]:content-none">
                <span>{faqCopy[item.question]?.question ?? item.question}</span>
                <span className="mt-1 text-base text-[#d6a85f] transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-4 border-t border-[rgba(214,168,95,0.12)] pt-4 text-sm leading-relaxed text-[#b8ab95]">
                {faqCopy[item.question]?.answer ?? item.answer}
              </p>
            </details>
          ))}
        </div>

        <section className="mt-14 border-t border-[rgba(214,168,95,0.12)] pt-10">
          <p className="text-[0.72rem] uppercase tracking-[0.24em] text-[#d6a85f]">
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
