// Client-side API utility with fallbacks to mock data
import {
  mockTasks,
  mockComments,
  mockUsers,
  mockBriefs,
  mockArticles,
  mockBacklinks,
  mockKPIMetrics,
  mockKeywordPerformance,
  mockMonthlyProjections,
  mockClients
} from '@/lib/mock-data';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Function to determine if we should use mock data
// This happens if explicitly enabled or if API calls fail
const shouldUseMockData = () => {
  if (!isBrowser) return false;

  // Check if mock data is explicitly enabled
  // Try both the NEXT_PUBLIC_ version and the one from next.config.js
  const useMockData =
    process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' ||
    (typeof window !== 'undefined' && (window as any).env?.NEXT_PUBLIC_USE_MOCK_DATA === 'true') ||
    (typeof window !== 'undefined' && localStorage.getItem('use-mock-data') === 'true');

  // Check if connection issues flag is disabled via environment variable
  const isConnectionIssuesFlagDisabled =
    process.env.NEXT_PUBLIC_DISABLE_CONNECTION_ISSUES_FLAG === 'true' ||
    (typeof window !== 'undefined' && (window as any).env?.NEXT_PUBLIC_DISABLE_CONNECTION_ISSUES_FLAG === 'true');

  // If the flag is disabled, don't check for connection issues
  if (isConnectionIssuesFlagDisabled) {
    console.log('Connection issues flag is disabled, not using mock data due to connection issues');
    return useMockData;
  }

  // Check if we're on Netlify and having issues with Airtable
  const isNetlifyWithAirtableIssues =
    isNetlify() &&
    localStorage.getItem('airtable-connection-issues') === 'true';

  // Check if we've had recent API errors
  const hasRecentApiErrors =
    localStorage.getItem('api-error-timestamp') &&
    Date.now() - parseInt(localStorage.getItem('api-error-timestamp') || '0') < 60000; // Within last minute

  console.log('Environment mode:', process.env.NODE_ENV);
  console.log('Using mock data:', useMockData || isNetlifyWithAirtableIssues || hasRecentApiErrors);

  // Return true if we should use mock data
  return useMockData || isNetlifyWithAirtableIssues || hasRecentApiErrors;
};

// Function to determine if we're on Netlify
const isNetlify = () => {
  if (!isBrowser) return false;
  return window.location.hostname.includes('netlify.app');
};

// Function to clear Airtable connection issues flag
// This is not exposed via a button, but is used internally
function clearAirtableConnectionIssuesInternal() {
  if (isBrowser) {
    localStorage.removeItem('airtable-connection-issues');
    localStorage.removeItem('api-error-timestamp');
    localStorage.removeItem('use-mock-data');
    console.log('Cleared Airtable connection issues flags');
    return true;
  }
  return false;
}

// Tasks API
export async function fetchTasks() {
  // Get current user from localStorage
  const currentUser = isBrowser ? JSON.parse(localStorage.getItem('scalerrs-user') || 'null') : null;

  // Use mock data if explicitly enabled
  if (shouldUseMockData()) {
    console.log('Using mock tasks data');

    // If user is a client, filter mock data
    if (currentUser && currentUser.Role === 'Client' && currentUser.Client) {
      console.log('Filtering mock tasks for client user:', currentUser.Name);
      // Ensure Client is an array
      const clientIds = Array.isArray(currentUser.Client) ? currentUser.Client : [currentUser.Client];

      return mockTasks.filter(task => {
        // Check if task has client field that matches any of the user's clients
        if (task.Client) {
          if (Array.isArray(task.Client)) {
            return task.Client.some(client => clientIds.includes(client));
          } else {
            return clientIds.includes(task.Client);
          }
        }
        return false;
      });
    }

    return mockTasks;
  }

  try {
    // In development, use direct Airtable access through the mock data
    // This bypasses the API routes which can be problematic in local development
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Using direct Airtable access');
      // Import the getTasks function directly
      const { getTasks } = await import('@/lib/airtable');

      // If user is logged in, pass user info to getTasks
      if (currentUser) {
        // Ensure Client is an array
        const clientIds = Array.isArray(currentUser.Client) ? currentUser.Client :
                         (currentUser.Client ? [currentUser.Client] : []);
        const tasks = await getTasks(currentUser.id, currentUser.Role, clientIds);
        return tasks;
      } else {
        // If no user is logged in, return empty array or public tasks
        console.log('No user logged in, returning empty task list');
        return [];
      }
    }

    // In production, use the API routes
    // Use Netlify Functions when on Netlify
    const url = isNetlify()
      ? '/.netlify/functions/get-tasks'
      : '/api/tasks';

    console.log('Fetching tasks from:', url);

    // Add a timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout - increased for Airtable API

    // Prepare headers with user information
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Cache-Control': 'no-cache',
    };

    // Add user information to headers if available
    if (currentUser) {
      headers['x-user-id'] = currentUser.id;
      headers['x-user-role'] = currentUser.Role;

      // Convert client array to JSON string
      if (currentUser.Client) {
        // Ensure Client is an array
        const clientIds = Array.isArray(currentUser.Client) ? currentUser.Client : [currentUser.Client];
        headers['x-user-client'] = JSON.stringify(clientIds);
      } else {
        headers['x-user-client'] = JSON.stringify([]);
      }
    }

    const response = await fetch(url, {
      signal: controller.signal,
      headers,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`API request failed with status ${response.status}`);
      // Try to get more detailed error information
      try {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        throw new Error(`API request failed with status ${response.status}: ${JSON.stringify(errorData)}`);
      } catch (parseError) {
        // If we can't parse the error response, just throw the status
        throw new Error(`API request failed with status ${response.status}`);
      }
    }

    const data = await response.json();
    console.log('Tasks data received:', data);

    if (!data.tasks) {
      console.error('No tasks found in response:', data);
      throw new Error('No tasks found in response');
    }

    // Clear Airtable connection issues flag on successful API call
    if (isNetlify() && isBrowser) {
      console.log('Clearing airtable-connection-issues flag due to successful API call');
      clearAirtableConnectionIssuesInternal();
    }

    return data.tasks;
  } catch (error) {
    console.error('Error fetching tasks:', error);

    // Set a flag in localStorage to indicate Airtable connection issues
    if (isNetlify() && isBrowser) {
      console.log('Setting airtable-connection-issues flag in localStorage');
      localStorage.setItem('airtable-connection-issues', 'true');
    }

    // Fall back to mock data if the API call fails
    console.log('Falling back to mock tasks data');
    return mockTasks;
  }
}

