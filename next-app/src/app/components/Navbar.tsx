"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/routines", label: "Routines" },
  { href: "/", label: "Home" },
  { href: "/ingredients", label: "Ingredients" },
  { href: "/journal", label: "Journal" },
  { href: "/about", label: "About" },
] as const;

const NAV_LINK_BASE =
  "inline-flex min-h-[44px] shrink-0 items-center whitespace-nowrap py-1 [text-shadow:0_1px_14px_rgba(0,0,0,0.85)] transition duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(212,175,55,0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:min-h-0 sm:py-0";

const NAV_LINK_IDLE = `${NAV_LINK_BASE} text-[#d4c4a8] hover:text-[#f0e6d4]`;
const NAV_LINK_ACTIVE = `${NAV_LINK_BASE} text-[#f0d19a]`;

const MOBILE_NAV_LINK_BASE =
  "inline-flex shrink-0 items-center whitespace-nowrap py-2 [text-shadow:0_1px_14px_rgba(0,0,0,0.85)] transition duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(212,175,55,0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

const MOBILE_NAV_LINK_IDLE = `${MOBILE_NAV_LINK_BASE} text-[#d4c4a8] hover:text-[#f0e6d4]`;
const MOBILE_NAV_LINK_ACTIVE = `${MOBILE_NAV_LINK_BASE} text-[#f0d19a]`;

const HELP_CHOOSING_LINK =
  "inline-flex min-h-[44px] max-w-full items-center justify-center whitespace-normal break-words py-1 text-center text-[0.5rem] uppercase leading-snug tracking-[0.2em] text-[#9a8b72] transition-colors duration-300 [text-shadow:0_1px_12px_rgba(0,0,0,0.75)] hover:text-[#d4c4a8] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(212,175,55,0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:min-h-0 sm:py-0 md:justify-start md:text-left md:text-[0.52rem] md:tracking-[0.22em]";

