import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mystique.example.com"),
  title: {
    default: "Mystique | Where Beauty Transcends",
    template: "%s | Mystique",
  },
  description:
    "Luxury dermatological skincare with a mystical edge, rooted in California minimalism and Mystique Beauty ritual.",
  applicationName: "Mystique",
  keywords: [
    "Mystique Beauty",
    "luxury skincare",
    "bloom skin",
    "peptides",
    "centella",
    "niacinamide",
  ],
  openGraph: {
    title: "Mystique | Where Beauty Transcends",
    description:
      "Luxury dermatological skincare with a mystical edge and bloom-skin ritual storytelling.",
    siteName: "Mystique",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mystique | Where Beauty Transcends",
    description:
      "Luxury dermatological skincare with a mystical edge and bloom-skin ritual storytelling.",
  },
};

export const viewport: Viewport = {
  themeColor: "#06080c",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${cormorant.variable} ${inter.variable} scroll-smooth`}
    >
      <body className="bg-[#06080c] text-[#f5eee3] antialiased">
        {children}
      </body>
    </html>
  );
}