export async function updateTaskStatus(taskId: string, status: string) {
  // Use mock data if explicitly enabled
  if (shouldUseMockData()) {
    console.log('Using mock data for updating task status:', taskId, status);
    const task = mockTasks.find(t => t.id === taskId);
    if (task) {
      task.Status = status;
    }
    return task || { id: taskId, Status: status };
  }

  try {
    // In development, use direct Airtable access
    // This bypasses the API routes which can be problematic in local development
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Using direct Airtable access for updating task');
      // Import the updateTaskStatus function directly
      const { updateTaskStatus: updateAirtableTaskStatus } = await import('@/lib/airtable');
      const updatedTask = await updateAirtableTaskStatus(taskId, status);
      return updatedTask;
    }

    // In production, use the API routes
    // Use Netlify Functions when on Netlify
    const url = isNetlify()
      ? '/.netlify/functions/update-task'
      : '/api/tasks';

    console.log('Updating task status at:', url);

    // Add a timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ taskId, status }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('Task update response:', data);
    return data.task;
  } catch (error) {
    console.error('Error updating task status:', error);
    // Fall back to mock data
    console.log('Falling back to mock data for updating task status');
    const task = mockTasks.find(t => t.id === taskId);
    if (task) {
      task.Status = status;
    }
    return task || { id: taskId, Status: status };
  }
}

// Comments API
export async function fetchComments(taskId: string) {
  // Use mock data if explicitly enabled
  if (shouldUseMockData()) {
    console.log('Using mock comments data for task:', taskId);
    return mockComments.filter(c => c.Task.includes(taskId));
  }

  try {
    // In development, use direct Airtable access
    // This bypasses the API routes which can be problematic in local development
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Using direct Airtable access for comments');
      // Import the getCommentsByTask function directly
      const { getCommentsByTask } = await import('@/lib/airtable');
      const comments = await getCommentsByTask(taskId);
      console.log('Comments received directly from Airtable:', comments);
      return comments;
    }

    // In production, use the API routes
    // Use Netlify Functions when on Netlify
    const url = isNetlify()
      ? `/.netlify/functions/get-comments?taskId=${taskId}`
      : `/api/comments?taskId=${taskId}`;

    console.log('Fetching comments from:', url);

    // Add a timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout - increased for Airtable API

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Try to get more detailed error information
      try {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        throw new Error(`API request failed with status ${response.status}: ${JSON.stringify(errorData)}`);
      } catch (parseError) {
        // If we can't parse the error response, just throw the status
        throw new Error(`API request failed with status ${response.status}`);
      }
    }

    const data = await response.json();
    console.log('Comments data received:', data);

    // Clear Airtable connection issues flag on successful API call
    if (isNetlify() && isBrowser) {
      console.log('Clearing airtable-connection-issues flag due to successful API call');
      clearAirtableConnectionIssuesInternal();
    }

    return data.comments;
  } catch (error) {
    console.error('Error fetching comments:', error);

    // Set a flag in localStorage to indicate Airtable connection issues
    if (isNetlify() && isBrowser) {
      console.log('Setting airtable-connection-issues flag in localStorage');
      localStorage.setItem('airtable-connection-issues', 'true');
    }

    // Fall back to mock data
    console.log('Falling back to mock comments data for task:', taskId);
    return mockComments.filter(c => c.Task.includes(taskId));
  }
}

