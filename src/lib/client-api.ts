// Client-side API utility with fallbacks to mock data
import { mockTasks, mockComments, mockUsers } from '@/lib/mock-data';

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

  console.log('Environment mode:', process.env.NODE_ENV);
  console.log('Using mock data:', useMockData);

  // Only use mock data if explicitly enabled
  return useMockData;
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
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

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
      throw new Error(`API request failed with status ${response.status}`);
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
