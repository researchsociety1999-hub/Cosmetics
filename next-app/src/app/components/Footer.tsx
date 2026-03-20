import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "./BrandLogo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-[rgba(214,168,95,0.18)] bg-[#05060a]">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="space-y-5 md:col-span-2">
            <div className="max-w-[320px]">
              <BrandLogo />
            </div>
            <p className="max-w-sm text-sm text-[#b8ab95]">
              A dark-luxury K-beauty experience shaped around bloom skin, regenerative
              science storytelling, and nightly ritual.
            </p>
          </div>

          <FooterColumn title="Shop">
            <FooterLink href="/shop">All Products</FooterLink>
            <FooterLink href="/shop?category=serums">Serums</FooterLink>
            <FooterLink href="/shop?category=cleansers">Cleansers</FooterLink>
            <FooterLink href="/shop?category=moisturizers">Moisturizers</FooterLink>
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
            <FooterLink href="/checkout">Shipping & Returns</FooterLink>
            <FooterLink href="/cart">Cart</FooterLink>
          </FooterColumn>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-[rgba(148,163,184,0.18)] pt-6 text-xs text-[#8b8b99] md:flex-row md:items-center md:justify-between">
          <p>Copyright {new Date().getFullYear()} Mystique. All rights reserved.</p>
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
