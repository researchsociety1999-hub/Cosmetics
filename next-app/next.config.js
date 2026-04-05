// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname, ".."),
  images: {
    // EMAIL INTEGRATION / DEV SERVER FIX:
    // `next/image` requires remote hosts to be explicitly allowed. The storefront
    // currently uses a `placehold.co` fallback image and may also load Supabase
    // asset URLs, so we allow only those known hosts here.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "**.supabase.in",
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none';",
  },
};

module.exports = nextConfig;
