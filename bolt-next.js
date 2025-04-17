#!/usr/bin/env node

// This script is a wrapper for Next.js that loads the Bolt configuration
// It's used to run Next.js on Bolt without SWC

// Disable native addons
process.env.NODE_OPTIONS = process.env.NODE_OPTIONS || '';
process.env.NODE_OPTIONS += ' --no-addons';

// Suppress SWC warnings
process.env.NEXT_IGNORE_MISSING_SWC = '1';
process.env.NEXT_IGNORE_SWC_MINIFY = '1';
process.env.NEXT_DISABLE_SWC_MINIFY = '1';

// Set the Next.js configuration file
process.env.NEXT_CONFIG_FILE = 'next.bolt.js';

// Disable SWC
process.env.NEXT_DISABLE_SWC = '1';

// Disable telemetry
process.env.NEXT_TELEMETRY_DISABLED = '1';

// Run Next.js
const { spawn } = require('child_process');
const nextBin = require.resolve('next/dist/bin/next');
const args = process.argv.slice(2);

const nextProcess = spawn(process.execPath, [nextBin, ...args], {
  stdio: 'inherit',
  env: process.env
});

nextProcess.on('close', (code) => {
  process.exit(code);
});
