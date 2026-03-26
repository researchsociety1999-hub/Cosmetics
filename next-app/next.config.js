// next.config.js

const withImages = require('next-images');

module.exports = withImages({
  inlineImageLimit: 8192,
  webpack(config, options) {
    return config;
  },
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none';" // Adjust according to your needs
  }
});