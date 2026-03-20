import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#06080c] text-[#f5eee3]">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-14 md:px-6">
        <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
          Terms
        </p>
        <h1 className="mt-4 font-cormorant text-4xl tracking-[0.12em] text-[#f5eee3] md:text-5xl">
          Terms of Service
        </h1>
        <div className="mystic-card mt-8 p-6 text-sm text-[#b8ab95] md:text-base">
          This placeholder page keeps the storefront navigable until you add
          your final legal terms.
        </div>
      </main>
      <Footer />
    </div>
  );
}
