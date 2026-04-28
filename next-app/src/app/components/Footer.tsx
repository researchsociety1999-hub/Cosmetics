import Link from "next/link";
import type { ReactNode } from "react";
import { getFooterSocialProfiles } from "../lib/siteConfig";
import { socialIconForId } from "./FooterSocialIcons";
import { NewsletterForm } from "./NewsletterForm";

const FOOTER_CENTER_LINK_CLASS =
  "inline-flex py-2 text-sm uppercase tracking-[0.22em] text-[#c5b79f] transition-colors duration-200 hover:text-[#f0d19a] md:text-[0.95rem]";

const FOOTER_SECTION_LABEL_CLASS =
  "mb-4 text-[0.62rem] uppercase tracking-[0.26em] text-[#7a7265]";

export function Footer() {
  const footerSocialProfiles = getFooterSocialProfiles();

  return (
    <footer className="mystique-material mystique-material--footer relative mt-24 overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,0.88))]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_28%,rgba(255,154,80,0.1),transparent_20%),radial-gradient(circle_at_82%_72%,rgba(212,175,55,0.07),transparent_26%),linear-gradient(180deg,#000000_8%,#030204_55%,#000000_100%)]" />
      <div className="w-full px-4 pb-10 pt-14 md:px-6 md:pb-12 md:pt-20 lg:px-10 xl:px-14">
        <div className="relative border-t border-[rgba(214,168,95,0.12)] px-0 py-10 md:py-12">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(214,168,95,0.3),transparent)]" />

          <div className="mx-auto grid max-w-3xl gap-10 py-6 md:grid-cols-3 md:gap-10 md:py-10">
            <nav aria-label="Help" className="flex flex-col items-center text-center md:items-start md:text-left">
              <p className={FOOTER_SECTION_LABEL_CLASS}>Help</p>
              <div className="flex flex-col gap-5 md:gap-6">
                <Link href="/faq#faq-top" className={FOOTER_CENTER_LINK_CLASS}>
                  FAQ
                </Link>
                <Link
                  href="/faq#shipping-and-returns"
                  className={FOOTER_CENTER_LINK_CLASS}
                >
                  Shipping &amp; returns
                </Link>
                <Link href="/contact" className={FOOTER_CENTER_LINK_CLASS}>
                  Contact
                </Link>
              </div>
            </nav>
            <nav aria-label="Discover" className="flex flex-col items-center text-center md:items-start md:text-left">
              <p className={FOOTER_SECTION_LABEL_CLASS}>Discover</p>
              <div className="flex flex-col gap-5 md:gap-6">
                <Link href="/search" className={FOOTER_CENTER_LINK_CLASS}>
                  Search
                </Link>
                <Link href="/journal" className={FOOTER_CENTER_LINK_CLASS}>
                  Journal
                </Link>
                <Link href="/media" className={FOOTER_CENTER_LINK_CLASS}>
                  Media
                </Link>
              </div>
            </nav>
            <nav aria-label="Company" className="flex flex-col items-center text-center md:items-start md:text-left">
              <p className={FOOTER_SECTION_LABEL_CLASS}>Company</p>
              <div className="flex flex-col gap-5 md:gap-6">
                <Link href="/stockists" className={FOOTER_CENTER_LINK_CLASS}>
                  Stockists
                </Link>
              </div>
            </nav>
          </div>

          <div className="mx-auto mt-2 max-w-3xl border-t border-[rgba(214,168,95,0.06)] pt-10">
            <div className="flex flex-col items-center text-center md:items-start md:text-left">
              <p className={FOOTER_SECTION_LABEL_CLASS}>Join the list</p>
              <NewsletterForm />
            </div>
          </div>

          <div className="relative mx-auto mt-10 max-w-3xl rounded-[22px] border border-[rgba(214,168,95,0.14)] bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.012))] px-6 py-7 text-center shadow-[0_22px_56px_rgba(0,0,0,0.4)] backdrop-blur-sm md:px-8 md:py-8">
            <div className="flex flex-col items-center gap-6">
              <div className="space-y-2">
                <p className="text-[0.62rem] uppercase tracking-[0.28em] text-[#7a7265]">
                  Social
                </p>
                <p className="text-sm uppercase tracking-[0.24em] text-[#d6c4a8]">
                  Follow Mystique
                </p>
              </div>
              <ul className="flex w-full min-w-0 flex-wrap justify-center gap-x-8 gap-y-4 md:gap-x-10">
                {footerSocialProfiles.map((profile) => {
                  const rowClass =
                    "group inline-flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(214,168,95,0.18)] bg-[rgba(2,3,6,0.4)] text-[#d6a85f] shadow-[0_10px_28px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-[border-color,background-color,transform,color,box-shadow] duration-200 hover:border-[rgba(214,168,95,0.34)] hover:bg-[rgba(8,9,14,0.52)] hover:text-[#e8c56e] hover:shadow-[0_0_28px_rgba(214,168,95,0.12),0_12px_34px_rgba(0,0,0,0.4)] active:scale-[0.96] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(212,175,55,0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070d]";
                  if (profile.href) {
                    return (
                      <li key={profile.id}>
                        <a
                          href={profile.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Mystique on ${profile.label}`}
                          className={rowClass}
                        >
                          {socialIconForId(profile.id)}
                          <span className="sr-only">{profile.label}</span>
                        </a>
                      </li>
                    );
                  }
                  return (
                    <li key={profile.id}>
                      <span
                        className={`${rowClass} cursor-default opacity-65`}
                        title="Link not available yet"
                      >
                        {socialIconForId(profile.id)}
                        <span className="sr-only">{profile.label}</span>
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
      className="inline-flex px-2 py-2 text-center text-xs uppercase tracking-[0.18em] text-[#b8ab95] transition-colors duration-200 hover:text-[#f0d19a]"
    >
      {children}
    </Link>
  );
}
