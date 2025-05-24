/**
 * Filter cache implementation for server-side filtering system
 * 
 * Provides memory caching for filter results with configurable TTL,
 * cache invalidation strategies, and performance monitoring.
 * Supports both in-memory and Redis caching (configurable).
 */

import { FilterState, ApiFilterResponse } from '@/types/filters';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

/**
 * Cache entry structure
 */
interface CacheEntry<T = unknown> {
  data: ApiFilterResponse<T>;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  key: string;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalEntries: number;
  memoryUsage: number;
  oldestEntry?: number;
  newestEntry?: number;
  averageAccessCount: number;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  /** Maximum number of entries to store */
  maxEntries: number;
  
  /** Default TTL in milliseconds */
  defaultTtl: number;
  
  /** Whether to use Redis for distributed caching */
  useRedis: boolean;
  
  /** Redis connection string (if using Redis) */
  redisUrl?: string;
  
  /** Cache key prefix */
  keyPrefix: string;
  
  /** Whether to enable cache statistics */
  enableStats: boolean;
  
  /** Cleanup interval in milliseconds */
  cleanupInterval: number;
}

/**
 * Cache invalidation strategy
 */
export type InvalidationStrategy = 
  | 'time-based'    // Invalidate based on TTL
  | 'lru'          // Least Recently Used
  | 'lfu'          // Least Frequently Used
  | 'manual';      // Manual invalidation only

// ============================================================================
// CACHE KEY GENERATION
// ============================================================================

/**
 * Generate a cache key from filter parameters
 */
export function generateCacheKey(
  endpoint: string,
  filters: FilterState,
  userContext?: { userId?: string; role?: string; clientIds?: string[] }
): string {
  // Create a deterministic key from filters
  const filterKey = JSON.stringify(filters, Object.keys(filters).sort());
  const userKey = userContext ? JSON.stringify(userContext, Object.keys(userContext).sort()) : '';
  
  // Create hash of the combined key to keep it manageable
  const combinedKey = `${endpoint}:${filterKey}:${userKey}`;
  return btoa(combinedKey).replace(/[+/=]/g, ''); // Base64 encode and remove special chars
}

/**
 * Parse cache key to extract components
 */
export function parseCacheKey(key: string): {
  endpoint?: string;
  filters?: FilterState;
  userContext?: Record<string, unknown>;
} {
  try {
    const decoded = atob(key);
    const [endpoint, filterStr, userStr] = decoded.split(':');
    
    return {
      endpoint,
      filters: filterStr ? JSON.parse(filterStr) : undefined,
      userContext: userStr ? JSON.parse(userStr) : undefined
    };
  } catch (error) {
    console.warn('Failed to parse cache key:', error);
    return {};
  }
}

// ============================================================================
// IN-MEMORY CACHE IMPLEMENTATION
// ============================================================================

/**
 * In-memory cache implementation with LRU eviction
 */
