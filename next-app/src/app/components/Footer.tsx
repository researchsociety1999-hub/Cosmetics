import Link from "next/link";
import type { ReactNode } from "react";

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,0.88))]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_28%,rgba(255,154,80,0.1),transparent_20%),radial-gradient(circle_at_82%_72%,rgba(212,175,55,0.07),transparent_26%),linear-gradient(180deg,#000000_8%,#030204_55%,#000000_100%)]" />
      <div className="w-full px-4 pb-10 pt-14 md:px-6 md:pb-12 md:pt-20 lg:px-10 xl:px-14">
        <div className="relative border-t border-[rgba(214,168,95,0.12)] px-0 py-10 md:py-12">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(214,168,95,0.3),transparent)]" />
          <div className="relative grid gap-10 sm:grid-cols-2 md:grid-cols-3 md:gap-8 lg:gap-10">
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
