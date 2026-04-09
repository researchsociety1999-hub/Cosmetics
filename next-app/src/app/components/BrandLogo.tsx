import Link from "next/link";
import { ThemedImageFrame } from "./ThemedImageFrame";

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
      <ThemedImageFrame
        src={LOGO_SRC}
        alt="Mystique logo"
        width={compact ? 280 : 390}
        height={compact ? 112 : 156}
        sizes={compact ? "(max-width: 768px) 236px, 280px" : "(max-width: 768px) 300px, 390px"}
        priority={compact}
        variant="brand"
        frameClassName={compact ? "rounded-[28px]" : "rounded-[34px]"}
        imageClassName="h-auto w-full object-contain"
      />
    </Link>
  );
}
