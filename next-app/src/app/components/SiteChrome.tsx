import type { ReactNode } from "react";
import Link from "next/link";
import { BackToTopButton } from "./BackToTopButton";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { SkipToContent } from "./SkipToContent";
import { getProducts } from "../lib/queries";
import { isProductPurchasable } from "../lib/productMerch";

function prelaunchBannerEnabled(): boolean {
  const flag =
    process.env.MYSTIQUE_PRELAUNCH_BANNER ??
    process.env.NEXT_PUBLIC_PRELAUNCH_BANNER ??
    "";
  return flag.trim() !== "0";
}

async function shouldShowPrelaunchBanner(): Promise<boolean> {
  if (!prelaunchBannerEnabled()) {
    return false;
  }
  const products = await getProducts({ sortBy: "newest", limit: 120 });
  return products.filter(isProductPurchasable).length === 0;
}

export async function SiteChrome({
  children,
  showFooter = true,
}: {
  children: ReactNode;
  showFooter?: boolean;
}) {
  return (
    <div className="relative min-h-screen w-full min-w-0 overflow-x-clip bg-transparent text-[#f6f0e6]">
      <SkipToContent />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_0%_0%,rgba(255,154,80,0.11),transparent_48%),radial-gradient(circle_at_86%_10%,rgba(212,175,55,0.08),transparent_24%),radial-gradient(circle_at_50%_88%,rgba(255,120,48,0.05),transparent_32%),radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.018),transparent_40%),linear-gradient(180deg,rgba(0,0,0,0.5),rgba(0,0,0,0.12)_40%,rgba(0,0,0,0.55)_100%)]"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[520px]">
        <span className="mystic-particle mystic-particle-sm left-[10%] top-[14%] opacity-80" />
        <span className="mystic-particle mystic-particle-md left-[76%] top-[12%] opacity-80" />
        <span className="mystic-particle mystic-particle-sm left-[88%] top-[36%] opacity-80" />
      </div>
      <Navbar />
      {/* Offset for fixed navbar (+ desktop hairline) */}
      <div
        id="main-content"
        tabIndex={-1}
        className="relative z-10 outline-none pt-0"
        style={{ paddingTop: "var(--mystique-header-offset, 7rem)" }}
      >
        {/* Prelaunch banner: shows only when there are 0 purchasable products in the catalog. */}
        <PrelaunchBanner />
        {children}
      </div>
      <BackToTopButton />
      {showFooter ? <Footer /> : null}
    </div>
  );
}

async function PrelaunchBanner() {
  const show = await shouldShowPrelaunchBanner();
  if (!show) return null;

  return (
    <section className="border-b border-[rgba(214,168,95,0.12)] bg-[linear-gradient(180deg,rgba(4,5,10,0.9),rgba(4,5,10,0.72))]">
      <div className="mystic-section-shell py-4 md:py-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-6">
          <div className="space-y-1.5">
            <p className="text-[0.62rem] uppercase tracking-[0.28em] text-[var(--mystic-gold-bright)] font-semibold">
              Launching soon
            </p>
            <p className="text-sm leading-relaxed text-[var(--mystic-text)] md:text-[0.95rem]">
              Explore the collection, learn the rituals, and get a note when your favorites
              arrive.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/shop"
              className="mystic-button-secondary inline-flex items-center justify-center px-5 py-2.5 text-[0.62rem] uppercase tracking-[0.22em]"
            >
              Shop the collection
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
