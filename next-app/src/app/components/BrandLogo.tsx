import Image from "next/image";
import Link from "next/link";

const LOGO_SRC = "/Photo%20Mar%2019%202026,%204%2022%2015%20PM.png";

export function BrandLogo({
  href = "/",
  compact = false,
}: {
  href?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label="Mystique home"
      className={`group relative inline-flex items-center transition-opacity duration-300 ${
        compact ? "max-w-[236px] md:max-w-[280px]" : "max-w-[300px] md:max-w-[390px]"
      }`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute left-[10%] top-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,173,66,0.2),rgba(255,173,66,0.06)_42%,transparent_72%)] blur-3xl ${
          compact ? "h-14 w-14" : "h-20 w-20"
        }`}
      />
      <span className="relative flex w-full items-center overflow-hidden rounded-[999px]">
        <Image
          src={LOGO_SRC}
          alt="Mystique logo"
          width={compact ? 280 : 390}
          height={compact ? 112 : 156}
          priority={compact}
          className={`relative h-auto w-full object-contain opacity-[0.9] mix-blend-screen brightness-[0.98] contrast-[0.94] saturate-[0.92] transition duration-300 group-hover:opacity-100 group-hover:brightness-[1.04] ${
            compact ? "drop-shadow-[0_0_22px_rgba(255,170,70,0.14)]" : "drop-shadow-[0_0_30px_rgba(255,170,70,0.18)]"
          }`}
        />
        <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(5,6,9,0.36),rgba(5,6,9,0.04)_18%,rgba(5,6,9,0.04)_82%,rgba(5,6,9,0.36))]" />
        <span className="pointer-events-none absolute inset-y-[18%] left-[12%] w-[24%] rounded-full border border-[rgba(255,184,92,0.12)] opacity-40 blur-[1px]" />
        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_48%,rgba(5,6,9,0.14)_100%)]" />
      </span>
    </Link>
  );
}
