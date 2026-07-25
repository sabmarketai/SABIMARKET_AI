const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  fallbacks: {
    document: "/offline",
  },
  // Nigerian mobile networks are often patchy (2G/3G, unstable power).
  // Cache aggressively so the app stays usable offline.
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: "NetworkFirst",
      options: {
        cacheName: "sabimarket-offline-cache",
        expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 },
        networkTimeoutSeconds: 5,
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