export async function addComment(taskId: string, userId: string, comment: string) {
  // Use mock data if explicitly enabled
  if (shouldUseMockData()) {
    console.log('Using mock data for adding comment:', taskId, userId, comment);
    const newComment = {
      id: `comment-${Date.now()}`,
      Title: `Comment on task ${taskId}`,
      Task: [taskId],
      User: [userId],
      Comment: comment,
      CreatedAt: new Date().toISOString()
    };
    mockComments.push(newComment);
    return newComment;
  }

  try {
    // In development, use direct Airtable access
    // This bypasses the API routes which can be problematic in local development
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Using direct Airtable access for adding comment');
      // Import the addComment function directly
      const { addComment: addAirtableComment } = await import('@/lib/airtable');
      const newComment = await addAirtableComment(taskId, userId, comment);
      return newComment;
    }

    // In production, use the API routes
    // Use Netlify Functions when on Netlify
    const url = isNetlify()
      ? '/.netlify/functions/add-comment'
      : '/api/comments';

    console.log('Adding comment at:', url);

    // Add a timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ taskId, userId, comment }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('Comment added response:', data);
    return data.comment;
  } catch (error) {
    console.error('Error adding comment:', error);
    // Fall back to mock data
    console.log('Falling back to mock data for adding comment');
    const newComment = {
      id: `comment-${Date.now()}`,
      Title: `Comment on task ${taskId}`,
      Task: [taskId],
      User: [userId],
      Comment: comment,
      CreatedAt: new Date().toISOString()
    };
    mockComments.push(newComment);
    return newComment;
  }
}

// Auth API
export async function loginUser(email: string, password: string) {
  // Use mock data if explicitly enabled
  if (shouldUseMockData()) {
    console.log('Using mock user data for login:', email);
    const user = mockUsers.find(u => u.Email === email);
    if (user) {
      return { user };
    }
    throw new Error('Invalid email or password');
  }

  try {
    // Use the Netlify function for authentication when on Netlify
    const loginUrl = isNetlify() ? '/.netlify/functions/login' : '/api/auth';
    console.log('Using login URL:', loginUrl);

    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Clear Airtable connection issues flag on successful API call
    if (isNetlify() && isBrowser) {
      console.log('Clearing airtable-connection-issues flag due to successful login');
      clearAirtableConnectionIssuesInternal();
    }

    return data;
  } catch (error) {
    console.error('Error logging in:', error);
    // Fall back to mock data
    console.log('Falling back to mock user data for login:', email);
    const user = mockUsers.find(u => u.Email === email);
    if (user) {
      return { user };
    }
    throw new Error('Invalid email or password');
  }
}

