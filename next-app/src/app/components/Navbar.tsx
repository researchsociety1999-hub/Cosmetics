import Link from "next/link";

/**
 * Minimal luxury bar: transparent overlay, four uppercase links only (no logo,
 * no account/search/cart). Shop + Routines left; Ingredients + About right.
 */
export function Navbar() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40">
      <div className="pointer-events-auto w-full px-5 pt-6 sm:px-8 md:px-10 md:pt-7 lg:px-14 lg:pt-8">
        <nav
          className="flex items-center justify-between gap-6 text-[0.62rem] uppercase tracking-[0.32em] text-[#d4c4a8] sm:text-[0.64rem] sm:tracking-[0.34em] md:tracking-[0.36em]"
          aria-label="Primary"
        >
          <div className="flex flex-1 flex-wrap items-center justify-start gap-x-6 gap-y-2 sm:gap-x-8 md:gap-x-10 lg:gap-x-12">
            <NavLink href="/shop" label="Shop" />
            <NavLink href="/routines" label="Routines" />
          </div>
          <div className="flex flex-1 flex-wrap items-center justify-end gap-x-6 gap-y-2 sm:gap-x-8 md:gap-x-10 lg:gap-x-12">
            <NavLink href="/ingredients" label="Ingredients" />
            <NavLink href="/about" label="About" />
          </div>
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="whitespace-nowrap text-[#e8dcc4] transition duration-300 hover:text-[#f5ebd4] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(212,175,55,0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
    >
      {label}
    </Link>
  );
}
