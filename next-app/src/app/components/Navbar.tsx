import Image from "next/image";
import Link from "next/link";
import { HOME_BRAND_IMAGES } from "../lib/homeBrandImages";

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

      <div className="mystic-nav-fade relative px-4 pb-5 pt-[max(1.25rem,env(safe-area-inset-top,0px))] sm:px-8 sm:pb-6 sm:pt-[max(1.5rem,env(safe-area-inset-top,0px))] md:px-10 lg:px-14">
        {/* Horizontal scroll on very narrow widths so links never clip; hidden scrollbar keeps the bar calm */}
        <div className="pointer-events-auto -mx-1 overflow-x-auto overflow-y-hidden overscroll-x-contain px-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:overflow-x-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
          {/*
            Mobile: single horizontal strip (scroll if needed). Side clusters use flex-nowrap
            so the account control never drops under Ingredients / About.

            sm+: CSS grid [1fr | auto | 1fr] keeps the brand mark optically centered while
            left/right columns take equal remaining width (symmetrical luxury bar).
          */}
          <nav
            className="mx-auto flex w-max max-w-none flex-nowrap items-center gap-0 text-[0.58rem] uppercase tracking-[0.26em] text-[#d4c4a8] min-[400px]:text-[0.62rem] min-[400px]:tracking-[0.32em] sm:grid sm:w-full sm:min-w-0 sm:max-w-full sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-x-0 sm:text-[0.64rem] sm:tracking-[0.34em] md:tracking-[0.36em]"
            aria-label="Primary"
          >
            <div className="flex w-max flex-none flex-nowrap items-center justify-end gap-x-3 pr-3 min-[400px]:gap-x-5 min-[400px]:pr-4 sm:w-full sm:min-w-0 sm:gap-x-7 sm:pr-6 md:gap-x-9 md:pr-8 lg:gap-x-11 lg:pr-10">
              <NavLink href="/shop" label="Shop" />
              <NavLink href="/routines" label="Routines" />
            </div>
            <div className="flex w-max flex-none shrink-0 items-center justify-center px-2 sm:w-auto sm:justify-self-center sm:px-6 md:px-8">
              <Link
                href="/"
                prefetch
                aria-label="Mystique home"
                className="inline-flex min-h-[48px] min-w-[48px] items-center justify-center rounded-[20px] px-1.5 outline-none transition duration-300 hover:opacity-[0.94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(212,175,55,0.42)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:min-h-0 sm:min-w-0 sm:px-2"
              >
                <Image
                  src={HOME_BRAND_IMAGES.navCenterMark}
                  alt=""
                  width={520}
                  height={140}
                  priority
                  sizes="(max-width:640px) 220px, (max-width:1024px) 280px, 360px"
                  className="h-10 w-auto max-h-10 max-w-[12.5rem] object-contain object-center mix-blend-screen sm:h-12 sm:max-h-12 sm:max-w-[16.5rem] md:h-[3.4rem] md:max-w-[18.5rem] lg:h-[3.75rem] lg:max-w-[20.5rem] [filter:drop-shadow(0_4px_28px_rgba(0,0,0,0.7))_drop-shadow(0_0_32px_rgba(212,175,55,0.14))]"
                />
              </Link>
            </div>
            <div className="flex w-max flex-none flex-nowrap items-center justify-start gap-x-3 pl-3 min-[400px]:gap-x-4 min-[400px]:pl-4 sm:w-full sm:min-w-0 sm:gap-x-6 sm:pl-6 md:gap-x-8 md:pl-8 lg:gap-x-10 lg:pl-10">
              <NavLink href="/ingredients" label="Ingredients" />
              <NavLink href="/about" label="About" />
              <AccountIconLink />
            </div>
          </nav>
        </div>

        {/* Middle-only accent: strongest at center, faded to invisible at sides */}
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

function AccountIconLink() {
  return (
    <Link
      href="/account"
      prefetch
      aria-label="Account"
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[rgba(214,168,95,0.22)] bg-[rgba(2,3,6,0.45)] text-[#e8dcc4] shadow-[0_4px_20px_rgba(0,0,0,0.35)] backdrop-blur-sm transition hover:border-[rgba(214,168,95,0.38)] hover:bg-[rgba(8,9,14,0.55)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(212,175,55,0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:h-9 sm:w-9"
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