// Briefs API
export async function fetchBriefs(month?: string) {
  // Use mock data if explicitly enabled
  if (shouldUseMockData()) {
    console.log('Using mock briefs data');
    return mockBriefs;
  }

  try {
    // In development, use direct Airtable access
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Using direct Airtable access for briefs');
      const { getBriefs } = await import('@/lib/airtable');

      // Get current user from localStorage
      const currentUser = isBrowser ? JSON.parse(localStorage.getItem('scalerrs-user') || 'null') : null;
      console.log('Current user from localStorage:', currentUser);

      // If user is logged in, pass user info to getBriefs
      if (currentUser) {
        try {
          // Ensure Client is an array
          const clientIds = Array.isArray(currentUser.Client) ? currentUser.Client :
                          (currentUser.Client ? [currentUser.Client] : []);
          console.log('Calling getBriefs with user ID:', currentUser.id, 'role:', currentUser.Role, 'clientIds:', clientIds, 'month:', month);
          const briefs = await getBriefs(currentUser.id, currentUser.Role, clientIds, month);
          console.log('Received briefs from Airtable:', briefs.length);

          // Log the first few briefs to see what we're working with
          if (briefs.length > 0) {
            console.log('First 3 briefs from Airtable:', briefs.slice(0, 3));
          } else {
            console.log('No briefs returned from Airtable');
          }

          return briefs;
        } catch (airtableError: any) {
          console.error('Error fetching briefs from Airtable:', airtableError);

          // Record the error timestamp
          if (isBrowser) {
            localStorage.setItem('api-error-timestamp', Date.now().toString());
            localStorage.setItem('use-mock-data', 'true');
          }

          // If we get a 403 error, fall back to mock data
          console.log('Falling back to mock briefs data due to Airtable error');
          return mockBriefs;
        }
      } else {
        // If no user is logged in, return empty array
        console.log('No user logged in, returning empty briefs list');
        return [];
      }
    }

    // In production, use the API routes
    let url = isNetlify()
      ? '/.netlify/functions/get-briefs'
      : '/api/briefs';

    // Add month parameter to URL if provided
    if (month) {
      url += `?month=${encodeURIComponent(month)}`;
    }

    console.log('Fetching briefs from:', url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    // Get current user from localStorage
    const currentUser = isBrowser ? JSON.parse(localStorage.getItem('scalerrs-user') || 'null') : null;

    // Prepare headers with user information
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Cache-Control': 'no-cache',
    };

    // Add user information to headers if available
    if (currentUser) {
      headers['x-user-id'] = currentUser.id;
      headers['x-user-role'] = currentUser.Role;

      // Convert client array to JSON string
      if (currentUser.Client) {
        // Ensure Client is an array
        const clientIds = Array.isArray(currentUser.Client) ? currentUser.Client : [currentUser.Client];
        headers['x-user-client'] = JSON.stringify(clientIds);
      } else {
        headers['x-user-client'] = JSON.stringify([]);
      }
    }

    const response = await fetch(url, {
      signal: controller.signal,
      headers,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('Briefs data received:', data);
    return data.briefs;
  } catch (error) {
    console.error('Error fetching briefs:', error);

    // Set a flag in localStorage to indicate Airtable connection issues
    if (isNetlify() && isBrowser) {
      localStorage.setItem('airtable-connection-issues', 'true');
    }

    // Fall back to mock data
    console.log('Falling back to mock briefs data');
    return mockBriefs;
  }
}

export async function updateBriefStatus(briefId: string, status: string) {
  // Use mock data if explicitly enabled
  if (shouldUseMockData()) {
    console.log('Using mock data for updating brief status:', briefId, status);
    const brief = mockBriefs.find(b => b.id === briefId);
    if (brief) {
      brief.Status = status;
    }
    return brief || { id: briefId, Status: status };
  }

  try {
    // In development, use direct Airtable access
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Using direct Airtable access for updating brief');
      try {
        const { updateBriefStatus: updateAirtableBriefStatus } = await import('@/lib/airtable');
        const updatedBrief = await updateAirtableBriefStatus(briefId, status);
        console.log('Successfully updated brief in Airtable:', updatedBrief);
        return updatedBrief;
      } catch (airtableError) {
        console.error('Error updating brief in Airtable:', airtableError);

        // Set a flag in localStorage to indicate Airtable connection issues
        if (isBrowser) {
          console.log('Setting airtable-connection-issues flag in localStorage');
          localStorage.setItem('airtable-connection-issues', 'true');
        }

        // Fall back to mock data
        console.log('Falling back to mock data for updating brief status');
        const brief = mockBriefs.find(b => b.id === briefId);
        if (brief) {
          brief.Status = status;
        }
        return brief || { id: briefId, Status: status };
      }
    }

    // In production, use the API routes
    const url = isNetlify()
      ? '/.netlify/functions/update-brief'
      : '/api/briefs';

    console.log('Updating brief status at:', url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // Increased timeout to 10 seconds

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ briefId, status }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API request failed with status ${response.status}:`, errorText);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Brief update response:', data);
    return data.brief;
  } catch (error) {
    console.error('Error updating brief status:', error);

    // Set a flag in localStorage to indicate Airtable connection issues
    if (isBrowser) {
      console.log('Setting airtable-connection-issues flag in localStorage');
      localStorage.setItem('airtable-connection-issues', 'true');
    }

    // Fall back to mock data
    console.log('Falling back to mock data for updating brief status');
    const brief = mockBriefs.find(b => b.id === briefId);
    if (brief) {
      brief.Status = status;
    }
    return brief || { id: briefId, Status: status };
  }
}

// Articles API
export async function fetchArticles(month?: string) {
  // Use mock data if explicitly enabled
  if (shouldUseMockData()) {
    console.log('Using mock articles data');
    return mockArticles;
  }

  try {
    // In development, use direct Airtable access
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Using direct Airtable access for articles');
      const { getArticles } = await import('@/lib/airtable');

      // Get current user from localStorage
      const currentUser = isBrowser ? JSON.parse(localStorage.getItem('scalerrs-user') || 'null') : null;

      // If user is logged in, pass user info to getArticles
      if (currentUser) {
        try {
          // Ensure Client is an array
          const clientIds = Array.isArray(currentUser.Client) ? currentUser.Client :
                          (currentUser.Client ? [currentUser.Client] : []);
          console.log('Calling getArticles with user ID:', currentUser.id, 'role:', currentUser.Role, 'clientIds:', clientIds, 'month:', month);
          const articles = await getArticles(currentUser.id, currentUser.Role, clientIds, month);
          console.log('Received articles from Airtable:', articles.length);
          return articles;
        } catch (airtableError: any) {
          console.error('Error fetching articles from Airtable:', airtableError);

          // Record the error timestamp
          if (isBrowser) {
            localStorage.setItem('api-error-timestamp', Date.now().toString());
            localStorage.setItem('use-mock-data', 'true');
          }

          // If we get a 403 error, fall back to mock data
          console.log('Falling back to mock articles data due to Airtable error');
          return mockArticles;
        }
      } else {
        // If no user is logged in, return empty array
        console.log('No user logged in, returning empty articles list');
        return [];
      }
    }

    // In production, use the API routes
    let url = isNetlify()
      ? '/.netlify/functions/get-articles'
      : '/api/articles';

    // Add month parameter to URL if provided
    if (month) {
      url += `?month=${encodeURIComponent(month)}`;
    }

    console.log('Fetching articles from:', url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    // Get current user from localStorage
    const currentUser = isBrowser ? JSON.parse(localStorage.getItem('scalerrs-user') || 'null') : null;

    // Prepare headers with user information
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Cache-Control': 'no-cache',
    };

    // Add user information to headers if available
    if (currentUser) {
      headers['x-user-id'] = currentUser.id;
      headers['x-user-role'] = currentUser.Role;

      // Convert client array to JSON string
      if (currentUser.Client) {
        // Ensure Client is an array
        const clientIds = Array.isArray(currentUser.Client) ? currentUser.Client : [currentUser.Client];
        headers['x-user-client'] = JSON.stringify(clientIds);
      } else {
        headers['x-user-client'] = JSON.stringify([]);
      }
    }

    const response = await fetch(url, {
      signal: controller.signal,
      headers,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('Articles data received:', data);
    return data.articles;
  } catch (error) {
    console.error('Error fetching articles:', error);

    // Set a flag in localStorage to indicate Airtable connection issues
    if (isNetlify() && isBrowser) {
      localStorage.setItem('airtable-connection-issues', 'true');
    }

    // Fall back to mock data
    console.log('Falling back to mock articles data');
    return mockArticles;
  }
}

export async function updateArticleStatus(articleId: string, status: string) {
  // Use mock data if explicitly enabled
  if (shouldUseMockData()) {
    console.log('Using mock data for updating article status:', articleId, status);
    const article = mockArticles.find(a => a.id === articleId);
    if (article) {
      article.Status = status;
    }
    return article || { id: articleId, Status: status };
  }

  try {
    // In development, use direct Airtable access
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Using direct Airtable access for updating article');
      try {
        const { updateArticleStatus: updateAirtableArticleStatus } = await import('@/lib/airtable');
        const updatedArticle = await updateAirtableArticleStatus(articleId, status);
        console.log('Successfully updated article in Airtable:', updatedArticle);
        return updatedArticle;
      } catch (airtableError) {
        console.error('Error updating article in Airtable:', airtableError);

        // Set a flag in localStorage to indicate Airtable connection issues
        if (isBrowser) {
          console.log('Setting airtable-connection-issues flag in localStorage');
          localStorage.setItem('airtable-connection-issues', 'true');
        }

        // Fall back to mock data
        console.log('Falling back to mock data for updating article status');
        const article = mockArticles.find(a => a.id === articleId);
        if (article) {
          article.Status = status;
        }
        return article || { id: articleId, Status: status };
      }
    }

    // In production, use the API routes
    const url = isNetlify()
      ? '/.netlify/functions/update-article'
      : '/api/articles';

    console.log('Updating article status at:', url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // Increased timeout to 10 seconds

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ articleId, status }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API request failed with status ${response.status}:`, errorText);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Article update response:', data);
    return data.article;
  } catch (error) {
    console.error('Error updating article status:', error);

    // Set a flag in localStorage to indicate Airtable connection issues
    if (isBrowser) {
      console.log('Setting airtable-connection-issues flag in localStorage');
      localStorage.setItem('airtable-connection-issues', 'true');
    }

    // Fall back to mock data
    console.log('Falling back to mock data for updating article status');
    const article = mockArticles.find(a => a.id === articleId);
    if (article) {
      article.Status = status;
    }
    return article || { id: articleId, Status: status };
  }
}

