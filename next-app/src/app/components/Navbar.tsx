"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useState } from "react";

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
 * Below `md`: compact bar + slide-over menu so links never wrap or overlap the account control.
 */
export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const panelId = useId();

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, closeMenu]);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40">
      {/* Veil: desktop only — mobile uses a solid bar so the hero stays unobstructed */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 hidden h-[min(11rem,32vh)] bg-[linear-gradient(180deg,rgba(2,3,6,0.82)_0%,rgba(2,3,6,0.42)_42%,rgba(2,3,6,0.12)_72%,transparent_100%)] backdrop-blur-[10px] [mask-image:linear-gradient(180deg,black_0%,black_55%,transparent_100%)] [-webkit-mask-image:linear-gradient(180deg,black_0%,black_55%,transparent_100%)] md:block"
      />

      {/* Mobile: one row — menu / wordmark / symmetric spacer (no cramped link strip) */}
      <div className="pointer-events-auto relative border-b border-white/[0.06] bg-[rgba(2,3,6,0.92)] backdrop-blur-md md:hidden">
        <div className="grid grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center gap-2 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))]">
          <button
            type="button"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[rgba(214,168,95,0.22)] bg-[rgba(2,3,6,0.45)] text-[#e8dcc4] shadow-[0_4px_20px_rgba(0,0,0,0.35)] backdrop-blur-sm transition hover:border-[rgba(214,168,95,0.38)] hover:bg-[rgba(8,9,14,0.55)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(212,175,55,0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            aria-expanded={menuOpen}
            aria-controls={panelId}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <IconClose /> : <IconMenu />}
          </button>
          <Link
            href="/"
            prefetch
            className="justify-self-center truncate text-center text-[0.62rem] uppercase tracking-[0.32em] text-[#e8dcc4] [text-shadow:0_1px_14px_rgba(0,0,0,0.85)] transition hover:text-[#f5ebd4] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(212,175,55,0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          >
            Mystique
          </Link>
          <span aria-hidden className="h-11 w-11 justify-self-end" />
        </div>
      </div>

      {/* Desktop: original centered strip + hairline */}
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

      {/* Mobile slide-over */}
      {menuOpen ? (
        <div className="pointer-events-auto fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-labelledby={`${panelId}-title`}>
          <button
            type="button"
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
            aria-label="Close menu"
            onClick={closeMenu}
          />
          <div
            id={panelId}
            className="absolute right-0 top-0 flex h-full w-[min(20rem,calc(100vw-2.5rem))] flex-col border-l border-white/10 bg-[#0a0a0c] shadow-[0_0_48px_rgba(0,0,0,0.65)]"
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-4 pt-[max(1rem,env(safe-area-inset-top,0px))]">
              <p id={`${panelId}-title`} className="text-[0.65rem] uppercase tracking-[0.28em] text-[#d4c4a8]">
                Menu
              </p>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(214,168,95,0.22)] text-[#e8dcc4] transition hover:border-[rgba(214,168,95,0.38)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(212,175,55,0.45)]"
                aria-label="Close menu"
                onClick={closeMenu}
              >
                <IconClose />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4" aria-label="Primary">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  prefetch
                  className="rounded-xl px-3 py-3 text-[0.68rem] uppercase tracking-[0.26em] text-[#e8dcc4] transition hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(212,175,55,0.45)]"
                  onClick={closeMenu}
                >
                  {label}
                </Link>
              ))}
              <Link
                href="/account"
                prefetch
                className="mt-2 flex items-center gap-3 rounded-xl border border-[rgba(214,168,95,0.22)] bg-[rgba(2,3,6,0.45)] px-3 py-3 text-[0.68rem] uppercase tracking-[0.22em] text-[#e8dcc4] transition hover:border-[rgba(214,168,95,0.38)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(212,175,55,0.45)]"
                onClick={closeMenu}
              >
                <AccountGlyph className="shrink-0" />
                Account
              </Link>
            </nav>
          </div>
        </div>
      ) : null}
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

function IconMenu() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M5 7h14M5 12h14M5 17h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M7 7l10 10M17 7L7 17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
