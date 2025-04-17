// This file is used when running on Bolt
// It's loaded via the NEXT_CONFIG_FILE environment variable

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

  // Custom webpack configuration for Bolt compatibility
  webpack: (config) => {
    // Disable native modules
    config.resolve.alias = {
      ...config.resolve.alias,
      '@next/swc-linux-x64-gnu': false,
      '@next/swc-linux-x64-musl': false,
    };

    // Force using Babel for JS/TS files
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      use: 'babel-loader',
      exclude: /node_modules/,
    });

    return config;
  },
};

module.exports = nextConfig;
