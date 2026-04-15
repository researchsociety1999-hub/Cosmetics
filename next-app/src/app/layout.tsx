import type { Metadata, Viewport } from "next";
import { Literata } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import type { ReactNode } from "react";
import { getConfiguredSiteUrl } from "./lib/siteUrl";
import "./globals.css";

const literata = Literata({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-literata",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getConfiguredSiteUrl()),
  title: {
    default: "Mystique | Where Beauty Transcends",
    template: "%s | Mystique",
  },
  description:
    "Premium skincare from California—layer-friendly textures, barrier-minded formulas, and morning-to-night rituals you can keep.",
  applicationName: "Mystique",
  keywords: [
    "Mystique",
    "luxury skincare",
    "California skincare",
    "layered skincare routine",
    "centella",
    "niacinamide",
    "ceramide moisturizer",
  ],
  openGraph: {
    title: "Mystique | Where Beauty Transcends",
    description:
      "Premium skincare with disciplined layering—calm radiance, refined textures, and routines built for daily use.",
    siteName: "Mystique",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mystique | Where Beauty Transcends",
    description:
      "Premium skincare with disciplined layering—calm radiance, refined textures, and routines built for daily use.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
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
      className={`${literata.variable} ${GeistSans.variable} scroll-smooth`}
    >
      <body
        className={`${GeistSans.className} min-w-0 w-full bg-black text-[#f6f0e6] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
