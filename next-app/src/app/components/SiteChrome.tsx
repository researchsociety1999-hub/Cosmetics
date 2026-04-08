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
  const cart = await getCartSummary();
  const user = await getAuthenticatedUser();

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#06080c] text-[#f5eee3]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(255,168,59,0.08),transparent_18%),radial-gradient(circle_at_82%_14%,rgba(214,168,95,0.06),transparent_20%),radial-gradient(circle_at_50%_44%,rgba(255,255,255,0.02),transparent_24%),linear-gradient(180deg,rgba(4,5,8,0),rgba(4,5,8,0.22)_40%,rgba(4,5,8,0.4)_100%)]"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[680px]">
        <span className="mystic-particle mystic-particle-sm left-[8%] top-[12%]" />
        <span className="mystic-particle mystic-particle-md left-[16%] top-[28%]" />
        <span className="mystic-particle mystic-particle-sm left-[28%] top-[18%]" />
        <span className="mystic-particle mystic-particle-lg left-[72%] top-[10%]" />
        <span className="mystic-particle mystic-particle-sm left-[84%] top-[22%]" />
        <span className="mystic-particle mystic-particle-md left-[90%] top-[42%]" />
      </div>
      <Navbar cartCount={cart.itemCount} isAuthenticated={Boolean(user)} />
      <div className="relative z-10">{children}</div>
      <BackToTopButton />
      {showFooter ? <Footer /> : null}
    </div>
  );
}
