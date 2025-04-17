/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for production builds
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
}

module.exports = nextConfig
