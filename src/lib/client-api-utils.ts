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
