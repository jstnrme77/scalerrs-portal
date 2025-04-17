/** @type {import('next').NextConfig} */
module.exports = {
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
    
    return config;
  },
};