export class MemoryFilterCache {
  private cache = new Map<string, CacheEntry>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    totalEntries: 0,
    memoryUsage: 0,
    averageAccessCount: 0
  };
  private cleanupTimer?: NodeJS.Timeout;

  constructor(private config: CacheConfig) {
    if (config.enableStats && config.cleanupInterval > 0) {
      this.startCleanupTimer();
    }
  }

  /**
   * Get cached data
   */
  async get<T = unknown>(key: string): Promise<ApiFilterResponse<T> | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    
    this.stats.hits++;
    this.updateHitRate();
    
    return entry.data as ApiFilterResponse<T>;
  }

  /**
   * Set cached data
   */
  async set<T = unknown>(
    key: string, 
    data: ApiFilterResponse<T>, 
    ttl?: number
  ): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTtl,
      accessCount: 0,
      lastAccessed: Date.now(),
      key
    };

    // Check if we need to evict entries
    if (this.cache.size >= this.config.maxEntries) {
      this.evictLeastRecentlyUsed();
    }

    this.cache.set(key, entry);
    this.updateStats();
  }

  /**
   * Delete cached entry
   */
  async delete(key: string): Promise<boolean> {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.updateStats();
    }
    return deleted;
  }

  /**
   * Clear all cached entries
   */
  async clear(): Promise<void> {
    this.cache.clear();
    this.resetStats();
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    this.updateStats();
    return { ...this.stats };
  }

  /**
   * Invalidate entries based on pattern
   */
  async invalidatePattern(pattern: RegExp): Promise<number> {
    let invalidated = 0;
    
    for (const [key] of this.cache) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        invalidated++;
      }
    }
    
    if (invalidated > 0) {
      this.updateStats();
    }
    
    return invalidated;
  }

  /**
   * Invalidate entries for specific endpoint
   */
  async invalidateEndpoint(endpoint: string): Promise<number> {
    const pattern = new RegExp(`^${btoa(endpoint + ':')}`);
    return this.invalidatePattern(pattern);
  }

  /**
   * Get memory usage estimate
   */
  getMemoryUsage(): number {
    let size = 0;
    for (const [key, entry] of this.cache) {
      size += key.length * 2; // String characters are 2 bytes
      size += JSON.stringify(entry).length * 2;
    }
    return size;
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      this.updateStats();
    }
    
    return cleaned;
  }

  /**
   * Destroy cache and cleanup resources
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.cache.clear();
    this.resetStats();
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private evictLeastRecentlyUsed(): void {
    let oldestKey = '';
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.cache) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  private updateStats(): void {
    this.stats.totalEntries = this.cache.size;
    this.stats.memoryUsage = this.getMemoryUsage();
    
    if (this.cache.size > 0) {
      const entries = Array.from(this.cache.values());
      this.stats.oldestEntry = Math.min(...entries.map(e => e.timestamp));
      this.stats.newestEntry = Math.max(...entries.map(e => e.timestamp));
      this.stats.averageAccessCount = entries.reduce((sum, e) => sum + e.accessCount, 0) / entries.length;
    }
    
    this.updateHitRate();
  }

  private resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalEntries: 0,
      memoryUsage: 0,
      averageAccessCount: 0
    };
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }
}

// ============================================================================
// REDIS CACHE IMPLEMENTATION (PLACEHOLDER)
// ============================================================================

/**
 * Redis cache implementation for distributed caching
 * Note: This is a placeholder implementation. In a real application,
 * you would use a Redis client like ioredis or node-redis.
 */
export class RedisFilterCache {
  constructor(private config: CacheConfig) {
    // Initialize Redis connection
    console.warn('Redis cache not implemented yet. Using memory cache fallback.');
  }

  async get<T = unknown>(key: string): Promise<ApiFilterResponse<T> | null> {
    // TODO: Implement Redis get
    return null;
  }

  async set<T = unknown>(
    key: string, 
    data: ApiFilterResponse<T>, 
    ttl?: number
  ): Promise<void> {
    // TODO: Implement Redis set
  }

  async delete(key: string): Promise<boolean> {
    // TODO: Implement Redis delete
    return false;
  }

  async clear(): Promise<void> {
    // TODO: Implement Redis clear
  }

  async invalidatePattern(pattern: RegExp): Promise<number> {
    // TODO: Implement Redis pattern invalidation
    return 0;
  }

  async invalidateEndpoint(endpoint: string): Promise<number> {
    // TODO: Implement Redis endpoint invalidation
    return 0;
  }

  getStats(): CacheStats {
    // TODO: Implement Redis stats
    return {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalEntries: 0,
      memoryUsage: 0,
      averageAccessCount: 0
    };
  }

  destroy(): void {
    // TODO: Cleanup Redis connection
  }
}

// ============================================================================
// CACHE FACTORY
// ============================================================================

/**
 * Create a cache instance based on configuration
 */
export function createFilterCache(config: CacheConfig) {
  if (config.useRedis) {
    return new RedisFilterCache(config);
  }
  return new MemoryFilterCache(config);
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

/**
 * Default cache configuration
 */
export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  maxEntries: 1000,
  defaultTtl: 5 * 60 * 1000, // 5 minutes
  useRedis: false,
  keyPrefix: 'filter_cache:',
  enableStats: true,
  cleanupInterval: 60 * 1000 // 1 minute
};

// ============================================================================
// SINGLETON CACHE INSTANCE
// ============================================================================

let globalCache: MemoryFilterCache | RedisFilterCache | null = null;

/**
 * Get the global cache instance
 */
export function getFilterCache(config?: Partial<CacheConfig>) {
  if (!globalCache) {
    const finalConfig = { ...DEFAULT_CACHE_CONFIG, ...config };
    globalCache = createFilterCache(finalConfig);
  }
  return globalCache;
}

/**
 * Reset the global cache instance
 */
export function resetFilterCache() {
  if (globalCache) {
    globalCache.destroy();
    globalCache = null;
  }
}