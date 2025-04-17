/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable SWC
  swcMinify: false,

  // Disable ESLint during builds
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Configure for Bolt compatibility
  experimental: {
    esmExternals: 'loose',
  },

  // Images configuration
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
