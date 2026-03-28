import { Inter } from 'next/font/google';
import { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>MYSTIQUE RITUAL</title>
        <Metadata
          description="Luxury K-beauty products"
          keywords="K-beauty, luxury skincare, ritual"
        />
      </head>
      <body className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header container */}
          <header className="w-full flex items-center justify-between px-4 py-4 bg-transparent">
            {/* Logo */}
            <div className="flex-shrink-0">
              <img
                className="h-10 md:h-12"
                src="/logo.svg"
                alt="MYSTIQUE"
              />
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button className="outline-none focus:outline-none">
                {/* Menu icon */}
              </button>
            </div>
          </header>
          
          {/* Main content */}
          {children}
          
          {/* Footer */}
          <footer className="w-full py-8 border-t-[1px] border-gray-800 bg-[var(--dark-bg)]">
            {/* Footer content */}
          </footer>
        </div>
      </body>
    </html>
  );
}
