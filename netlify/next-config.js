// This file configures the Next.js plugin for Netlify
module.exports = {
  // Enable Next.js server-side rendering
  useServerlessTraceTarget: true,
  // Ensure API routes work correctly
  generateSources: true,
  // Handle API routes properly
  apiRoutes: [
    '/api/auth',
    '/api/tasks',
    '/api/comments',
  ],
};
