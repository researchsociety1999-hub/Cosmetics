import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-[#06080c] text-[#f5eee3]">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-14 md:px-6">
        <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
          Careers
        </p>
        <h1 className="mt-4 font-literata text-4xl tracking-[0.12em] text-[#f5eee3] md:text-5xl">
          Join the Mystic team
        </h1>
        <div className="mystic-card mt-8 p-6 text-sm text-[#b8ab95] md:text-base">
          Careers is now a valid route instead of a broken link. Add your live
          openings here when you are ready.
        </div>
      </main>
      <Footer />
    </div>
  );
}
