import Image from "next/image";
import Link from "next/link";

const LOGO_SRC = "/mystique-logo.png";

/**
 * Official Mystique lockup (`/public/mystique-logo.png`).
 * Nav uses a larger, un-frosted treatment so the fine type and embers stay legible.
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
      className={`group relative inline-flex items-center justify-center outline-none transition duration-200 hover:opacity-[0.98] focus-visible:opacity-100 ${className}`}
    >
      <span
        className={`inline-flex items-center justify-center ${
          compact
            ? "px-0 py-0"
            : "rounded-2xl border border-[rgba(214,168,95,0.14)] bg-[rgba(2,3,6,0.55)] px-3 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
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
              ? "(max-width: 640px) 300px, (max-width: 1024px) 340px, 400px"
              : "(max-width: 768px) 320px, 440px"
          }
          className={
            compact
              ? "h-11 w-auto max-h-11 object-contain object-center sm:h-12 sm:max-h-12 md:h-[3.35rem] md:max-h-[3.35rem] lg:h-[3.65rem] lg:max-h-[3.65rem] [filter:drop-shadow(0_2px_14px_rgba(0,0,0,0.92))_drop-shadow(0_0_32px_rgba(212,175,55,0.42))_drop-shadow(0_0_60px_rgba(255,154,80,0.12))_brightness(1.08)_contrast(1.08)_saturate(1.06)]"
              : "h-12 w-auto max-h-12 object-contain object-center sm:h-14 sm:max-h-14 md:h-16 md:max-h-16 lg:h-[4.5rem] lg:max-h-[4.5rem] [filter:drop-shadow(0_2px_16px_rgba(0,0,0,0.88))_drop-shadow(0_0_36px_rgba(212,175,55,0.36))_drop-shadow(0_0_72px_rgba(255,154,80,0.1))_brightness(1.06)_contrast(1.06)_saturate(1.05)]"
          }
        />
      </span>
    </Link>
  );
}
