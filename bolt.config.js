module.exports = {
  // Specify the Node.js version
  nodeVersion: '18.x',

  // Commands for Bolt to run
  commands: {
    build: 'next build',
    start: 'next start',
    dev: 'next dev'
  },

  // Environment variables
  env: {
    NODE_ENV: 'production',
    NEXT_TELEMETRY_DISABLED: '1',
    NEXT_DISABLE_SWC: '1',
    NEXT_IGNORE_MISSING_SWC: '1',
    NODE_OPTIONS: '--no-addons'
  },

  // Static file serving
  static: {
    directory: 'public'
  }
};
