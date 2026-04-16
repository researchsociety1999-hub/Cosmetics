import Link from "next/link";

type AccordionItem = {
  id: string;
  title: string;
  content: React.ReactNode;
};

export function ProductDetailAccordions({
  items,
}: {
  items: AccordionItem[];
}) {
  return (
    <div className="divide-y divide-[rgba(212,175,55,0.14)] rounded-[22px] border border-[rgba(212,175,55,0.2)] bg-[rgba(0,0,0,0.55)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_0_1px_rgba(212,175,55,0.05)]">
      {items.map((item) => (
        <details key={item.id} className="group p-0">
          <summary className="cursor-pointer list-none px-5 py-4 font-literata text-lg tracking-[0.08em] text-[#f6f0e6] transition-colors hover:bg-[rgba(212,175,55,0.04)] marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="flex items-center justify-between gap-3">
              {item.title}
              <span
                className="text-[#e8c56e] transition group-open:rotate-45"
                aria-hidden
              >
                +
              </span>
            </span>
          </summary>
          <div className="border-t border-[rgba(212,175,55,0.12)] px-5 pb-5 pt-3 text-sm leading-relaxed text-[#b9aa8f]">
            {item.content}
          </div>
        </details>
      ))}
    </div>
  );
}

export function buildProductAccordionItems({
  productName,
  benefits,
  keyIngredients,
  skinTypes,
  routineStep,
  howToLines,
}: {
  productName: string;
  benefits: string[];
  keyIngredients: string[];
  skinTypes: string[];
  routineStep: string;
  howToLines: string[];
}): AccordionItem[] {
  const skinLine =
    skinTypes.length > 0 ? skinTypes.join(" · ") : "a range of skin types";

  return [
    {
      id: "details",
      title: "Product details",
      content: (
        <div className="space-y-3">
          <p>
            {productName} is designed for your {routineStep.toLowerCase()} step—meant to
            layer cleanly with the rest of your ritual and feel comfortable on{" "}
            {skinLine}.
          </p>
          {benefits.length ? (
            <ul className="list-inside list-disc space-y-1">
              {benefits.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ),
    },
    {
      id: "ingredients",
      title: "Key ingredients",
      content: (
        <div className="space-y-3">
          {keyIngredients.length ? (
            <ul className="space-y-3">
              {keyIngredients.map((ing) => {
                const parts = ing.split(/\s—\s/);
                if (parts.length === 2) {
                  return (
                    <li key={ing} className="leading-relaxed">
                      <span className="text-[#e8dcc8]">{parts[0].trim()}</span>
                      <span className="text-[#b9aa8f]"> — {parts[1].trim()}</span>
                    </li>
                  );
                }
                return (
                  <li key={ing} className="leading-relaxed">
                    {ing}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>
              Highlighted notes will appear here as each formula is finalized. Your carton
              always carries the full INCI—the authoritative list for what you’re holding. If
              you’d like that list before you decide, we’re happy to send it through{" "}
              <a
                href="/contact"
                className="text-[#d6a85f] underline-offset-4 hover:underline"
              >
                Contact
              </a>
              .
            </p>
          )}
          {keyIngredients.length ? (
            <p className="text-xs leading-relaxed text-[#7a7265]">
              Formulas may evolve gently over time; your carton remains the true reference for
              the current INCI.
            </p>
          ) : null}
        </div>
      ),
    },
    {
      id: "howto",
      title: "How to use",
      content: (
        <ol className="list-inside list-decimal space-y-2">
          {howToLines.map((line, index) => (
            <li key={index}>{line}</li>
          ))}
        </ol>
      ),
    },
    {
      id: "skin",
      title: "Skin types",
      content:
        skinTypes.length > 0 ? (
          <p>{skinTypes.join(" · ")}</p>
        ) : (
          <p>
            Formulated for many skin types. If you’re sensitive or introducing new actives,
            patch test first.
          </p>
        ),
    },
    {
      id: "shipping",
      title: "Shipping & returns",
      content: (
        <div className="space-y-4">
          <div>
            <p className="mb-1 text-[0.7rem] uppercase tracking-[0.18em] text-[#d6a85f]">
              United States
            </p>
            <p>
              Standard and expedited options at checkout. Processing is typically 1–2 business
              days, and you’ll receive tracking by email once your parcel is scanned.
            </p>
          </div>
          <div>
            <p className="mb-1 text-[0.7rem] uppercase tracking-[0.18em] text-[#d6a85f]">
              International
            </p>
            <p>
              Where available, duties and import taxes may be due at delivery depending on
              destination. Returns from outside the U.S. may differ; see our{" "}
              <Link
                href="/terms"
                className="text-[#d6a85f] underline-offset-4 hover:underline"
              >
                terms
              </Link>
              .
            </p>
          </div>
          <p>
            Questions?{" "}
            <Link
              href="/contact"
              className="text-[#d6a85f] underline-offset-4 hover:underline"
            >
              Contact
            </Link>{" "}
            or visit{" "}
            <Link
              href="/faq"
              className="text-[#d6a85f] underline-offset-4 hover:underline"
            >
              FAQ
            </Link>
            .
          </p>
        </div>
      ),
    },
  ];
}
