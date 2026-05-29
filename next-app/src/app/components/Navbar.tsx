"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { acquireOverlayLock, trapTabKey } from "../lib/a11yOverlay";
import { durationsMs, msToSeconds, springs } from "../lib/motion";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/routines", label: "Routines" },
  { href: "/ingredients", label: "Ingredients" },
  { href: "/journal", label: "Journal" },
  { href: "/about", label: "About" },
] as const;

// Tap-target audit: mobile gets min-h-[44px] (WCAG 2.5.5); desktop reverts to
// the original compact editorial spacing via `md:min-h-0` so the header layout
// is unchanged at md+ breakpoints (mobile menu uses these classes; desktop nav
// is `hidden md:flex` so the mobile constraint is invisible there).
const NAV_LINK_BASE =
  "inline-flex shrink-0 items-center whitespace-nowrap min-h-[44px] md:min-h-0 py-1 transition-[color,opacity] duration-500 ease-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(212,175,55,0.35)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent motion-reduce:transition-none";

const NAV_LINK_IDLE = `${NAV_LINK_BASE} text-[#a69884] hover:text-[#e4d9c8]`;
const NAV_LINK_ACTIVE = `${NAV_LINK_BASE} text-[#d4c4a8]`;

const HELP_CHOOSING_LINK =
  "inline-flex max-w-full items-center justify-start whitespace-normal break-words min-h-[44px] md:min-h-0 py-1 text-left text-[0.6rem] md:text-[0.62rem] uppercase leading-snug tracking-[0.24em] text-[#7d7366] transition-colors duration-500 ease-out hover:text-[#b5a896] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(212,175,55,0.35)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

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
  const [logoCompressed, setLogoCompressed] = useState(false);
  const [cartCount, setCartCount] = useState<number>(0);
  const [cartLiveMessage, setCartLiveMessage] = useState("");
  const headerRef = useRef<HTMLElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const reduceMotion = useReducedMotion() ?? false;
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuCloseRef = useRef<HTMLButtonElement>(null);
  const mobileMenuToggleRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const overlayRef = useRef<ReturnType<typeof acquireOverlayLock> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onScroll = () => setLogoCompressed(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ message?: string }>).detail;
      const msg = typeof detail?.message === "string" ? detail.message : "";
      if (!msg) return;
      setCartLiveMessage(msg);
      window.setTimeout(() => setCartLiveMessage(""), 1800);
    };
    window.addEventListener("mystique:cart-feedback", handler as EventListener);
    return () =>
      window.removeEventListener("mystique:cart-feedback", handler as EventListener);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const node = headerRef.current;
    if (!node) return;

    const measure = () => {
      const h = Math.ceil(node.getBoundingClientRect().height);
      if (h > 0) {
        root.style.setProperty("--mystique-header-offset", `${h}px`);
      }
    };

    // A ResizeObserver fires on *every* height change — including each frame of
    // the `transition-[padding]` scrolled/unscrolled animation and post-font-swap
    // reflow — so `--mystique-header-offset` always reflects the navbar's true
    // current height. This replaces the previous rAF + window-resize approach,
    // which measured once mid-transition and could leave the offset stale (too
    // small) when scrolling back to the top, letting the heading slip under the nav.
    const ro = new ResizeObserver(() => measure());
    ro.observe(node);

    // Initial synchronous measure so the offset is correct before the first
    // observer callback (covers no-mutation first paint).
    measure();

    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    if (isMobileMenuOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const main = document.getElementById("main-content");
    const footer = document.querySelector("footer");
    const backToTop = document.querySelector<HTMLElement>('button[aria-label="Back to top"]');
    const cookieBanner = document.querySelector<HTMLElement>('[aria-label="Cookie consent"]');

    if (isMobileMenuOpen) {
      restoreFocusRef.current = (document.activeElement as HTMLElement | null) ?? null;
      overlayRef.current?.release();
      overlayRef.current = acquireOverlayLock({
        inertTargets: [main, footer as HTMLElement | null, backToTop, cookieBanner],
      });

      const id = window.requestAnimationFrame(() => {
        mobileMenuCloseRef.current?.focus();
      });
      return () => {
        window.cancelAnimationFrame(id);
        // Safety: if the navbar unmounts while still open, release the overlay lock.
        overlayRef.current?.release();
        overlayRef.current = null;
      };
    }

    overlayRef.current?.release();
    overlayRef.current = null;

    const toFocus = restoreFocusRef.current ?? mobileMenuToggleRef.current;
    if (toFocus) {
      const id = window.requestAnimationFrame(() => {
        toFocus.focus();
      });
      return () => window.cancelAnimationFrame(id);
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const panel = mobileMenuRef.current;
    if (!panel) return;

    const onKeyDown = (e: KeyboardEvent) => {
      trapTabKey(e, panel, { initialFocus: mobileMenuCloseRef.current });
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
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
    <header
      ref={headerRef}
      className="fixed inset-x-0 top-0 z-40"
      data-navbar-variant={isOnHome ? "home" : undefined}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(10rem,30vh)] bg-[linear-gradient(180deg,rgba(2,3,6,0.72)_0%,rgba(2,3,6,0.32)_48%,rgba(2,3,6,0.08)_78%,transparent_100%)] backdrop-blur-[8px] [mask-image:linear-gradient(180deg,black_0%,black_52%,transparent_100%)] [-webkit-mask-image:linear-gradient(180deg,black_0%,black_52%,transparent_100%)]"
      />

      {/* Fluid header: no hamburger, wraps to keep all links visible */}
      <div className="pointer-events-auto relative overflow-hidden border-b border-white/[0.045] bg-[rgba(2,3,6,0.58)] backdrop-blur-xl">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_100%_at_50%_0%,rgba(214,168,95,0.045),transparent_58%),linear-gradient(180deg,rgba(8,9,14,0.22)_0%,rgba(2,3,6,0.12)_100%)]"
        />
        <div
          data-scrolled={scrolled ? "1" : "0"}
          className={`mystique-navbar-inner relative flex flex-col gap-2.5 px-4 pt-[max(0.75rem,env(safe-area-inset-top,0px))] transition-[padding] duration-500 ease-out motion-reduce:transition-none sm:px-6 md:px-10 lg:px-14 ${
            scrolled ? "pb-2.5" : "pb-4"
          }`}
        >
          <div className="flex w-full min-w-0 items-center justify-between gap-4">
            <div className="min-w-0">
              <GuidedDiscoveryLink isOnHome={isOnHome} className={HELP_CHOOSING_LINK} />
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <CartIconLink count={cartCount} />
              <AccountIconLink />
              <div className="sr-only" aria-live="polite">
                {cartLiveMessage}
              </div>
              <button
                ref={mobileMenuToggleRef}
                type="button"
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle menu"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="relative inline-flex h-10 w-10 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full border border-[rgba(214,168,95,0.14)] bg-[rgba(2,3,6,0.35)] text-[#cfc3b0] shadow-[0_2px_14px_rgba(0,0,0,0.28)] backdrop-blur-sm transition-[border-color,background-color,color] duration-500 ease-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(212,175,55,0.35)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent md:hidden"
              >
                <HamburgerGlyph open={isMobileMenuOpen} />
              </button>
            </div>
          </div>
          <nav
            className="mx-auto hidden w-full max-w-5xl items-center justify-center gap-x-[clamp(1rem,2.4vw,2.5rem)] gap-y-2.5 text-center text-[clamp(0.52rem,1.15vw,0.62rem)] font-medium uppercase tracking-[0.28em] text-[#a69884] md:flex"
            aria-label="Primary"
          >
            {NAV_LINKS.slice(0, 2).map(({ href, label }) => (
              <NavLink key={href} href={href} label={label} active={isNavActive(href, pathname)} />
            ))}
            <NavLink
              href="/"
              label="Home"
              active={isOnHome}
              extraProps={homeClickProps}
              logoMotion={{
                compressed: logoCompressed,
                reduceMotion,
              }}
            />
            {NAV_LINKS.slice(2).map(({ href, label }) => (
              <NavLink key={href} href={href} label={label} active={isNavActive(href, pathname)} />
            ))}
          </nav>
        </div>

        <div
          aria-hidden
          className={`mystique-navbar-divider pointer-events-none mx-auto h-px w-[min(36rem,92vw)] max-w-[94%] bg-[linear-gradient(90deg,transparent_0%,rgba(214,168,95,0.04)_12%,rgba(214,168,95,0.2)_50%,rgba(214,168,95,0.04)_88%,transparent_100%)] shadow-[0_0_18px_rgba(214,168,95,0.04)] transition-[margin-top] duration-500 ease-out motion-reduce:transition-none md:flex ${
            scrolled ? "mt-3" : "mt-4"
          }`}
        />
      </div>

      {isMobileMenuOpen ? (
        <div
          className="fixed inset-0 z-[70] flex flex-col items-center justify-center md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            aria-hidden
            className="absolute inset-0 bg-[rgba(2,3,6,0.95)] backdrop-blur-2xl"
          />
          <div
            ref={mobileMenuRef}
            tabIndex={-1}
            className="relative flex w-full flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              ref={mobileMenuCloseRef}
              type="button"
              aria-label="Close menu"
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute right-4 top-4 inline-flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-[rgba(214,168,95,0.14)] bg-[rgba(2,3,6,0.35)] text-[#cfc3b0] transition-[border-color,background-color,color] duration-500 ease-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(212,175,55,0.35)] sm:right-6 sm:top-[max(0.75rem,env(safe-area-inset-top,0px))]"
            >
              <HamburgerGlyph open={true} />
            </button>
            <nav
              className="flex flex-col items-center gap-8 text-center text-sm uppercase tracking-[0.3em] text-[#d4c4a8]"
              aria-label="Mobile Primary"
            >
              <NavLink
                href="/"
                label="Home"
                active={isOnHome}
                extraProps={homeClickProps}
                logoMotion={{
                  compressed: logoCompressed,
                  reduceMotion,
                }}
              />
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
        </div>
      ) : null}
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
      className="relative inline-flex h-10 w-10 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full border border-[rgba(214,168,95,0.14)] bg-[rgba(2,3,6,0.35)] text-[#cfc3b0] shadow-[0_2px_14px_rgba(0,0,0,0.28)] backdrop-blur-sm transition-[border-color,background-color,color] duration-500 ease-out hover:border-[rgba(214,168,95,0.26)] hover:bg-[rgba(8,9,14,0.42)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(212,175,55,0.35)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
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
  logoMotion,
}: {
  href: string;
  label: string;
  active: boolean;
  extraProps?: AnchorHTMLAttributes<HTMLAnchorElement>;
  logoMotion?: { compressed: boolean; reduceMotion: boolean };
}) {
  const isBreathing = logoMotion
    ? !logoMotion.reduceMotion && !logoMotion.compressed
    : false;

  return (
    <Link
      href={href}
      prefetch
      className={active ? NAV_LINK_ACTIVE : NAV_LINK_IDLE}
      aria-current={active ? "page" : undefined}
      {...extraProps}
    >
      {logoMotion ? (
        <motion.span
          className="inline-flex items-center justify-center"
          style={{ transformOrigin: "50% 55%" }}
          animate={
            logoMotion.reduceMotion
              ? undefined
              : isBreathing
                ? { scale: [1, 1.015, 1], opacity: 1 }
                : logoMotion.compressed
                  ? { scale: 0.85, opacity: 0.88 }
                  : { scale: 1, opacity: 1 }
          }
          transition={
            isBreathing
              ? {
                  duration: msToSeconds(durationsMs.navbarLogoBreathingLoop),
                  repeat: Infinity,
                }
              : springs.soft
          }
        >
          {label}
        </motion.span>
      ) : (
        label
      )}
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
        className="group inline-flex h-10 min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-full border border-[rgba(214,168,95,0.14)] bg-[rgba(2,3,6,0.35)] px-0 text-[#cfc3b0] shadow-[0_2px_14px_rgba(0,0,0,0.28)] backdrop-blur-sm transition-[border-color,background-color,color] duration-500 ease-out hover:border-[rgba(214,168,95,0.26)] hover:bg-[rgba(8,9,14,0.42)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(212,175,55,0.35)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent lg:px-3.5"
      >
        <span className="sr-only">Account</span>
        <span className="inline-flex h-10 w-10 items-center justify-center">
          <AccountGlyph />
        </span>
        <span className="hidden font-ui text-[0.56rem] font-medium uppercase tracking-[0.3em] text-[#9a8b78] lg:inline">
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