// Backlinks API
export async function fetchBacklinks(month?: string) {
  // Use mock data if explicitly enabled
  if (shouldUseMockData()) {
    console.log('Using mock backlinks data');
    return mockBacklinks;
  }

  try {
    // In development, use direct Airtable access
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Using direct Airtable access for backlinks');

      // Check if we have the public environment variables
      const publicApiKey = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
      const publicBaseId = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;

      console.log('Public API Key exists:', !!publicApiKey);
      console.log('Public Base ID exists:', !!publicBaseId);

      // Import the getBacklinks function directly
      const { getBacklinks } = await import('@/lib/airtable');

      try {
        console.log('Fetching backlinks with month filter:', month);
        const backlinks = await getBacklinks(month);
        console.log('Backlinks fetched successfully, count:', backlinks.length);

        // Log the first backlink to see its structure
        if (backlinks.length > 0) {
          console.log('First backlink:', backlinks[0]);
          console.log('First backlink fields:', Object.keys(backlinks[0]));
        }

        return backlinks;
      } catch (airtableError: any) {
        console.error('Error fetching directly from Airtable:', airtableError);

        // Record detailed error information
        console.error('Error details:', airtableError.message || 'No error message');
        if (airtableError.statusCode) {
          console.error('Status code:', airtableError.statusCode);
        }

        // Record the error timestamp and set flags
        if (isBrowser) {
          localStorage.setItem('api-error-timestamp', Date.now().toString());
          localStorage.setItem('use-mock-data', 'true');
          localStorage.setItem('airtable-connection-issues', 'true');
        }

        console.log('Falling back to mock backlinks data due to Airtable error');
        return mockBacklinks;
      }
    }

    // In production, use the API routes
    let url = isNetlify()
      ? '/.netlify/functions/get-backlinks'
      : '/api/backlinks';

    // Add month parameter to URL if provided
    if (month) {
      url += `?month=${encodeURIComponent(month)}`;
    }

    console.log('Fetching backlinks from:', url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('Backlinks data received:', data);
    return data.backlinks;
  } catch (error) {
    console.error('Error fetching backlinks:', error);

    // Set a flag in localStorage to indicate Airtable connection issues
    if (isBrowser) {
      localStorage.setItem('airtable-connection-issues', 'true');
    }

    // Fall back to mock data
    console.log('Falling back to mock backlinks data');
    return mockBacklinks;
  }
}

