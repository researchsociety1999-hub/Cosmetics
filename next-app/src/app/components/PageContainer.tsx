import type { ReactNode } from "react";

type PageContainerVariant = "narrow" | "default" | "wide";
type PageContainerElement = "main" | "section" | "div";

/**
 * Canonical page wrapper for Mystique routes.
 *
 * Provides a centered column, consistent responsive inline padding, and a
 * shared vertical rhythm so every route lines up under the fixed header
 * (`#main-content` already supplies the header offset — this only adds the
 * page's own top/bottom breathing room). Width is chosen via `variant`:
 *
 * - `narrow`  — legal copy, forms, confirmations (comfortable reading measure)
 * - `default` — standard content pages
 * - `wide`    — catalog / dashboard-style layouts
 *
 * Extra `className` is appended last so callers can refine layout
 * (e.g. tighter bottom padding) without fighting the base classes.
 */
const VARIANT_MAX_WIDTH: Record<PageContainerVariant, string> = {
  narrow: "max-w-3xl",
  default: "max-w-6xl",
  wide: "max-w-[110rem]",
};

function joinClasses(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

export function PageContainer({
  children,
  variant = "default",
  as = "main",
  className,
}: {
  children: ReactNode;
  variant?: PageContainerVariant;
  as?: PageContainerElement;
  className?: string;
}) {
  const Element = as;

  return (
    <Element
      className={joinClasses(
        "mx-auto w-full px-4 py-10 md:px-6 md:py-16 lg:px-10 lg:py-20 xl:px-14",
        VARIANT_MAX_WIDTH[variant],
        className,
      )}
    >
      {children}
    </Element>
  );
}
