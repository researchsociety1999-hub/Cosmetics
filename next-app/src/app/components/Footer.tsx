import Link from "next/link";
import type { ReactNode } from "react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-[rgba(214,168,95,0.18)] bg-[#05060a]">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(214,168,95,0.35)] bg-[rgba(255,255,255,0.03)]">
                  <span className="font-cormorant text-lg tracking-[0.3em] text-[#d6a85f]">
                    M
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-cormorant text-lg font-semibold tracking-[0.25em] text-[#d6a85f]">
                    MYSTIC
                  </span>
                  <span className="text-[0.65rem] uppercase tracking-[0.25em] text-[#b8ab95]">
                    Where Beauty Transcends
                  </span>
                </div>
              </div>
              <p className="mt-4 max-w-xs text-sm text-[#b8ab95]">
                Elevated skincare and beauty rituals, crafted to turn every
                moment into ceremony.
              </p>
            </div>
            <div className="flex gap-3 text-sm text-[#f5eee3]">
              <SocialIcon label="Instagram" />
              <SocialIcon label="TikTok" />
              <SocialIcon label="Pinterest" />
            </div>
          </div>

          <FooterColumn title="Shop">
            <FooterLink href="/shop">All Products</FooterLink>
            <FooterLink href="/shop?category=serums">Serums</FooterLink>
            <FooterLink href="/shop?category=body-rituals">Body Rituals</FooterLink>
            <FooterLink href="/shop?category=masks">Masks</FooterLink>
          </FooterColumn>

          <FooterColumn title="Company">
            <FooterLink href="/#about">About Mystic</FooterLink>
            <FooterLink href="/press">Press</FooterLink>
            <FooterLink href="/ingredients">Ingredients</FooterLink>
            <FooterLink href="/careers">Careers</FooterLink>
          </FooterColumn>

          <FooterColumn title="Support">
            <FooterLink href="/#faq">FAQ</FooterLink>
            <FooterLink href="/#contact">Contact</FooterLink>
            <FooterLink href="/account/orders">Returns</FooterLink>
            <FooterLink href="/account/orders">Track Order</FooterLink>
          </FooterColumn>
        </div>

        <div className="mt-10 border-t border-[rgba(148,163,184,0.28)] pt-6 text-xs text-[#8b8b99] md:flex md:items-center md:justify-between">
          <p className="mb-3 md:mb-0">
            Copyright {new Date().getFullYear()} Mystic. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4">
            <FooterLink href="/privacy">Privacy Policy</FooterLink>
            <FooterLink href="/terms">Terms of Service</FooterLink>
            <FooterLink href="/cookies">Cookie Policy</FooterLink>
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
    <div>
      <h3 className="font-cormorant text-lg font-semibold tracking-[0.18em] text-[#f5eee3]">
        {title}
      </h3>
      <div className="mt-4 flex flex-col gap-2 text-sm text-[#b8ab95]">
        {children}
      </div>
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
      className="text-xs uppercase tracking-[0.18em] text-[#b8ab95] hover:text-[#f0d19a]"
    >
      {children}
    </Link>
  );
}

function SocialIcon({ label }: { label: string }) {
  const first = label.charAt(0).toUpperCase();
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(214,168,95,0.4)] bg-[rgba(255,255,255,0.03)] text-xs uppercase tracking-[0.18em] text-[#f5eee3] hover:bg-[rgba(214,168,95,0.16)]"
    >
      {first}
    </button>
  );
}
