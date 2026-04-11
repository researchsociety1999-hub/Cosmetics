import Image from "next/image";
import Link from "next/link";

const LOGO_SRC = "/mystique-logo.png";

/**
 * Official Mystique lockup (`/public/mystique-logo.png`).
 * Subtle glass cradle so the mark reads as part of the chrome, not a raw rectangle.
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
  /** Navbar: pass true for faster LCP on the wordmark. */
  priority?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label="Mystique home"
      className={`group relative inline-flex items-center justify-center outline-none transition duration-300 hover:opacity-[0.96] focus-visible:opacity-100 ${className}`}
    >
      <span
        className={`mystic-glass--subtle inline-flex items-center justify-center ${
          compact
            ? "rounded-2xl px-2 py-1 md:rounded-[1.1rem] md:px-2.5 md:py-1.5"
            : "rounded-2xl px-2.5 py-1.5"
        }`}
      >
        <Image
          src={LOGO_SRC}
          alt="Mystique — Where beauty transcends"
          width={640}
          height={200}
          priority={priority}
          sizes={
            compact
              ? "(max-width: 768px) 180px, 240px"
              : "(max-width: 768px) 220px, 300px"
          }
          className={
            compact
              ? "h-8 w-auto max-h-8 object-contain object-center [filter:drop-shadow(0_0_20px_rgba(212,175,92,0.22))_contrast(1.04)_brightness(1.03)] md:h-10 md:max-h-10"
              : "h-9 w-auto max-h-9 object-contain object-center [filter:drop-shadow(0_0_22px_rgba(212,175,92,0.2))_contrast(1.04)_brightness(1.03)] md:h-[2.85rem] md:max-h-[2.85rem]"
          }
        />
      </span>
    </Link>
  );
}
