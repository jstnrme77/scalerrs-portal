import Airtable from 'airtable';

// Check if we have the required API keys
const hasAirtableCredentials = !!(process.env.NEXT_PUBLIC_AIRTABLE_API_KEY && process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID);

// Initialize Airtable with API key if available
let airtable: Airtable;
let base: any;

if (hasAirtableCredentials) {
  airtable = new Airtable({
    apiKey: process.env.NEXT_PUBLIC_AIRTABLE_API_KEY,
  });

  // Get the base
  base = airtable.base(process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || '');
} else {
  console.warn('Airtable API key or Base ID not found. Using mock data for build process.');
}

// Table names
export const TABLES = {
  USERS: 'Users',
  TASKS: 'Tasks',
  COMMENTS: 'Comments',
};

// Mock data for build process
const mockUsers = [
  {
    id: 'rec123',
    Name: 'Admin User',
    Email: 'admin@example.com',
    Role: 'Admin'
  },
  {
    id: 'rec456',
    Name: 'Client User',
    Email: 'client@example.com',
    Role: 'Client'
  }
];

const mockTasks = [
  {
    id: 'task1',
    Title: 'Sample Task 1',
    Description: 'This is a sample task',
    Status: 'In Progress',
    AssignedTo: ['rec123'],
    Priority: 'High'
  },
  {
    id: 'task2',
    Title: 'Sample Task 2',
    Description: 'Another sample task',
    Status: 'Completed',
    AssignedTo: ['rec456'],
    Priority: 'Medium'
  }
];

const mockComments = [
  {
    id: 'comment1',
    Title: 'Comment on task task1',
    Task: ['task1'],
    User: ['rec123'],
    Comment: 'This is a sample comment',
    CreatedAt: '2023-01-01'
  }
];

// User functions
export async function getUsers() {
  if (!hasAirtableCredentials) {
    console.log('Using mock users data');
    return mockUsers;
  }

  try {
    const records = await base(TABLES.USERS).select().all();
    return records.map((record: any) => ({
      id: record.id,
      ...record.fields,
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    // Fall back to mock data if there's an error
    console.log('Falling back to mock users data');
    return mockUsers;
  }
}

export async function getUserByEmail(email: string) {
  if (!hasAirtableCredentials) {
    console.log('Using mock user data for email:', email);
    const mockUser = mockUsers.find(user => user.Email === email);
    return mockUser || null;
  }

  try {
    const records = await base(TABLES.USERS)
      .select({
        filterByFormula: `{Email} = '${email}'`,
      })
      .all();

    if (records.length === 0) {
      return null;
    }

    return {
      id: records[0].id,
      ...records[0].fields,
    };
  } catch (error) {
    console.error('Error fetching user by email:', error);
    // Fall back to mock data
    console.log('Falling back to mock user data for email:', email);
    const mockUser = mockUsers.find(user => user.Email === email);
    return mockUser || null;
  }
}

// Task functions
export async function getTasks() {
  if (!hasAirtableCredentials) {
    console.log('Using mock tasks data');
    return mockTasks;
  }

  try {
    const records = await base(TABLES.TASKS).select().all();
    return records.map((record: any) => ({
      id: record.id,
      ...record.fields,
    }));
  } catch (error) {
    console.error('Error fetching tasks:', error);
    // Fall back to mock data
    console.log('Falling back to mock tasks data');
    return mockTasks;
  }
}

export async function updateTaskStatus(taskId: string, status: string) {
  if (!hasAirtableCredentials) {
    console.log('Using mock data for updating task status:', taskId, status);
    const updatedTask = mockTasks.find(task => task.id === taskId);
    if (updatedTask) {
      updatedTask.Status = status;
    }
    return updatedTask || { id: taskId, Status: status };
  }

  try {
    const updatedRecord = await base(TABLES.TASKS).update(taskId, {
      Status: status,
    });

    return {
      id: updatedRecord.id,
      ...updatedRecord.fields,
    };
  } catch (error) {
    console.error('Error updating task status:', error);
    // Fall back to mock data
    console.log('Falling back to mock data for updating task status');
    const updatedTask = mockTasks.find(task => task.id === taskId);
    if (updatedTask) {
      updatedTask.Status = status;
    }
    return updatedTask || { id: taskId, Status: status };
  }
}

// Comment functions
export async function addComment(taskId: string, userId: string, comment: string) {
  if (!hasAirtableCredentials) {
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
    // First, verify that the task exists
    const taskRecords = await base(TABLES.TASKS)
      .select({
        filterByFormula: `RECORD_ID() = '${taskId}'`,
      })
      .all();

    if (taskRecords.length === 0) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    // Create the comment
    const newComment = await base(TABLES.COMMENTS).create({
      Title: `Comment on task ${taskId}`, // Generate a title for the primary field
      Task: [taskId], // Link to the task by ID
      User: [userId], // Link to the user by ID
      Comment: comment,
      // Note: CreatedAt is an Airtable "Created time" field that's set automatically
    });

    return {
      id: newComment.id,
      ...newComment.fields,
    };
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

export async function getCommentsByTask(taskId: string) {
  if (!hasAirtableCredentials) {
    console.log('Using mock comments data for task:', taskId);
    return mockComments.filter(comment => comment.Task.includes(taskId));
  }

  try {
    const records = await base(TABLES.COMMENTS)
      .select({
        filterByFormula: `FIND('${taskId}', {Task})`,
        sort: [{ field: 'CreatedAt', direction: 'asc' }],
      })
      .all();

    return records.map((record: any) => ({
      id: record.id,
      ...record.fields,
    }));
  } catch (error) {
    console.error('Error fetching comments:', error);
    // Fall back to mock data
    console.log('Falling back to mock comments data for task:', taskId);
    return mockComments.filter(comment => comment.Task.includes(taskId));
  }
}
