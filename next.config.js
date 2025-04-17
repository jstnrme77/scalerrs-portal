/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static export for Netlify to allow API routes to work
  // output: process.env.NODE_ENV === 'production' ? 'export' : undefined,

  // Only use these settings for GitHub Pages, not for Netlify
  basePath: process.env.DEPLOY_TARGET === 'github' ? '/scalerrs-portal' : '',
  assetPrefix: process.env.DEPLOY_TARGET === 'github' ? '/scalerrs-portal/' : '',
  trailingSlash: process.env.DEPLOY_TARGET === 'github',
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
