/**
 * Client API utilities for making API requests from the client side
 * This file provides a more efficient and maintainable way to make API requests
 */
import { fetchWithFallback, getApiUrl, getCurrentUser, prepareUserHeaders } from './api-utils';
import { shouldUseMockData } from './airtable-utils';
import * as mockData from './mock-data';
import { getFromCacheOrFetch, clearCacheByPrefix } from './client-cache';

/**
 * Generic function to fetch data from the API
 * @param endpoint API endpoint
 * @param options Request options
 * @param mockDataFallback Mock data to use as fallback
 * @param signal AbortSignal for cancellation
 * @returns Fetched data
 */
async function fetchFromApi<T>(
  endpoint: string,
  options: RequestInit = {},
  mockDataFallback: T,
  signal?: AbortSignal
): Promise<T> {
  // Check if we should use mock data
  if (shouldUseMockData()) {
    console.log(`Using mock data for ${endpoint} because shouldUseMockData() returned true`);
    return mockDataFallback;
  }

  // Get the current user
  const currentUser = getCurrentUser();

  // Prepare headers with user information
  const headers = prepareUserHeaders(currentUser);

  // Merge headers with options
  const mergedOptions: RequestInit = {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {})
    }
  };

  // Add the signal if provided
  if (signal) {
    mergedOptions.signal = signal;
  }

  // Get the API URL
  const apiUrl = getApiUrl(endpoint);

  // Make the request
  return fetchWithFallback<T>(apiUrl, mergedOptions, mockDataFallback);
}

/**
 * Fetch tasks from the API
 * @returns Array of tasks
 */
export async function fetchTasks() {
  return fetchFromApi('tasks', {}, mockData.mockTasks);
}

/**
 * Update task status via the API
 * @param taskId Task ID
 * @param newStatus New status
 * @returns Updated task
 */
export async function updateTaskStatus(taskId: string, newStatus: string) {
  return fetchFromApi(
    'tasks',
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, newStatus })
    },
    { success: true }
  );
}

/**
 * Fetch comments for a task from the API
 * @param taskId Task ID
 * @returns Array of comments
 */
export async function fetchComments(taskId: string) {
  return fetchFromApi(
    `comments?taskId=${taskId}`,
    {},
    mockData.mockComments.filter(comment =>
      Array.isArray(comment.Task) && comment.Task.includes(taskId)
    )
  );
}

/**
 * Add a comment to a task via the API
 * @param taskId Task ID
 * @param text Comment text
 * @returns Added comment
 */
export async function addComment(taskId: string, text: string) {
  return fetchFromApi(
    'comments',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, text })
    },
    { success: true }
  );
}

/**
 * Fetch briefs from the API
 * @param month Month to filter by
 * @returns Array of briefs
 */
export async function fetchBriefs(month?: string) {
  const queryParams = month ? `?month=${encodeURIComponent(month)}` : '';
  const response = await fetchFromApi<{ briefs: any[] }>(`briefs${queryParams}`, {}, { briefs: mockData.mockBriefs });
  return response.briefs;
}

/**
 * Update brief status via the API
 * @param briefId Brief ID
 * @param newStatus New status
 * @returns Updated brief
 */
export async function updateBriefStatus(briefId: string, newStatus: string) {
  return fetchFromApi(
    'briefs',
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ briefId, newStatus })
    },
    { success: true }
  );
}

/**
 * Fetch articles from the API
 * @param month Month to filter by
 * @returns Array of articles
 */
export async function fetchArticles(month?: string) {
  const queryParams = month ? `?month=${encodeURIComponent(month)}` : '';
  const response = await fetchFromApi<{ articles: any[] }>(`articles${queryParams}`, {}, { articles: mockData.mockArticles });
  return response.articles;
}

/**
 * Update article status via the API
 * @param articleId Article ID
 * @param newStatus New status
 * @returns Updated article
 */
export async function updateArticleStatus(articleId: string, newStatus: string) {
  return fetchFromApi(
    'articles',
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articleId, newStatus })
    },
    { success: true }
  );
}

/**
 * Fetch backlinks from the API
 * @param month Month to filter by
 * @returns Array of backlinks
 */
