import Link from "next/link";
import type { ReactNode } from "react";
import { getFooterSocialProfiles } from "../lib/siteConfig";
import { socialIconForId } from "./FooterSocialIcons";

const FOOTER_CENTER_LINK_CLASS =
  "text-sm uppercase tracking-[0.22em] text-[#c5b79f] transition hover:text-[#f0d19a] md:text-[0.95rem]";

export function Footer() {
  const footerSocialProfiles = getFooterSocialProfiles();

  return (
    <footer className="relative mt-24 overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,0.88))]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_28%,rgba(255,154,80,0.1),transparent_20%),radial-gradient(circle_at_82%_72%,rgba(212,175,55,0.07),transparent_26%),linear-gradient(180deg,#000000_8%,#030204_55%,#000000_100%)]" />
      <div className="w-full px-4 pb-10 pt-14 md:px-6 md:pb-12 md:pt-20 lg:px-10 xl:px-14">
        <div className="relative border-t border-[rgba(214,168,95,0.12)] px-0 py-10 md:py-12">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(214,168,95,0.3),transparent)]" />

          <nav
            aria-label="Footer"
            className="mx-auto flex max-w-md flex-col items-center justify-center gap-6 py-6 md:gap-7 md:py-10"
          >
            <Link href="/faq" className={FOOTER_CENTER_LINK_CLASS}>
              FAQ
            </Link>
            <Link href="/contact" className={FOOTER_CENTER_LINK_CLASS}>
              Contact
            </Link>
            <Link href="/journal" className={FOOTER_CENTER_LINK_CLASS}>
              Journal
            </Link>
            <Link href="/faq" className={FOOTER_CENTER_LINK_CLASS}>
              Shipping &amp; Returns
            </Link>
          </nav>

          <div className="relative mx-auto mt-10 max-w-3xl rounded-[22px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)] px-5 py-5 text-center shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-sm md:px-6 md:py-6">
            <div className="flex flex-col items-center gap-5">
              <p className="text-sm uppercase tracking-[0.2em] text-[#b8ab95]">
                Follow us
              </p>
              <ul className="flex w-full min-w-0 flex-wrap justify-center gap-x-5 gap-y-3">
                {footerSocialProfiles.map((profile) => {
                  const rowClass =
                    "inline-flex items-center gap-2 text-sm text-[#f5eee3] transition hover:text-[#f0d19a]";
                  const iconClass = "shrink-0 text-[#d6a85f]";
                  if (profile.href) {
                    return (
                      <li key={profile.id}>
                        <a
                          href={profile.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={rowClass}
                        >
                          <span className={iconClass}>{socialIconForId(profile.id)}</span>
                          {profile.label}
                        </a>
                      </li>
                    );
                  }
                  return (
                    <li key={profile.id}>
                      <span
                        className={`${rowClass} cursor-default opacity-60 hover:text-[#f5eee3]`}
                        title="Profile URL not set yet — add it in siteConfig.ts"
                      >
                        <span className={iconClass}>{socialIconForId(profile.id)}</span>
                        {profile.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="relative mt-10 flex flex-col items-center gap-4 border-t border-[rgba(148,163,184,0.14)] pt-6 text-center text-xs text-[#8b8b99]">
            <p>Copyright {new Date().getFullYear()} Mystique. All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/terms">Terms</FooterLink>
              <FooterLink href="/cookies">Cookies</FooterLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-center text-xs uppercase tracking-[0.18em] text-[#b8ab95] transition hover:text-[#f0d19a]"
    >
      {children}
    </Link>
  );
}