export async function updateBacklinkStatus(backlinkId: string, status: string) {
  // Use mock data if explicitly enabled
  if (shouldUseMockData()) {
    console.log('Using mock data for updating backlink status:', backlinkId, status);
    const backlink = mockBacklinks.find(b => b.id === backlinkId);
    if (backlink) {
      backlink.Status = status;
    }
    return backlink || { id: backlinkId, Status: status };
  }

  try {
    // In development, use direct Airtable access
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Using direct Airtable access for updating backlink');
      const { updateBacklinkStatus: updateAirtableBacklinkStatus } = await import('@/lib/airtable');
      const updatedBacklink = await updateAirtableBacklinkStatus(backlinkId, status);
      return updatedBacklink;
    }

    // In production, use the API routes
    const url = isNetlify()
      ? '/.netlify/functions/update-backlink'
      : '/api/backlinks';

    console.log('Updating backlink status at:', url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ backlinkId, status }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('Backlink update response:', data);
    return data.backlink;
  } catch (error) {
    console.error('Error updating backlink status:', error);
    // Fall back to mock data
    console.log('Falling back to mock data for updating backlink status');
    const backlink = mockBacklinks.find(b => b.id === backlinkId);
    if (backlink) {
      backlink.Status = status;
    }
    return backlink || { id: backlinkId, Status: status };
  }
}

// KPI Metrics API
export async function fetchKPIMetrics() {
  // Use mock data if explicitly enabled
  if (shouldUseMockData()) {
    console.log('Using mock KPI metrics data');
    return mockKPIMetrics;
  }

  try {
    // In development, use direct Airtable access
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Using direct Airtable access for KPI metrics');

      // Check if we have the public environment variables
      const publicApiKey = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
      const publicBaseId = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;

      console.log('Public API Key exists:', !!publicApiKey);
      console.log('Public Base ID exists:', !!publicBaseId);

      // Import the getKPIMetrics function directly
      const { getKPIMetrics } = await import('@/lib/airtable');

      try {
        const kpiMetrics = await getKPIMetrics();
        console.log('KPI metrics fetched successfully:', kpiMetrics);
        return kpiMetrics;
      } catch (airtableError: any) {
        console.error('Error fetching directly from Airtable:', airtableError);

        // If we get an authorization error, fall back to mock data
        if (airtableError.message && airtableError.message.includes('authorized')) {
          console.error('Authorization error with Airtable. Check your API key and permissions.');

          // Set a flag in localStorage to indicate Airtable connection issues
          if (isBrowser) {
            localStorage.setItem('airtable-connection-issues', 'true');
          }

          return mockKPIMetrics;
        }

        // Re-throw other errors to be caught by the outer catch
        throw airtableError;
      }
    }

    // In production, use the API routes
    const url = isNetlify()
      ? '/.netlify/functions/get-kpi-metrics'
      : '/api/kpi-metrics';

    console.log('Fetching KPI metrics from:', url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('KPI metrics data received:', data);
    return data.kpiMetrics;
  } catch (error) {
    console.error('Error fetching KPI metrics:', error);

    // Set a flag in localStorage to indicate Airtable connection issues
    if (isBrowser) {
      localStorage.setItem('airtable-connection-issues', 'true');
    }

    // Fall back to mock data
    console.log('Falling back to mock KPI metrics data');
    return mockKPIMetrics;
  }
}

