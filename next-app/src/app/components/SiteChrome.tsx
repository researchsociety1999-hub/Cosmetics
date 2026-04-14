import type { ReactNode } from "react";
import { BackToTopButton } from "./BackToTopButton";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

export function SiteChrome({
  children,
  showFooter = true,
}: {
  children: ReactNode;
  showFooter?: boolean;
}) {
  return (
    <div className="relative min-h-screen w-full min-w-0 overflow-x-clip bg-black text-[#f6f0e6]">
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
      {/* Offset for fixed navbar + hairline; extra on xs when links wrap */}
      <div className="relative z-10 pt-[5.25rem] sm:pt-[5.35rem] md:pt-[5.65rem]">{children}</div>
      <BackToTopButton />
      {showFooter ? <Footer /> : null}
    </div>
  );
}
