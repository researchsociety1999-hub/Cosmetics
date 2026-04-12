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
  watermark = false,
}: {
  href?: string;
  compact?: boolean;
  className?: string;
  /** Navbar: pass true for faster LCP on the wordmark. */
  priority?: boolean;
  /** Large decorative mark behind hero copy (no link, hidden from assistive tech). */
  watermark?: boolean;
}) {
  if (watermark) {
    return (
      <div aria-hidden className={`relative h-full w-full ${className}`}>
        {/* Large-field mask: keeps edges soft so the mark merges with Mystique ink + gold ambience */}
        <div className="absolute inset-[-6%] [mask-image:radial-gradient(ellipse_88%_72%_at_50%_50%,#000_0%,#000_10%,rgba(0,0,0,0.78)_26%,rgba(0,0,0,0.42)_46%,rgba(0,0,0,0.16)_64%,transparent_80%)] [-webkit-mask-image:radial-gradient(ellipse_88%_72%_at_50%_50%,#000_0%,#000_10%,rgba(0,0,0,0.78)_26%,rgba(0,0,0,0.42)_46%,rgba(0,0,0,0.16)_64%,transparent_80%)]">
          <Image
            src={LOGO_SRC}
            alt=""
            fill
            priority={priority}
            sizes="100vw"
            className="object-contain object-center mix-blend-soft-light opacity-[0.22] [filter:brightness(1.08)_contrast(1.06)_saturate(0.94)_drop-shadow(0_0_72px_rgba(214,168,95,0.3))_drop-shadow(0_0_160px_rgba(212,175,55,0.16))_drop-shadow(0_0_260px_rgba(0,0,0,0.26))]"
          />
        </div>
        {/* Pull gold from the mark into surrounding UI chrome */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_82%_58%_at_50%_46%,rgba(214,168,95,0.14),transparent_58%)] opacity-95 mix-blend-soft-light"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[rgba(1,2,3,0.16)] from-[0%] via-transparent via-[35%] to-[rgb(5,6,10)] to-[100%]"
        />
      </div>
    );
  }

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
              ? "(max-width: 1279px) 280px, (max-width: 1536px) 340px, 400px"
              : "(max-width: 768px) 320px, 440px"
          }
          className={
            compact
              ? "h-10 w-auto max-h-10 object-contain object-center sm:h-11 sm:max-h-11 md:h-12 md:max-h-12 xl:h-[3.35rem] xl:max-h-[3.35rem] 2xl:h-[3.65rem] 2xl:max-h-[3.65rem] [filter:drop-shadow(0_2px_14px_rgba(0,0,0,0.92))_drop-shadow(0_0_32px_rgba(212,175,55,0.42))_drop-shadow(0_0_60px_rgba(255,154,80,0.12))_brightness(1.08)_contrast(1.08)_saturate(1.06)]"
              : "h-12 w-auto max-h-12 object-contain object-center sm:h-14 sm:max-h-14 md:h-16 md:max-h-16 lg:h-[4.5rem] lg:max-h-[4.5rem] [filter:drop-shadow(0_2px_16px_rgba(0,0,0,0.88))_drop-shadow(0_0_36px_rgba(212,175,55,0.36))_drop-shadow(0_0_72px_rgba(255,154,80,0.1))_brightness(1.06)_contrast(1.06)_saturate(1.05)]"
          }
        />
      </span>
    </Link>
  );
}
