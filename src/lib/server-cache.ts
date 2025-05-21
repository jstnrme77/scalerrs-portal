interface CacheEntry {
  data: any;
  timestamp: number;
  expiresIn: number; // Lifespan in milliseconds
}

const cache: Record<string, CacheEntry> = {};

/**
 * Sets a value in the cache.
 * @param key The cache key.
 * @param data The data to store.
 * @param expiresIn Lifespan of the cache entry in milliseconds.
 */
export function setCache(key: string, data: any, expiresIn: number): void {
  console.log(`[CACHE] Setting cache for key: ${key}, expiresIn: ${expiresIn}ms`);
  cache[key] = {
    data,
    timestamp: Date.now(),
    expiresIn,
  };
}

/**
 * Retrieves a value from the cache.
 * @param key The cache key.
 * @returns The cached data, or null if not found or expired.
 */
export function getCache(key: string): any | null {
  const entry = cache[key];
  if (!entry) {
    // console.log(`[CACHE] Miss for key: ${key}`);
    return null;
  }

  if (Date.now() - entry.timestamp > entry.expiresIn) {
    console.log(`[CACHE] Expired for key: ${key}`);
    delete cache[key]; // Remove expired entry
    return null;
  }

  // console.log(`[CACHE] Hit for key: ${key}`);
  return entry.data;
}

/**
 * Checks if a cache entry is still valid (exists and not expired).
 * @param key The cache key.
 * @param expiresIn Optional: if provided, checks against this specific expiresIn, otherwise uses stored expiresIn.
 *                  This is useful if the desired cache duration changes.
 * @returns True if the cache is valid, false otherwise.
 */
export function isCacheValid(key: string, expiresIn?: number): boolean {
  const entry = cache[key];
  if (!entry) {
    return false;
  }

  const currentExpiresIn = expiresIn !== undefined ? expiresIn : entry.expiresIn;
  if (Date.now() - entry.timestamp > currentExpiresIn) {
    // console.log(`[CACHE] Invalid (expired) for key: ${key}`);
    // Don't delete here, getCache will handle deletion on access if expired.
    return false;
  }
  return true;
}

/**
 * Clears all cache entries.
 */
export function clearAllCache(): void {
  console.log('[CACHE] Clearing all cache entries.');
  Object.keys(cache).forEach(key => delete cache[key]);
}

/**
 * Clears a specific cache entry by key.
 * @param key The cache key to clear.
 */
export function clearCacheEntry(key: string): void {
  console.log(`[CACHE] Clearing cache entry: ${key}`);
  if (cache[key]) {
    delete cache[key];
  }
}

/**
 * Clears all cache entries whose keys start with the given prefix.
 * @param prefix The prefix to match.
 */
export function clearCacheForPrefix(prefix: string): void {
  console.log(`[CACHE] Clearing cache entries with prefix: ${prefix}`);
  Object.keys(cache).forEach(key => {
    if (key.startsWith(prefix)) {
      // console.log(`[CACHE] Deleting prefixed key: ${key}`);
      delete cache[key];
    }
  });
}
