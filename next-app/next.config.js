// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require("path");

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
// CSP allows third-party services required by the storefront (Supabase, Stripe,
// optional GA4, OpenRouter chat, Vercel Speed Insights). 'unsafe-inline' is
// required for Next.js inline bootstrap scripts; nonce-based CSP is not wired yet.
const isDev = process.env.NODE_ENV === "development";
const scriptSrc = [
  "script-src",
  "'self'",
  "'unsafe-inline'",
  ...(isDev ? ["'unsafe-eval'"] : []),
  "https://js.stripe.com",
  ...(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
    ? ["https://www.googletagmanager.com"]
    : []),
].join(" ");

const securityHeaders = [
  {
    key: "X-Frame-Options",
    value: "DENY",
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
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      scriptSrc,
      "style-src 'self' 'unsafe-inline' https://api.fontshare.com https://fonts.googleapis.com",
      "font-src 'self' https://api.fontshare.com https://fonts.gstatic.com data:",
      [
        "img-src",
        "'self'",
        "data:",
        "blob:",
        "https://*.supabase.co",
        "https://vercel.com",
        "https://placehold.co",
        "https://images.unsplash.com",
      ].join(" "),
      [
        "connect-src",
        "'self'",
        "https://*.supabase.co",
        "https://api.stripe.com",
        "https://openrouter.ai",
        "https://vitals.vercel-insights.com",
        ...(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
          ? ["https://www.google-analytics.com", "https://www.googletagmanager.com"]
          : []),
      ].join(" "),
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
    ].join("; "),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  /** Hides the floating Next.js dev indicator (N badge) in development; no effect on production builds. */
  devIndicators: false,
  experimental: {
    optimizePackageImports: ["framer-motion"],
  },
  turbopack: {
    // npm workspaces hoist `next` to the repo root — point Turbopack at that root.
    root: path.join(__dirname, ".."),
  },
  outputFileTracingRoot: path.join(__dirname, ".."),
  images: {
    // Next 16 defaults to qualities: [75]; hero uses quality={88} and story image uses quality={90}.
    qualities: [75, 88, 90],
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

module.exports =
  process.env.ANALYZE === "true"
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("@next/bundle-analyzer")({ enabled: true })(nextConfig)
    : nextConfig;
