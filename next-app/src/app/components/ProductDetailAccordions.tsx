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
            {productName} is designed for the {routineStep.toLowerCase()} step—layered
            to sit comfortably alongside other Mystique formulas and suited to{" "}
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
            <ul className="space-y-2">
              {keyIngredients.map((ing) => (
                <li key={ing}>{ing}</li>
              ))}
            </ul>
          ) : (
            <p>
              Highlights are listed here as you refine each formula. The complete INCI
              (International Nomenclature of Cosmetic Ingredients) appears on the carton and
              unit packaging—request a PDF from{" "}
              <a
                href="/contact"
                className="text-[#d6a85f] underline-offset-4 hover:underline"
              >
                Contact
              </a>{" "}
              if you need it before purchase.
            </p>
          )}
          {keyIngredients.length ? (
            <p className="text-xs leading-relaxed text-[#7a7265]">
              Formulas evolve with supplier batches; always refer to your product packaging
              for the authoritative ingredient list.
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
          <p>Formulated for most skin types; patch test if you have sensitivities.</p>
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
              Standard and expedited options at checkout. Processing typically
              1–2 business days; you&apos;ll receive tracking by email.
            </p>
          </div>
          <div>
            <p className="mb-1 text-[0.7rem] uppercase tracking-[0.18em] text-[#d6a85f]">
              International
            </p>
            <p>
              Where available, duties and import taxes may be charged at
              delivery depending on destination—shown when you enter your
              shipping country. Returns from outside the US may differ; see our{" "}
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
