"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/routines", label: "Routines" },
  { href: "/ingredients", label: "Ingredients" },
  { href: "/journal", label: "Journal" },
  { href: "/about", label: "About" },
] as const;

const NAV_LINK_BASE =
  "inline-flex shrink-0 items-center whitespace-nowrap py-1 [text-shadow:0_1px_14px_rgba(0,0,0,0.85)] transition duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(212,175,55,0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

const NAV_LINK_IDLE = `${NAV_LINK_BASE} text-[#d4c4a8] hover:text-[#f0e6d4]`;
const NAV_LINK_ACTIVE = `${NAV_LINK_BASE} text-[#f0d19a]`;

const HELP_CHOOSING_LINK =
  "inline-flex max-w-full items-center justify-start whitespace-normal break-words py-1 text-left text-[0.62rem] md:text-[0.65rem] uppercase leading-snug tracking-[0.2em] text-[#9a8b72] transition-colors duration-300 [text-shadow:0_1px_12px_rgba(0,0,0,0.75)] hover:text-[#d4c4a8] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(212,175,55,0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

/**
 * Centered gold nav (Shop · Routines · Ingredients · Journal · About) + account icon
 * on the right; hairline below — matches the editorial header reference.
 */
function isNavActive(href: string, pathname: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function GuidedDiscoveryLink({
  isOnHome,
  className,
}: {
  isOnHome: boolean;
  className: string;
}) {
  if (isOnHome) {
    return (
      <a href="#guided-discovery" className={className}>
        Need help choosing?
      </a>
    );
  }
  return (
    <Link href="/#guided-discovery" prefetch={false} className={className}>
      Need help choosing?
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const isOnHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState<number>(0);
  const headerRef = useRef<HTMLElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useLayoutEffect(() => {
    const root = document.documentElement;
    let raf = 0;

    const measure = () => {
      const node = headerRef.current;
      if (!node) return;
      const h = Math.ceil(node.getBoundingClientRect().height);
      if (h > 0) {
        root.style.setProperty("--mystique-header-offset", `${h}px`);
      }
    };

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    schedule();
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", schedule);
    };
  }, [scrolled]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    if (isMobileMenuOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    // eslint-disable-next-line
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;
    async function loadCartCount() {
      try {
        const res = await fetch("/api/cart-summary", { cache: "no-store" });
        const data = (await res.json()) as { itemCount?: number };
        if (cancelled) return;
        setCartCount(Math.max(0, Math.floor(Number(data.itemCount ?? 0))));
      } catch {
        if (cancelled) return;
        setCartCount(0);
      }
    }
    loadCartCount();
    window.addEventListener("focus", loadCartCount);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", loadCartCount);
    };
  }, []);

  const homeClickProps = isOnHome
    ? {
        onClick: (event: MouseEvent<HTMLAnchorElement>) => {
          event.preventDefault();
          const instant =
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          window.scrollTo({ top: 0, behavior: instant ? "auto" : "smooth" });
        },
      }
    : undefined;

  return (
    <header ref={headerRef} className="pointer-events-none fixed inset-x-0 top-0 z-40">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(11rem,32vh)] bg-[linear-gradient(180deg,rgba(2,3,6,0.82)_0%,rgba(2,3,6,0.42)_42%,rgba(2,3,6,0.12)_72%,transparent_100%)] backdrop-blur-[10px] [mask-image:linear-gradient(180deg,black_0%,black_55%,transparent_100%)] [-webkit-mask-image:linear-gradient(180deg,black_0%,black_55%,transparent_100%)]"
      />

      {/* Fluid header: no hamburger, wraps to keep all links visible */}
      <div className="pointer-events-auto relative overflow-hidden border-b border-white/[0.07] bg-[rgba(2,3,6,0.78)] backdrop-blur-xl">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_100%_at_50%_0%,rgba(214,168,95,0.07),transparent_55%),linear-gradient(180deg,rgba(8,9,14,0.35)_0%,rgba(2,3,6,0.2)_100%)]"
        />
        <div
          className={`relative flex flex-col gap-2 px-4 pt-[max(0.65rem,env(safe-area-inset-top,0px))] transition-[padding] duration-300 ease-out motion-reduce:transition-none sm:px-6 md:px-10 lg:px-14 ${
            scrolled ? "pb-2.5" : "pb-3.5"
          }`}
        >
          <div className="flex w-full min-w-0 items-center justify-between gap-3">
            <div className="min-w-0">
              <GuidedDiscoveryLink isOnHome={isOnHome} className={HELP_CHOOSING_LINK} />
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <CartIconLink count={cartCount} />
              <AccountIconLink />
              <button
                type="button"
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle menu"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[rgba(214,168,95,0.22)] bg-[rgba(2,3,6,0.45)] text-[#e8dcc4] shadow-[0_4px_20px_rgba(0,0,0,0.35)] backdrop-blur-sm transition duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(212,175,55,0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent md:hidden sm:h-9 sm:w-9"
              >
                <HamburgerGlyph open={isMobileMenuOpen} />
              </button>
            </div>
          </div>
          <nav
            className="mx-auto hidden w-full items-center justify-center gap-x-[clamp(0.5rem,2vw,2rem)] gap-y-2 text-center text-[clamp(0.5rem,1.35vw,0.64rem)] uppercase tracking-[clamp(0.22em,0.6vw,0.36em)] text-[#d4c4a8] md:flex"
            aria-label="Primary"
          >
            {NAV_LINKS.slice(0, 2).map(({ href, label }) => (
              <NavLink key={href} href={href} label={label} active={isNavActive(href, pathname)} />
            ))}
            <NavLink href="/" label="Home" active={isOnHome} extraProps={homeClickProps} />
            {NAV_LINKS.slice(2).map(({ href, label }) => (
              <NavLink key={href} href={href} label={label} active={isNavActive(href, pathname)} />
            ))}
          </nav>
        </div>

        <div
          aria-hidden
          className={`pointer-events-none mx-auto h-px w-[min(32rem,92vw)] max-w-[92%] bg-[linear-gradient(90deg,transparent_0%,rgba(214,168,95,0.05)_10%,rgba(214,168,95,0.38)_50%,rgba(214,168,95,0.05)_90%,transparent_100%)] shadow-[0_0_24px_rgba(214,168,95,0.07)] transition-[margin-top] duration-300 ease-out motion-reduce:transition-none md:flex ${
            scrolled ? "mt-3" : "mt-4.5"
          }`}
        />
      </div>

      <div
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[rgba(2,3,6,0.95)] backdrop-blur-2xl transition-all duration-300 md:hidden ${
          isMobileMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        aria-modal="true"
        role="dialog"
        aria-label="Mobile navigation menu"
      >
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setIsMobileMenuOpen(false)}
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(214,168,95,0.22)] bg-[rgba(2,3,6,0.45)] text-[#e8dcc4] transition duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(212,175,55,0.45)] sm:right-6 sm:top-[max(0.65rem,env(safe-area-inset-top,0px))] sm:h-9 sm:w-9"
        >
          <HamburgerGlyph open={true} />
        </button>
        <nav
          className="flex flex-col items-center gap-8 text-center text-sm uppercase tracking-[0.3em] text-[#d4c4a8]"
          aria-label="Mobile Primary"
        >
          <NavLink href="/" label="Home" active={isOnHome} extraProps={homeClickProps} />
          {NAV_LINKS.map(({ href, label }) => (
            <NavLink
              key={href}
              href={href}
              label={label}
              active={isNavActive(href, pathname)}
            />
          ))}
        </nav>
      </div>
    </header>
  );
}

