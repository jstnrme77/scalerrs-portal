/**
 * Airtable Comments Service
 * Provides a comprehensive service layer for managing Airtable's built-in record comments
 * with caching, rate limiting, and retry mechanisms
 */
import { AirtableComment } from '@/types/airtable-comments';

// Service configuration
const SERVICE_CONFIG = {
  maxRetries: 3,
  retryDelayMs: 1000,
  rateLimitDelayMs: 250, // 4 requests per second
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  requestTimeout: 10000 // 10 seconds
};

// Cache entry interface
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

// In-memory cache
class MemoryCache {
  private cache = new Map<string, CacheEntry>();

  set(key: string, data: any, ttl: number = SERVICE_CONFIG.cacheTimeout): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  invalidate(key: string): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

const cache = new MemoryCache();

// Helper function to get Airtable credentials
function getAirtableCredentials() {
  const apiKey = process.env.AIRTABLE_API_KEY || process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    throw new Error('Missing Airtable credentials');
  }

  return { apiKey, baseId };
}

// Rate limiting
let lastRequestTime = 0;

async function applyRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < SERVICE_CONFIG.rateLimitDelayMs) {
    const delay = SERVICE_CONFIG.rateLimitDelayMs - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  lastRequestTime = Date.now();
}

// Retry logic with exponential backoff
async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= SERVICE_CONFIG.maxRetries; attempt++) {
    try {
      await applyRateLimit();
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.error(`${operationName} attempt ${attempt}/${SERVICE_CONFIG.maxRetries} failed:`, lastError.message);
      
      if (attempt < SERVICE_CONFIG.maxRetries) {
        const delay = SERVICE_CONFIG.retryDelayMs * attempt; // Exponential backoff
        console.log(`Retrying ${operationName} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error(`Failed after ${SERVICE_CONFIG.maxRetries} attempts`);
}

// Health check
let isHealthy = true;

export function getServiceHealth(): boolean {
  return isHealthy;
}

/**
 * Airtable Comments Service
 * Main service class for handling Airtable comments operations
 */
export class AirtableCommentsService {
  // Use Keywords table for both keywords and backlinks as requested
  private static defaultTableName = 'Keywords';

  /**
   * Get comments for a specific record using Airtable's built-in comments API
   */
  static async getComments(recordId: string, useCache: boolean = true, tableName: string = this.defaultTableName): Promise<AirtableComment[]> {
    if (!recordId) {
      console.warn('AirtableCommentsService.getComments: No recordId provided');
      return [];
    }

    const cacheKey = `comments_${tableName}_${recordId}`;

    // Try cache first if enabled
    if (useCache) {
      const cachedComments = cache.get(cacheKey);
      if (cachedComments) {
        console.log(`AirtableCommentsService.getComments: Using cached comments for ${recordId}`);
        return cachedComments;
      }
    }

    try {
      const comments = await withRetry(async () => {
        const { apiKey, baseId } = getAirtableCredentials();
        
        // Use Airtable's built-in comments API endpoint
        const url = `https://api.airtable.com/v0/${baseId}/${tableName}/${recordId}/comments`;
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(SERVICE_CONFIG.requestTimeout)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        return (data.comments || []).map((comment: any) => ({
          id: comment.id,
          text: comment.text || '',
          author: comment.author?.name || comment.author?.email || 'Unknown',
          timestamp: comment.createdTime ? new Date(comment.createdTime).toLocaleDateString() : new Date().toLocaleDateString(),
          contentType: '', // Not available in built-in comments
          recordId: recordId,
          createdAt: comment.createdTime || new Date().toISOString()
        }));
      }, `getComments(${recordId})`);

      // Cache the results
      if (useCache) {
        cache.set(cacheKey, comments);
      }

      console.log(`AirtableCommentsService.getComments: Found ${comments.length} comments for ${recordId}`);
      isHealthy = true;
      return comments;

    } catch (error) {
      console.error(`AirtableCommentsService.getComments: Error for ${recordId}:`, error);
      isHealthy = false;
      return [];
    }
  }

  /**
   * Add a new comment to a record using Airtable's built-in comments API
   */
  static async addComment(
    recordId: string,
    text: string,
    author?: string,
    contentType?: string,
    tableName: string = this.defaultTableName
  ): Promise<AirtableComment> {
    if (!recordId || !text) {
      throw new Error('Record ID and text are required');
    }

    const comment = await withRetry(async () => {
      const { apiKey, baseId } = getAirtableCredentials();
      
      // Use Airtable's built-in comments API endpoint
      const url = `https://api.airtable.com/v0/${baseId}/${tableName}/${recordId}/comments`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text.trim()
        }),
        signal: AbortSignal.timeout(SERVICE_CONFIG.requestTimeout)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      return {
        id: data.id,
        text: data.text || text,
        author: data.author?.name || data.author?.email || author || 'Anonymous User',
        timestamp: data.createdTime ? new Date(data.createdTime).toLocaleDateString() : new Date().toLocaleDateString(),
        contentType: contentType || '',
        recordId,
        createdAt: data.createdTime || new Date().toISOString()
      };
    }, `addComment(${recordId})`);

    // Invalidate cache for this record
    cache.invalidate(`comments_${tableName}_${recordId}`);
    cache.invalidate(`count_${tableName}_${recordId}`);

    console.log(`AirtableCommentsService.addComment: Added comment to ${recordId}`);
    isHealthy = true;
    return comment;
  }

  /**
   * Get comment count for a record
   */
  static async getCommentCount(recordId: string, useCache: boolean = true, tableName: string = this.defaultTableName): Promise<number> {
    if (!recordId) {
      return 0;
    }

    const cacheKey = `count_${tableName}_${recordId}`;

    // Try cache first if enabled
    if (useCache) {
      const cachedCount = cache.get(cacheKey);
      if (cachedCount !== null) {
        return cachedCount;
      }
    }

    try {
      const comments = await this.getComments(recordId, useCache, tableName);
      const count = comments.length;

      // Cache the count
      if (useCache) {
        cache.set(cacheKey, count);
      }

      return count;
    } catch (error) {
      console.error(`AirtableCommentsService.getCommentCount: Error for ${recordId}:`, error);
      return 0;
    }
  }

  /**
   * Batch operations for multiple records
   */
  static async getBatchComments(recordIds: string[], tableName: string = this.defaultTableName): Promise<{ [recordId: string]: AirtableComment[] }> {
    const results: { [recordId: string]: AirtableComment[] } = {};

    // Process records in batches to avoid overwhelming the API
    const batchSize = 5;
    for (let i = 0; i < recordIds.length; i += batchSize) {
      const batch = recordIds.slice(i, i + batchSize);
      
      const promises = batch.map(async (recordId) => {
        try {
          const comments = await this.getComments(recordId, true, tableName);
          return { recordId, comments };
        } catch (error) {
          console.error(`Error getting comments for record ${recordId}:`, error);
          return { recordId, comments: [] };
        }
      });

      const batchResults = await Promise.all(promises);
      batchResults.forEach(({ recordId, comments }) => {
        results[recordId] = comments;
      });

      // Rate limiting between batches
      if (i + batchSize < recordIds.length) {
        await applyRateLimit();
      }
    }

    return results;
  }

  /**
   * Clear cache for specific record or all cache
   */
  static clearCache(recordId?: string, tableName: string = this.defaultTableName): void {
    if (recordId) {
      cache.invalidate(`comments_${tableName}_${recordId}`);
      cache.invalidate(`count_${tableName}_${recordId}`);
    } else {
      cache.clear();
    }
  }
} 