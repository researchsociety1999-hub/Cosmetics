import Link from "next/link";
import type { ReactNode } from "react";
import { signOutAction } from "../actions/auth";
import { BrandLogo } from "./BrandLogo";
import { NavbarMobileMenu } from "./NavbarMobileMenu";

interface NavbarProps {
  cartCount?: number;
  isAuthenticated?: boolean;
}

export function Navbar({ cartCount = 0, isAuthenticated = false }: NavbarProps) {
  return (
    <header className="relative z-40">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(3,4,6,0.72),rgba(3,4,6,0.28),transparent)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(214,168,95,0.26),transparent)]" />
      <div className="mx-auto max-w-7xl px-4 pt-5 md:px-6 md:pt-6">
        <div className="relative flex items-center justify-between gap-3 border-b border-[rgba(214,168,95,0.1)] px-1 pb-4 md:hidden">
          <div className="relative max-w-[220px] flex-1">
            <BrandLogo compact priority className="mx-auto" />
          </div>

          <NavbarMobileMenu isAuthenticated={isAuthenticated} cartCount={cartCount} />
        </div>

        <div className="relative hidden grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-6 border-b border-[rgba(214,168,95,0.1)] pb-5 md:grid lg:gap-8">
          <div className="flex min-w-0 items-center justify-start gap-4 lg:gap-6">
            <IconLink href="/search" label="Search">
              <SearchIcon />
            </IconLink>
            <nav className="flex min-w-0 items-center gap-4 lg:gap-6">
              <NavLink href="/shop" label="Shop" />
              <NavLink href="/routines" label="Routines" />
              <NavLink href="/ingredients" label="Ingredients" />
              <NavLink href="/journal" label="Journal" />
            </nav>
          </div>

          <div className="relative flex justify-center">
            <BrandLogo compact priority className="mx-auto max-w-[220px] lg:max-w-[248px]" />
          </div>

          <div className="flex min-w-0 items-center justify-end gap-3 lg:gap-5">
            <nav className="flex min-w-0 items-center gap-4 lg:gap-6">
              <NavLink href="/about" label="About" />
              <NavLink href="/faq" label="FAQ" />
              <NavLink href="/contact" label="Contact" />
            </nav>

            <div className="h-7 w-px bg-[rgba(214,168,95,0.12)]" />

            {isAuthenticated ? (
              <>
                <NavLink href="/account/orders" label="Account" />
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="mystic-button-secondary inline-flex min-h-[40px] items-center justify-center whitespace-nowrap px-4 py-2 text-[0.68rem] uppercase tracking-[0.22em]"
                  >
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <>
                <NavLink href="/account/login" label="Sign in" />
                <Link
                  href="/account/signup"
                  className="mystic-button-secondary inline-flex min-h-[40px] items-center justify-center whitespace-nowrap px-4 py-2 text-[0.68rem] uppercase tracking-[0.22em]"
                >
                  Sign up
                </Link>
              </>
            )}

            <IconLink href="/cart" label="Cart" badge={cartCount}>
              <CartIcon />
            </IconLink>
          </div>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="relative whitespace-nowrap text-[0.66rem] uppercase tracking-[0.22em] text-[#c5b79f] transition hover:text-[#f0d19a] focus-visible:outline-none focus-visible:text-[#f0d19a] lg:text-[0.68rem] lg:tracking-[0.24em]"
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
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(214,168,95,0.14)] bg-[rgba(10,12,16,0.46)] text-[#f5eee3] transition hover:border-[rgba(214,168,95,0.36)] hover:bg-[rgba(214,168,95,0.06)] hover:text-[#f0d19a]"
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
