import type { Metadata, Viewport } from "next";
import { Inter, Literata, Playfair_Display } from "next/font/google";
import type { ReactNode } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { DeferredClientBits } from "./components/DeferredClientBits";
import { mystiqueDefaultOpenGraphImages } from "./lib/socialMetadata";
import { getConfiguredSiteUrl } from "./lib/siteUrl";
import "./globals.css";

const literata = Literata({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-literata",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
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
    images: mystiqueDefaultOpenGraphImages(),
  },
  twitter: {
    card: "summary_large_image",
    title: "Mystique | Where Beauty Transcends",
    description:
      "Premium skincare with disciplined layering—calm radiance, refined textures, and routines built for daily use.",
    images: mystiqueDefaultOpenGraphImages().map((img) => img.url),
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
      className={`${literata.variable} ${playfair.variable} ${inter.variable} scroll-smooth`}
    >
      {/*
        body background is set in globals.css (background: #08070a).
        Tailwind `bg-transparent` is removed here to eliminate the hydration
        flash where the browser briefly shows white before CSS loads.
        The `mystique-app-shell` z-index stacking context sits above the
        body::before (film grain, z=1) and body::after (wallpaper, z=0) layers.
      */}
      <body
        className={`${inter.className} min-w-0 w-full antialiased`}
      >
        <div className="mystique-app-shell">
          {children}
          <DeferredClientBits />
        </div>
        <SpeedInsights />
      </body>
    </html>
  );
}
