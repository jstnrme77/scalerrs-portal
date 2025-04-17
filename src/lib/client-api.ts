// Client-side API utility with fallbacks to mock data
import { mockTasks, mockComments, mockUsers } from '@/lib/mock-data';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Function to determine if we should use mock data
// This only happens if explicitly enabled or if API calls fail
const shouldUseMockData = () => {
  if (!isBrowser) return false;

  // Only use mock data if explicitly enabled
  return process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
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
    // Use Netlify Functions when on Netlify
    const url = isNetlify()
      ? '/.netlify/functions/get-tasks'
      : '/api/tasks';

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    const data = await response.json();
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
    // Use Netlify Functions when on Netlify
    const url = isNetlify()
      ? '/.netlify/functions/update-task'
      : '/api/tasks';

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ taskId, status }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
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
    // Use Netlify Functions when on Netlify
    const url = isNetlify()
      ? `/.netlify/functions/get-comments?taskId=${taskId}`
      : `/api/comments?taskId=${taskId}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    const data = await response.json();
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
    // Use Netlify Functions when on Netlify
    const url = isNetlify()
      ? '/.netlify/functions/add-comment'
      : '/api/comments';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ taskId, userId, comment }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
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
