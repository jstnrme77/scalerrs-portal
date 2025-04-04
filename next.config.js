/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Configure for GitHub Pages - modify this to match your repository name
  basePath: process.env.NODE_ENV === 'production' ? '/scalerrs-portal' : '',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