/**
 * Centered gold nav (Shop · Routines · Home · Ingredients · About) + account icon
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
        onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
          event.preventDefault();
          const instant =
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          window.scrollTo({ top: 0, behavior: instant ? "auto" : "smooth" });
        },
      }
    : {};

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 hidden h-[min(11rem,32vh)] bg-[linear-gradient(180deg,rgba(2,3,6,0.82)_0%,rgba(2,3,6,0.42)_42%,rgba(2,3,6,0.12)_72%,transparent_100%)] backdrop-blur-[10px] [mask-image:linear-gradient(180deg,black_0%,black_55%,transparent_100%)] [-webkit-mask-image:linear-gradient(180deg,black_0%,black_55%,transparent_100%)] md:block"
      />

      {/* Mobile: centered link strip; account pinned top-right */}
      <div className="pointer-events-auto relative overflow-hidden border-b border-white/[0.07] bg-[rgba(2,3,6,0.78)] backdrop-blur-xl md:hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_100%_at_50%_0%,rgba(214,168,95,0.07),transparent_55%),linear-gradient(180deg,rgba(8,9,14,0.35)_0%,rgba(2,3,6,0.2)_100%)]"
        />
        <div className="absolute right-2 top-[max(0.35rem,env(safe-area-inset-top,0px))] z-10 flex items-center gap-2 sm:right-4">
          <CartIconLink count={cartCount} />
          <AccountIconLink />
        </div>
        <div
          className={`relative flex items-center px-4 pt-[max(0.65rem,env(safe-area-inset-top,0px))] transition-[padding] duration-300 ease-out motion-reduce:transition-none sm:px-6 ${
            scrolled ? "pb-2 sm:pb-2.5" : "pb-3.5 sm:pb-4"
          }`}
        >
          <nav
            className="mx-auto flex w-full max-w-[calc(100%-3.75rem)] flex-nowrap items-center justify-center gap-x-2.5 overflow-x-auto overscroll-x-contain text-center text-[0.5rem] uppercase tracking-[0.22em] text-[#d4c4a8] [-ms-overflow-style:none] [scrollbar-width:none] min-[400px]:gap-x-3.5 min-[400px]:text-[0.54rem] min-[400px]:tracking-[0.24em] sm:max-w-[calc(100%-3.25rem)] sm:gap-x-4 sm:text-[0.56rem] sm:tracking-[0.26em] [&::-webkit-scrollbar]:hidden"
            aria-label="Primary"
          >
            {NAV_LINKS.map(({ href, label }) => (
              <MobileNavLink
                key={href}
                href={href}
                label={label}
                active={isNavActive(href, pathname)}
                extraProps={href === "/" ? homeClickProps : undefined}
              />
            ))}
          </nav>
        </div>
        <div className="relative border-t border-white/[0.06] px-4 pb-2.5 pt-1 sm:px-6 sm:pb-3 sm:pt-1.5">
          <GuidedDiscoveryLink isOnHome={isOnHome} className={`${HELP_CHOOSING_LINK} w-full`} />
        </div>
      </div>

      {/* Desktop: true center nav + account only on the right */}
      <div className="mystic-nav-fade relative hidden md:block">
        <div
          className={`pointer-events-auto grid grid-cols-[1fr_auto_1fr] items-center px-4 pt-[max(1.25rem,env(safe-area-inset-top,0px))] transition-[padding] duration-300 ease-out motion-reduce:transition-none sm:px-8 sm:pt-[max(1.5rem,env(safe-area-inset-top,0px))] md:px-10 lg:px-14 ${
            scrolled ? "pb-3 sm:pb-4" : "pb-5 sm:pb-6"
          }`}
        >
          <div className="flex min-w-0 items-center justify-start self-center pr-2">
            <GuidedDiscoveryLink isOnHome={isOnHome} className={HELP_CHOOSING_LINK} />
          </div>
          <nav
            className="mx-auto flex w-max max-w-[100vw] flex-nowrap items-center justify-center gap-x-3 text-[0.58rem] uppercase tracking-[0.26em] text-[#d4c4a8] min-[400px]:gap-x-4 min-[400px]:text-[0.62rem] min-[400px]:tracking-[0.32em] sm:gap-x-6 sm:text-[0.64rem] sm:tracking-[0.34em] md:gap-x-8 md:tracking-[0.36em]"
            aria-label="Primary"
          >
            {NAV_LINKS.map(({ href, label }) => (
              <NavLink
                key={href}
                href={href}
                label={label}
                active={isNavActive(href, pathname)}
                extraProps={href === "/" ? homeClickProps : undefined}
              />
            ))}
          </nav>
          <div className="flex min-w-0 justify-end">
            <CartIconLink count={cartCount} />
            <AccountIconLink />
          </div>
        </div>

        <div
          aria-hidden
          className={`pointer-events-none mx-auto h-px w-[min(28rem,72vw)] max-w-[92%] bg-[linear-gradient(90deg,transparent_0%,rgba(214,168,95,0.05)_10%,rgba(214,168,95,0.38)_50%,rgba(214,168,95,0.05)_90%,transparent_100%)] shadow-[0_0_24px_rgba(214,168,95,0.07)] transition-[margin-top] duration-300 ease-out motion-reduce:transition-none md:w-[min(32rem,78vw)] ${
            scrolled ? "mt-3 sm:mt-4" : "mt-5 sm:mt-6"
          }`}
        />
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
      className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[rgba(214,168,95,0.22)] bg-[rgba(2,3,6,0.45)] text-[#e8dcc4] shadow-[0_4px_20px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-[border-color,background-color,transform,color] duration-200 hover:border-[rgba(214,168,95,0.38)] hover:bg-[rgba(8,9,14,0.55)] active:scale-[0.96] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(212,175,55,0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:h-9 sm:w-9"
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
  extraProps?: React.AnchorHTMLAttributes<HTMLAnchorElement>;
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

function MobileNavLink({
  href,
  label,
  active,
  extraProps,
}: {
  href: string;
  label: string;
  active: boolean;
  extraProps?: React.AnchorHTMLAttributes<HTMLAnchorElement>;
}) {
  return (
    <Link
      href={href}
      prefetch
      className={active ? MOBILE_NAV_LINK_ACTIVE : MOBILE_NAV_LINK_IDLE}
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
        className="group inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[rgba(214,168,95,0.22)] bg-[rgba(2,3,6,0.45)] px-0 text-[#e8dcc4] shadow-[0_4px_20px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-[border-color,background-color,transform,color] duration-200 hover:border-[rgba(214,168,95,0.38)] hover:bg-[rgba(8,9,14,0.55)] active:scale-[0.96] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(212,175,55,0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:h-9 sm:px-0 md:px-3.5"
      >
        <span className="sr-only">Account</span>
        <span className="inline-flex h-11 w-11 items-center justify-center sm:h-9 sm:w-9">
          <AccountGlyph />
        </span>
        <span className="hidden font-ui text-[0.58rem] font-semibold uppercase tracking-[0.26em] text-[#d6c4a8] md:inline">
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
