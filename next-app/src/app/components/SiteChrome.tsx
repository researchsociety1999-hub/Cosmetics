import type { ReactNode } from "react";
import { getCartSummary } from "../lib/cart";
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

  return (
    <div className="min-h-screen bg-[#06080c] text-[#f5eee3]">
      <Navbar cartCount={cart.itemCount} />
      {children}
      {showFooter ? <Footer /> : null}
    </div>
  );
}
