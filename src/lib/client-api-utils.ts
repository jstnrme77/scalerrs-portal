/**
 * Client API utilities for making API requests from the client side
 * This file provides a more efficient and maintainable way to make API requests
 */
import { fetchWithFallback, getApiUrl, getCurrentUser, prepareUserHeaders } from './api-utils';
import { shouldUseMockData } from './airtable-utils';
import * as mockData from './mock-data';
import { getFromCacheOrFetch, clearCacheByPrefix, clearCacheEntry } from './client-cache';

// Cache keys
const WQA_TASKS_CACHE_KEY = 'wqa-tasks';
const CRO_TASKS_CACHE_KEY = 'cro-tasks';

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

/**
 * Fetch WQA task data for the Task Boards page
 * @param boardType Type of task board to fetch (technicalSEO, cro, strategyAdHoc)
 * @param signal Optional AbortSignal for cancellation
 * @param useCache Whether to use cached data
 * @returns Array of WQA tasks for the specified board type
 */
export async function fetchWQATasks(
  boardType: string,
  signal?: AbortSignal,
  useCache: boolean = true
) {
  // Create a cache key based on the board type
  const cacheKey = `wqa_tasks_${boardType}`;

  return getFromCacheOrFetch(
    cacheKey,
    async () => {
      // Prepare the API endpoint with board type as a query parameter
      const endpoint = `wqa-tasks?type=${encodeURIComponent(boardType)}`;
      
      // Use the generic fetchFromApi function to make the request
      const response = await fetchFromApi(
        endpoint,
        { method: 'GET' },
        // Fallback mock data based on board type
        mockData.mockTasks.filter(task => {
          // Filter mock tasks based on board type
          // This is just for fallback purposes
          if (boardType === 'technicalSEO') {
            return (task as any).Type === 'Technical SEO' || (task as any).Type === 'WQA';
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
  clearCacheByPrefix('wqa_tasks_');
  clearCacheByPrefix('wqa_task_comments_');
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
  impact: number;
  effort: string;
  notes?: string;
  boardType: string;
}) {
  // Clear the WQA tasks cache to ensure we get fresh data
  clearWQATasksCache();
  
  // Map the status to Airtable accepted values
  let airtableStatus: string;
  switch (taskData.status.toLowerCase()) {
    case 'not started':
      airtableStatus = 'To Do';
      break;
    case 'in progress':
      airtableStatus = 'In Progress';
      break;
    case 'blocked':
    case 'done':
      airtableStatus = 'Setup';
      break;
    default:
      airtableStatus = 'To Do';
  }
  
  // Note: We're not passing the Type field to Airtable as it's causing errors
  // Create the task via the API
  return fetchFromApi(
    'wqa-tasks/add-task',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        ...taskData,
        status: airtableStatus // Use the mapped status value
      })
    },
    // Fallback mock data
    {
      id: `task-${Date.now()}`,
      task: taskData.task,
      status: taskData.status,
      priority: taskData.priority,
      assignedTo: taskData.assignedTo || 'Unassigned',
      impact: taskData.impact,
      effort: taskData.effort,
      notes: taskData.notes,
      dateLogged: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      comments: [],
      commentCount: 0
    }
  );
}

/**
 * Get CRO tasks
 * @param useCache Whether to use cached data (default: false)
 * @returns Array of CRO tasks
 */
export async function getCROTasks(useCache: boolean = false) {
  // Always clear the cache before fetching new data to avoid stale data issues
  localStorage.removeItem(CRO_TASKS_CACHE_KEY);
  
  // Check cache first if useCache is true
  if (useCache) {
    const cachedTasks = localStorage.getItem(CRO_TASKS_CACHE_KEY);
    if (cachedTasks) {
      try {
        const parsedTasks = JSON.parse(cachedTasks);
        console.log('Using cached CRO tasks:', parsedTasks.length);
        return parsedTasks;
      } catch (error) {
        console.error('Error parsing cached CRO tasks:', error);
        // Continue to fetch from API
      }
    }
  } else {
    console.log('Bypassing cache and fetching fresh CRO tasks from API');
  }

  // Fetch from API
  const response = await fetchFromApi(
    'cro-tasks',
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
  impact: number;
  effort: string;
  notes?: string;
}) {
  // Clear the CRO tasks cache to ensure we get fresh data
  clearCROTasksCache();
  
  // Create the task via the API
  return fetchFromApi(
    'cro-tasks/add-task',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    },
    // Fallback mock data
    {
      id: `task-${Date.now()}`,
      task: taskData.task,
      status: taskData.status,
      priority: taskData.priority,
      assignedTo: taskData.assignedTo || 'Unassigned',
      impact: taskData.impact,
      effort: taskData.effort,
      notes: taskData.notes,
      dateLogged: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      comments: [],
      commentCount: 0,
      type: 'CRO'
    }
  );
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
