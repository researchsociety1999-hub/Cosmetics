import type { ReactNode } from "react";
import Link from "next/link";
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
  // Treat empty string as "0" (disabled) — banner only shows when explicitly set to "1"
  return flag.trim() === "1";
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
    <div className="relative min-h-screen w-full min-w-0 overflow-x-clip overflow-y-visible bg-transparent text-[#f6f0e6]">
      <SkipToContent />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_0%_0%,rgba(255,154,80,0.09),transparent_50%),radial-gradient(circle_at_86%_10%,rgba(212,175,55,0.07),transparent_26%),radial-gradient(circle_at_50%_88%,rgba(255,120,48,0.04),transparent_34%),radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.016),transparent_42%),linear-gradient(180deg,rgba(0,0,0,0.35),rgba(0,0,0,0.06)_40%,rgba(0,0,0,0.42)_100%)]"
      />
      {/* Particle embers — anchored to SiteChrome (position:relative); must stay out of document flow */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[520px]">
        <span className="mystic-particle mystic-particle-sm" style={{ left: "10%", top: "14%", opacity: 0.8 }} />
        <span className="mystic-particle mystic-particle-md" style={{ left: "76%", top: "12%", opacity: 0.8 }} />
        <span className="mystic-particle mystic-particle-sm" style={{ left: "88%", top: "36%", opacity: 0.8 }} />
      </div>
      <Navbar />
      {/*
        Offset for fixed navbar.
        `--mystique-header-offset` is set by Navbar JS based on actual header height.
        The fallback `7rem` matches `:root` until the header is measured. Direct
        `<main>` children must not add a second top gutter — see globals
        `#main-content > main`. Full-bleed / hero-first sections use `.mystique-first-section`.
      */}
      <div
        id="main-content"
        tabIndex={-1}
        className="relative z-10 outline-none"
        style={{ paddingTop: "var(--mystique-header-offset, 7rem)" }}
      >
        {/* Prelaunch banner: shows only when MYSTIQUE_PRELAUNCH_BANNER=1 AND there are 0 purchasable products */}
        <PrelaunchBanner />
        {children}
      </div>
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
