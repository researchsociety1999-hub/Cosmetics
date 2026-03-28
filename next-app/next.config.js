// next.config.js

// EMAIL INTEGRATION / DEV SERVER FIX:
// The project config was requiring `next-images`, but that package is not installed
// in `next-app` and the current codebase does not import image files through JS/TS.
// Exporting the plain Next config keeps the existing image settings while allowing
// `next dev` to start without adding an unnecessary dependency.
module.exports = {
  inlineImageLimit: 8192,
  webpack(config, options) {
    return config;
  },
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none';" // Adjust according to your needs
  }
};
