import { mockUsers, mockTasks, mockComments } from './mock-data';

// Check if we're in a static environment (GitHub Pages)
const isStaticEnvironment = () => {
  if (typeof window === 'undefined') return false;
  return window.location.hostname.includes('github.io') || 
         process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
};

// Generic fetch wrapper with error handling and static environment check
async function fetchWithFallback<T>(
  url: string, 
  options?: RequestInit,
  mockData?: T
): Promise<T> {
  // If we're in a static environment, return mock data immediately
  if (isStaticEnvironment() && mockData) {
    console.log(`Static environment detected, using mock data for: ${url}`);
    return mockData as T;
  }

  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json() as T;
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error);
    
    // If fetch fails and we have mock data, use it as fallback
    if (mockData) {
      console.log(`Falling back to mock data for: ${url}`);
      return mockData as T;
    }
    
    throw error;
  }
}

// API functions that match the server-side API routes
export async function loginUser(email: string, password: string) {
  // For static environments, find the user in mock data
  if (isStaticEnvironment()) {
    const user = mockUsers.find(u => u.Email === email);
    if (user) {
      return { user };
    }
    throw new Error('Invalid email or password');
  }
  
  return fetchWithFallback(
    '/api/auth',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    },
    { user: mockUsers.find(u => u.Email === email) }
  );
}

export async function fetchTasks() {
  return fetchWithFallback('/api/tasks', undefined, { tasks: mockTasks });
}

export async function updateTask(taskId: string, status: string) {
  // For static environments, update the task in mock data
  if (isStaticEnvironment()) {
    const task = mockTasks.find(t => t.id === taskId);
    if (task) {
      task.Status = status;
      return { task };
    }
  }
  
  return fetchWithFallback(
    '/api/tasks',
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, status })
    },
    { 
      task: mockTasks.find(t => t.id === taskId) || 
            { id: taskId, Status: status } 
    }
  );
}

export async function fetchComments(taskId: string) {
  // For static environments, filter comments from mock data
  if (isStaticEnvironment()) {
    const comments = mockComments.filter(c => c.Task.includes(taskId));
    return { comments };
  }
  
  return fetchWithFallback(
    `/api/comments?taskId=${taskId}`,
    undefined,
    { comments: mockComments.filter(c => c.Task.includes(taskId)) }
  );
}

export async function addTaskComment(taskId: string, userId: string, comment: string) {
  // For static environments, create a new comment in mock data
  if (isStaticEnvironment()) {
    const newComment = {
      id: `comment-${Date.now()}`,
      Title: `Comment on task ${taskId}`,
      Task: [taskId],
      User: [userId],
      Comment: comment,
      CreatedAt: new Date().toISOString()
    };
    mockComments.push(newComment);
    return { comment: newComment };
  }
  
  return fetchWithFallback(
    '/api/comments',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, userId, comment })
    },
    { 
      comment: {
        id: `comment-${Date.now()}`,
        Title: `Comment on task ${taskId}`,
        Task: [taskId],
        User: [userId],
        Comment: comment,
        CreatedAt: new Date().toISOString()
      } 
    }
  );
}
