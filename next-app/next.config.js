// next.config.js

// EMAIL INTEGRATION / DEV SERVER FIX:
// The project config was requiring `next-images`, but that package is not installed
// in `next-app` and the current codebase does not import image files through JS/TS.
// Exporting the plain Next config keeps the existing image settings while allowing
// `next dev` to start without adding an unnecessary dependency.
module.exports = {
  webpack(config) {
    return config;
  },
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
    contentSecurityPolicy: "default-src 'self'; script-src 'none';" // Adjust according to your needs
  }
};
