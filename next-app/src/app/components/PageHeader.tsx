type PageHeaderAlign = "left" | "center";

/**
 * Shared page heading block: optional eyebrow, an `<h1>` in the site's
 * Literata heading style, and an optional subtitle constrained to a readable
 * measure (`mystic-intro`). Purely presentational — no data fetching.
 *
 * Matches the eyebrow/title/subtitle treatment already used across routes
 * (cart, checkout, contact, faq, etc.) so headings stay visually consistent.
 */
function joinClasses(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: PageHeaderAlign;
  className?: string;
}) {
  const isCentered = align === "center";

  return (
    <header
      className={joinClasses(
        "space-y-4",
        isCentered ? "text-center" : undefined,
        className,
      )}
    >
      {eyebrow ? <p className="mystic-kicker">{eyebrow}</p> : null}
      <h1 className="font-literata text-4xl tracking-[0.12em] text-[#f5eee3] md:text-5xl">
        {title}
      </h1>
      {subtitle ? (
        <p
          className={joinClasses(
            "mystic-intro text-sm leading-relaxed text-[#b8ab95] md:text-base",
            isCentered ? "mx-auto" : undefined,
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}
