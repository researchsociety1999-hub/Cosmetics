import Link from "next/link";

/**
 * Floats over content: soft vertical fade into the hero, centered gold hairline
 * (not edge-to-edge), gentle fade-in on load.
 */
export function Navbar() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40">
      {/* Veil: readable under links, dissolves downward into hero — no corner-to-corner bar */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(11rem,32vh)] bg-[linear-gradient(180deg,rgba(2,3,6,0.82)_0%,rgba(2,3,6,0.42)_42%,rgba(2,3,6,0.12)_72%,transparent_100%)] backdrop-blur-[10px] [mask-image:linear-gradient(180deg,black_0%,black_55%,transparent_100%)] [-webkit-mask-image:linear-gradient(180deg,black_0%,black_55%,transparent_100%)]"
      />

      <div className="mystic-nav-fade relative px-5 pb-5 pt-6 sm:px-8 sm:pb-6 sm:pt-7 md:px-10 lg:px-14">
        <nav
          className="pointer-events-auto flex items-center justify-center gap-0 text-[0.62rem] uppercase tracking-[0.32em] text-[#d4c4a8] sm:text-[0.64rem] sm:tracking-[0.34em] md:tracking-[0.36em]"
          aria-label="Primary"
        >
          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-x-5 gap-y-2 pr-4 sm:gap-x-7 sm:pr-6 md:gap-x-9 md:pr-8 lg:gap-x-11 lg:pr-10">
            <NavLink href="/shop" label="Shop" />
            <NavLink href="/routines" label="Routines" />
          </div>
          <div className="flex shrink-0 items-center justify-center px-2 sm:px-3">
            <NavLink href="/" label="Home" />
          </div>
          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-start gap-x-4 gap-y-2 pl-4 sm:gap-x-6 sm:pl-6 md:gap-x-8 md:pl-8 lg:gap-x-10 lg:pl-10">
            <NavLink href="/ingredients" label="Ingredients" />
            <NavLink href="/about" label="About" />
            <AccountIconLink />
          </div>
        </nav>

        {/* Middle-only accent: strongest at center, faded to invisible at sides */}
        <div
          aria-hidden
          className="pointer-events-none mx-auto mt-5 h-px w-[min(22rem,56vw)] max-w-[88%] bg-[linear-gradient(90deg,transparent_0%,rgba(214,168,95,0.06)_12%,rgba(214,168,95,0.42)_50%,rgba(214,168,95,0.06)_88%,transparent_100%)] shadow-[0_0_20px_rgba(214,168,95,0.08)] sm:mt-6"
        />
      </div>
    </header>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="whitespace-nowrap text-[#e8dcc4] [text-shadow:0_1px_14px_rgba(0,0,0,0.85)] transition duration-300 hover:text-[#f5ebd4] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(212,175,55,0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
    >
      {label}
    </Link>
  );
}

function AccountIconLink() {
  return (
    <Link
      href="/account"
      aria-label="Account"
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[rgba(214,168,95,0.22)] bg-[rgba(2,3,6,0.45)] text-[#e8dcc4] shadow-[0_4px_20px_rgba(0,0,0,0.35)] backdrop-blur-sm transition hover:border-[rgba(214,168,95,0.38)] hover:bg-[rgba(8,9,14,0.55)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(212,175,55,0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
    >
      <span className="sr-only">Account</span>
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <circle
          cx="12"
          cy="9"
          r="3.25"
          stroke="currentColor"
          strokeWidth="1.35"
          strokeOpacity="0.9"
        />
        <path
          d="M6.5 19.25c0-3.1 2.35-5 5.5-5s5.5 1.9 5.5 5"
          stroke="currentColor"
          strokeWidth="1.35"
          strokeLinecap="round"
          strokeOpacity="0.9"
        />
      </svg>
    </Link>
  );
}
