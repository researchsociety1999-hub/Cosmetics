import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "./BrandLogo";

const SOCIAL_LINKS: Array<{ label: string; href: string }> = [
  { label: "TikTok", href: "https://www.tiktok.com" },
  { label: "Instagram", href: "https://www.instagram.com" },
  { label: "X", href: "https://x.com" },
  { label: "Facebook", href: "https://www.facebook.com" },
  { label: "Snapchat", href: "https://www.snapchat.com" },
];

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(5,6,10,0),rgba(5,6,10,0.78))]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(255,170,70,0.08),transparent_18%),radial-gradient(circle_at_82%_74%,rgba(214,168,95,0.05),transparent_24%),linear-gradient(180deg,#05060a_12%,#040509_100%)]" />
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-14 md:px-6 md:pb-12 md:pt-20">
        <div className="relative border-t border-[rgba(214,168,95,0.12)] px-0 py-10 md:py-12">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(214,168,95,0.3),transparent)]" />
          <div className="relative grid gap-10 md:grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr] md:gap-8">
            <div className="space-y-5 md:pr-8">
              <div className="max-w-[300px]">
                <BrandLogo className="opacity-95" />
              </div>
              <p className="inline-flex rounded-full border border-[rgba(214,168,95,0.14)] bg-[rgba(255,255,255,0.03)] px-4 py-2 text-[0.66rem] uppercase tracking-[0.28em] text-[#cdb58d]">
                California luxury Mystique Beauty
              </p>
              <p className="max-w-sm text-sm leading-relaxed text-[#b8ab95]">
                Mystique is luxury Mystique Beauty for calm, luminous skin, shaped through
                plush textures, guided layering, and an after-dark editorial mood.
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
              <FooterLink href="/cart">Cart</FooterLink>
            </FooterColumn>
          </div>

          <div className="relative mt-10 rounded-[22px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)] px-5 py-5 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-sm md:px-6 md:py-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="text-sm uppercase tracking-[0.2em] text-[#b8ab95]">
                Follow us
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {SOCIAL_LINKS.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-[#f5eee3] transition hover:text-[#f0d19a]"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
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
      <h3 className="font-cormorant text-lg tracking-[0.16em] text-[#f5eee3]">
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
