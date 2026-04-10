import Link from "next/link";

/**
 * Vector-style wordmark + crescent — reads as a designed lockup, not a photo pasted in the header.
 */
export function BrandLogo({
  href = "/",
  compact = false,
  className = "",
}: {
  href?: string;
  compact?: boolean;
  className?: string;
}) {
  const arcClass = compact
    ? "mb-0.5 h-[1.15rem] w-[4.5rem] md:h-[1.35rem] md:w-[5.25rem]"
    : "mb-1 h-[1.35rem] w-[5.5rem] md:h-[1.55rem] md:w-[6.25rem]";
  const textClass = compact
    ? "text-[0.78rem] md:text-[0.86rem] tracking-[0.4em]"
    : "text-[0.88rem] md:text-[0.98rem] tracking-[0.36em]";

  return (
    <Link
      href={href}
      aria-label="Mystique home"
      className={`group relative inline-flex flex-col items-center outline-none transition duration-500 hover:opacity-100 focus-visible:opacity-100 ${className}`}
    >
      <span className="relative flex flex-col items-center">
        {/* Crescent — gold stroke only, no raster frame */}
        <svg
          viewBox="0 0 140 40"
          className={`pointer-events-none text-[#d6a85f] transition duration-500 group-hover:text-[#f0d19a] ${arcClass}`}
          aria-hidden
        >
          <path
            d="M6 32c18-26 52-34 88-22 14 5 22 14 18 20-22-12-52-10-78 6-12 8-24 6-28-4z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.15"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.88}
            className="drop-shadow-[0_0_12px_rgba(214,168,95,0.35)]"
          />
        </svg>
        <span
          className={`font-literata font-medium leading-none text-[#f2ebe3] antialiased ${textClass}`}
        >
          MYSTIQUE
        </span>
      </span>
    </Link>
  );
}
