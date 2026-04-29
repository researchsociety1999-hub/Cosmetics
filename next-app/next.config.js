const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

function extraImageRemotePatterns() {
  const raw = process.env.NEXT_PUBLIC_IMAGE_REMOTE_HOSTS || "";
  return raw
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean)
    .map((hostname) => ({ protocol: "https", hostname }));
}

// ---------------------------------------------------------------------------
// Security headers
// ---------------------------------------------------------------------------
// CSP is intentionally permissive where third-party services require it:
//   - Supabase (storage + auth callbacks)
//   - Stripe (JS + iframe for payment elements)
//   - Resend / email assets (images in transactional emails are served from
//     resend CDN; only affects img-src, never script-src)
//   - Google Fonts (font-src)
// All values are origin-scoped — no 'unsafe-eval' or wildcard '*' in script-src.
// Iterate this policy as the app evolves; use report-uri/report-to in prod.
const securityHeaders = [
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    // Lock down powerful features we don't use on this storefront.
    value: "camera=(), microphone=(), geolocation=(), payment=(self)",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    // Required for SharedArrayBuffer; keeps the browsing context group isolated.
    value: "same-origin-allow-popups",
  },
  {
    key: "Cross-Origin-Embedder-Policy",
    // "unsafe-none" is the safe default for storefronts embedding Stripe iframes
    // and Supabase auth pop-ups.  Switch to "require-corp" only after all
    // cross-origin resources ship CORP headers.
    value: "unsafe-none",
  },
  {
    key: "Content-Security-Policy",
    value: [
      // Default: same-origin only.
      "default-src 'self'",

      // Scripts: self + Next.js inline runtime chunks (hash/nonce preferred in
      // future; 'unsafe-inline' is needed only for some Stripe SDKs).
      // Stripe requires js.stripe.com for its JS bundle.
      "script-src 'self' 'unsafe-inline' https://js.stripe.com",

      // Styles: self + Google Fonts stylesheet + inline Tailwind utilities.
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",

      // Fonts: self + Google Fonts binary files.
      "font-src 'self' https://fonts.gstatic.com data:",

      // Images: self + all allowed Next/Image remote hosts + data URIs
      // (used by inline SVG placeholders / film grain).
      [
        "img-src",
        "'self'",
        "data:",
        "blob:",
        "https://placehold.co",
        "https://images.unsplash.com",
        "https://via.placeholder.com",
        "https://*.supabase.co",
        "https://*.supabase.in",
      ].join(" "),

      // Connections: self + Supabase API + Stripe API.
      "connect-src 'self' https://*.supabase.co https://*.supabase.in https://api.stripe.com",

      // Frames: Stripe Payment Element renders inside a cross-origin iframe.
      "frame-src https://js.stripe.com https://hooks.stripe.com",

      // Workers: none beyond self (no SW for now).
      "worker-src 'self' blob:",

      // Media: self only.
      "media-src 'self'",

      // Manifests, objects, base-uri.
      "manifest-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",

      // Upgrade all insecure requests in production.
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  /** Hides the floating Next.js dev indicator (N badge) in development; no effect on production builds. */
  devIndicators: false,
  turbopack: {
    // This repo is a workspace. Pin the Turbopack root so it doesn't incorrectly infer `src/app`
    // as the workspace root when commands are launched from tooling (e.g. Playwright webServer).
    root: __dirname,
  },
  outputFileTracingRoot: __dirname,
  images: {
    // `next/image` requires remote hosts to be explicitly allowed (must stay in sync with
    // `isSafeImageSrc` in `src/app/lib/format.ts`). Add more via `NEXT_PUBLIC_IMAGE_REMOTE_HOSTS`.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "**.supabase.in",
      },
      ...extraImageRemotePatterns(),
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none';",
  },

  // ---------------------------------------------------------------------------
  // HTTP response headers applied to every route
  // ---------------------------------------------------------------------------
  async headers() {
    return [
      {
        // Apply to all routes including API, static files, and page routes.
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);
