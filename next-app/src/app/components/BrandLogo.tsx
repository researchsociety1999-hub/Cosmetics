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
    <Link href={href} aria-label="Mystique home" className="group relative inline-flex items-center">
      <Image
        src={LOGO_SRC}
        alt="Mystique logo"
        width={compact ? 260 : 420}
        height={compact ? 98 : 158}
        priority={compact}
        className={`h-auto w-full object-contain ${
          compact ? "max-w-[220px] md:max-w-[260px]" : "max-w-[340px] md:max-w-[420px]"
        }`}
      />
    </Link>
  );
}