function CartIconLink({ count }: { count: number }) {
  const showBadge = Number.isFinite(count) && count > 0;
  return (
    <Link
      href="/cart"
      prefetch
      aria-label={showBadge ? `Cart (${count} items)` : "Cart"}
      className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[rgba(214,168,95,0.22)] bg-[rgba(2,3,6,0.45)] text-[#e8dcc4] shadow-[0_4px_20px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-[border-color,background-color,transform,color] duration-200 hover:border-[rgba(214,168,95,0.38)] hover:bg-[rgba(8,9,14,0.55)] active:scale-[0.96] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(212,175,55,0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:h-9 sm:w-9"
    >
      <span className="sr-only">Cart</span>
      <CartGlyph />
      {showBadge ? (
        <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[#d6a85f] px-1 text-[0.6rem] font-semibold tabular-nums text-black shadow-[0_0_18px_rgba(214,168,95,0.25)]">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}

function NavLink({
  href,
  label,
  active,
  extraProps,
}: {
  href: string;
  label: string;
  active: boolean;
  extraProps?: AnchorHTMLAttributes<HTMLAnchorElement>;
}) {
  return (
    <Link
      href={href}
      prefetch
      className={active ? NAV_LINK_ACTIVE : NAV_LINK_IDLE}
      aria-current={active ? "page" : undefined}
      {...extraProps}
    >
      {label}
    </Link>
  );
}
function AccountIconLink() {
  return (
    <div className="relative shrink-0">
      <Link
        href="/account"
        prefetch
        aria-label="Account"
        className="group inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[rgba(214,168,95,0.22)] bg-[rgba(2,3,6,0.45)] px-0 text-[#e8dcc4] shadow-[0_4px_20px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-[border-color,background-color,transform,color] duration-200 hover:border-[rgba(214,168,95,0.38)] hover:bg-[rgba(8,9,14,0.55)] active:scale-[0.96] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(212,175,55,0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:h-9 sm:px-0 lg:px-3.5"
      >
        <span className="sr-only">Account</span>
        <span className="inline-flex h-10 w-10 items-center justify-center sm:h-9 sm:w-9">
          <AccountGlyph />
        </span>
        <span className="hidden font-ui text-[0.58rem] font-semibold uppercase tracking-[0.26em] text-[#d6c4a8] lg:inline">
          ACCOUNT
        </span>
      </Link>
      <span className="pointer-events-none absolute left-1/2 top-[calc(100%+0.35rem)] z-50 hidden -translate-x-1/2 whitespace-nowrap rounded-full border border-[rgba(214,168,95,0.24)] bg-[rgba(6,8,14,0.96)] px-3 py-1 text-[0.6rem] uppercase tracking-[0.24em] text-[#f5eee3] opacity-0 shadow-[0_10px_32px_rgba(0,0,0,0.5)] transition-opacity duration-200 group-focus-within:opacity-100 sm:group-focus-within:opacity-0 sm:hidden">
        Account
      </span>
    </div>
  );
}

function AccountGlyph() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="12" cy="9" r="3.25" stroke="currentColor" strokeWidth="1.35" strokeOpacity="0.9" />
      <path
        d="M6.5 19.25c0-3.1 2.35-5 5.5-5s5.5 1.9 5.5 5"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeOpacity="0.9"
      />
    </svg>
  );
}

function CartGlyph() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M7.25 7.5h13l-1.2 6.6a2.25 2.25 0 0 1-2.21 1.85H9.1a2.25 2.25 0 0 1-2.2-1.78L5.2 4.75H3.25"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.9"
      />
      <circle cx="9.75" cy="19.25" r="1.1" fill="currentColor" fillOpacity="0.9" />
      <circle cx="17.25" cy="19.25" r="1.1" fill="currentColor" fillOpacity="0.9" />
    </svg>
  );
}

function HamburgerGlyph({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
      <path d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
    </svg>
  );
}
