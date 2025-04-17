import Airtable from 'airtable';

// Check if we have the required API keys
const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;

const hasAirtableCredentials = !!(apiKey && baseId);

// Initialize Airtable with API key if available
let airtable: Airtable;
let base: any;

if (hasAirtableCredentials) {
  console.log('Airtable credentials found. Initializing Airtable client.');
  airtable = new Airtable({
    apiKey: apiKey,
  });

  // Get the base
  base = airtable.base(baseId || '');
} else {
  console.warn(`Airtable API key or Base ID not found. Using mock data for build process.`);
  console.warn(`API Key exists: ${!!apiKey}, Base ID exists: ${!!baseId}`);
  console.warn('Environment: ' + process.env.NODE_ENV);
}

// Table names
export const TABLES = {
  USERS: 'Users',
  TASKS: 'Tasks',
  COMMENTS: 'Comments',
};

// Import mock data from separate file
import { mockUsers, mockTasks, mockComments } from './mock-data';

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
    console.log('Using mock tasks data - no Airtable credentials');
    console.log('API Key exists:', !!apiKey);
    console.log('Base ID exists:', !!baseId);
    return mockTasks;
  }

  try {
    console.log('Fetching tasks from Airtable...');
    console.log('Using base ID:', baseId);

    const records = await base(TABLES.TASKS).select().all();
    console.log(`Successfully fetched ${records.length} tasks from Airtable`);

    return records.map((record: any) => ({
      id: record.id,
      ...record.fields,
    }));
  } catch (error) {
    console.error('Error fetching tasks from Airtable:', error);
    // Fall back to mock data
    console.log('Falling back to mock tasks data due to error');
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
    console.log('Using mock comments data for task (no credentials):', taskId);
    return mockComments.filter(comment => comment.Task.includes(taskId));
  }

  try {
    console.log('Fetching comments from Airtable for task:', taskId);
    console.log('Using table:', TABLES.COMMENTS);

    // Log the task ID we're searching for
    console.log('Searching for comments with Task ID:', taskId);

    // First, let's get all comments to see what's available
    const allComments = await base(TABLES.COMMENTS).select().all();
    console.log('All comments in Airtable:', allComments.length);

    if (allComments.length > 0) {
      // Log the first comment to see its structure
      console.log('Sample comment structure:', allComments[0].fields);
      console.log('Sample comment Task field:', allComments[0].fields.Task);

      // Log all field names to help debug
      console.log('Available fields in first comment:', Object.keys(allComments[0].fields));
    }

    // Now try to filter for our specific task
    // For linked records in Airtable, we need to use a different approach
    // The Task field will be an array of record IDs
    const records = await base(TABLES.COMMENTS)
      .select({
        // Filter for comments where the Task field contains our taskId
        // For linked records, we need to use the FIND function to check if the taskId is in the array
        filterByFormula: `SEARCH('${taskId}', ARRAYJOIN(Task, ',')) > 0`,
        sort: [{ field: 'CreatedAt', direction: 'desc' }],
      })
      .all();

    // If we didn't find any comments, try a different approach
    if (records.length === 0) {
      console.log('No comments found with first approach, trying alternative...');

      // Try getting all comments and filtering manually
      const allTaskComments = allComments.filter(record => {
        const taskField = record.fields.Task;

        // Log the task field to help debug
        console.log(`Comment ${record.id} Task field:`, taskField);

        // Check if the Task field contains our taskId
        if (Array.isArray(taskField)) {
          return taskField.includes(taskId);
        } else if (typeof taskField === 'string') {
          return taskField === taskId;
        }
        return false;
      });

      console.log(`Found ${allTaskComments.length} comments with manual filtering`);

      if (allTaskComments.length > 0) {
        return allTaskComments.map(record => ({
          id: record.id,
          ...record.fields,
          // Ensure we have the expected fields
          Title: record.fields.Title || '',
          Comment: record.fields.Comment || '',
          Task: Array.isArray(record.fields.Task) ? record.fields.Task : [record.fields.Task || ''],
          User: Array.isArray(record.fields.User) ? record.fields.User : [record.fields.User || ''],
          CreatedAt: record.fields.CreatedAt || new Date().toISOString()
        }));
      }
    }

    console.log(`Found ${records.length} comments in Airtable for task ${taskId}`);

    if (records.length > 0) {
      console.log('Sample comment fields:', records[0].fields);
    }

    // Map records to our expected format, with fallbacks for different field names
    const comments = records.map((record: any) => {
      const fields = record.fields;

      // Log each record to help debug
      console.log('Processing comment record:', record.id, fields);

      // Log the specific fields we're looking for
      console.log('Title field:', fields.Title);
      console.log('Comment field:', fields.Comment);
      console.log('Task field:', fields.Task);
      console.log('User field:', fields.User);
      console.log('CreatedAt field:', fields.CreatedAt);

      return {
        id: record.id,
        // Use the fields from your Airtable schema
        Title: fields.Title || '',
        Comment: fields.Comment || '',
        // For linked records, Task will be an array of record IDs
        Task: Array.isArray(fields.Task) ? fields.Task : [fields.Task || ''],
        // For linked records, User will be an array of record IDs
        User: Array.isArray(fields.User) ? fields.User : [fields.User || ''],
        // CreatedAt might be a timestamp or ISO string
        CreatedAt: fields.CreatedAt || fields['Created Time'] || new Date().toISOString(),
        // Include all original fields as well
        ...fields
      };
    });

    return comments;
  } catch (error) {
    console.error('Error fetching comments from Airtable:', error);
    // Fall back to mock data
    console.log('Falling back to mock comments data for task:', taskId);
    return mockComments.filter(comment => comment.Task.includes(taskId));
  }
}
