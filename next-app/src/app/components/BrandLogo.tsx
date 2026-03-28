import Image from "next/image";
import Link from "next/link";

const LOGO_SRC = "/Photo%20Mar%2019%202026,%204%2022%2015%20PM.png";

export function BrandLogo({
  href = "/",
  compact = false,
  className = "",
}: {
  href?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label="Mystique home"
      className={`group relative inline-flex items-center transition-all duration-500 ${
        compact ? "max-w-[236px] md:max-w-[280px]" : "max-w-[300px] md:max-w-[390px]"
      } ${className}`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute left-[16%] top-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,173,66,0.22),rgba(255,173,66,0.08)_40%,transparent_74%)] blur-3xl ${
          compact ? "h-16 w-16" : "h-24 w-24"
        }`}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute right-[14%] top-[28%] rounded-full bg-[radial-gradient(circle,rgba(214,168,95,0.12),transparent_72%)] blur-2xl ${
          compact ? "h-10 w-10" : "h-16 w-16"
        }`}
      />
      <span className="relative flex w-full items-center overflow-hidden rounded-[999px]">
        <Image
          src={LOGO_SRC}
          alt="Mystique logo"
          width={compact ? 280 : 390}
          height={compact ? 112 : 156}
          priority={compact}
          className={`relative h-auto w-full object-contain opacity-[0.9] mix-blend-screen brightness-[1] contrast-[0.92] saturate-[0.88] transition duration-500 group-hover:scale-[1.015] group-hover:opacity-100 group-hover:brightness-[1.05] ${
            compact ? "drop-shadow-[0_0_26px_rgba(255,170,70,0.16)]" : "drop-shadow-[0_0_36px_rgba(255,170,70,0.2)]"
          }`}
        />
        <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(5,6,9,0.42),rgba(5,6,9,0.02)_18%,rgba(5,6,9,0.02)_82%,rgba(5,6,9,0.42))]" />
        <span className="pointer-events-none absolute inset-y-[16%] left-[12%] w-[26%] rounded-full border border-[rgba(255,184,92,0.1)] opacity-35 blur-[1px]" />
        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_44%,rgba(5,6,9,0.18)_100%)]" />
      </span>
    </Link>
  );
}
