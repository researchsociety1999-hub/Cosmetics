import type { Metadata, Viewport } from "next";
import { Inter, Literata } from "next/font/google";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { DeferredClientBits } from "./components/DeferredClientBits";
import { GoogleAnalyticsTracker } from "./components/GoogleAnalytics";
import { mystiqueDefaultOpenGraphImages } from "./lib/socialMetadata";
import { getConfiguredSiteUrl } from "./lib/siteUrl";
import "./globals.css";

const literata = Literata({
  subsets: ["latin"],
  // Variable font range — single request covers all weights/styles
  axes: ["opsz"],
  variable: "--font-literata",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  // Variable font — one request instead of 4 discrete weight files
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
  verification: {
    other: {
      "msvalidate.01": "0E5D689E6202B5F2",
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
  colorScheme: "dark",
};

/**
 * Origin of the Supabase project (catalog API + product image CDN), derived
 * from env. Used for an early `preconnect` so the TLS/DNS handshake overlaps
 * with HTML parsing — cuts TTFB-to-image and API latency on first paint.
 */
function getSupabaseOrigin(): string | null {
  const raw =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const supabaseOrigin = getSupabaseOrigin();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${literata.variable} ${inter.variable} scroll-smooth`}
    >
      <head>
        {supabaseOrigin ? (
          <>
            <link rel="preconnect" href={supabaseOrigin} crossOrigin="" />
            <link rel="dns-prefetch" href={supabaseOrigin} />
          </>
        ) : null}
      </head>
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
          {/* Cookie banner, back-to-top, ritual companion chat */}
          <DeferredClientBits />
        </div>

        {/* Google Analytics 4 — production only; no-op if env var is unset.
            GoogleAnalytics loads gtag.js + fires the initial page_view.
            GoogleAnalyticsTracker handles consent gate + SPA route-change
            page_views (App Router does not fire these automatically).
            Suspense boundary is required because GoogleAnalyticsTracker
            uses useSearchParams(). */}
        {process.env.NODE_ENV === "production" && gaMeasurementId && (
          <>
            <GoogleAnalytics gaId={gaMeasurementId} />
            <Suspense fallback={null}>
              <GoogleAnalyticsTracker measurementId={gaMeasurementId} />
            </Suspense>
          </>
        )}

        {/* Vercel Speed Insights — no env var needed; active on all Vercel deploys */}
        <SpeedInsights />
        {/* Vercel Web Analytics — page views, route performance, audience data */}
        <Analytics />
      </body>
    </html>
  );
}
