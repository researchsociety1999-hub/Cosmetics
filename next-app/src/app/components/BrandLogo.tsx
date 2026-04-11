import Image from "next/image";
import Link from "next/link";

/** Official lockup (1024×682); black in the file aligns with `bg-black` so edges stay invisible. */
const BRAND_LOGO_SRC = "/mystique-brand-logo.png";

/**
 * Raster wordmark + crescent + mist — kept intentionally flat: no frame, no shadow, pure #000
 * behind the asset so it reads as continuous with the header instead of a sticker.
 */
export function BrandLogo({
  href = "/",
  compact = false,
  className = "",
  priority = false,
}: {
  href?: string;
  compact?: boolean;
  className?: string;
  /** Set true in the navbar so LCP stays sharp. */
  priority?: boolean;
}) {
  const sizeClass = compact
    ? "h-8 w-auto max-w-[min(72vw,200px)] sm:h-9 sm:max-w-[220px] md:h-10 md:max-w-[248px]"
    : "h-[3.35rem] w-auto max-w-[min(92vw,300px)] md:h-[3.85rem] md:max-w-[340px]";

  return (
    <Link
      href={href}
      aria-label="Mystique home"
      className={`inline-block bg-black outline-none transition-opacity duration-500 ease-out opacity-[0.92] hover:opacity-100 focus-visible:opacity-100 ${className}`}
    >
      <Image
        src={BRAND_LOGO_SRC}
        alt="Mystique — Where Beauty Transcends"
        width={1024}
        height={682}
        priority={priority}
        sizes={
          compact
            ? "(max-width: 640px) 72vw, (max-width: 768px) 220px, 248px"
            : "(max-width: 768px) 92vw, 340px"
        }
        className={`block object-contain object-center ${sizeClass}`}
      />
    </Link>
  );
}
