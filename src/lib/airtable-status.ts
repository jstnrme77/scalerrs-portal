// Track Airtable API usage and health status

// Statistics
interface AirtableStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  rateLimitHits: number;
  lastRequestTime: number | null;
  lastErrorTime: number | null;
  lastErrorMessage: string | null;
  averageResponseTime: number;
  isHealthy: boolean;
  connectionPoolSize: number;
  uptime?: number;
  successRate?: number;
}

let stats: AirtableStats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  rateLimitHits: 0,
  lastRequestTime: null,
  lastErrorTime: null,
  lastErrorMessage: null,
  averageResponseTime: 0,
  isHealthy: true,
  connectionPoolSize: 0
};

// Response time tracking
const responseTimes: number[] = [];
const MAX_RESPONSE_TIMES = 100; // Keep track of the last 100 requests for average calculation

/**
 * Record a successful Airtable request
 */
export function recordSuccess(responseTimeMs: number): void {
  stats.totalRequests++;
  stats.successfulRequests++;
  stats.lastRequestTime = Date.now();
  stats.isHealthy = true;
  
  // Track response time
  responseTimes.push(responseTimeMs);
  if (responseTimes.length > MAX_RESPONSE_TIMES) {
    responseTimes.shift();
  }
  
  // Calculate average response time
  const sum = responseTimes.reduce((acc, time) => acc + time, 0);
  stats.averageResponseTime = sum / responseTimes.length;
}

/**
 * Record a failed Airtable request
 */
export function recordFailure(error: Error): void {
  stats.totalRequests++;
  stats.failedRequests++;
  stats.lastRequestTime = Date.now();
  stats.lastErrorTime = Date.now();
  stats.lastErrorMessage = error.message;
  
  // Check for rate limit errors
  if (error.message.includes('rate limit') || error.message.includes('Rate Limit')) {
    stats.rateLimitHits++;
  }
  
  // Only mark as unhealthy if we have multiple failures
  if (stats.failedRequests > stats.successfulRequests / 10) {
    stats.isHealthy = false;
  }
}

/**
 * Update connection pool size
 */
export function updateConnectionPoolSize(size: number): void {
  stats.connectionPoolSize = size;
}

/**
 * Get current Airtable stats
 */
export function getAirtableStats(): AirtableStats {
  return {
    ...stats,
    uptime: Date.now() - (stats.lastErrorTime || Date.now()),
    successRate: stats.totalRequests 
      ? Math.round((stats.successfulRequests / stats.totalRequests) * 100) 
      : 100
  };
}

/**
 * Reset all stats
 */
export function resetStats(): void {
  stats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    rateLimitHits: 0,
    lastRequestTime: null,
    lastErrorTime: null,
    lastErrorMessage: null,
    averageResponseTime: 0,
    isHealthy: true,
    connectionPoolSize: 0
  };
  
  while (responseTimes.length > 0) {
    responseTimes.pop();
  }
} 