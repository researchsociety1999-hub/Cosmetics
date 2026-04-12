import Link from "next/link";
import type { ReactNode } from "react";
import { signOutAction } from "../actions/auth";
import { NavbarMobileMenu } from "./NavbarMobileMenu";

interface NavbarProps {
  cartCount?: number;
  isAuthenticated?: boolean;
}

export function Navbar({ cartCount = 0, isAuthenticated = false }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[rgba(212,175,55,0.14)] bg-[rgba(0,0,0,0.72)] shadow-[0_12px_40px_rgba(0,0,0,0.55),0_0_48px_rgba(212,175,55,0.04)] backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-[rgba(0,0,0,0.58)]">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(212,175,55,0.35),rgba(255,200,140,0.12),transparent)]" />
      <div className="w-full px-4 pt-4 md:px-6 md:pt-5 lg:px-10 xl:px-14">
        <div className="relative flex items-center justify-between gap-3 pb-4 md:hidden">
          <nav className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2">
            <NavLink href="/shop" label="Shop" />
            <NavLink href="/routines" label="Routines" />
            <NavLink href="/ingredients" label="Ingredients" />
            <NavLink href="/about" label="About" />
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <IconLink href="/search" label="Search">
              <SearchIcon />
            </IconLink>
            <NavbarMobileMenu isAuthenticated={isAuthenticated} />
            <IconLink href="/cart" label="Bag" badge={cartCount}>
              <CartIcon />
            </IconLink>
          </div>
        </div>

        <div className="relative hidden items-center justify-between gap-6 pb-5 md:flex lg:gap-8">
          <nav className="flex min-w-0 flex-1 items-center gap-5 lg:gap-7">
            <NavLink href="/shop" label="Shop" />
            <NavLink href="/routines" label="Routines" />
            <NavLink href="/ingredients" label="Ingredients" />
            <NavLink href="/about" label="About" />
          </nav>

          <div className="flex shrink-0 items-center gap-3 lg:gap-4">
            <IconLink href="/search" label="Search">
              <SearchIcon />
            </IconLink>

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

            <IconLink href="/cart" label="Bag" badge={cartCount}>
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
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] text-[#f5eee3] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md transition hover:border-[rgba(214,168,95,0.4)] hover:bg-[rgba(214,168,95,0.08)] hover:text-[#f0d19a]"
    >
      {children}
      {showBadge ? (
        <span className="absolute -right-1 -top-1 inline-flex min-w-[1.1rem] items-center justify-center rounded-full bg-[#d4af37] px-1 text-[0.62rem] font-semibold text-black">
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
