import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "./BrandLogo";

interface NavbarProps {
  cartCount?: number;
}

export function Navbar({ cartCount = 0 }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[rgba(214,168,95,0.14)] bg-[linear-gradient(180deg,rgba(4,5,7,0.9),rgba(6,8,12,0.72))] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:gap-8 md:px-6 md:py-4">
        <div className="max-w-[228px] flex-1 opacity-90 md:max-w-[280px]">
          <BrandLogo compact />
        </div>

        <nav className="hidden items-center gap-6 lg:gap-8 md:flex">
          <NavLink href="/shop" label="Shop" />
          <NavLink href="/ingredients" label="Ingredients" />
          <NavLink href="/journal" label="Journal" />
          <NavLink href="/about" label="About" />
          <NavLink href="/faq" label="FAQ" />
          <NavLink href="/contact" label="Contact" />
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <IconLink href="/search" label="Search">
            <SearchIcon />
          </IconLink>
          <IconLink href="/cart" label="Cart" badge={cartCount}>
            <CartIcon />
          </IconLink>
        </div>

        <details className="relative md:hidden">
          <summary className="flex list-none items-center gap-2 rounded-full border border-[rgba(214,168,95,0.24)] bg-[rgba(255,255,255,0.03)] px-4 py-2 text-[0.68rem] uppercase tracking-[0.24em] text-[#f5eee3]">
            Menu
          </summary>
          <div className="absolute right-0 top-[calc(100%+0.75rem)] w-[280px] rounded-[22px] border border-[rgba(214,168,95,0.18)] bg-[#090c12] p-4 shadow-[0_22px_60px_rgba(0,0,0,0.55)]">
            <nav className="flex flex-col gap-2">
              <MobileNavLink href="/shop" label="Shop" />
              <MobileNavLink href="/ingredients" label="Ingredients" />
              <MobileNavLink href="/journal" label="Journal" />
              <MobileNavLink href="/about" label="About" />
              <MobileNavLink href="/faq" label="FAQ" />
              <MobileNavLink href="/contact" label="Contact" />
              <MobileNavLink href="/search" label="Search" />
              <MobileNavLink href="/cart" label={`Cart (${cartCount})`} />
            </nav>
          </div>
        </details>
      </div>
    </header>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-[0.68rem] uppercase tracking-[0.24em] text-[#b8ab95] transition hover:text-[#f0d19a] focus-visible:outline-none focus-visible:text-[#f0d19a]"
    >
      {label}
    </Link>
  );
}

function MobileNavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-full px-3 py-2 text-xs uppercase tracking-[0.22em] text-[#f5eee3] transition hover:bg-[rgba(214,168,95,0.12)]"
    >
      {label}
    </Link>
  );
}

function IconLink({
  href,
  label,
  badge,
  children,
}: {
  href: string;
  label: string;
  badge?: number;
  children: ReactNode;
}) {
  const showBadge = (badge ?? 0) > 0;

  return (
    <Link
      href={href}
      aria-label={label}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(214,168,95,0.28)] bg-[rgba(255,255,255,0.03)] text-[#f5eee3] transition hover:border-[rgba(214,168,95,0.6)] hover:text-[#f0d19a]"
    >
      {children}
      {showBadge ? (
        <span className="absolute -right-1 -top-1 inline-flex min-w-[1.1rem] items-center justify-center rounded-full bg-[#d6a85f] px-1 text-[0.62rem] font-semibold text-black">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" aria-hidden="true">
      <circle cx="11" cy="11" r="6" strokeWidth="1.8" />
      <path d="M20 20l-4.2-4.2" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" aria-hidden="true">
      <path d="M4 5h2l1.4 8.2a1 1 0 001 .8h8.8a1 1 0 001-.78L20 8H7.2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="19" r="1.5" strokeWidth="1.6" />
      <circle cx="17" cy="19" r="1.5" strokeWidth="1.6" />
    </svg>
  );
}