export async function fetchBacklinks(month?: string) {
  const queryParams = month ? `?month=${encodeURIComponent(month)}` : '';
  const response = await fetchFromApi<{ backlinks: any[] }>(`backlinks${queryParams}`, {}, { backlinks: mockData.mockBacklinks });
  return response.backlinks;
}

/**
 * Update backlink status via the API
 * @param backlinkId Backlink ID
 * @param newStatus New status
 * @returns Updated backlink
 */
export async function updateBacklinkStatus(backlinkId: string, newStatus: string) {
  return fetchFromApi(
    'backlinks',
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ backlinkId, newStatus })
    },
    { success: true }
  );
}

/**
 * URL Performance functionality has been removed as it's no longer used
 * @deprecated This function is no longer used and has been removed
 */
export async function fetchURLPerformance() {
  console.log('URL Performance functionality has been removed');
  return [];
}

/**
 * Fetch KPI metrics from the API
 * @returns Array of KPI metrics
 */
export async function fetchKPIMetrics() {
  const response = await fetchFromApi<{ metrics: any[] }>('kpi-metrics', {}, { metrics: mockData.mockKPIMetrics });
  return response.metrics;
}

/**
 * Fetch keyword performance data from the API
 * @returns Array of keyword performance data
 */
export async function fetchKeywordPerformance() {
  const response = await fetchFromApi<{ keywords: any[] }>('keyword-performance', {}, { keywords: mockData.mockKeywordPerformance });
  return response.keywords;
}

/**
 * Fetch clients from the API
 * @returns Array of clients
 */
export async function fetchClients() {
  const response = await fetchFromApi<{ clients: any[] }>('clients', {}, { clients: mockData.mockClients });
  return response.clients;
}

/**
 * Fetch available months from the API
 * @param signal Optional AbortSignal for cancellation
 * @returns Array of available months
 */
export async function fetchAvailableMonths(signal?: AbortSignal) {
  const response = await fetchFromApi<string[]>('months', {}, mockData.mockMonths, signal);
  return response;
}



/**
 * Fetch approval items from the API with pagination and caching
 * @param type Type of approval items to fetch (keywords, briefs, articles)
 * @param page Page number to fetch
 * @param pageSize Number of items per page
 * @param offset Offset for pagination (from Airtable)
 * @param signal Optional AbortSignal for cancellation
 * @param useCache Whether to use cache (default: true)
 * @returns Object with items array and pagination info
 */
export async function fetchApprovalItems(
  type: string,
  page: number = 1,
  pageSize: number = 10,
  offset?: string,
  signal?: AbortSignal,
  useCache: boolean = true, // Changed back to true now that we have data
  clientId?: string,
  status?: string // Add status parameter
) {
  // Create a cache key based on the parameters including clientId and status
  const clientKey = clientId ? `_client_${clientId}` : '';
  // Always include the page in the cache key to ensure proper pagination
  const pageKey = `_page_${page}`;
  const statusKey = status ? `_status_${status}` : '';
  // Include pageSize in the cache key to ensure proper caching
  const pageSizeKey = `_pageSize_${pageSize}`;
  const cacheKey = `approvals_${type}${pageKey}${pageSizeKey}_${offset || ''}${clientKey}${statusKey}`;

  // If we're not using cache, clear the cache entry first
  if (!useCache) {
    clearCacheByPrefix(`approvals_${type}`);
  }

  // Use our caching utility to get data from cache or fetch from API
  return getFromCacheOrFetch(
    cacheKey,
    async () => {
      const queryParams = new URLSearchParams({
        type,
        page: page.toString(),
        pageSize: pageSize.toString()
      });

      // Add offset if provided
      if (offset) {
        queryParams.append('offset', offset);
      }

      // Add client ID if provided
      if (clientId) {
        // Always pass the clientId, even if it's 'all'
        queryParams.append('clientId', clientId);
      }

      // Add status if provided
      if (status) {
        queryParams.append('status', status);
      }

      // Fetch from API with fallback to mock data
      const response = await fetchFromApi<{
        items: any[],
        pagination: {
          currentPage: number;
          totalPages: number;
          totalItems: number;
          hasNextPage: boolean;
          hasPrevPage: boolean;
          nextOffset: string | null;
          prevOffset: string | null;
        }
      }>(`approvals?${queryParams.toString()}`, {}, {
        items: type === 'briefs' ? mockData.mockBriefs :
               type === 'articles' ? mockData.mockArticles :
               type === 'backlinks' ? mockData.mockBacklinks :
               mockData.mockKeywordPerformance,
        pagination: {
          currentPage: page,
          totalPages: 1,
          totalItems: type === 'briefs' ? mockData.mockBriefs.length :
                      type === 'articles' ? mockData.mockArticles.length :
                      type === 'backlinks' ? mockData.mockBacklinks.length :
                      mockData.mockKeywordPerformance.length,
          hasNextPage: false,
          hasPrevPage: page > 1,
          nextOffset: null,
          prevOffset: page > 1 ? (page - 1).toString() : null
        }
      }, signal);

      return response;
    },
    // Cache for 5 minutes
    5 * 60 * 1000
  );
}

