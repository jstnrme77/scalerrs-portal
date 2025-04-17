/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only use static export in production
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  // Configure for GitHub Pages - modify this to match your repository name
  basePath: process.env.NODE_ENV === 'production' ? '/scalerrs-portal' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/scalerrs-portal/' : '',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Disable ESLint during builds
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Configure webpack for compatibility with Bolt
  webpack: (config, { isServer }) => {
    // Force using Babel for JS/TS files
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      use: 'babel-loader',
      exclude: /node_modules/,
    });
    return config;
  },
}

module.exports = nextConfig
