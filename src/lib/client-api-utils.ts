/**
 * Client API utilities for making API requests from the client side
 * This file provides a more efficient and maintainable way to make API requests
 */
import { fetchWithFallback, getApiUrl, getCurrentUser, prepareUserHeaders } from './api-utils';
import { shouldUseMockData } from './airtable-utils';
import * as mockData from './mock-data';
import { getFromCacheOrFetch, clearCacheByPrefix, clearCacheEntry } from './client-cache';

// Cache keys
const WQA_TASKS_CACHE_KEY = 'wqa_tasks';
const CRO_TASKS_CACHE_KEY = 'cro_tasks';
const STRATEGY_TASKS_CACHE_KEY = 'strategy_tasks';
const TASK_FIELD_OPTIONS_CACHE_KEY = 'task_field_options';

// In-memory cache for API responses
const apiCache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_TTL = 60 * 1000; // 1 minute cache TTL

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
 * Fetch KPI metrics with caching
 */
export async function fetchKPIMetricsWithCache(
  clientId?: string | null,
  month?: string | null,
  useCache: boolean = true,
  addTimestamp: boolean = true
) {
  // Build URL with query parameters
  const params = new URLSearchParams();
  
  // Important: Always include clientId parameter if available
  if (clientId) {
    params.append('clientId', clientId);
    console.log(`Including client filter: ${clientId}`);
  } else {
    console.log('No clientId provided for KPI metrics');
  }
  
  if (month) {
    params.append('month', month);
    console.log(`Including month filter: ${month}`);
  }
  
  if (!useCache) {
    params.append('skipCache', 'true');
  }
  
  // Always add a timestamp to avoid browser caching issues when requested
  if (addTimestamp) {
    params.append('_', Date.now().toString());
  }
  
  try {
    // Generate a cache key for this specific request
    const cacheKey = `kpi_metrics_${clientId || 'all'}_${month || 'all'}`;
    
    // Check if we have a cached version
    if (useCache && apiCache[cacheKey]) {
      const cachedData = apiCache[cacheKey];
      const now = Date.now();
      
      // Use cache if it's less than TTL old
      if (now - cachedData.timestamp < CACHE_TTL) {
        console.log(`Using cached data for ${cacheKey} (${Math.round((now - cachedData.timestamp) / 1000)}s old)`);
        return cachedData.data;
      } else {
        console.log(`Cache expired for ${cacheKey}`);
      }
    }
    
    // Call the API endpoint with cache prevention headers
    const response = await fetch(`/api/kpi-metrics?${params.toString()}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      // Use no-store to prevent the browser from using cached responses
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch KPI metrics: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Validate that the response contains the expected data structure
    if (!data || !data.kpiMetrics) {
      console.error('Invalid response format from API', data);
      throw new Error('Invalid response format from API');
    }
    
    // Store in cache
    if (useCache) {
      apiCache[cacheKey] = {
        data: data.kpiMetrics,
        timestamp: Date.now()
      };
      console.log(`Cached data for ${cacheKey}`);
    }
    
    return data.kpiMetrics;
  } catch (error) {
    console.error(`Error fetching KPI metrics:`, error);
    // Rethrow to allow the caller to handle the error
    throw error;
  }
}

/**
 * Fetch KPI progress with caching
 */
export async function fetchKPIProgressWithCache(
  clientId: string,
  useCache: boolean = true,
  addTimestamp: boolean = true
) {
  // Build URL with query parameters
  const params = new URLSearchParams({
    clientId
  });
  
  if (!useCache) {
    params.append('skipCache', 'true');
  }
  
  // Always add a timestamp to avoid browser caching issues when requested
  if (addTimestamp) {
    params.append('_', Date.now().toString());
  }
  
  try {
    // Generate a cache key for this specific request
    const cacheKey = `kpi_progress_${clientId}`;
    
    // Check if we have a cached version
    if (useCache && apiCache[cacheKey]) {
      const cachedData = apiCache[cacheKey];
      const now = Date.now();
      
      // Use cache if it's less than TTL old
      if (now - cachedData.timestamp < CACHE_TTL) {
        console.log(`Using cached data for ${cacheKey} (${Math.round((now - cachedData.timestamp) / 1000)}s old)`);
        return cachedData.data;
      } else {
        console.log(`Cache expired for ${cacheKey}`);
      }
    }
    
    // Call the API endpoint with cache prevention headers
    const response = await fetch(`/api/kpi-progress?${params.toString()}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      // Use no-store to prevent the browser from using cached responses
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch KPI progress: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Store in cache
    if (useCache) {
      apiCache[cacheKey] = {
        data,
        timestamp: Date.now()
      };
      console.log(`Cached data for ${cacheKey}`);
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching KPI progress:`, error);
    // Rethrow to allow the caller to handle the error
    throw error;
  }
}

/**
 * Clear all cached KPI data
 */
export function clearKPICache() {
  Object.keys(apiCache).forEach(key => {
    if (key.startsWith('kpi_')) {
      delete apiCache[key];
    }
  });
  console.log('Cleared all KPI data cache');
  return true;
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

  console.log('Using cache key:', cacheKey);

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
 * Function to clear all cache for approvals - used when switching clients or tabs
 * @param type Type of approval items to clear cache for
 */
export function clearApprovalsCache(type?: string) {
  console.log(`Clearing approvals cache ${type ? `for ${type}` : 'for all types'}`);
  
  try {
    // If running on the client side
    if (typeof window !== 'undefined') {
      // Create a timestamp for cache-busting
      const timestamp = Date.now();
      
      // Immediately clear all localStorage items that contain 'approvals'
      // This is critical to prevent flashing old data from other clients
      Object.keys(localStorage).forEach(key => {
        if (key.includes('approvals')) {
          console.log(`Removing localStorage item: ${key}`);
          localStorage.removeItem(key);
        }
      });
      
      // Optionally store the timestamp in sessionStorage to ensure fresh data
      // across components that use approvals data
      sessionStorage.setItem('approvals_cache_timestamp', timestamp.toString());
      
      // If a specific type is provided, only clear that type
      if (type) {
        // Call the server-side clearCacheForType function via API
        return fetch(`/api/approvals?clearCache=true&type=${type}&_=${timestamp}`, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          cache: 'no-store'
        });
      } else {
        // Clear all types
        return fetch(`/api/approvals?clearCache=true&_=${timestamp}`, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          cache: 'no-store'
        });
      }
    } else {
      // If running on the server side, do nothing
      console.log('Running on server side, no localStorage to clear');
      return Promise.resolve();
    }
  } catch (error) {
    console.error('Error clearing approvals cache:', error);
    return Promise.resolve();
  }
}

/**
 * Update approval status via the API
 * @param type Content type
 * @param itemId Item ID
 * @param status New status
 * @param revisionReason Optional revision reason
 * @returns Success status
 */
export async function updateApprovalStatus(
  type: 'keywords' | 'briefs' | 'articles' | 'backlinks' | 'quickwins' | 'youtubetopics' | 'youtubethumbnails' | 'redditthreads',
  itemId: string,
  status: string,
  revisionReason?: string
) {
  // Clear cache for this type when status is updated
  clearApprovalsCache(type);

  return fetchFromApi(
    'update-approval',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, itemId, status, revisionReason }),
    },
    { success: true }
  );
}

/**
 * Fetch conversation history for an approval item
 * @param contentType Content type
 * @param itemId Item ID
 * @returns Conversation history
 */
export async function fetchConversationHistory(
  contentType: 'keywords' | 'briefs' | 'youtubetopics' | 'youtubethumbnails' | 'redditthreads',
  itemId: string
) {
  // Create mock conversation history for testing
  const mockConversationHistory = [
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
    mockConversationHistory
  );
}

/**
 * Add a comment to an approval item
 * @param contentType Content type
 * @param itemId Item ID
 * @param text Comment text
 * @returns Added comment
 */
export async function addApprovalComment(
  contentType: 'keywords' | 'briefs' | 'youtubetopics' | 'youtubethumbnails' | 'redditthreads',
  itemId: string,
  text: string
) {
  return fetchFromApi(
    'api/add-comment',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentType, itemId, text }),
    },
    { id: `comment-${Date.now()}`, text, author: 'You', timestamp: new Date().toLocaleDateString() }
  );
}

/**
 * Fetch Airtable comments for a record
 * @param recordId Record ID to fetch comments for
 * @param contentType Content type (keywords, briefs, articles, backlinks) - defaults to keywords
 * @returns Array of Airtable comments
 */
export async function fetchAirtableComments(recordId: string, contentType: string = 'keywords') {
  if (!recordId) {
    console.error('No recordId provided to fetchAirtableComments');
    return [];
  }

  try {
    // Use Keywords table for both keywords and backlinks as requested
    const tableName = 'Keywords';
    
    const response = await fetchFromApi(
      `airtable-comments?recordId=${encodeURIComponent(recordId)}&tableIdOrName=${encodeURIComponent(tableName)}`,
      { method: 'GET' },
      { comments: [], recordId, total: 0 }
    );

    return response.comments || [];
  } catch (error) {
    console.error('Error fetching Airtable comments:', error);
    return [];
  }
}

/**
 * Add a comment to Airtable
 * @param recordId Record ID to add comment to
 * @param text Comment text
 * @param contentType Content type (keywords, briefs, articles, backlinks) - defaults to keywords
 * @returns Added comment
 */
export async function addAirtableComment(
  recordId: string, 
  text: string, 
  contentType: string = 'keywords'
) {
  if (!recordId || !text) {
    throw new Error('Record ID and text are required');
  }

  try {
    // Use Keywords table for both keywords and backlinks as requested
    const tableName = 'Keywords';
    
    const response = await fetchFromApi(
      'airtable-comments/add',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          recordId, 
          text, 
          contentType: contentType || '',
          tableIdOrName: tableName
        })
      },
      {
        comment: {
          id: `comment-${Date.now()}`,
          text,
          author: 'You',
          timestamp: new Date().toLocaleDateString(),
          contentType: contentType || '',
          recordId,
          createdAt: new Date().toISOString()
        },
        success: true
      }
    );

    return response.comment;
  } catch (error) {
    console.error('Error adding Airtable comment:', error);
    throw error;
  }
}

/**
 * Fetch WQA tasks from the API
 * @param boardType Type of board (technicalSEO, strategyAdHoc)
 * @param signal Optional AbortSignal for cancellation
 * @param useCache Whether to use cached data
 * @param clientId Optional client ID for filtering
 * @returns Array of WQA tasks
 */
export async function fetchWQATasks(
  boardType: string,
  signal?: AbortSignal,
  useCache: boolean = true,
  clientId?: string | null
) {
  // Create a cache key based on the board type
  const cacheKey = `${WQA_TASKS_CACHE_KEY}_${boardType}`;
  
  // Always clear the cache before fetching new data to avoid stale data issues
  if (!useCache) {
    localStorage.removeItem(cacheKey);
    console.log(`Cleared cache for ${cacheKey}`);
  }
  
  // Check cache first if useCache is true
  if (useCache) {
    const cachedTasks = localStorage.getItem(cacheKey);
    if (cachedTasks) {
      try {
        const parsedTasks = JSON.parse(cachedTasks);
        console.log(`Using cached WQA tasks for ${boardType}:`, parsedTasks.length);
        
        // If clientId is provided, filter the cached tasks
        if (clientId && clientId !== 'all') {
          console.log(`Filtering cached WQA tasks by client: ${clientId}`);
          return parsedTasks.filter((task: any) => {
            // Check Clients field (array or string)
            if (task.Clients) {
              if (Array.isArray(task.Clients)) {
                return task.Clients.includes(clientId);
              } else {
                return task.Clients === clientId;
              }
            }
            // Check Client field (array or string)
            if (task.Client) {
              if (Array.isArray(task.Client)) {
                return task.Client.includes(clientId);
              } else {
                return task.Client === clientId;
              }
            }
            return false;
          });
        }
        
        return parsedTasks;
      } catch (error) {
        console.error(`Error parsing cached WQA tasks for ${boardType}:`, error);
        // Continue to fetch from API
      }
    }
  } else {
    console.log(`Bypassing cache and fetching fresh WQA tasks for ${boardType}`);
  }

  // Add timestamp to prevent browser caching and build base URL
  const timestamp = Date.now();

  // Construct URL – we no longer include any "type" discriminator; the server
  // route now returns all WQA rows and applies filtering solely by client ID.
  let url = `wqa-tasks?t=${timestamp}`;

  // Forward the concrete clientId when we have one (never "all")
  if (clientId) {
    url += `&clientId=${encodeURIComponent(clientId)}`;
  }
  
  // Fetch from API with parameters
  const response = await fetchFromApi(
    url,
    { method: 'GET' },
    { tasks: [] }, // Default empty array if API fails
    signal
  );

  // Cache the response if useCache is true
  if (useCache && response.tasks && Array.isArray(response.tasks)) {
    localStorage.setItem(cacheKey, JSON.stringify(response.tasks));
    console.log(`Cached ${response.tasks.length} WQA tasks for ${boardType}`);
  }

  return response.tasks || [];
}

/**
 * Update WQA task status via the API
 * @param taskId Task ID
 * @param newStatus New status
 * @returns Updated task
 */
export async function updateWQATaskStatus(taskId: string, newStatus: string) {
  // Clear the cache for all board types when updating a task
  clearWQATasksCache();
  
  return fetchFromApi(
    'wqa-tasks/update-status',
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, newStatus })
    },
    { success: true, id: taskId, status: newStatus }
  );
}

/**
 * Add a comment to a WQA task
 * @param taskId Task ID
 * @param comment Comment text
 * @returns Added comment
 */
export async function addWQATaskComment(taskId: string, comment: string) {
  // Clear the comments cache for this task
  clearCacheEntry(`wqa_task_comments_${taskId}`);
  
  // Also clear the tasks cache to ensure updated comment counts
  clearWQATasksCache();
  
  return fetchFromApi(
    'wqa-tasks/add-comment',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, comment })
    },
    {
      id: `comment-${Date.now()}`,
      text: comment,
      author: 'You',
      timestamp: new Date().toLocaleDateString()
    }
  );
}

/**
 * Fetch comments for a specific WQA task
 * @param taskId Task ID
 * @param signal Optional AbortSignal for cancellation
 * @param useCache Whether to use cached data
 * @returns Array of comments for the task
 */
export async function fetchWQATaskComments(
  taskId: string,
  signal?: AbortSignal,
  useCache: boolean = true
) {
  if (!taskId) {
    console.error('No taskId provided to fetchWQATaskComments');
    return [];
  }
  
  // Create a cache key based on the taskId
  const cacheKey = `wqa_task_comments_${taskId}`;

  return getFromCacheOrFetch(
    cacheKey,
    async () => {
      // Prepare the API endpoint with taskId as a query parameter
      const endpoint = `wqa-tasks/comments?taskId=${encodeURIComponent(taskId)}`;
      
      // Use the generic fetchFromApi function to make the request
      const response = await fetchFromApi(
        endpoint,
        { method: 'GET' },
        // Fallback mock comments for the task
        [
          {
            id: `mock-comment-1-${taskId}`,
            text: 'This is a mock comment for this task',
            author: 'Mock User',
            timestamp: new Date().toLocaleDateString()
          }
        ],
        signal
      );

      // If the response is already an array, return it
      if (Array.isArray(response)) {
        return response;
      }
      
      // If the response has a comments property that is an array, return it
      if (response && typeof response === 'object' && 'comments' in (response as any) && Array.isArray((response as any).comments)) {
        return (response as any).comments;
      }
      
      // Otherwise, return an empty array
      return [];
    },
    5 * 60 * 1000 // 5 minutes cache expiration
  );
}

/**
 * Clear the WQA tasks cache
 */
export function clearWQATasksCache() {
  // Clear all WQA task caches
  localStorage.removeItem(`${WQA_TASKS_CACHE_KEY}_technicalSEO`);
  localStorage.removeItem(`${WQA_TASKS_CACHE_KEY}_strategyAdHoc`);
  
  // Also clear comments cache
  clearCacheByPrefix('wqa_task_comments_');
  
  console.log('Cleared all WQA tasks caches');
}

/**
 * Fetch task board data from the API with caching
 * @param boardType Type of task board to fetch (technicalSEO, cro, strategyAdHoc)
 * @param signal Optional AbortSignal for cancellation
 * @param useCache Whether to use cached data
 * @returns Array of tasks for the specified board type
 */
export async function fetchTaskBoardData(
  boardType: string,
  signal?: AbortSignal,
  useCache: boolean = true
) {
  // Create a cache key based on the board type
  const cacheKey = `taskboard_${boardType}`;

  return getFromCacheOrFetch(
    cacheKey,
    async () => {
      // Prepare the API endpoint with board type as a query parameter
      const endpoint = `tasks/board?type=${encodeURIComponent(boardType)}`;
      
      // Use the generic fetchFromApi function to make the request
      const response = await fetchFromApi(
        endpoint,
        { method: 'GET' },
        // Fallback mock data based on board type
        mockData.mockTasks.filter(task => {
          // Filter mock tasks based on board type
          // This is just for fallback purposes
          if (boardType === 'technicalSEO') {
            return (task as any).Type === 'Technical SEO';
          } else if (boardType === 'cro') {
            return (task as any).Type === 'CRO';
          } else if (boardType === 'strategyAdHoc') {
            return (task as any).Type === 'Strategy' || (task as any).Type === 'Ad Hoc';
          }
          return false;
        }),
        signal
      );

      return response;
    },
    5 * 60 * 1000 // 5 minutes cache expiration
  );
}

/**
 * Clear the task boards cache for a specific board type
 * @param boardType Type of board to clear cache for
 */
export function clearTaskBoardCache(boardType?: string) {
  if (boardType) {
    // Clear cache for specific board type
    clearCacheByPrefix(`taskboard_${boardType}`);
  } else {
    // Clear all task board caches
    clearCacheByPrefix('taskboard_');
  }
}

/**
 * Create a new WQA task
 * @param taskData Task data to create
 * @returns Created task
 */
export async function createWQATask(taskData: {
  task: string;
  status: string;
  priority: string;
  assignedTo?: string;
  impact: number | string; // Allow both number and string for backward compatibility
  effort: string;
  notes?: string;
  boardType: string;
  clients?: string[];
}) {
  console.log("createWQATask called with taskData (including clients):", taskData);
  // Clear the WQA tasks cache to ensure we get fresh data
  clearWQATasksCache();
  
  // Build the payload exactly as the API route expects (client-side labels)
  const payload = {
    task      : taskData.task,
    status    : taskData.status,
    priority  : taskData.priority,
    impact    : taskData.impact,
    effort    : taskData.effort,
    notes     : taskData.notes,
    assignedTo: taskData.assignedTo,
    boardType : taskData.boardType,
    clients   : taskData.clients
  };

  const resp = await fetchFromApi(
    'wqa-tasks/add-task',
    {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify(payload)
    },
    // Fallback mock data
    {
      id          : `task-${Date.now()}`,
      task        : taskData.task,
      status      : taskData.status,
      priority    : taskData.priority,
      assignedTo  : taskData.assignedTo || 'Unassigned',
      impact      : taskData.impact,
      effort      : taskData.effort,
      notes       : taskData.notes,
      dateLogged  : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      comments    : [],
      commentCount: 0
    }
  );

  // API returns { success: true, task: {...} } – unwrap to keep a flat Task object
  if (resp && typeof resp === 'object' && 'task' in resp) {
    return (resp as any).task;
  }

  return resp;
}

/**
 * Fetch CRO tasks from the API
 * @param useCache Whether to use cached data
 * @param clientId Optional client ID for filtering
 * @returns Array of CRO tasks
 */
export async function getCROTasks(useCache: boolean = false, clientId?: string | null) {
  // Always clear the cache before fetching new data to avoid stale data issues
  localStorage.removeItem(CRO_TASKS_CACHE_KEY);
  
  // Check cache first if useCache is true
  if (useCache) {
    const cachedTasks = localStorage.getItem(CRO_TASKS_CACHE_KEY);
    if (cachedTasks) {
      try {
        const parsedTasks = JSON.parse(cachedTasks);
        console.log('Using cached CRO tasks:', parsedTasks.length);
        
        // If clientId is provided, filter the cached tasks
        if (clientId && clientId !== 'all') {
          console.log(`Filtering cached CRO tasks by client: ${clientId}`);
          return parsedTasks.filter((task: any) => {
            // Check Clients field (array or string)
            if (task.Clients) {
              if (Array.isArray(task.Clients)) {
                return task.Clients.includes(clientId);
              } else {
                return task.Clients === clientId;
              }
            }
            // Check Client field (array or string)
            if (task.Client) {
              if (Array.isArray(task.Client)) {
                return task.Client.includes(clientId);
              } else {
                return task.Client === clientId;
              }
            }
            return false;
          });
        }
        
        return parsedTasks;
      } catch (error) {
        console.error('Error parsing cached CRO tasks:', error);
        // Continue to fetch from API
      }
    }
  } else {
    console.log('Bypassing cache and fetching fresh CRO tasks from API');
  }

  // Add timestamp to prevent browser caching
  const timestamp = new Date().getTime();
  
  // Create the URL with parameters
  let url = `cro-tasks?t=${timestamp}`;
  
  // Add clientId parameter if provided
  if (clientId && clientId !== 'all') {
    url += `&clientId=${encodeURIComponent(clientId)}`;
  }
  
  // Fetch from API with parameters
  const response = await fetchFromApi(
    url,
    {},
    { tasks: [] } // Default empty array if API fails
  );

  // Cache the response if useCache is true
  if (useCache && response.tasks && Array.isArray(response.tasks)) {
    localStorage.setItem(CRO_TASKS_CACHE_KEY, JSON.stringify(response.tasks));
  }

  return response.tasks || [];
}

/**
 * Create a new CRO task
 * @param taskData Task data to create
 * @returns Created task
 */
export async function createCROTask(taskData: {
  task: string;
  status: string;
  priority: string;
  assignedTo?: string;
  impact: number | string; // Allow both number and string for backward compatibility
  effort: string;
  notes?: string;
  clients?: string[];
  // New CRO-specific fields
  type?: string;
  exampleUrl?: string;
  exampleScreenshot?: string;
}) {
  // Clear the CRO tasks cache to ensure we get fresh data
  clearCROTasksCache();
  
  const resp = await fetchFromApi(
    'cro-tasks/add-task',
    {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify(taskData)
    },
    // Fallback mock data
    {
      id          : `task-${Date.now()}`,
      task        : taskData.task,
      status      : taskData.status,
      priority    : taskData.priority,
      assignedTo  : taskData.assignedTo || 'Unassigned',
      impact      : taskData.impact,
      effort      : taskData.effort,
      notes       : taskData.notes,
      dateLogged  : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      comments    : [],
      commentCount: 0,
      type        : 'CRO'
    }
  );

  // API returns { success: true, task: {...} } – unwrap
  if (resp && typeof resp === 'object' && 'task' in resp) {
    return (resp as any).task;
  }

  return resp;
}

/**
 * Update a CRO task's status
 * @param taskId Task ID to update
 * @param status New status
 * @returns Updated task
 */
export async function updateCROTaskStatus(taskId: string, status: string) {
  // Clear the CRO tasks cache to ensure we get fresh data
  clearCROTasksCache();
  
  return fetchFromApi(
    'cro-tasks/update-status',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, status })
    },
    // Fallback mock data
    {
      success: true,
      task: {
        id: taskId,
        status
      }
    }
  );
}

/**
 * Clear the CRO tasks cache
 */
export function clearCROTasksCache() {
  localStorage.removeItem(CRO_TASKS_CACHE_KEY);
}

/**
 * Fetch Strategy / Ad-hoc tasks from the API (Airtable table: "Strategy Tasks")
 * @param useCache Whether to use cached data
 * @param clientId Optional client ID for filtering
 */
export async function getStrategyTasks(useCache: boolean = false, clientId?: string | null) {
  // Always clear the cache before fetching new data to avoid stale data issues
  localStorage.removeItem(STRATEGY_TASKS_CACHE_KEY);

  // Check cache first if useCache is true
  if (useCache) {
    const cachedTasks = localStorage.getItem(STRATEGY_TASKS_CACHE_KEY);
    if (cachedTasks) {
      try {
        const parsedTasks = JSON.parse(cachedTasks);
        console.log('Using cached Strategy tasks:', parsedTasks.length);

        // If clientId is provided, filter the cached tasks
        if (clientId && clientId !== 'all') {
          console.log(`Filtering cached Strategy tasks by client: ${clientId}`);
          return parsedTasks.filter((task: any) => {
            if (task.Clients) {
              if (Array.isArray(task.Clients)) return task.Clients.includes(clientId);
              return task.Clients === clientId;
            }
            if (task.Client) {
              if (Array.isArray(task.Client)) return task.Client.includes(clientId);
              return task.Client === clientId;
            }
            return false;
          });
        }

        return parsedTasks;
      } catch (error) {
        console.error('Error parsing cached Strategy tasks:', error);
      }
    }
  } else {
    console.log('Bypassing cache and fetching fresh Strategy tasks from API');
  }

  // Add timestamp to prevent browser caching
  const timestamp = new Date().getTime();

  // Build URL
  let url = `strategy-tasks?t=${timestamp}`;
  if (clientId && clientId !== 'all') {
    url += `&clientId=${encodeURIComponent(clientId)}`;
  }

  // Fetch from API
  const response = await fetchFromApi(
    url,
    {},
    { tasks: [] }
  );

  // Cache if needed
  if (useCache && response.tasks && Array.isArray(response.tasks)) {
    localStorage.setItem(STRATEGY_TASKS_CACHE_KEY, JSON.stringify(response.tasks));
  }

  return response.tasks || [];
}

/** Clear the Strategy tasks cache */
export function clearStrategyTasksCache() {
  localStorage.removeItem(STRATEGY_TASKS_CACHE_KEY);
}

/**
 * Create a new Strategy / Ad-hoc task (table "Strategy Tasks")
 * @param taskData Task fields coming from the modal
 */
export async function createStrategyTask(taskData: {
  task: string;
  status: string;
  priority: string;
  assignedTo?: string;
  impact: number | string;
  effort: string;
  notes?: string;
  clients?: string[];
}) {
  // No dedicated cache for strategy tasks yet, but clear the generic one
  clearStrategyTasksCache?.();
  
  const payload = {
    task      : taskData.task,
    status    : taskData.status,
    priority  : taskData.priority,
    impact    : taskData.impact,
    effort    : taskData.effort,
    notes     : taskData.notes,
    assignedTo: taskData.assignedTo,
    clients   : taskData.clients
  };

  const resp = await fetchFromApi(
    'strategy-tasks/add-task',
    {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify(payload)
    },
    // Fallback mock
    {
      id          : `strategy-task-${Date.now()}`,
      task        : taskData.task,
      status      : taskData.status,
      priority    : taskData.priority,
      impact      : taskData.impact,
      effort      : taskData.effort,
      assignedTo  : taskData.assignedTo || 'Unassigned',
      notes       : taskData.notes || '',
      dateLogged  : new Date().toISOString(),
      comments    : [],
      commentCount: 0,
      type        : 'Strategy'
    }
  );

  // API returns { task: { ... } } or { success: true, task: { ... } } – unwrap
  if (resp && typeof resp === 'object' && 'task' in resp) {
    return (resp as any).task;
  }

  return resp;
}

export async function getTaskFieldOptions(boardType: string) {
    const res = await fetch(`/api/task-field-options?boardType=${boardType}`);
    if (!res.ok) throw new Error("Unable to load options");
    return res.json();            // { assignedTo: [...], priority: [...], ... }
}

export async function addTask(
    boardType: string,
    data: Record<string, any>,
) {
    const res = await fetch("/api/task-add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boardType, data }),
    });
    return res.ok;
}

/**
 * Fetch reports data with caching
 */
export async function fetchReportsWithCache(
  reportType: 'weekly' | 'monthly' | 'quarterly',
  clientId?: string | null,
  useCache: boolean = true,
  addTimestamp: boolean = true
) {
  // Generate a cache key for this specific request
  const cacheKey = `reports_${reportType}_${clientId || 'all'}`;
  
  console.log(`=== fetchReportsWithCache for ${reportType} reports ===`);
  console.log(`ClientId: ${clientId}, UseCache: ${useCache}`);
  
  // For quarterly reports, validate clientId from multiple sources
  if (reportType === 'quarterly') {
    // Check if we have a valid clientId
    if (!clientId && typeof window !== 'undefined') {
      console.log('No clientId provided for quarterly reports, checking alternative sources');
      
      // Try localStorage directly
      const localStorageClientId = localStorage.getItem('clientRecordID') || 
                                  localStorage.getItem('selected-client-id');
      
      if (localStorageClientId) {
        console.log(`Found clientId in localStorage: ${localStorageClientId}`);
        clientId = localStorageClientId;
      } else {
        // Try cached clients data
        try {
          const cachedClients = localStorage.getItem('cached-clients-data');
          if (cachedClients) {
            const clients = JSON.parse(cachedClients);
            if (Array.isArray(clients) && clients.length > 0) {
              clientId = clients[0].id;
              console.log(`Using clientId from cached-clients-data: ${clientId}`);
            }
          }
        } catch (e) {
          console.error('Error parsing cached-clients-data:', e);
        }
      }
    }
  }
  
  // Clear the cache if useCache is false
  if (!useCache && typeof window !== 'undefined') {
    console.log(`Clearing cache for ${cacheKey}`);
    sessionStorage.removeItem(cacheKey);
  }
  
  // Add a timestamp to avoid browser caching issues when requested
  const params = new URLSearchParams();
  
  // Important: Always include clientId parameter if available
  if (clientId) {
    params.append('clientId', clientId);
    console.log(`Including client filter: ${clientId}`);
  }
  
  if (!useCache) {
    params.append('skipCache', 'true');
  }
  
  // Always add a timestamp to avoid browser caching issues when requested
  if (addTimestamp) {
    params.append('_', Date.now().toString());
  }
  
  try {
    // Check if we have a cached version in sessionStorage
    if (useCache && typeof window !== 'undefined') {
      const cachedData = sessionStorage.getItem(cacheKey);
      if (cachedData) {
        try {
          const parsedData = JSON.parse(cachedData);
          const cacheTime = parsedData.timestamp || 0;
          const now = Date.now();
          
          // For quarterly reports, use a shorter cache TTL to avoid stale data
          const cacheTTL = reportType === 'quarterly' ? 30000 : 60000; // 30 seconds for quarterly, 1 minute for others
          
          // Use cache if it's less than the TTL old
          if (now - cacheTime < cacheTTL) {
            console.log(`Using cached data for ${cacheKey} (${Math.round((now - cacheTime) / 1000)}s old)`);
            
            // Check if the data is empty and log if it is
            if (parsedData.data && parsedData.data.length === 0) {
              console.warn(`Cache contains empty data array for ${cacheKey}`);
              if (reportType === 'quarterly') {
                console.log('Empty quarterly data cache detected, clearing to force refresh');
                sessionStorage.removeItem(cacheKey);
                // Fall through to fetch new data
              } else {
                return parsedData.data;
              }
            } else {
              console.log(`Cache contains ${parsedData.data?.length || 0} items`);
              return parsedData.data;
            }
          } else {
            console.log(`Cache expired for ${cacheKey} (${Math.round((now - cacheTime) / 1000)}s old)`);
          }
        } catch (e) {
          console.error('Error parsing cached data:', e);
          // Clear invalid cache
          sessionStorage.removeItem(cacheKey);
        }
      }
    }
    
    console.log(`Fetching ${reportType} reports for client: ${clientId}`);
    
    // Import the appropriate fetch function based on report type
    let fetchFunction;
    let results;
    
    switch (reportType) {
      case 'weekly':
        const { fetchClientsByWeek } = await import('@/lib/airtable/tables/clientsByWeek');
        results = await fetchClientsByWeek(clientId);
        break;
      case 'monthly':
        const { fetchClientsByMonth } = await import('@/lib/airtable/tables/clientsByMonth');
        results = await fetchClientsByMonth(clientId);
        break;
      case 'quarterly':
        console.log('⭐ Fetching quarterly data from Airtable...');
        const { fetchClientsByQuarter } = await import('@/lib/airtable/tables/clientsByQuarter');
        
        // For quarterly reports, ensure we have a valid clientId
        if (!clientId && typeof window !== 'undefined') {
          const localStorageClientId = localStorage.getItem('clientRecordID') || 
                                      localStorage.getItem('selected-client-id');
          if (localStorageClientId) {
            console.log(`Using clientId from localStorage for quarterly reports: ${localStorageClientId}`);
            results = await fetchClientsByQuarter(localStorageClientId);
          } else {
            console.warn('No clientId available for quarterly reports');
            results = await fetchClientsByQuarter(clientId);
          }
        } else {
          results = await fetchClientsByQuarter(clientId);
        }
        
        console.log('⭐ Quarterly data fetch completed');
        console.log('Raw quarterly results length:', results?.length || 0);
        
        if (results?.length > 0) {
          console.log('Raw quarterly results first item:', {
            id: results[0].id,
            fieldKeys: Object.keys(results[0].fields || {})
          });
        } else {
          console.warn('No quarterly results returned from fetchClientsByQuarter');
        }
        break;
      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }
    
    // Log if results is empty
    if (!results || results.length === 0) {
      console.warn(`No ${reportType} reports found for client: ${clientId}`);
      
      // Store empty results in cache (with shorter TTL for quarterly)
      if (typeof window !== 'undefined') {
        const emptyData = {
          data: [],
          timestamp: Date.now()
        };
        // For quarterly, add a flag to indicate it's an empty result
        if (reportType === 'quarterly') {
          emptyData.timestamp = Date.now() - 40000; // Make it expire sooner (20 seconds)
        }
        sessionStorage.setItem(cacheKey, JSON.stringify(emptyData));
        console.log(`Cached empty ${reportType} results with key: ${cacheKey}`);
      }
      
      // For quarterly reports, always return a fallback sample to avoid UI issues
      if (reportType === 'quarterly') {
        console.log('Creating fallback quarterly report');
        const currentYear = new Date().getFullYear();
        const currentQuarter = Math.floor((new Date().getMonth() + 3) / 3);
        
        // Use the clientId we have (possibly from cached-clients-data)
        const fallbackQuarterly = [{
          id: `quarterly-fallback-${Date.now()}`,
          title: `Q${currentQuarter} ${currentYear} Performance Report`,
          date: new Date().toISOString().split('T')[0],
          type: 'quarterly',
          month: `${currentYear}-${String(currentQuarter * 3).padStart(2, '0')}`,
          fields: {
            "Quarter": `Q${currentQuarter} ${currentYear}`,
            "Quarter End": new Date().toISOString().split('T')[0],
            "Client + Quarter": `Q${currentQuarter} ${currentYear} Performance Report`,
            "Quarter Name": `Q${currentQuarter} ${currentYear}`,
            "Clicks (Actual)": 1000,
            "Leads (Actual)": 50,
            "Revenue (Actual)": 5000,
            "Executive Summary": "No data found for this quarter. This is a fallback report.",
            "Client Record ID": clientId
          }
        }];
        
        return fallbackQuarterly;
      }
      
      return [];
    }
    
    console.log(`Found ${results.length} raw ${reportType} reports before mapping`);
    
    // Map results to a consistent format
    const mappedResults = results.map((r: any) => {
      if (!r || !r.fields) {
        console.warn('Invalid record in results:', r);
        return null;
      }
      
      const fields = r.fields as any;
      let title, date, month;
      
      switch (reportType) {
        case 'weekly':
          title = fields["Client + Week"] || fields["Week"] || "Week";
          date = fields["Week"] || fields["Week Start"] || "";
          month = getValidMonth(date);
          break;
        case 'monthly':
          title = fields["Client + Month"] || fields["Month"] || "Month";
          date = fields["Month Start"] || fields["Month"] || "";
          month = getValidMonth(date);
          break;
        case 'quarterly':
          // Enhanced field mapping for quarterly reports with exact fields from CSV
          title = fields["Quarter Name"] || fields["Name"] || 
                  `Q${Math.floor((new Date().getMonth() + 3) / 3)} ${new Date().getFullYear()}`;
          
          // Handle potential missing Quarter End field
          // In the CSV, there's no explicit Quarter End, so we'll derive it from other fields
          date = fields["Month Start (from Clients by Month)"] || "";
          if (!date) {
            // Default to last day of current quarter if no date is available
            const now = new Date();
            const currentQuarter = Math.floor((now.getMonth() + 3) / 3);
            const lastMonth = currentQuarter * 3 - 1;
            const lastDay = new Date(now.getFullYear(), lastMonth, 0).getDate();
            date = `${now.getFullYear()}-${String(lastMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
          }
          
          month = getValidMonth(date);
          
          // Ensure all required fields exist - use exact names from CSV
          if (!fields["Clicks (Actual)"] && !fields["Organic Traffic (Actual)"]) {
            fields["Clicks (Actual)"] = fields["Organic Traffic (Actual)"] || 0;
          }
          if (!fields["Leads (Actual)"]) {
            fields["Leads (Actual)"] = fields["Leads"] || 0;
          }
          if (!fields["Revenue (Actual)"]) {
            fields["Revenue (Actual)"] = 0;
          }
          
          // Make sure we have an Executive Summary field
          if (!fields["Executive Summary"]) {
            // Try other related fields from the CSV
            fields["Executive Summary"] = fields["Narrative Summary"] || 
                                         fields["TL;DR"] || 
                                         "No executive summary available for this quarter.";
          }
          
          break;
      }
      
      return {
        id: r.id,
        title,
        date,
        month,
        fields,
      };
    })
    .filter(Boolean) // Remove any null items
    .sort((a: any, b: any) => (b.date > a.date ? 1 : -1)); // Sort newest first
    
    // Log and debug the first item if available
    if (mappedResults.length > 0 && reportType === 'quarterly') {
      const firstReport = mappedResults[0];
      console.log('First quarterly report after mapping:', {
        id: firstReport?.id || 'unknown',
        title: firstReport?.title || 'unknown',
        date: firstReport?.date || 'unknown',
        fieldKeys: firstReport?.fields ? Object.keys(firstReport.fields).join(', ') : 'no fields'
      });
    } else if (reportType === 'quarterly') {
      console.warn('No quarterly reports after mapping');
    }
    
    // Store in sessionStorage cache if using cache
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify({
          data: mappedResults,
          timestamp: Date.now()
        }));
        console.log(`Cached ${mappedResults.length} ${reportType} reports with key: ${cacheKey}`);
      } catch (e) {
        console.error('Error caching data:', e);
      }
    }
    
    console.log(`Found ${mappedResults.length} ${reportType} reports after mapping`);
    return mappedResults;
    
  } catch (error) {
    console.error(`Error fetching ${reportType} reports:`, error);
    
    // Clear cache if there's an error
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(cacheKey);
    }
    
    // For quarterly reports, return a fallback when error occurs
    if (reportType === 'quarterly') {
      console.log('Error occurred, creating fallback quarterly report');
      const currentYear = new Date().getFullYear();
      const currentQuarter = Math.floor((new Date().getMonth() + 3) / 3);
      
      return [{
        id: `quarterly-error-${Date.now()}`,
        title: `Q${currentQuarter} ${currentYear} Performance Report`,
        date: new Date().toISOString().split('T')[0],
        type: 'quarterly',
        month: `${currentYear}-${String(currentQuarter * 3).padStart(2, '0')}`,
        fields: {
          "Quarter": `Q${currentQuarter} ${currentYear}`,
          "Quarter End": new Date().toISOString().split('T')[0],
          "Client + Quarter": `Q${currentQuarter} ${currentYear} Performance Report`,
          "Quarter Name": `Q${currentQuarter} ${currentYear}`,
          "Clicks (Actual)": 1000,
          "Leads (Actual)": 50,
          "Revenue (Actual)": 5000,
          "Executive Summary": "Error fetching quarterly data. This is a fallback report."
        }
      }];
    }
    
    return [];
  }
}

// Helper function to get a valid month string from a date
function getValidMonth(dateString: string): string {
  if (!dateString) return "all";
  
  try {
    const date = new Date(dateString);
    // Check if date is valid before calling toISOString()
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date: ${dateString}, using 'all' as fallback`);
      return "all";
    }
    return date.toISOString().slice(0, 7);
  } catch (error) {
    console.warn(`Error processing date ${dateString}: ${error}`);
    return "all";
  }
}
