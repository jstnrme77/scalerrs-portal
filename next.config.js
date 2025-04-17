/** @type {import('next').NextConfig} */
const nextConfig = {
  // Make server-side environment variables available to the client
  env: {
    AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY,
    AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID,
    NEXT_PUBLIC_USE_MOCK_DATA: 'false',
  },
  // For Netlify, we don't want static export
  // This ensures API routes work properly
  output: undefined,

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
