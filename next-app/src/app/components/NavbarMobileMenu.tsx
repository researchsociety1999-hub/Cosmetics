"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { signOutAction } from "../actions/auth";

type NavbarMobileMenuProps = {
  isAuthenticated: boolean;
  cartCount: number;
};

export function NavbarMobileMenu({
  isAuthenticated,
  cartCount,
}: NavbarMobileMenuProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const el = detailsRef.current;
    if (!el) return;

    function handlePointerDown(event: PointerEvent) {
      if (!el.open) return;
      const target = event.target as Node;
      if (!el.contains(target)) {
        el.open = false;
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  function closeMenu() {
    const el = detailsRef.current;
    if (el) {
      el.open = false;
    }
  }

  return (
    <details ref={detailsRef} className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-[rgba(214,168,95,0.16)] bg-[rgba(8,10,14,0.4)] px-4 py-2 text-[0.68rem] uppercase tracking-[0.24em] text-[#f5eee3] backdrop-blur-sm [&::-webkit-details-marker]:hidden">
        <span>Menu</span>
        <span className="text-[#d6a85f] transition-transform duration-200 group-open:rotate-180">
          <ChevronIcon />
        </span>
      </summary>
      <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[280px] overflow-hidden rounded-[22px] border border-[rgba(214,168,95,0.16)] bg-[linear-gradient(180deg,rgba(9,12,18,0.96),rgba(7,9,13,0.92))] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,170,70,0.1),transparent_26%)]" />
        <nav className="relative flex flex-col gap-2">
          <MobileNavLink href="/shop" label="Shop" onNavigate={closeMenu} />
          <MobileNavLink href="/routines" label="Routines" onNavigate={closeMenu} />
          <MobileNavLink href="/ingredients" label="Ingredients" onNavigate={closeMenu} />
          <MobileNavLink href="/journal" label="Journal" onNavigate={closeMenu} />
          <MobileNavLink href="/about" label="About" onNavigate={closeMenu} />
          <MobileNavLink href="/faq" label="FAQ" onNavigate={closeMenu} />
          <MobileNavLink href="/contact" label="Contact" onNavigate={closeMenu} />
          {isAuthenticated ? (
            <>
              <MobileNavLink href="/account/orders" label="Account" onNavigate={closeMenu} />
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="w-full rounded-full px-3 py-2 text-left text-xs uppercase tracking-[0.22em] text-[#f5eee3] transition hover:bg-[rgba(214,168,95,0.12)]"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <MobileNavLink href="/account/login" label="Sign in" onNavigate={closeMenu} />
              <MobileNavLink href="/account/signup" label="Sign up" onNavigate={closeMenu} />
            </>
          )}
          <MobileNavLink href="/search" label="Search" onNavigate={closeMenu} />
          <MobileNavLink href="/cart" label={`Cart (${cartCount})`} onNavigate={closeMenu} />
        </nav>
      </div>
    </details>
  );
}

function MobileNavLink({
  href,
  label,
  onNavigate,
}: {
  href: string;
  label: string;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="rounded-full px-3 py-2 text-xs uppercase tracking-[0.22em] text-[#f5eee3] transition hover:bg-[rgba(214,168,95,0.12)]"
    >
      {label}
    </Link>
  );
}

function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
