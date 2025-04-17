export default {
  // Specify the Node.js version
  nodeVersion: '18.x',
  
  // Commands for Bolt to run
  commands: {
    build: 'NODE_OPTIONS="--no-addons" next build',
    start: 'next start',
    dev: 'NODE_OPTIONS="--no-addons --max_old_space_size=4096" next dev'
  },
  
  // Environment variables
  env: {
    NODE_ENV: 'production',
    NEXT_TELEMETRY_DISABLED: '1',
    NEXT_DISABLE_SWC: '1'
  },
  
  // Static file serving
  static: {
    directory: 'public'
  },
  
  // Disable native modules
  disableNativeModules: true
};
