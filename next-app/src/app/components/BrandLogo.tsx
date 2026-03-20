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
      className={`group relative inline-flex items-center ${
        compact ? "max-w-[270px] md:max-w-[320px]" : "max-w-[360px] md:max-w-[430px]"
      }`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute left-[10%] top-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,173,66,0.28),rgba(255,173,66,0.08)_42%,transparent_70%)] blur-2xl ${
          compact ? "h-16 w-16" : "h-24 w-24"
        }`}
      />
      <span className="relative overflow-hidden rounded-[999px]">
        <Image
          src={LOGO_SRC}
          alt="Mystique logo"
          width={compact ? 320 : 430}
          height={compact ? 128 : 172}
          priority={compact}
          className={`relative h-auto w-full object-contain brightness-[1.08] contrast-[1.06] saturate-[1.02] transition duration-300 group-hover:brightness-[1.14] ${
            compact ? "drop-shadow-[0_0_28px_rgba(255,170,70,0.22)]" : "drop-shadow-[0_0_36px_rgba(255,170,70,0.26)]"
          }`}
        />
        <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(5,6,9,0.16),transparent_18%,transparent_82%,rgba(5,6,9,0.16))]" />
        <span className="pointer-events-none absolute inset-y-[10%] left-[8%] w-[30%] rounded-full border border-[rgba(255,184,92,0.22)] opacity-60 blur-[1px]" />
      </span>
    </Link>
  );
}
