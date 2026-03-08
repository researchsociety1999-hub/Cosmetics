// src/app/page.tsx
import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header with Logo */}
      <header className="p-6 md:p-10 flex justify-center">
        <Image
          src="/LOGO Mystic.png"  // We'll move the logo next
          alt="Mystic Store Logo"
          width={300}
          height={100}
          priority
          className="drop-shadow-lg"
        />
      </header>

      {/* Hero Section */}
      <section className="text-center px-6 py-16 md:py-24">
        <h1 className="text-5xl md:text-7xl font-bold text-purple-900 mb-6">
          Mystic Store
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto">
          WHERE BEAUTY TRANSFORMS INTO MAGIC
        </p>

        <div className="mt-10">
          <a
            href="/shop"
            className="inline-block bg-purple-600 text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-purple-700 transition"
          >
            Shop Now
          </a>
        </div>
      </section>

      {/* Quick note */}
      <div className="text-center text-gray-500 py-8">
        <p>Next: Connect Supabase products → edit /shop/page.tsx</p>
      </div>
    </main>
  );
}