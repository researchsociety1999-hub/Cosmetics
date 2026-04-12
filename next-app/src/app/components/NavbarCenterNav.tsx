"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Header primary links only — no logo, no hamburger drawer */
const PRIMARY_NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/routines", label: "Routines" },
  { href: "/ingredients", label: "Ingredients" },
  { href: "/about", label: "About" },
] as const;

function navIsActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavbarCenterNav({ className = "" }: { className?: string }) {
  const pathname = usePathname() ?? "/";

  return (
    <nav
      aria-label="Primary"
      className={`flex min-w-0 flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:gap-x-5 sm:gap-y-0 ${className}`}
    >
      {PRIMARY_NAV.map((item) => {
        const active = navIsActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative shrink-0 py-1.5 font-literata text-[0.62rem] tracking-[0.12em] transition sm:text-[0.7rem] sm:tracking-[0.14em] ${
              active
                ? "text-[#f4e8c8] after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-6 after:-translate-x-1/2 after:rounded-full after:bg-[#d4af37] after:content-['']"
                : "text-[#9a8d78] hover:text-[#e8d5b5]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
