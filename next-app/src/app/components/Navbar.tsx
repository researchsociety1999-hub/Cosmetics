"use client";

import Link from "next/link";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/routines", label: "Routines" },
  { href: "/", label: "Home" },
  { href: "/ingredients", label: "Ingredients" },
  { href: "/about", label: "About" },
] as const;

/**
 * Floats over content: soft vertical fade into the hero, centered gold hairline
 * (not edge-to-edge), gentle fade-in on load.
 * Below `md`: centered links; account pinned top-right.
 */
export function Navbar() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40">
      {/* Veil: desktop only — mobile uses a solid bar so the hero stays unobstructed */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 hidden h-[min(11rem,32vh)] bg-[linear-gradient(180deg,rgba(2,3,6,0.82)_0%,rgba(2,3,6,0.42)_42%,rgba(2,3,6,0.12)_72%,transparent_100%)] backdrop-blur-[10px] [mask-image:linear-gradient(180deg,black_0%,black_55%,transparent_100%)] [-webkit-mask-image:linear-gradient(180deg,black_0%,black_55%,transparent_100%)] md:block"
      />

      {/* Mobile: centered nav strip; account floats */}
      <div className="pointer-events-auto relative overflow-hidden border-b border-white/[0.07] bg-[rgba(2,3,6,0.78)] backdrop-blur-xl md:hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_100%_at_50%_0%,rgba(214,168,95,0.07),transparent_55%),linear-gradient(180deg,rgba(8,9,14,0.35)_0%,rgba(2,3,6,0.2)_100%)]"
        />
        <div className="absolute right-2 top-[max(0.35rem,env(safe-area-inset-top,0px))] z-10 sm:right-4">
          <AccountIconLink />
        </div>
        <div className="relative flex flex-col items-center px-4 pb-3.5 pt-[max(0.65rem,env(safe-area-inset-top,0px))] sm:px-6 sm:pb-4">
          <nav
            className="flex max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center text-[0.52rem] uppercase tracking-[0.24em] text-[#d4c4a8] min-[400px]:gap-x-4 min-[400px]:text-[0.56rem] min-[400px]:tracking-[0.26em] sm:gap-x-5 sm:text-[0.58rem]"
            aria-label="Primary"
          >
            {NAV_LINKS.map(({ href, label }) => (
              <MobileNavLink key={href} href={href} label={label} />
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop: centered strip + hairline */}
      <div className="mystic-nav-fade relative hidden px-4 pb-5 pt-[max(1.25rem,env(safe-area-inset-top,0px))] sm:px-8 sm:pb-6 sm:pt-[max(1.5rem,env(safe-area-inset-top,0px))] md:block md:px-10 lg:px-14">
        <div className="pointer-events-auto -mx-1 overflow-x-auto overflow-y-hidden overscroll-x-contain px-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:overflow-x-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
          <nav
            className="mx-auto flex w-max max-w-none flex-nowrap items-center justify-center gap-x-3 text-[0.58rem] uppercase tracking-[0.26em] text-[#d4c4a8] min-[400px]:gap-x-4 min-[400px]:text-[0.62rem] min-[400px]:tracking-[0.32em] sm:min-w-0 sm:max-w-full sm:gap-x-6 sm:text-[0.64rem] sm:tracking-[0.34em] md:gap-x-8 md:tracking-[0.36em]"
            aria-label="Primary"
          >
            {NAV_LINKS.map(({ href, label }) => (
              <NavLink key={href} href={href} label={label} />
            ))}
            <AccountIconLink />
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

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      prefetch
      className="inline-flex min-h-[44px] shrink-0 items-center whitespace-nowrap py-1 text-[#e8dcc4] [text-shadow:0_1px_14px_rgba(0,0,0,0.85)] transition duration-300 hover:text-[#f5ebd4] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(212,175,55,0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:min-h-0 sm:py-0"
    >
      {label}
    </Link>
  );
}

/** Tighter inline strip for the mobile header row (scroll container). */
function MobileNavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      prefetch
      className="inline-flex shrink-0 items-center whitespace-nowrap py-2 text-[#e8dcc4] [text-shadow:0_1px_14px_rgba(0,0,0,0.85)] transition duration-300 hover:text-[#f5ebd4] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(212,175,55,0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
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
