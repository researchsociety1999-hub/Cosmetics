"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LEFT = [
  { href: "/shop", label: "Shop" },
  { href: "/routines", label: "Routines" },
] as const;

const NAV_CENTER = { href: "/", label: "Home" } as const;

const NAV_RIGHT = [
  { href: "/ingredients", label: "Ingredients" },
  { href: "/about", label: "About" },
] as const;

/**
 * Floats over content: soft vertical fade into the hero, centered gold hairline
 * (not edge-to-edge), gentle fade-in on load.
 * Below `md`: Home centered between pairs; account pinned top-right.
 */
export function Navbar() {
  const pathname = usePathname();
  const isOnHome = pathname === "/";

  const homeClickProps = isOnHome
    ? {
        onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
          event.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        },
      }
    : {};

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40">
      {/* Veil: desktop only — mobile uses a solid bar so the hero stays unobstructed */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 hidden h-[min(11rem,32vh)] bg-[linear-gradient(180deg,rgba(2,3,6,0.82)_0%,rgba(2,3,6,0.42)_42%,rgba(2,3,6,0.12)_72%,transparent_100%)] backdrop-blur-[10px] [mask-image:linear-gradient(180deg,black_0%,black_55%,transparent_100%)] [-webkit-mask-image:linear-gradient(180deg,black_0%,black_55%,transparent_100%)] md:block"
      />

      {/* Mobile: Home centered; account floats */}
      <div className="pointer-events-auto relative overflow-hidden border-b border-white/[0.07] bg-[rgba(2,3,6,0.78)] backdrop-blur-xl md:hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_100%_at_50%_0%,rgba(214,168,95,0.07),transparent_55%),linear-gradient(180deg,rgba(8,9,14,0.35)_0%,rgba(2,3,6,0.2)_100%)]"
        />
        <div className="absolute right-[max(0.5rem,env(safe-area-inset-right,0px))] top-[max(0.35rem,env(safe-area-inset-top,0px))] z-10 sm:right-4">
          <AccountIconLink />
        </div>
        <div className="relative flex items-center px-4 pb-3.5 pt-[max(0.65rem,env(safe-area-inset-top,0px))] pr-[max(3.75rem,calc(2.75rem+env(safe-area-inset-right,0px)))] sm:px-6 sm:pb-4">
          <nav
            className="flex w-full min-w-0 flex-nowrap items-center gap-x-1.5 text-[0.5rem] uppercase tracking-[0.2em] text-[#d4c4a8] min-[360px]:gap-x-2 min-[360px]:text-[0.52rem] min-[360px]:tracking-[0.22em] min-[400px]:gap-x-2.5 min-[400px]:text-[0.56rem] min-[400px]:tracking-[0.24em] sm:gap-x-3 sm:text-[0.58rem]"
            aria-label="Primary"
          >
            <div className="flex min-w-0 flex-1 flex-nowrap items-center justify-end gap-x-1.5 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] min-[360px]:gap-x-2 min-[400px]:gap-x-2.5 sm:gap-x-3 [&::-webkit-scrollbar]:hidden">
              {NAV_LEFT.map(({ href, label }) => (
                <MobileNavLink key={href} href={href} label={label} />
              ))}
            </div>
            <MobileNavLink
              href={NAV_CENTER.href}
              label={NAV_CENTER.label}
              extraProps={homeClickProps}
              className="shrink-0 px-0.5"
            />
            <div className="flex min-w-0 flex-1 flex-nowrap items-center justify-start gap-x-1.5 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] min-[360px]:gap-x-2 min-[400px]:gap-x-2.5 sm:gap-x-3 [&::-webkit-scrollbar]:hidden">
              {NAV_RIGHT.map(({ href, label }) => (
                <MobileNavLink key={href} href={href} label={label} />
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Desktop: Home centered; account at end of row */}
      <div className="mystic-nav-fade relative hidden min-w-0 px-4 pb-5 pt-[max(1.25rem,env(safe-area-inset-top,0px))] sm:px-8 sm:pb-6 sm:pt-[max(1.5rem,env(safe-area-inset-top,0px))] md:block md:px-10 lg:px-14">
        <div className="pointer-events-auto relative -mx-1 max-w-full min-w-0 px-1 sm:mx-0 sm:px-0">
          <div className="absolute right-0 top-1/2 z-10 -translate-y-1/2 sm:right-0 md:right-0">
            <AccountIconLink />
          </div>
          <nav
            className="mx-auto flex min-w-0 max-w-full flex-nowrap items-center gap-x-2 pr-12 text-[0.58rem] uppercase tracking-[0.26em] text-[#d4c4a8] min-[400px]:gap-x-3 min-[400px]:text-[0.62rem] min-[400px]:tracking-[0.3em] sm:gap-x-4 sm:text-[0.64rem] sm:tracking-[0.32em] md:gap-x-6 md:pr-14 md:tracking-[0.34em] lg:gap-x-8 lg:tracking-[0.36em]"
            aria-label="Primary"
          >
            <div className="flex min-w-0 flex-1 flex-nowrap items-center justify-end gap-x-3 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] min-[400px]:gap-x-4 sm:gap-x-6 md:gap-x-8 [&::-webkit-scrollbar]:hidden">
              {NAV_LEFT.map(({ href, label }) => (
                <NavLink key={href} href={href} label={label} />
              ))}
            </div>
            <NavLink
              href={NAV_CENTER.href}
              label={NAV_CENTER.label}
              extraProps={homeClickProps}
              className="shrink-0 px-1"
            />
            <div className="flex min-w-0 flex-1 flex-nowrap items-center justify-start gap-x-3 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] min-[400px]:gap-x-4 sm:gap-x-6 md:gap-x-8 [&::-webkit-scrollbar]:hidden">
              {NAV_RIGHT.map(({ href, label }) => (
                <NavLink key={href} href={href} label={label} />
              ))}
            </div>
          </nav>
        </div>

        <div
          aria-hidden
          className="pointer-events-none mx-auto mt-5 h-px w-[min(28rem,72vw)] max-w-[92%] bg-[linear-gradient(90deg,transparent_0%,rgba(214,168,95,0.05)_10%,rgba(214,168,95,0.38)_50%,rgba(214,168,95,0.05)_90%,transparent_100%)] shadow-[0_0_24px_rgba(214,168,95,0.07)] sm:mt-6 md:w-[min(32rem,78vw)]"
        />
      </div>
    </header>
  );
}

const navLinkClass =
  "inline-flex min-h-[44px] shrink-0 items-center whitespace-nowrap py-1 text-[#e8dcc4] [text-shadow:0_1px_14px_rgba(0,0,0,0.85)] transition duration-300 hover:text-[#f5ebd4] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(212,175,55,0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:min-h-0 sm:py-0";

const mobileNavLinkClass =
  "inline-flex shrink-0 items-center whitespace-nowrap py-2 text-[#e8dcc4] [text-shadow:0_1px_14px_rgba(0,0,0,0.85)] transition duration-300 hover:text-[#f5ebd4] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(212,175,55,0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

function NavLink({
  href,
  label,
  extraProps,
  className,
}: {
  href: string;
  label: string;
  extraProps?: React.AnchorHTMLAttributes<HTMLAnchorElement>;
  className?: string;
}) {
  return (
    <Link
      href={href}
      prefetch
      className={className ? `${navLinkClass} ${className}` : navLinkClass}
      {...extraProps}
    >
      {label}
    </Link>
  );
}

function MobileNavLink({
  href,
  label,
  extraProps,
  className,
}: {
  href: string;
  label: string;
  extraProps?: React.AnchorHTMLAttributes<HTMLAnchorElement>;
  className?: string;
}) {
  return (
    <Link
      href={href}
      prefetch
      className={className ? `${mobileNavLinkClass} ${className}` : mobileNavLinkClass}
      {...extraProps}
    >
      {label}
    </Link>
  );
}

function AccountIconLink() {
  return (
    <Link
      href="/account"
      prefetch
      aria-label="Account"
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[rgba(214,168,95,0.22)] bg-[rgba(2,3,6,0.45)] text-[#e8dcc4] shadow-[0_4px_20px_rgba(0,0,0,0.35)] backdrop-blur-sm transition hover:border-[rgba(214,168,95,0.38)] hover:bg-[rgba(8,9,14,0.55)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(212,175,55,0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:h-9 sm:w-9"
    >
      <span className="sr-only">Account</span>
      <AccountGlyph />
    </Link>
  );
}

function AccountGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
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