/**
 * URL Performance functionality has been removed as it's no longer used
 * @deprecated This function is no longer used and has been removed
 */
export async function fetchURLPerformance() {
  console.log('URL Performance functionality has been removed');
  return [];
}

// Monthly Projections API
export async function fetchMonthlyProjections() {
  // Use mock data if explicitly enabled
  if (shouldUseMockData()) {
    console.log('Using mock monthly projections data');
    return mockMonthlyProjections;
  }

  try {
    // Check if we're in a browser environment
    const isBrowser = typeof window !== 'undefined';

    // In production, use Netlify Functions
    if (isBrowser && process.env.NODE_ENV === 'production') {
      console.log('Fetching monthly projections from Netlify Function');
      const response = await fetch('/.netlify/functions/get-monthly-projections');

      if (!response.ok) {
        throw new Error(`Failed to fetch monthly projections: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Monthly projections data received:', data);
      return data.monthlyProjections;
    }

    // In development, try to fetch directly from Airtable
    if (isBrowser && process.env.NODE_ENV === 'development') {
      console.log('Fetching monthly projections directly from Airtable (development mode)');

      try {
        // Import the getMonthlyProjections function directly
        const { getMonthlyProjections } = await import('@/lib/airtable/index');
        const monthlyProjections = await getMonthlyProjections();
        console.log('Monthly projections fetched successfully:', monthlyProjections);
        return monthlyProjections;
      } catch (airtableError: any) {
        console.error('Error fetching directly from Airtable:', airtableError);

        // If we get an authorization error, fall back to mock data
        if (airtableError.message && airtableError.message.includes('authorized')) {
          console.error('Authorization error with Airtable. Check your API key and permissions.');

          // Set a flag in localStorage to indicate Airtable connection issues
          if (isBrowser) {
            localStorage.setItem('airtable-connection-issues', 'true');
          }

          return mockMonthlyProjections;
        }

        // Re-throw other errors to be caught by the outer catch
        throw airtableError;
      }
    }

    // Server-side rendering or static generation
    console.log('API route for monthly projections was removed, using mock data');
    return mockMonthlyProjections;
  } catch (error) {
    console.error('Error fetching monthly projections:', error);

    // Set a flag in localStorage to indicate Airtable connection issues
    if (typeof window !== 'undefined') {
      localStorage.setItem('airtable-connection-issues', 'true');
    }

    // Fall back to mock data
    console.log('Falling back to mock monthly projections data');
    return mockMonthlyProjections;
  }
}

// Clients API
export async function fetchClients() {
  // Use mock data if explicitly enabled
  if (shouldUseMockData()) {
    console.log('Using mock clients data');
    return mockClients;
  }

  try {
    // In development, use direct Airtable access
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Using direct Airtable access for clients');
      const { getClients } = await import('@/lib/airtable');
      const clients = await getClients();
      return clients;
    }

    // In production, use the API routes
    const url = isNetlify()
      ? '/.netlify/functions/get-clients'
      : '/api/clients';

    console.log('Fetching clients from:', url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('Clients data received:', data);
    return data.clients;
  } catch (error) {
    console.error('Error fetching clients:', error);

    // Set a flag in localStorage to indicate Airtable connection issues
    if (isNetlify() && isBrowser) {
      console.log('Setting airtable-connection-issues flag in localStorage');
      localStorage.setItem('airtable-connection-issues', 'true');
    }

    // Fall back to mock data
    console.log('Falling back to mock clients data');
    return mockClients;
  }
}

export async function fetchKeywordPerformance() {
  // Use mock data if explicitly enabled
  if (shouldUseMockData()) {
    console.log('Using mock keyword performance data');
    return mockKeywordPerformance;
  }

  try {
    // In development, use direct Airtable access
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Using direct Airtable access for keyword performance');

      // Check if we have the public environment variables
      const publicApiKey = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
      const publicBaseId = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;

      console.log('Public API Key exists:', !!publicApiKey);
      console.log('Public Base ID exists:', !!publicBaseId);

      // Import the getKeywordPerformance function directly
      const { getKeywordPerformance } = await import('@/lib/airtable');

      try {
        const keywordPerformance = await getKeywordPerformance();
        console.log('Keyword performance fetched successfully:', keywordPerformance);
        return keywordPerformance;
      } catch (airtableError: any) {
        console.error('Error fetching directly from Airtable:', airtableError);

        // If we get an authorization error, fall back to mock data
        if (airtableError.message && airtableError.message.includes('authorized')) {
          console.error('Authorization error with Airtable. Check your API key and permissions.');

          // Set a flag in localStorage to indicate Airtable connection issues
          if (isBrowser) {
            localStorage.setItem('airtable-connection-issues', 'true');
          }

          return mockKeywordPerformance;
        }

        // Re-throw other errors to be caught by the outer catch
        throw airtableError;
      }
    }

    // In production, use the API routes
    const url = isNetlify()
      ? '/.netlify/functions/get-keyword-performance'
      : '/api/keyword-performance';

    console.log('Fetching keyword performance from:', url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('Keyword performance data received:', data);
    return data.keywordPerformance;
  } catch (error) {
    console.error('Error fetching keyword performance:', error);

    // Set a flag in localStorage to indicate Airtable connection issues
    if (isBrowser) {
      localStorage.setItem('airtable-connection-issues', 'true');
    }

    // Fall back to mock data
    console.log('Falling back to mock keyword performance data');
    return mockKeywordPerformance;
  }
}

// Available Months API
export async function fetchAvailableMonths() {
  // Check for cached months first
  if (isBrowser) {
    const cachedMonths = localStorage.getItem('cached-available-months');
    const cacheTimestamp = localStorage.getItem('cached-months-timestamp');

    // Use cache if it exists and is less than 1 hour old
    if (cachedMonths && cacheTimestamp) {
      const cacheAge = Date.now() - parseInt(cacheTimestamp);
      const cacheValidityPeriod = 60 * 60 * 1000; // 1 hour in milliseconds

      if (cacheAge < cacheValidityPeriod) {
        console.log('Using cached months data');
        try {
          return JSON.parse(cachedMonths);
        } catch (e) {
          console.error('Error parsing cached months:', e);
          // Continue to fetch fresh data if parsing fails
        }
      }
    }
  }

  // Use mock data if explicitly enabled
  if (shouldUseMockData()) {
    console.log('Using mock months data');
    const mockMonths = [
      'July 2024',
      'August 2024',
      'September 2024',
      'October 2024',
      'November 2024',
      'December 2024',
      'January 2025',
      'February 2025'
    ];

    // Cache the mock data
    if (isBrowser) {
      localStorage.setItem('cached-available-months', JSON.stringify(mockMonths));
      localStorage.setItem('cached-months-timestamp', Date.now().toString());
    }

    return mockMonths;
  }

  try {
    // In development, use direct Airtable access
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Using direct Airtable access for available months');
      const { getAvailableMonths } = await import('@/lib/airtable');
      const months = await getAvailableMonths();
      console.log('Months received from Airtable:', months);

      // Cache the months data
      if (isBrowser && months && months.length > 0) {
        localStorage.setItem('cached-available-months', JSON.stringify(months));
        localStorage.setItem('cached-months-timestamp', Date.now().toString());
      }

      return months;
    }

    // In production, use the API routes
    const url = isNetlify()
      ? '/.netlify/functions/get-available-months'
      : '/api/months'; // Use the existing months API route

    console.log('Fetching available months from:', url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // Reduced timeout to 10 seconds

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'max-age=3600', // Allow caching for 1 hour
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('Available months data received:', data);

    // Cache the months data
    if (isBrowser && data.months && data.months.length > 0) {
      localStorage.setItem('cached-available-months', JSON.stringify(data.months));
      localStorage.setItem('cached-months-timestamp', Date.now().toString());
    }

    return data.months;
  } catch (error) {
    console.error('Error fetching available months:', error);

    // Set a flag in localStorage to indicate Airtable connection issues
    if (isBrowser) {
      localStorage.setItem('airtable-connection-issues', 'true');
    }

    // Fall back to hardcoded months
    console.log('Falling back to hardcoded months data');
    const fallbackMonths = [
      // Current and future months (most relevant)
      'May 2024',
      'June 2024',
      'July 2024',
      'August 2024',
      'September 2024',
      'October 2024',
      'November 2024',
      'December 2024',
      'January 2025',
      'February 2025',
      'March 2025',
      'April 2025',
      'May 2025'
    ];

    // Cache the fallback data
    if (isBrowser) {
      localStorage.setItem('cached-available-months', JSON.stringify(fallbackMonths));
      localStorage.setItem('cached-months-timestamp', Date.now().toString());
    }

    return fallbackMonths;
  }
}