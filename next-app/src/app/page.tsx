// src/app/page.tsx
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#06080c] via-[#0a0d12] to-[#05070b] text-[#f5eee3] font-['Inter',sans-serif]">
      {/* Topbar */}
      <header className="border-b border-[#d6a85f]/20 bg-black/30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between text-sm text-[#b8ab95]">
          <p>Free U.S. shipping on orders over $75</p>
          <p>Luxury rituals. Timeless glow.</p>
        </div>
      </header>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-[#d6a85f]/20">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14">
              <Image
                src="/LOGO Mystic.png"
                alt="Mystic"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-3xl font-['Cormorant_Garamond',serif] font-bold text-[#d6a85f] tracking-wide">
                MYSTIC
              </h1>
              <p className="text-xs uppercase tracking-widest text-[#b8ab95]">
                Where Beauty Transcends
              </p>
            </div>
          </div>

          {/* Links (desktop) */}
          <div className="hidden md:flex gap-10 text-[#b8ab95]">
            <a href="#home" className="hover:text-[#f0d19a] transition">Home</a>
            <a href="#shop" className="hover:text-[#f0d19a] transition">Shop</a>
            <a href="#ritual" className="hover:text-[#f0d19a] transition">Ritual</a>
            <a href="#about" className="hover:text-[#f0d19a] transition">About</a>
            <a href="#faq" className="hover:text-[#f0d19a] transition">FAQ</a>
            <a href="#contact" className="hover:text-[#f0d19a] transition">Contact</a>
          </div>

          {/* Icons */}
          <div className="flex gap-6 text-2xl">
            <button>🔍</button>
            <button>♡</button>
            <button>🛒</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section id="home" className="relative min-h-[80vh] flex items-center">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-6xl md:text-8xl font-['Cormorant_Garamond',serif] font-bold text-white mb-6 tracking-tight">
            Beauty reimagined in a world of shadow, gold, and glow.
          </h1>
          <p className="text-xl md:text-2xl text-[#b8ab95] mb-12 max-w-3xl mx-auto">
            Discover elevated skincare and beauty essentials designed to feel ceremonial, indulgent, and unforgettable.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a href="#shop" className="bg-[#d6a85f] text-black px-10 py-5 rounded-full font-bold text-lg hover:bg-[#f0d19a] transition">
              Shop Now
            </a>
            <a href="#ritual" className="border-2 border-[#d6a85f] text-[#d6a85f] px-10 py-5 rounded-full font-bold text-lg hover:bg-[#d6a85f]/10 transition">
              Discover the Ritual
            </a>
          </div>
        </div>
      </section>

      {/* Placeholder for more sections */}
      <div className="h-96 flex items-center justify-center text-[#b8ab95]">
        <p>More sections (products, FAQ, newsletter...) coming next...</p>
      </div>
    </div>
  );
}