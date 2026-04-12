import { NavbarCenterNav } from "./NavbarCenterNav";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-[rgba(212,175,55,0.14)] bg-[rgba(0,0,0,0.72)] shadow-[0_12px_40px_rgba(0,0,0,0.55),0_0_48px_rgba(212,175,55,0.04)] backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-[rgba(0,0,0,0.58)]">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(212,175,55,0.35),rgba(255,200,140,0.12),transparent)]" />
      <div className="w-full px-3 pt-4 sm:px-4 sm:pt-5 md:px-6 md:pt-6 lg:px-10 xl:px-14">
        <div className="flex min-h-[2.75rem] items-center justify-center pb-4 sm:min-h-[3rem] sm:pb-5">
          <NavbarCenterNav className="w-full max-w-full" />
        </div>
      </div>
    </header>
  );
}
