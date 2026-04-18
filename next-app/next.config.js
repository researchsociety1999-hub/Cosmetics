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

/** @type {import('next').NextConfig} */
const nextConfig = {
  /** Hides the floating Next.js dev indicator (N badge) in development; no effect on production builds. */
  devIndicators: false,
  outputFileTracingRoot: path.join(__dirname, ".."),
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
};

module.exports = nextConfig;
