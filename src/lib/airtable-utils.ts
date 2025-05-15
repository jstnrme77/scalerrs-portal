/**
 * Centralized utilities for Airtable integration
 * This file contains shared functions and configuration for Airtable
 */
import Airtable from 'airtable';
import { TABLES, ALT_TABLES } from './airtable-tables';

// Export the tables for convenience
export { TABLES, ALT_TABLES };

// Default cache duration: 5 minutes (in milliseconds)
export const DEFAULT_CACHE_DURATION = 5 * 60 * 1000;

/**
 * Check if we're in a browser environment
 */
export const isBrowser = typeof window !== 'undefined';

/**
 * Check if we're on Netlify
 */
export const isNetlify = () => {
  if (!isBrowser) return false;
  return window.location.hostname.includes('netlify.app');
};

/**
 * Get Airtable API key and Base ID from environment variables
 */
export const getAirtableCredentials = () => {
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
  }

  console.log('Using Airtable base ID:', baseId);

  return {
    apiKey,
    baseId,
    hasCredentials: !!(apiKey && baseId)
  };
};

// Initialize Airtable singleton
let airtableInstance: Airtable | null = null;
let baseInstance: Airtable.Base | null = null;

/**
 * Get or initialize the Airtable client
 * This is a singleton factory function to ensure we only create one instance
 */
export const getAirtableClient = () => {
  const { apiKey, baseId, hasCredentials } = getAirtableCredentials();

  if (!hasCredentials) {
    console.warn('Airtable credentials not found. Using mock data.');
    return { airtable: null, base: null, hasCredentials: false };
  }

  if (!airtableInstance) {
    try {
      airtableInstance = new Airtable({
        apiKey: apiKey!,
        endpointUrl: 'https://api.airtable.com',
      });

      baseInstance = airtableInstance.base(baseId!);
      console.log('Airtable client initialized successfully');
    } catch (error) {
      console.error('Error initializing Airtable client:', error);
      return { airtable: null, base: null, hasCredentials: false };
    }
  }

  return {
    airtable: airtableInstance,
    base: baseInstance,
    hasCredentials: true
  };
};

/**
 * Function to determine if we should use mock data
 * This happens if explicitly enabled or if API calls fail
 */
export const shouldUseMockData = () => {
  // If we're on the server, check if we have valid Airtable credentials
  if (!isBrowser) {
    const { apiKey, baseId } = getAirtableCredentials();
    return !apiKey || !baseId;
  }

  // Check if mock data is explicitly enabled
  const useMockData =
    process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' ||
    (typeof window !== 'undefined' && (window as any).env?.NEXT_PUBLIC_USE_MOCK_DATA === 'true') ||
    (typeof window !== 'undefined' && localStorage.getItem('use-mock-data') === 'true');

  // Check if we're on Netlify and having issues with Airtable
  const isNetlifyWithAirtableIssues =
    isNetlify() &&
    localStorage.getItem('airtable-connection-issues') === 'true';

  // Return true if either condition is met
  return useMockData || isNetlifyWithAirtableIssues;
};

/**
 * Create a timeout controller for fetch requests
 * @param timeoutMs Timeout in milliseconds
 * @returns Controller and cleanup function
 */
export const createRequestTimeout = (timeoutMs: number = 15000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    // Add a reason when aborting to avoid "signal is aborted without reason" error
    controller.abort(new DOMException('Timeout exceeded', 'TimeoutError'));
  }, timeoutMs);

  return {
    signal: controller.signal,
    cleanup: () => clearTimeout(timeoutId),
    controller
  };
};

/**
 * Ensure client IDs are in array format
 * @param clientId Client ID or array of client IDs
 * @returns Array of client IDs
 */
export const ensureClientIdArray = (clientId: string | string[] | null | undefined): string[] => {
  if (!clientId) return [];
  return Array.isArray(clientId) ? clientId : [clientId];
};

/**
 * Set a flag in localStorage to indicate Airtable connection issues
 */
export const setAirtableConnectionIssue = () => {
  if (isBrowser) {
    console.log('Setting airtable-connection-issues flag in localStorage');
    localStorage.setItem('airtable-connection-issues', 'true');
  }
};

/**
 * Generic function to fetch data from Airtable with fallback to mock data
 * @param tableName The Airtable table name
 * @param options Query options
 * @param mockData Mock data to use as fallback
 * @returns The fetched data or mock data
 */
export const fetchFromAirtableWithFallback = async <T>(
  tableName: string,
  options: {
    filterFormula?: string;
    sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
    maxRecords?: number;
    fields?: string[];
  },
  mockData: T
): Promise<T> => {
  // Check if we should use mock data
  if (shouldUseMockData()) {
    console.log(`Using mock data for ${tableName}`);
    return mockData;
  }

  // Get Airtable client
  const { base, hasCredentials } = getAirtableClient();

  if (!hasCredentials || !base) {
    console.log(`No Airtable credentials for ${tableName}, using mock data`);
    return mockData;
  }

  try {
    console.log(`Fetching ${tableName} from Airtable...`);

    // Build the query
    const query: Record<string, any> = {};

    if (options.filterFormula) {
      query.filterByFormula = options.filterFormula;
    }

    if (options.sort) {
      query.sort = options.sort;
    }

    if (options.maxRecords) {
      query.maxRecords = options.maxRecords;
    }

    if (options.fields) {
      query.fields = options.fields;
    }

    // Execute the query
    const records = await base(tableName).select(query).all();
    console.log(`Successfully fetched ${records.length} records from ${tableName}`);

    // Map records to the expected format
    return records.map((record: { id: string; fields: Record<string, unknown> }) => ({
      id: record.id,
      ...record.fields
    })) as unknown as T;
  } catch (error) {
    console.error(`Error fetching ${tableName} from Airtable:`, error);

    // Set connection issues flag
    setAirtableConnectionIssue();

    // Fall back to mock data
    console.log(`Falling back to mock data for ${tableName}`);
    return mockData;
  }
};