/**
 * Clear the approvals cache for a specific type
 * @param type Type of approval items to clear cache for
 * @param clearFullDataset Whether to also clear the full dataset cache
 */
export function clearApprovalsCache(type?: string, clearFullDataset: boolean = true) {
  // Import the efficient-airtable functions
  const { clearCacheForType, clearFullDatasetCache } = require('./efficient-airtable');

  if (type) {
    // Clear client-side cache
    clearCacheByPrefix(`approvals_${type}`);

    // Clear server-side cache if available
    if (typeof clearCacheForType === 'function') {
      clearCacheForType(type);
    }
  } else {
    // Clear all approvals cache
    clearCacheByPrefix('approvals_');

    // Clear all server-side cache if available
    if (typeof clearCacheForType === 'function') {
      ['keywords', 'briefs', 'articles', 'backlinks'].forEach(t => clearCacheForType(t));
    }
  }

  // Optionally clear the full dataset cache
  if (clearFullDataset && typeof clearFullDatasetCache === 'function') {
    clearFullDatasetCache();
  }
}

/**
 * Update approval status via the API
 * @param type Type of approval item (keywords, briefs, articles, backlinks)
 * @param itemId Item ID
 * @param status New status
 * @param revisionReason Optional reason for revision
 * @returns Updated item
 */
export async function updateApprovalStatus(
  type: 'keywords' | 'briefs' | 'articles' | 'backlinks',
  itemId: string,
  status: string,
  revisionReason?: string
) {
  // Prepare the request body
  const body = {
    type,
    itemId,
    status,
    revisionReason
  };

  // Use fetchFromApi to handle the request
  return fetchFromApi(
    'update-approval',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    },
    { success: true, id: itemId, status }
  );
}

/**
 * Fetch conversation history for an approval item
 * @param contentType Type of content (keywords, briefs, articles, backlinks, quickwins)
 * @param itemId Item ID
 * @returns Array of comments
 */
export async function fetchConversationHistory(
  contentType: 'keywords' | 'briefs', // Only allow Keywords and Briefs content types
  itemId: string
) {
  // Create mock comments for testing
  const mockComments = [
    {
      id: `comment-${Date.now()}-1`,
      text: `This is a sample comment for ${contentType} item ${itemId}`,
      author: 'John Doe',
      timestamp: new Date(Date.now() - 86400000).toLocaleDateString() // 1 day ago
    },
    {
      id: `comment-${Date.now()}-2`,
      text: 'Thanks for the update. Looking good!',
      author: 'Jane Smith',
      timestamp: new Date(Date.now() - 43200000).toLocaleDateString() // 12 hours ago
    }
  ];

  return fetchFromApi(
    `conversation-history?contentType=${contentType}&itemId=${itemId}`,
    {},
    mockComments
  );
}

/**
 * Add a comment to an approval item
 * @param contentType Type of content (keywords, briefs, articles, backlinks, quickwins)
 * @param itemId Item ID
 * @param text Comment text
 * @returns Added comment
 */
export async function addApprovalComment(
  contentType: 'keywords' | 'briefs', // Only allow Keywords and Briefs content types
  itemId: string,
  text: string
) {
  return fetchFromApi(
    'add-comment',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentType, itemId, text })
    },
    {
      id: `comment-${Date.now()}`,
      text,
      author: 'You',
      timestamp: new Date().toLocaleDateString()
    }
  );
}
