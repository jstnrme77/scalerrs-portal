/**
 * Cache module exports
 * 
 * Provides comprehensive caching functionality for the server-side filtering system
 */

// Main cache implementation
export {
  MemoryFilterCache,
  RedisFilterCache,
  createFilterCache,
  getFilterCache,
  resetFilterCache,
  DEFAULT_CACHE_CONFIG
} from './filter-cache';

// Cache types and interfaces
export type {
  CacheStats,
  CacheConfig,
  InvalidationStrategy
} from './filter-cache';

// Cache utilities
export {
  generateCacheKey,
  parseCacheKey
} from './filter-cache';