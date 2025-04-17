module.exports = {
  // Specify the Node.js version
  nodeVersion: '18.x',
  
  // Commands for Bolt to run
  commands: {
    build: 'next build',
    start: 'next start',
    dev: 'NODE_OPTIONS=\'--no-experimental-fetch\' next dev'
  },
  
  // Environment variables
  env: {
    NODE_ENV: 'production',
    NEXT_PUBLIC_BASE_URL: 'https://your-bolt-url.bolt.dev'
  },
  
  // Static file serving
  static: {
    directory: 'public'
  }
};
