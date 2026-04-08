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
        className={`pointer-events-none absolute left-[16%] top-[46%] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,173,66,0.18),rgba(255,173,66,0.06)_40%,transparent_74%)] blur-3xl ${
          compact ? "h-16 w-16" : "h-24 w-24"
        }`}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute right-[14%] top-[30%] rounded-full bg-[radial-gradient(circle,rgba(214,168,95,0.1),transparent_72%)] blur-2xl ${
          compact ? "h-10 w-10" : "h-16 w-16"
        }`}
      />
      <span
        className={`relative flex w-full items-center overflow-hidden border border-[rgba(43,33,23,0.9)] bg-[#0b0907] ${
          compact ? "rounded-[28px]" : "rounded-[34px]"
        }`}
      >
        <Image
          src={LOGO_SRC}
          alt="Mystique logo"
          width={compact ? 280 : 390}
          height={compact ? 112 : 156}
          priority={compact}
          className={`relative h-auto w-full object-contain opacity-[0.88] mix-blend-screen brightness-[0.98] contrast-[0.9] saturate-[0.82] transition duration-500 group-hover:scale-[1.015] group-hover:opacity-[0.96] group-hover:brightness-[1.03] ${
            compact ? "drop-shadow-[0_0_26px_rgba(255,170,70,0.16)]" : "drop-shadow-[0_0_36px_rgba(255,170,70,0.2)]"
          }`}
        />
        <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(11,9,7,0.56),rgba(11,9,7,0.04)_18%,rgba(11,9,7,0.04)_82%,rgba(11,9,7,0.56))]" />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[24%] bg-[linear-gradient(180deg,rgba(11,9,7,0),rgba(11,9,7,0.42)_48%,rgba(11,9,7,1)_100%)]" />
        <span className="pointer-events-none absolute inset-y-[16%] left-[12%] w-[26%] rounded-full border border-[rgba(255,184,92,0.08)] opacity-30 blur-[1px]" />
        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_42%,rgba(5,6,9,0.2)_100%)]" />
      </span>
    </Link>
  );
}
