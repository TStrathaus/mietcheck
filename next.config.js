const withNextIntl = require('next-intl/plugin')(
  './src/i18n/request.ts'
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Force cache invalidation after major UI changes
  generateBuildId: async () => {
    const buildId = `build-${Date.now()}`;
    return buildId;
  },
  env: {
    NEXT_PUBLIC_BUILD_ID: process.env.VERCEL_GIT_COMMIT_SHA || `local-${Date.now()}`,
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
    };
    return config;
  },
}

module.exports = withNextIntl(nextConfig)
