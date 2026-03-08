// src/app/page.tsx
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="site-shell min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(214,168,95,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(214,168,95,0.08),transparent_22%),linear-gradient(180deg,#06080c_0%,#0a0d12_45%,#05070b_100%)] text-[var(--text)] font-['Inter',sans-serif] overflow-x-hidden">
      {/* Topbar */}
      <header className="topbar border-b border-[var(--line)] bg-[rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="container mx-auto px-6 py-3 flex flex-col md:flex-row items-center justify-between text-[var(--muted)] text-sm">
          <p>Free U.S. shipping on orders over $75</p>
          <p>Luxury rituals. Timeless glow.</p>
        </div>
      </header>

      {/* Navbar */}
      <nav className="navbar sticky top-0 z-50 bg-[rgba(7,9,13,0.82)] backdrop-blur-2xl border-b border-[var(--line)]">
        <div className="container mx-auto px-6 py-5 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-full overflow-hidden">
              <Image
                src="/LOGO Mystic.png"
                alt="Mystic Logo"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--gold)]/20 to-transparent" />
            </div>
            <div>
              <span className="block text-2xl font-['Cormorant_Garamond',serif] font-semibold tracking-wider text-[var(--gold)]">
                MYSTIC
              </span>
              <span className="text-xs tracking-[0.2em] uppercase text-[var(--muted)]">
                Where Beauty Transcends
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10 text-[var(--muted)]">
            <Link href="#home" className="hover:text-[var(--gold-soft)] transition-colors">Home</Link>
            <Link href="#shop" className="hover:text-[var(--gold-soft)] transition-colors">Shop</Link>
            <Link href="#ritual" className="hover:text-[var(--gold-soft)] transition-colors">Ritual</Link>
            <Link href="#about" className="hover:text-[var(--gold-soft)] transition-colors">About</Link>
            <Link href="#faq" className="hover:text-[var(--gold-soft)] transition-colors">FAQ</Link>
            <Link href="#contact" className="hover:text-[var(--gold-soft)] transition-colors">Contact</Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-5">
            <button aria-label="Search" className="text-2xl hover:text-[var(--gold-soft)] transition-colors">
              🔍
            </button>
            <button aria-label="Wishlist" className="text-2xl hover:text-[var(--gold-soft)] transition-colors">
              ♡
            </button>
            <button aria-label="Cart" className="relative text-2xl hover:text-[var(--gold-soft)] transition-colors">
              👜
              <span className="absolute -top-1 -right-1 bg-[var(--danger)] text-white text-xs rounded-full px-1.5 py-0.5">
                0
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section id="home" className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-[var(--panel)] backdrop-blur-sm" />
        <div className="container mx-auto px-6 relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="eyebrow uppercase tracking-widest text-[var(--gold-soft)] mb-4">Luxury Beauty • Mystic Rituals</p>
            <h1 className="text-5xl md:text-7xl font-['Cormorant_Garamond',serif] font-bold leading-tight text-white mb-6">
              Beauty reimagined in a world of shadow, gold, and glow.
            </h1>
            <p className="text-xl text-[var(--muted)] mb-10 max-w-xl">
              Discover elevated skincare and beauty essentials designed to feel ceremonial, indulgent, and unforgettable.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <Link
                href="#shop"
                className="inline-block bg-gradient-to-r from-[var(--gold)] to-[var(--gold-soft)] text-[var(--bg)] px-10 py-5 rounded-full font-bold text-lg hover:opacity-90 transition"
              >
                Shop Now
              </Link>
              <Link
                href="#ritual"
                className="inline-block border-2 border-[var(--gold)] text-[var(--gold)] px-10 py-5 rounded-full font-bold text-lg hover:bg-[var(--gold)]/10 transition"
              >
                Discover the Ritual
              </Link>
            </div>
          </div>

          <div className="relative hidden md:block">
            {/* You can add a hero image here later */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--gold)]/20 to-transparent rounded-3xl" />
          </div>
        </div>
      </section>

      {/* Products Section (placeholder — replace with Supabase fetch later) */}
      <section id="shop" className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <p className="eyebrow uppercase tracking-widest text-[var(--gold-soft)] mb-4">Collections</p>
            <h2 className="text-5xl font-['Cormorant_Garamond',serif] font-bold text-white">Featured Rituals</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Example product card — duplicate & replace with map from Supabase */}
            <div className="group glass-panel rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
              <div className="relative h-80">
                <Image
                  src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80"
                  alt="Product"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-[var(--gold)] text-[var(--bg)] px-4 py-1 rounded-full text-sm font-bold">
                  Best Seller
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-['Cormorant_Garamond',serif] font-semibold mb-2">Celestial Glow Serum</h3>
                <p className="text-[var(--muted)] mb-4">Brightening • Radiance</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-[var(--gold-soft)]">$68</span>
                  <button className="bg-[var(--gold)]/20 hover:bg-[var(--gold)]/40 text-[var(--gold)] px-6 py-3 rounded-full transition">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>

            {/* Add 2–5 more cards here */}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-[rgba(0,0,0,0.3)]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <p className="eyebrow uppercase tracking-widest text-[var(--gold-soft)] mb-4">Voices</p>
            <h2 className="text-5xl font-['Cormorant_Garamond',serif] font-bold text-white">Loved by those who glow</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-panel p-8 rounded-3xl">
              <p className="text-lg italic mb-6">
                "This serum gave me the glow I’ve been chasing for years. Truly ceremonial."
              </p>
              <span className="text-[var(--gold-soft)] font-medium">— Ava R.</span>
            </div>
            {/* Add more testimonials */}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <p className="eyebrow uppercase tracking-widest text-[var(--gold-soft)] mb-4">Questions</p>
            <h2 className="text-5xl font-['Cormorant_Garamond',serif] font-bold text-white">Frequently Asked</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <details className="glass-panel rounded-2xl overflow-hidden">
              <summary className="p-6 text-xl font-medium cursor-pointer hover:text-[var(--gold-soft)] transition">
                What makes Mystic different?
              </summary>
              <div className="px-6 pb-6 text-[var(--muted)]">
                We craft ritual-inspired luxury beauty with intention, using rare ingredients and timeless alchemy.
              </div>
            </details>
            {/* Add more FAQ items */}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="glass-panel rounded-3xl p-12 md:p-16 text-center max-w-4xl mx-auto">
            <p className="eyebrow uppercase tracking-widest text-[var(--gold-soft)] mb-4">Stay Connected</p>
            <h2 className="text-5xl font-['Cormorant_Garamond',serif] font-bold mb-6">Join the Mystic Circle</h2>
            <p className="text-xl text-[var(--muted)] mb-10">
              First access to launches, rituals, and exclusive offers.
            </p>

            <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-6 py-4 rounded-full bg-[rgba(255,255,255,0.05)] border border-[var(--line)] text-white placeholder-[var(--muted)] focus:outline-none focus:border-[var(--gold)] transition"
                required
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-[var(--gold)] to-[var(--gold-soft)] text-[var(--bg)] px-10 py-4 rounded-full font-bold hover:opacity-90 transition"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-16 border-t border-[var(--line)] bg-[rgba(0,0,0,0.4)]">
        <div className="container mx-auto px-6 text-center md:text-left">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <Link href="/" className="inline-flex items-center gap-4 mb-6">
                <Image src="/LOGO Mystic.png" alt="Mystic" width={60} height={60} />
                <div>
                  <span className="block text-2xl font-['Cormorant_Garamond',serif] text-[var(--gold)]">MYSTIC</span>
                  <span className="text-sm text-[var(--muted)]">Where Beauty Transcends</span>
                </div>
              </Link>
              <p className="text-[var(--muted)]">
                Luxury rituals for the modern mystic.
              </p>
            </div>

            {/* Add more footer columns: Shop, Support, Contact */}
          </div>

          <div className="mt-16 pt-8 border-t border-[var(--line)] text-center text-[var(--muted)] text-sm">
            © {new Date().getFullYear()} Mystic. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}