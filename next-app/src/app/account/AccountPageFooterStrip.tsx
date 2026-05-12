import Link from "next/link";

const linkClass =
  "text-xs uppercase tracking-[0.2em] text-[#b8ab95] transition hover:text-[#f0d19a] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(212,175,55,0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

/**
 * In-page policy strip for account views (mirrors common footer links, scoped to account).
 */
export function AccountPageFooterStrip() {
  return (
    <footer
      className="mt-16 border-t border-[rgba(214,168,95,0.14)] pb-6 pt-10"
      aria-label="Policies and help"
    >
      <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[#d6a85f]">
        Help &amp; policies
      </p>
      <nav
        className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-2"
        aria-label="Account policies"
      >
        <Link href="/faq" className={linkClass}>
          Shipping &amp; returns
        </Link>
        <Link href="/terms" className={linkClass}>
          Terms of service
        </Link>
        <Link href="/privacy" className={linkClass}>
          Privacy policy
        </Link>
      </nav>
      <p className="mt-6 max-w-2xl text-xs leading-relaxed text-[#8f8576]">
        Return eligibility, timeframes, and shipping rates are covered in shipping
        &amp; returns above. FAQ and Contact live in the site footer.
      </p>
    </footer>
  );
}
