import { Footer } from "../../components/Footer";
import { Navbar } from "../../components/Navbar";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#06080c] text-[#f5eee3]">
      <Navbar />
      <main className="mx-auto max-w-xl px-4 py-14 md:px-6">
        <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
          Account
        </p>
        <h1 className="mt-4 font-cormorant text-4xl tracking-[0.12em] text-[#f5eee3]">
          Login coming next
        </h1>
        <div className="mystic-card mt-8 space-y-4 p-6">
          <p className="text-sm text-[#b8ab95]">
            Your schema already includes `profiles`, `orders`, `addresses`, and
            related account data. This placeholder route keeps navigation
            working until the auth flow is built.
          </p>
          <a
            href="/"
            className="mystic-button-secondary inline-flex items-center justify-center px-6 py-2 text-xs uppercase tracking-[0.2em]"
          >
            Return home
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}
