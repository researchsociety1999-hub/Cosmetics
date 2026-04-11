import type { ReactNode } from "react";
import { getCartSummary } from "../lib/cart";
import { getAuthenticatedUser } from "../lib/supabaseServer";
import { BackToTopButton } from "./BackToTopButton";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

export async function SiteChrome({
  children,
  showFooter = true,
}: {
  children: ReactNode;
  showFooter?: boolean;
}) {
  const user = await getAuthenticatedUser();
  const cart = await getCartSummary(user);

  return (
    <div className="relative min-h-screen w-full min-w-0 overflow-x-clip bg-[#030406] text-[#f5eee3]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(255,160,72,0.07),transparent_20%),radial-gradient(circle_at_82%_12%,rgba(214,168,95,0.07),transparent_22%),radial-gradient(circle_at_50%_48%,rgba(255,255,255,0.02),transparent_26%),linear-gradient(180deg,rgba(0,0,0,0.35),rgba(4,5,8,0.15)_35%,rgba(4,5,8,0.45)_100%)]"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[520px]">
        <span className="mystic-particle mystic-particle-sm left-[10%] top-[14%] opacity-80" />
        <span className="mystic-particle mystic-particle-md left-[76%] top-[12%] opacity-80" />
        <span className="mystic-particle mystic-particle-sm left-[88%] top-[36%] opacity-80" />
      </div>
      <Navbar cartCount={cart.itemCount} isAuthenticated={Boolean(user)} />
      <div className="relative z-10">{children}</div>
      <BackToTopButton />
      {showFooter ? <Footer /> : null}
    </div>
  );
}
