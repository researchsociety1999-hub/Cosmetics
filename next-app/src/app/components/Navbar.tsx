"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface NavbarProps {
  cartCount?: number;
  wishlistCount?: number;
}

export function Navbar({ cartCount, wishlistCount }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [guestCartCount, setGuestCartCount] = useState(0);
  const [guestWishlistCount, setGuestWishlistCount] = useState(0);

  useEffect(() => {
    if (cartCount == null) {
      try {
        const raw = window.localStorage.getItem("mystic_cart");
        if (raw) {
          const parsed = JSON.parse(raw) as { quantity: number }[];
          const total = parsed.reduce(
            (sum, item) => sum + (item.quantity ?? 0),
            0,
          );
          setGuestCartCount(total);
        }
      } catch {
        setGuestCartCount(0);
      }
    }

    if (wishlistCount == null) {
      try {
        const raw = window.localStorage.getItem("mystic_wishlist");
        if (raw) {
          const parsed = JSON.parse(raw) as unknown[];
          setGuestWishlistCount(parsed.length);
        }
      } catch {
        setGuestWishlistCount(0);
      }
    }
  }, [cartCount, wishlistCount]);

  const effectiveCartCount = cartCount ?? guestCartCount;
  const effectiveWishlistCount = wishlistCount ?? guestWishlistCount;

  return (
    <header className="sticky top-0 z-40 border-b border-[rgba(214,168,95,0.2)] bg-black/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(214,168,95,0.35)] bg-[rgba(255,255,255,0.03)] shadow-[0_0_25px_rgba(214,168,95,0.25)]">
            <span className="font-cormorant text-xl tracking-[0.3em] text-[#d6a85f]">
              M
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-cormorant text-xl font-semibold tracking-[0.25em] text-[#d6a85f]">
              MYSTIC
            </span>
            <span className="text-[0.65rem] uppercase tracking-[0.25em] text-[#b8ab95]">
              Where Beauty Transcends
            </span>
          </div>
        </Link>

        <nav className="hidden gap-8 text-sm text-[#b8ab95] md:flex">
          <NavLink href="/" label="Home" />
          <NavLink href="/shop" label="Shop" />
          <NavLink href="/ingredients" label="Ingredients" />
          <NavLink href="/press" label="Press" />
          <NavLink href="/#about" label="About" />
          <NavLink href="/#faq" label="FAQ" />
          <NavLink href="/#contact" label="Contact" />
        </nav>

        <div className="flex items-center gap-3 md:gap-5">
          <IconButton ariaLabel="Search" shortLabel="Srch" />
          <IconButton
            ariaLabel="Wishlist"
            shortLabel="Wish"
            badge={effectiveWishlistCount}
          />
          <IconButton
            ariaLabel="Cart"
            shortLabel="Cart"
            badge={effectiveCartCount}
          />

          <Link
            href="/account/login"
            className="hidden rounded-full border border-[rgba(214,168,95,0.5)] px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-[#f5eee3] hover:bg-[rgba(214,168,95,0.08)] md:inline-flex"
          >
            Login
          </Link>

          <button
            type="button"
            className="inline-flex h-9 w-12 items-center justify-center rounded-full border border-[rgba(214,168,95,0.5)] bg-black/40 text-[0.6rem] uppercase tracking-[0.12em] text-[#f5eee3] md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="mystic-glass border-t border-[rgba(214,168,95,0.2)] md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 text-sm text-[#f5eee3]">
            <MobileNavLink href="/" label="Home" onClick={() => setMobileOpen(false)} />
            <MobileNavLink href="/shop" label="Shop" onClick={() => setMobileOpen(false)} />
            <MobileNavLink
              href="/ingredients"
              label="Ingredients"
              onClick={() => setMobileOpen(false)}
            />
            <MobileNavLink href="/press" label="Press" onClick={() => setMobileOpen(false)} />
            <MobileNavLink href="/#about" label="About" onClick={() => setMobileOpen(false)} />
            <MobileNavLink href="/#faq" label="FAQ" onClick={() => setMobileOpen(false)} />
            <MobileNavLink
              href="/#contact"
              label="Contact"
              onClick={() => setMobileOpen(false)}
            />
            <Link
              href="/account/login"
              onClick={() => setMobileOpen(false)}
              className="mt-3 inline-flex items-center justify-center rounded-full border border-[rgba(214,168,95,0.5)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f5eee3] hover:bg-[rgba(214,168,95,0.08)]"
            >
              Login
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

interface NavLinkProps {
  href: string;
  label: string;
}

function NavLink({ href, label }: NavLinkProps) {
  return (
    <Link
      href={href}
      className="relative text-xs uppercase tracking-[0.22em] text-[#b8ab95] transition hover:text-[#f0d19a]"
    >
      {label}
    </Link>
  );
}

interface MobileNavLinkProps extends NavLinkProps {
  onClick: () => void;
}

function MobileNavLink({ href, label, onClick }: MobileNavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="rounded-full px-3 py-2 text-xs uppercase tracking-[0.22em] text-[#f5eee3] hover:bg-[rgba(214,168,95,0.12)]"
    >
      {label}
    </Link>
  );
}

function IconButton({
  badge,
  ariaLabel,
  shortLabel,
}: {
  badge?: number;
  ariaLabel: string;
  shortLabel: string;
}) {
  const showBadge = (badge ?? 0) > 0;

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className="relative inline-flex h-9 w-12 items-center justify-center rounded-full border border-[rgba(214,168,95,0.5)] bg-black/40 text-[0.6rem] uppercase tracking-[0.12em] text-[#f5eee3] hover:bg-[rgba(214,168,95,0.12)]"
    >
      {shortLabel}
      {showBadge && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[#d6a85f] px-1 text-[0.6rem] font-semibold text-black shadow-[0_0_0_1px_rgba(0,0,0,0.6)]">
          {badge}
        </span>
      )}
    </button>
  );
}
