/**
 * Client-side caching utility for API responses
 * This helps reduce unnecessary API calls and improves performance
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresIn: number; // milliseconds
}

// In-memory cache
const cache: Record<string, CacheItem<any>> = {};

/**
 * Get data from cache or fetch from API
 * @param key Cache key
 * @param fetchFn Function to fetch data if not in cache
 * @param expiresIn Cache expiration time in milliseconds (default: 5 minutes)
 * @returns Cached or freshly fetched data
 */
export async function getFromCacheOrFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  expiresIn: number = 5 * 60 * 1000 // 5 minutes
): Promise<T> {
  // Check if we have a valid cache entry
  const now = Date.now();
  if (cache[key] && now - cache[key].timestamp < cache[key].expiresIn) {
    console.log(`Using cached data for ${key}`);
    return cache[key].data;
  }

  // Fetch fresh data
  console.log(`Fetching fresh data for ${key}`);
  const data = await fetchFn();

  // Cache the data
  cache[key] = {
    data,
    timestamp: now,
    expiresIn
  };

  return data;
}

/**
 * Clear the entire cache
 */
export function clearCache(): void {
  Object.keys(cache).forEach(key => delete cache[key]);
}

/**
 * Clear a specific cache entry
 * @param key Cache key to clear
 */
export function clearCacheEntry(key: string): void {
  if (cache[key]) {
    delete cache[key];
  }
}

/**
 * Clear cache entries that match a prefix
 * @param prefix Prefix to match
 */
export function clearCacheByPrefix(prefix: string): void {
  Object.keys(cache).forEach(key => {
    if (key.startsWith(prefix)) {
      delete cache[key];
    }
  });
}

/**
 * Get all cache keys
 * @returns Array of cache keys
 */
export function getCacheKeys(): string[] {
  return Object.keys(cache);
}

/**
 * Get cache statistics
 * @returns Object with cache statistics
 */
export function getCacheStats(): { totalEntries: number; totalSize: number } {
  const totalEntries = Object.keys(cache).length;
  let totalSize = 0;

  // Estimate size by converting to JSON and measuring string length
  Object.values(cache).forEach(item => {
    totalSize += JSON.stringify(item.data).length;
  });

  return { totalEntries, totalSize };
}
