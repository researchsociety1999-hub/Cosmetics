"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { signOutAction } from "../actions/auth";

type NavbarMobileMenuProps = {
  isAuthenticated: boolean;
};

export function NavbarMobileMenu({ isAuthenticated }: NavbarMobileMenuProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const el = detailsRef.current;
    if (!el) return;

    function handlePointerDown(event: PointerEvent) {
      const current = detailsRef.current;
      if (!current) return;
      if (!current.open) return;
      const target = event.target as Node;
      if (!current.contains(target)) {
        current.open = false;
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
      <summary
        aria-label="Open navigation menu"
        className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-[rgba(212,175,55,0.22)] bg-[rgba(0,0,0,0.55)] px-4 py-2 text-[0.68rem] uppercase tracking-[0.24em] text-[#f6f0e6] shadow-[0_0_24px_rgba(212,175,55,0.06)] backdrop-blur-md [&::-webkit-details-marker]:hidden"
      >
        <span>Menu</span>
        <span className="text-[#e8c56e] transition-transform duration-200 group-open:rotate-180">
          <ChevronIcon />
        </span>
      </summary>
      <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[280px] overflow-hidden rounded-[22px] border border-[rgba(212,175,55,0.22)] bg-[linear-gradient(180deg,rgba(0,0,0,0.96),rgba(4,3,6,0.94))] p-4 shadow-[0_0_0_1px_rgba(212,175,55,0.08),0_28px_64px_rgba(0,0,0,0.65)] backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(255,154,80,0.12),transparent_38%),radial-gradient(circle_at_100%_100%,rgba(212,175,55,0.08),transparent_42%)]" />
        <nav className="relative flex flex-col gap-2">
          <p className="px-3 pb-1 text-[0.58rem] uppercase tracking-[0.2em] text-[#7a7265]">
            More
          </p>
          <MobileNavLink href="/journal" label="Journal" onNavigate={closeMenu} />
          <MobileNavLink href="/faq" label="FAQ" onNavigate={closeMenu} />
          <MobileNavLink href="/contact" label="Contact" onNavigate={closeMenu} />
          {isAuthenticated ? (
            <>
              <MobileNavLink href="/account/orders" label="Account" onNavigate={closeMenu} />
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="w-full rounded-full px-3 py-2 text-left text-xs uppercase tracking-[0.22em] text-[#f6f0e6] transition hover:bg-[rgba(212,175,55,0.12)]"
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
      className="rounded-full px-3 py-2 text-xs uppercase tracking-[0.22em] text-[#f6f0e6] transition hover:bg-[rgba(212,175,55,0.12)] hover:text-[#f5e0a8]"
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
