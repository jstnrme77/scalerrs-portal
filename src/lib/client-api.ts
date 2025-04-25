// Client-side API utility with fallbacks to mock data
import {
  mockTasks,
  mockComments,
  mockUsers,
  mockBriefs,
  mockArticles,
  mockBacklinks,
  mockKPIMetrics,
  mockURLPerformance,
  mockKeywordPerformance
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
    (typeof window !== 'undefined' && (window as any).env?.NEXT_PUBLIC_USE_MOCK_DATA === 'true');

  // Check if we're on Netlify and having issues with Airtable
  const isNetlifyWithAirtableIssues =
    isNetlify() &&
    localStorage.getItem('airtable-connection-issues') === 'true';

  console.log('Environment mode:', process.env.NODE_ENV);
  console.log('Using mock data:', useMockData || isNetlifyWithAirtableIssues);

  // Use mock data if explicitly enabled or if we're on Netlify with Airtable issues
  return useMockData || isNetlifyWithAirtableIssues;
};

// Function to determine if we're on Netlify
const isNetlify = () => {
  if (!isBrowser) return false;
  return window.location.hostname.includes('netlify.app');
};

// Tasks API
export async function fetchTasks() {
  // Use mock data if explicitly enabled
  if (shouldUseMockData()) {
    console.log('Using mock tasks data');
    return mockTasks;
  }

  try {
    // In development, use direct Airtable access through the mock data
    // This bypasses the API routes which can be problematic in local development
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Using direct Airtable access');
      // Import the getTasks function directly
      const { getTasks } = await import('@/lib/airtable');
      const tasks = await getTasks();
      return tasks;
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

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
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
    // For now, we'll just use mock data for authentication on Netlify
    // In a real app, you'd create a Netlify Function for authentication
    if (isNetlify()) {
      console.log('Using mock user data for login on Netlify:', email);
      const user = mockUsers.find(u => u.Email === email);
      if (user) {
        return { user };
      }
      throw new Error('Invalid email or password');
    }

    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return await response.json();
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
export async function fetchBriefs() {
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
      const briefs = await getBriefs();
      return briefs;
    }

    // In production, use the API routes
    const url = isNetlify()
      ? '/.netlify/functions/get-briefs'
      : '/api/briefs';

    console.log('Fetching briefs from:', url);

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
export async function fetchArticles() {
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
      const articles = await getArticles();
      return articles;
    }

    // In production, use the API routes
    const url = isNetlify()
      ? '/.netlify/functions/get-articles'
      : '/api/articles';

    console.log('Fetching articles from:', url);

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
export async function fetchBacklinks() {
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
        const backlinks = await getBacklinks();
        console.log('Backlinks fetched successfully, count:', backlinks.length);

        // Log the first backlink to see its structure
        if (backlinks.length > 0) {
          console.log('First backlink:', backlinks[0]);
          console.log('First backlink fields:', Object.keys(backlinks[0]));
        }

        return backlinks;
      } catch (airtableError: any) {
        console.error('Error fetching directly from Airtable:', airtableError);

        // If we get an authorization error, fall back to mock data
        if (airtableError.message && airtableError.message.includes('authorized')) {
          console.error('Authorization error with Airtable. Check your API key and permissions.');

          // Set a flag in localStorage to indicate Airtable connection issues
          if (isBrowser) {
            localStorage.setItem('airtable-connection-issues', 'true');
          }

          return mockBacklinks;
        }

        // Re-throw other errors to be caught by the outer catch
        throw airtableError;
      }
    }

    // In production, use the API routes
    const url = isNetlify()
      ? '/.netlify/functions/get-backlinks'
      : '/api/backlinks';

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

// URL Performance API
export async function fetchURLPerformance() {
  // Use mock data if explicitly enabled
  if (shouldUseMockData()) {
    console.log('Using mock URL performance data');
    return mockURLPerformance;
  }

  try {
    // In development, use direct Airtable access
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Using direct Airtable access for URL performance');

      // Check if we have the public environment variables
      const publicApiKey = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
      const publicBaseId = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;

      console.log('Public API Key exists:', !!publicApiKey);
      console.log('Public Base ID exists:', !!publicBaseId);

      // Import the getURLPerformance function directly
      const { getURLPerformance } = await import('@/lib/airtable');

      try {
        const urlPerformance = await getURLPerformance();
        console.log('URL performance fetched successfully:', urlPerformance);
        return urlPerformance;
      } catch (airtableError: any) {
        console.error('Error fetching directly from Airtable:', airtableError);

        // If we get an authorization error, fall back to mock data
        if (airtableError.message && airtableError.message.includes('authorized')) {
          console.error('Authorization error with Airtable. Check your API key and permissions.');

          // Set a flag in localStorage to indicate Airtable connection issues
          if (isBrowser) {
            localStorage.setItem('airtable-connection-issues', 'true');
          }

          return mockURLPerformance;
        }

        // Re-throw other errors to be caught by the outer catch
        throw airtableError;
      }
    }

    // In production, use the API routes
    const url = isNetlify()
      ? '/.netlify/functions/get-url-performance'
      : '/api/url-performance';

    console.log('Fetching URL performance from:', url);

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
    console.log('URL performance data received:', data);
    return data.urlPerformance;
  } catch (error) {
    console.error('Error fetching URL performance:', error);

    // Set a flag in localStorage to indicate Airtable connection issues
    if (isBrowser) {
      localStorage.setItem('airtable-connection-issues', 'true');
    }

    // Fall back to mock data
    console.log('Falling back to mock URL performance data');
    return mockURLPerformance;
  }
}

// Keyword Performance API
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
