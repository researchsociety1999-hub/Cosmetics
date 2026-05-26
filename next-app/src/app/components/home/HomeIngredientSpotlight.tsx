"use client";

import Link from "next/link";
import { IngredientSpotlightThumb } from "../IngredientSpotlightThumb";
import { MYSTIQUE_CANONICAL_INGREDIENTS } from "../../lib/data";

function SectionIntro({
  eyebrow,
  title,
  ctaHref,
  ctaLabel,
}: {
  eyebrow?: string;
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
        {eyebrow ? (
          <p className="text-[0.68rem] uppercase tracking-[0.34em] text-[#8f8475]">
            {eyebrow}
          </p>
        ) : null}
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

export function HomeIngredientSpotlight() {
  const ingredients = MYSTIQUE_CANONICAL_INGREDIENTS;

  return (
    <section className="mystic-section mystique-material mystique-material--soft relative border-b border-[rgba(17,24,39,0.88)] bg-transparent py-16 md:py-24">
      <div className="mystic-section-shell">
        <div className="mystique-section-surface px-6 py-10 md:px-11 md:py-12">
          <SectionIntro
            eyebrow="Ingredients"
            title="Actives we formulate around."
            ctaHref="/ingredients"
            ctaLabel="How we choose ingredients"
          />
          <div className="grid gap-7 md:grid-cols-2 md:gap-8 xl:grid-cols-3">
            {ingredients.map((ingredient, index) => {
              const isPoster = ingredient.imagePresentation === "poster";
              const stg = index % 3;
              return (
                <article
                  key={ingredient.id}
                  className={`group mystic-card mystique-ingredient-card--stg-${stg} relative flex flex-row items-start gap-5 overflow-hidden rounded-[var(--mystic-radius-card)] border border-[rgba(214,168,95,0.11)] bg-gradient-to-br from-[rgba(14,16,24,0.78)] via-[rgba(8,10,18,0.58)] to-[rgba(5,6,14,0.72)] p-6 shadow-[0_14px_44px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.04)] ring-1 ring-inset ring-[rgba(214,168,95,0.06)] transition-[box-shadow,border-color,ring-color] duration-500 ease-out before:pointer-events-none before:absolute before:inset-0 before:z-[1] before:bg-[radial-gradient(ellipse_95%_85%_at_0%_0%,rgba(214,168,95,0.08),transparent_58%)] before:opacity-0 before:transition-opacity before:duration-500 hover:border-[rgba(214,168,95,0.16)] hover:shadow-[0_18px_52px_rgba(0,0,0,0.34)] hover:ring-[rgba(214,168,95,0.1)] hover:before:opacity-100 sm:gap-6 sm:p-7`}
                >
                  <div
                    className="mystique-ingredient-card-atmosphere"
                    aria-hidden
                  />
                  <div className="relative z-[2] shrink-0">
                    <IngredientSpotlightThumb
                      id={ingredient.id}
                      imageSrc={ingredient.imageSrc}
                      name={ingredient.name}
                      presentation={ingredient.imagePresentation ?? "thumb"}
                    />
                  </div>
                  <div className="relative z-[2] min-w-0 flex-1">
                    {isPoster ? (
                      <>
                        <p className="sr-only">
                          {[ingredient.source, ingredient.name]
                            .filter(Boolean)
                            .join(" — ")}
                        </p>
                        <h3 className="sr-only">{ingredient.name}</h3>
                        {ingredient.description ? (
                          <p className="text-sm leading-relaxed text-[#cfc3b0] line-clamp-5 [text-shadow:0_1px_14px_rgba(0,0,0,0.25)]">
                            {ingredient.description}
                          </p>
                        ) : null}
                      </>
                    ) : (
                      <>
                        <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#c4b49a]">
                          {ingredient.source ?? "Active"}
                        </p>
                        <h3 className="mt-2.5 font-literata text-2xl font-light tracking-[0.09em] text-[#faf6f0] [text-shadow:0_1px_18px_rgba(0,0,0,0.28)] sm:text-[1.85rem]">
                          {ingredient.name}
                        </h3>
                      </>
                    )}
                    <Link
                      href={`/shop?ingredient=${ingredient.id}`}
                      aria-label={`Shop ${ingredient.name} formulas`}
                      className="mt-5 inline-flex min-h-[44px] items-center text-[0.6rem] uppercase tracking-[0.24em] text-[#c9b896] underline-offset-[5px] transition-[color] duration-500 ease-out hover:text-[#e8d4b0] hover:underline"
                    >
                      Shop formulas &rarr;
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
