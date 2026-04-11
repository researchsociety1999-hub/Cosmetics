import Link from "next/link";
import type { ReactNode } from "react";
import { getConfiguredSocialLinks } from "../lib/siteConfig";
import { BrandLogo } from "./BrandLogo";

export function Footer() {
  const socialLinks = getConfiguredSocialLinks();

  return (
    <footer className="relative mt-24 overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(5,6,10,0),rgba(5,6,10,0.78))]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(255,170,70,0.08),transparent_18%),radial-gradient(circle_at_82%_74%,rgba(214,168,95,0.05),transparent_24%),linear-gradient(180deg,#05060a_12%,#040509_100%)]" />
      <div className="w-full px-4 pb-10 pt-14 md:px-6 md:pb-12 md:pt-20 lg:px-10 xl:px-14">
        <div className="relative border-t border-[rgba(214,168,95,0.12)] px-0 py-10 md:py-12">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(214,168,95,0.3),transparent)]" />
          <div className="relative grid gap-10 md:grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr] md:gap-8">
            <div className="space-y-5 md:pr-8">
              <div className="max-w-[min(100%,360px)]">
                <BrandLogo />
              </div>
              <p className="inline-flex rounded-full border border-[rgba(214,168,95,0.14)] bg-[rgba(255,255,255,0.03)] px-4 py-2 text-[0.66rem] uppercase tracking-[0.28em] text-[#cdb58d]">
                California · luxury skincare
              </p>
              <p className="max-w-sm text-sm leading-relaxed text-[#b8ab95]">
                Mystique is a California-rooted house of ritual skincare—formulas built for
                calm, luminous skin, layered textures, and evenings that feel quietly
                elevated.
              </p>
            </div>

            <FooterColumn title="Shop">
              <FooterLink href="/shop">All Products</FooterLink>
              <FooterLink href="/shop?search=serum">Serums</FooterLink>
              <FooterLink href="/shop?search=cleanser">Cleansers</FooterLink>
              <FooterLink href="/shop?search=moisturizer">Moisturizers</FooterLink>
            </FooterColumn>

            <FooterColumn title="Brand">
              <FooterLink href="/about">About</FooterLink>
              <FooterLink href="/ingredients">Ingredients</FooterLink>
              <FooterLink href="/journal">Journal</FooterLink>
              <FooterLink href="/press">Press</FooterLink>
            </FooterColumn>

            <FooterColumn title="Support">
              <FooterLink href="/faq">FAQ</FooterLink>
              <FooterLink href="/contact">Contact</FooterLink>
              <FooterLink href="/faq">Shipping & Returns</FooterLink>
              <FooterLink href="/cart">Bag</FooterLink>
            </FooterColumn>
          </div>

          <div className="relative mt-10 rounded-[22px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)] px-5 py-5 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-sm md:px-6 md:py-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="text-sm uppercase tracking-[0.2em] text-[#b8ab95]">
                Follow us
              </p>
              {socialLinks.length ? (
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  {socialLinks.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#f5eee3] transition hover:text-[#f0d19a]"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              ) : (
                <p className="max-w-md text-sm leading-relaxed text-[#8f8576]">
                  Follow along via{" "}
                  <Link href="/journal" className="text-[#d6a85f] underline-offset-4 hover:underline">
                    Journal
                  </Link>{" "}
                  and{" "}
                  <Link href="/press" className="text-[#d6a85f] underline-offset-4 hover:underline">
                    Press
                  </Link>
                  . Social icons appear here once verified profile URLs are configured—no
                  placeholder handles.
                </p>
              )}
            </div>
          </div>

          <div className="relative mt-10 flex flex-col gap-4 border-t border-[rgba(148,163,184,0.14)] pt-6 text-xs text-[#8b8b99] md:flex-row md:items-center md:justify-between">
            <p>Copyright {new Date().getFullYear()} Mystique. All rights reserved.</p>
            <div className="flex flex-wrap gap-4 md:justify-end">
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/terms">Terms of Service</FooterLink>
              <FooterLink href="/cookies">Cookie Policy</FooterLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="border-t border-[rgba(214,168,95,0.1)] pt-5 md:border-none md:pt-0">
      <h3 className="font-literata text-lg tracking-[0.16em] text-[#f5eee3]">
        {title}
      </h3>
      <div className="mt-4 flex flex-col gap-2">{children}</div>
    </div>
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
      className="text-xs uppercase tracking-[0.18em] text-[#b8ab95] transition hover:text-[#f0d19a]"
    >
      {children}
    </Link>
  );
}
