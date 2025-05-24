import Airtable from 'airtable';

// Check if we have the required API keys
// Note: AIRTABLE_API_KEY should now be a personal access token
const apiKey = process.env.AIRTABLE_API_KEY || process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;

// For debugging purposes, log the first few characters of the token and the base ID
if (apiKey) {
  const tokenPrefix = apiKey.substring(0, 10);
  console.log('Token prefix:', tokenPrefix + '...');

  // Check if it's a personal access token (should start with 'pat')
  if (!apiKey.startsWith('pat')) {
    console.warn('Warning: API key does not appear to be a personal access token (should start with "pat")');
  }
} else {
  console.error('CRITICAL: API key is undefined!');
  console.log('Environment mode:', process.env.NODE_ENV);
  console.log('Available environment variables:', Object.keys(process.env).filter(key => 
    !key.includes('SECRET') && !key.includes('KEY') && !key.includes('TOKEN')
  ));
}

console.log('Using Airtable base ID:', baseId || 'UNDEFINED');

export const hasAirtableCredentials = !!(apiKey && baseId);

// Initialize Airtable with API key if available
let airtable: Airtable;
let base: any;

if (hasAirtableCredentials) {
  console.log('Airtable credentials found. Initializing Airtable client.');

  // Check if we're in a browser environment
  const isBrowser = typeof window !== 'undefined';

  if (isBrowser) {
    console.log('Running in browser environment. Using client-side Airtable initialization.');

    // In browser environment, we need to use the Next.js public env vars
    const publicApiKey = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY || apiKey;
    const publicBaseId = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || baseId;

    console.log('Public API Key exists:', !!publicApiKey);
    console.log('Public Base ID exists:', !!publicBaseId);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Vercel environment:', process.env.VERCEL_ENV || process.env.NEXT_PUBLIC_VERCEL_ENV || 'Not in Vercel');

    if (publicApiKey && publicBaseId) {
      try {
        airtable = new Airtable({
          apiKey: publicApiKey,
          endpointUrl: 'https://api.airtable.com',
        });

        // Get the base
        base = airtable.base(publicBaseId);
        console.log('Airtable client initialized with public credentials');
      } catch (error) {
        console.error('Error initializing Airtable client:', error);
      }
    } else {
      console.warn('Public Airtable credentials not found. Using mock data.');
      console.warn(`Public API Key exists: ${!!publicApiKey}, Public Base ID exists: ${!!publicBaseId}`);
    }
  } else {
    // Server-side initialization
    airtable = new Airtable({
      apiKey: apiKey,
      endpointUrl: 'https://api.airtable.com',
    });

    // Get the base
    if (baseId) {
      base = airtable.base(baseId);
      console.log('Airtable client initialized with server-side credentials');
    } else {
      console.warn('Base ID is undefined. Cannot initialize Airtable base.');
    }
  }
} else {
  console.warn(`Airtable API key or Base ID not found. Using mock data for build process.`);
  console.warn(`API Key exists: ${!!apiKey}, Base ID exists: ${!!baseId}`);
  console.warn('Environment: ' + process.env.NODE_ENV);
}

// Table names for the new Airtable base (based on schema)
export const TABLES = {
  // User Management
  USERS: 'Users',
  CLIENTS: 'Clients',

  // Content Management
  BRIEFS: 'Briefs',
  ARTICLES: 'Articles',
  BACKLINKS: 'Backlinks',
  CLUSTERS: 'Clusters',

  // Task Management
  TASKS: 'Tasks',
  COMMENTS: 'Comments',

  // Performance Data
  KEYWORDS: 'Keywords',
  URL_PERFORMANCE: 'URL Performance',
  KPI_METRICS: 'KPI Metrics',
  MONTHLY_PROJECTIONS: 'Monthly Projections',

  // System Tables
  INTEGRATIONS: 'Integrations',
  NOTIFICATIONS: 'Notifications',
  REPORTS: 'Reports',
  ACTIVITY_LOG: 'Activity Log'
};

// Alternative table names (in case the casing is different)
export const ALT_TABLES = {
  KPI_METRICS: ['kpi_metrics', 'kpimetrics', 'kpi metrics', 'KPIMetrics'],
  URL_PERFORMANCE: ['url_performance', 'urlperformance', 'url performance', 'URLPerformance'],
  KEYWORDS: ['keyword_performance', 'keywordperformance', 'keyword performance', 'KeywordPerformance', 'keywords'],
  MONTHLY_PROJECTIONS: ['monthly_projections', 'monthlyprojections', 'monthly projections', 'MonthlyProjections']
};

/**
 * Get the Airtable base instance
 * This function ensures we always have a valid base instance
 * @returns The Airtable base instance
 */
export function getAirtableBase() {
  // Check if we have the required API keys
  const apiKey = process.env.AIRTABLE_API_KEY || process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    console.error('Missing Airtable credentials');
    throw new Error('Missing Airtable credentials');
  }

  // If we already have a base instance, return it
  if (base) {
    return base;
  }

  // Otherwise, create a new instance
  const newAirtable = new Airtable({ apiKey });
  return newAirtable.base(baseId);
}

export { base, airtable };
