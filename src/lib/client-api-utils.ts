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
 * Fetch URL performance data from the API
 * @returns Array of URL performance data
 */
export async function fetchURLPerformance() {
  const response = await fetchFromApi<{ urlPerformance: any[] }>('url-performance', {}, { urlPerformance: mockData.mockURLPerformance });
  return response.urlPerformance;
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
  clientId?: string
) {
  // Create a cache key based on the parameters including clientId
  const clientKey = clientId ? `_client_${clientId}` : '';
  // For 'all' clients, include the page in the cache key to ensure proper pagination
  const pageKey = clientId === 'all' ? `_page_${page}` : '';
  const cacheKey = `approvals_${type}${pageKey}_${pageSize}_${offset || ''}${clientKey}`;

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
               mockData.mockKeywordPerformance,
        pagination: {
          currentPage: page,
          totalPages: 1,
          totalItems: type === 'briefs' ? mockData.mockBriefs.length :
                      type === 'articles' ? mockData.mockArticles.length :
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
 */
export function clearApprovalsCache(type?: string) {
  if (type) {
    clearCacheByPrefix(`approvals_${type}`);
  } else {
    clearCacheByPrefix('approvals_');
  }
}
