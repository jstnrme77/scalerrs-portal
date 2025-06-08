import Airtable from 'airtable';

// Configuration
const CONFIG = {
  maxRequestsPerMinute: 180, // Airtable's limit is 5 requests per second
  cacheExpiration: 5 * 60 * 1000, // 5 minutes in milliseconds
  maxRetries: 3,
  retryDelayMs: 1000
};

// Type definitions
interface CacheEntry {
  data: any;
  timestamp: number;
}

interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  oldestEntry: number | null;
  newestEntry: number | null;
}

// Stats tracking
let requestCount = 0;
let requestsLastMinute = 0;
let lastResetTime = Date.now();
let lastRequestTime = 0;

// Cache
const cache: Map<string, CacheEntry> = new Map();
let cacheHits = 0;
let cacheMisses = 0;

/**
 * Apply rate limiting to Airtable requests
 */
async function applyRateLimit(): Promise<void> {
  const now = Date.now();
  
  // Reset counter if a minute has passed
  if (now - lastResetTime > 60000) {
    requestsLastMinute = 0;
    lastResetTime = now;
  }
  
  // Check if we've hit the rate limit
  if (requestsLastMinute >= CONFIG.maxRequestsPerMinute) {
    const waitTime = 60000 - (now - lastResetTime);
    console.warn(`Rate limit reached, waiting ${waitTime}ms before next request`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
    requestsLastMinute = 0;
    lastResetTime = Date.now();
  }
  
  // Apply minimum delay between requests
  const timeSinceLastRequest = now - lastRequestTime;
  const minDelay = 60000 / CONFIG.maxRequestsPerMinute;
  
  if (timeSinceLastRequest < minDelay) {
    const delay = minDelay - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  // Update stats
  requestCount++;
  requestsLastMinute++;
  lastRequestTime = Date.now();
}

/**
 * Get data from cache or fetch from Airtable with rate limiting
 */
export async function getRateLimitedData(
  tableName: string,
  options: any,
  cacheKey: string,
  fetchFn: () => Promise<any>
): Promise<any> {
  // Check cache first
  if (cache.has(cacheKey)) {
    const cacheEntry = cache.get(cacheKey)!;
    const now = Date.now();
    
    if (now - cacheEntry.timestamp < CONFIG.cacheExpiration) {
      cacheHits++;
      return cacheEntry.data;
    }
    
    // Cache expired, remove it
    cache.delete(cacheKey);
  }
  
  cacheMisses++;
  
  // Apply rate limiting
  await applyRateLimit();
  
  // Retry mechanism
  let attempt = 0;
  let lastError;
  
  while (attempt < CONFIG.maxRetries) {
    try {
      const data = await fetchFn();
      
      // Cache the result
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      lastError = error;
      attempt++;
      
      if (attempt < CONFIG.maxRetries) {
        const delay = CONFIG.retryDelayMs * attempt;
        console.warn(`Airtable request failed, retrying in ${delay}ms (attempt ${attempt}/${CONFIG.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error('Airtable request failed after multiple retries:', lastError);
  throw lastError;
}

/**
 * Clear the Airtable cache
 */
export function clearAirtableCache(): void {
  const size = cache.size;
  cache.clear();
  console.log(`Cleared ${size} entries from Airtable cache`);
  cacheHits = 0;
  cacheMisses = 0;
}

/**
 * Get cache statistics
 */
export function getCacheStats(): CacheStats {
  // Find oldest and newest entries
  let oldestTimestamp: number | null = null;
  let newestTimestamp: number | null = null;
  
  for (const entry of cache.values()) {
    if (oldestTimestamp === null || entry.timestamp < oldestTimestamp) {
      oldestTimestamp = entry.timestamp;
    }
    
    if (newestTimestamp === null || entry.timestamp > newestTimestamp) {
      newestTimestamp = entry.timestamp;
    }
  }
  
  return {
    size: cache.size,
    hits: cacheHits,
    misses: cacheMisses,
    oldestEntry: oldestTimestamp,
    newestEntry: newestTimestamp
  };
}

/**
 * Initialize a rate-limited Airtable base instance
 */
export function getAirtableBase(): Airtable.Base {
  const apiKey = process.env.AIRTABLE_API_KEY || process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;
  
  if (!apiKey || !baseId) {
    throw new Error('Missing Airtable credentials');
  }
  
  return new Airtable({ apiKey }).base(baseId);
}

/**
 * Get request stats
 */
export function getRequestStats() {
  return {
    totalRequests: requestCount,
    requestsLastMinute,
    lastResetTime,
    lastRequestTime
  };
} 