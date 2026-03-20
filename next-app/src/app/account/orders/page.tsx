import { Footer } from "../../components/Footer";
import { Navbar } from "../../components/Navbar";

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-[#06080c] text-[#f5eee3]">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-14 md:px-6">
        <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
          Orders
        </p>
        <h1 className="mt-4 font-cormorant text-4xl tracking-[0.12em] text-[#f5eee3] md:text-5xl">
          Order history placeholder
        </h1>
        <div className="mystic-card mt-8 p-6 text-sm text-[#b8ab95] md:text-base">
          This route is ready for your future `orders`, `order_items`, and
          `order_status_history` UI. For now it prevents the support links from
          breaking.
        </div>
      </main>
      <Footer />
    </div>
  );
}
