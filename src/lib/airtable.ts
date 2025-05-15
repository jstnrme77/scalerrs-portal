import Airtable from 'airtable';

// Check if we have the required API keys
// Note: AIRTABLE_API_KEY should now be a personal access token
const apiKey = process.env.AIRTABLE_API_KEY || process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;

// For debugging purposes, log the first few characters of the token and the base ID
if (apiKey) {
  const tokenPrefix = apiKey.substring(0, 10);
  console.log('Token prefix:', tokenPrefix + '...');

  // Check if it's a personal access token (should start with 'pat')
  if (!apiKey.startsWith('pat')) {
    console.warn('Warning: API key does not appear to be a personal access token (should start with "pat")');
  }
}

console.log('Using Airtable base ID:', baseId);

const hasAirtableCredentials = !!(apiKey && baseId);

// Initialize Airtable with API key if available
let airtable: Airtable;
let base: any;

if (hasAirtableCredentials) {
  console.log('Airtable credentials found. Initializing Airtable client.');

  // Check if we're in a browser environment
  const isBrowser = typeof window !== 'undefined';

  if (isBrowser) {
    console.log('Running in browser environment. Using client-side Airtable initialization.');

    // In browser environment, we need to use the Next.js public env vars
    const publicApiKey = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY || apiKey;
    const publicBaseId = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || baseId;

    if (publicApiKey && publicBaseId) {
      airtable = new Airtable({
        apiKey: publicApiKey,
        endpointUrl: 'https://api.airtable.com',
      });

      // Get the base
      base = airtable.base(publicBaseId);
      console.log('Airtable client initialized with public credentials');
    } else {
      console.warn('Public Airtable credentials not found. Using mock data.');
      console.warn(`Public API Key exists: ${!!publicApiKey}, Public Base ID exists: ${!!publicBaseId}`);
    }
  } else {
    // Server-side initialization
    airtable = new Airtable({
      apiKey: apiKey,
      endpointUrl: 'https://api.airtable.com',
    });

    // Get the base
    base = airtable.base(baseId);
    console.log('Airtable client initialized with server-side credentials');
  }
} else {
  console.warn(`Airtable API key or Base ID not found. Using mock data for build process.`);
  console.warn(`API Key exists: ${!!apiKey}, Base ID exists: ${!!baseId}`);
  console.warn('Environment: ' + process.env.NODE_ENV);
}

// Table names for the new Airtable base (based on schema)
export const TABLES = {
  // User Management
  USERS: 'Users',
  CLIENTS: 'Clients',

  // Content Management
  BRIEFS: 'Briefs',
  ARTICLES: 'Articles',
  BACKLINKS: 'Backlinks',
  CLUSTERS: 'Clusters',

  // Task Management
  TASKS: 'Tasks',
  COMMENTS: 'Comments',

  // Performance Data
  KEYWORDS: 'Keywords',
  URL_PERFORMANCE: 'URL Performance',
  KPI_METRICS: 'KPI Metrics',
  MONTHLY_PROJECTIONS: 'Monthly Projections',

  // System Tables
  INTEGRATIONS: 'Integrations',
  NOTIFICATIONS: 'Notifications',
  REPORTS: 'Reports',
  ACTIVITY_LOG: 'Activity Log'
};

// Alternative table names (in case the casing is different)
export const ALT_TABLES = {
  KPI_METRICS: ['kpi_metrics', 'kpimetrics', 'kpi metrics', 'KPIMetrics'],
  URL_PERFORMANCE: ['url_performance', 'urlperformance', 'url performance', 'URLPerformance'],
  KEYWORDS: ['keyword_performance', 'keywordperformance', 'keyword performance', 'KeywordPerformance', 'keywords']
};

// Import mock data from separate file
import {
  mockUsers,
  mockTasks,
  mockComments,
  mockBriefs,
  mockArticles,
  mockBacklinks,
  mockKPIMetrics,
  mockURLPerformance,
  mockKeywordPerformance,
  mockClients
} from './mock-data';

// Client functions
export async function getClients() {
  if (!hasAirtableCredentials) {
    console.log('Using mock clients data - no Airtable credentials');
    return mockClients;
  }

  try {
    console.log('Fetching clients from Airtable...');
    const records = await base(TABLES.CLIENTS).select().all();
    console.log(`Successfully fetched ${records.length} clients from Airtable`);

    return records.map((record: any) => ({
      id: record.id,
      ...record.fields
    }));
  } catch (error: any) {
    console.error('Error fetching clients:', error);
    console.error('Error details:', error.message || 'No error message available');

    // Fall back to mock data
    console.log('Falling back to mock clients data');
    return mockClients;
  }
}

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

// Get user by email
export async function getUserByEmail(email: string) {
  if (!hasAirtableCredentials) {
    console.log('Using mock data for getUserByEmail');
    const mockUser = mockUsers.find(user => user.Email && user.Email.toLowerCase() === email.toLowerCase()) || null;

    console.log('Found mock user (no credentials):', mockUser);

    // Ensure the mock user has a Name field
    if (mockUser && !mockUser.Name) {
      console.warn('Mock user does not have a Name field:', mockUser);

      // For admin@example.com, use "Admin User" as the name
      if (mockUser.Email === 'admin@example.com') {
        mockUser.Name = 'Admin User';
      }
      // For client@example.com, use "Client User" as the name
      else if (mockUser.Email === 'client@example.com') {
        mockUser.Name = 'Client User';
      }
      // For seo@example.com, use "SEO Specialist" as the name
      else if (mockUser.Email === 'seo@example.com') {
        mockUser.Name = 'SEO Specialist';
      }
      // Otherwise, set a default name based on email
      else {
        mockUser.Name = mockUser.Email.split('@')[0] || 'User';
      }

      console.log('Set default name for mock user:', mockUser.Name);
    }

    return mockUser;
  }

  try {
    console.log(`Fetching user with email: ${email}`);
    // Query Airtable for the user with the matching email
    const records = await base(TABLES.USERS)
      .select({
        filterByFormula: `LOWER({Email}) = "${email.toLowerCase()}"`,
        maxRecords: 1
      })
      .firstPage();

    if (records.length === 0) {
      console.log(`No user found with email: ${email}`);
      return null;
    }

    console.log(`Found user with email: ${email}`);

    // Log the raw record to see what fields are available
    console.log('Raw user record from Airtable:', records[0]);
    console.log('User fields from Airtable:', records[0].fields);

    const user = {
      id: records[0].id,
      ...records[0].fields
    };

    // Check if the user has a Name field
    if (!user.Name) {
      console.warn('User record does not have a Name field:', user);

      // Try to find an alternative field that might contain the name
      const possibleNameFields = ['name', 'Name', 'FullName', 'full_name', 'DisplayName', 'display_name'];
      for (const field of possibleNameFields) {
        if (records[0].fields[field]) {
          console.log(`Found alternative name field: ${field}`);
          user.Name = records[0].fields[field];
          break;
        }
      }

      // If still no name, use email-specific names or fallback
      if (!user.Name && user.Email) {
        console.log('Using email-specific names or fallback for name');

        // For admin@example.com, use "Admin User" as the name
        if (user.Email === 'admin@example.com') {
          user.Name = 'Admin User';
        }
        // For client@example.com, use "Client User" as the name
        else if (user.Email === 'client@example.com') {
          user.Name = 'Client User';
        }
        // For seo@example.com, use "SEO Specialist" as the name
        else if (user.Email === 'seo@example.com') {
          user.Name = 'SEO Specialist';
        }
        // Otherwise, use email as fallback
        else {
          user.Name = user.Email.split('@')[0];
        }
      }
    }

    console.log('Processed user object:', user);
    return user;
  } catch (error: any) {
    console.error('Error fetching user by email:', error.message);

    // Fall back to mock data
    console.log('Falling back to mock data for getUserByEmail');
    const mockUser = mockUsers.find(user => user.Email && user.Email.toLowerCase() === email.toLowerCase()) || null;

    console.log('Found mock user:', mockUser);

    // Ensure the mock user has a Name field
    if (mockUser && !mockUser.Name) {
      console.warn('Mock user does not have a Name field:', mockUser);

      // For admin@example.com, use "Admin User" as the name
      if (mockUser.Email === 'admin@example.com') {
        mockUser.Name = 'Admin User';
      }
      // For client@example.com, use "Client User" as the name
      else if (mockUser.Email === 'client@example.com') {
        mockUser.Name = 'Client User';
      }
      // For seo@example.com, use "SEO Specialist" as the name
      else if (mockUser.Email === 'seo@example.com') {
        mockUser.Name = 'SEO Specialist';
      }
      // Otherwise, set a default name based on email
      else {
        mockUser.Name = mockUser.Email.split('@')[0] || 'User';
      }

      console.log('Set default name for mock user:', mockUser.Name);
    }

    return mockUser;
  }
}



// Function to create a new user in Airtable
export async function createUser(userData: {
  Name: string;
  Email: string;
  Role: string;
  Client?: string[];
}) {
  if (!hasAirtableCredentials) {
    console.log('Using mock data for creating user:', userData);
    // Create a mock user with an ID
    const newUser = {
      id: `rec${Date.now()}`,
      ...userData,
      Client: userData.Client || [],
      CreatedAt: new Date().toISOString()
    };
    mockUsers.push(newUser);
    return newUser;
  }

  try {
    // Check if user with this email already exists
    const existingUser = await getUserByEmail(userData.Email);
    if (existingUser) {
      throw new Error(`User with email ${userData.Email} already exists`);
    }

    // Create the user in Airtable
    const newUser = await base(TABLES.USERS).create({
      Name: userData.Name,
      Email: userData.Email,
      Role: userData.Role,
      Client: userData.Client || [],
      CreatedAt: new Date().toISOString()
    });

    console.log('User created successfully:', newUser.id);

    return {
      id: newUser.id,
      ...newUser.fields
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Task functions
export async function getTasks(userId?: string | null, userRole?: string | null, clientIds?: string[] | null) {
  if (!hasAirtableCredentials) {
    console.log('Using mock tasks data - no Airtable credentials');
    console.log('API Key exists:', !!apiKey);
    console.log('Base ID exists:', !!baseId);

    // Filter mock data based on user role and ID
    if (userId && userRole) {
      console.log(`Filtering mock tasks for user: ${userId}, role: ${userRole}`);

      // For client users, filter by client IDs
      if (userRole === 'Client' && clientIds && clientIds.length > 0) {
        console.log('Filtering mock tasks by client:', clientIds);
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

      // For non-admin users who aren't clients, only show tasks assigned to them
      if (userRole !== 'Admin' && userRole !== 'Client') {
        return mockTasks.filter(task => {
          // Check if the task is assigned to this user
          if (task.AssignedTo) {
            if (Array.isArray(task.AssignedTo)) {
              return task.AssignedTo.includes(userId);
            } else {
              return task.AssignedTo === userId;
            }
          }
          return false;
        });
      }
    }

    return mockTasks;
  }

  try {
    console.log('Fetching tasks from Airtable...');
    console.log('Using base ID:', baseId);

    // Build the query with appropriate filters
    let filterFormula = '';

    // If user is a client, filter by client
    if (userRole === 'Client' && clientIds && clientIds.length > 0) {
      console.log('Filtering tasks by client:', clientIds);

      // Create a filter formula for client IDs
      // This handles the case where Client field is an array of record IDs
      const clientFilters = clientIds.map(clientId =>
        `SEARCH('${clientId}', ARRAYJOIN(Client, ',')) > 0`
      );

      // Combine filters with OR
      filterFormula = `OR(${clientFilters.join(',')})`;
    }
    // If user is not an admin or client, filter by assigned user
    else if (userId && userRole && userRole !== 'Admin') {
      console.log(`Filtering tasks for user: ${userId}, role: ${userRole}`);

      // Filter for tasks assigned to this user
      filterFormula = `SEARCH('${userId}', ARRAYJOIN(AssignedTo, ',')) > 0`;
    }

    // Apply the filter if one was created
    let query;
    if (filterFormula) {
      console.log('Using filter formula:', filterFormula);
      query = base(TABLES.TASKS).select({
        filterByFormula: filterFormula
      });
    } else {
      query = base(TABLES.TASKS).select();
    }

    const records = await query.all();
    console.log(`Successfully fetched ${records.length} tasks from Airtable`);

    return records.map((record: any) => {
      const fields = record.fields;

      // Ensure we have consistent field names
      // If the record has Title but not Name, add Name as an alias
      if (fields.Title && !fields.Name) {
        fields.Name = fields.Title;
      }
      // If the record has Name but not Title, add Title as an alias
      else if (fields.Name && !fields.Title) {
        fields.Title = fields.Name;
      }

      return {
        id: record.id,
        ...fields,
      };
    });
  } catch (error) {
    console.error('Error fetching tasks from Airtable:', error);
    // Fall back to mock data
    console.log('Falling back to mock tasks data due to error');

    // Filter mock data based on user role and ID
    if (userId && userRole) {
      console.log(`Filtering mock tasks for user: ${userId}, role: ${userRole}`);

      // For client users, filter by client IDs
      if (userRole === 'Client' && clientIds && clientIds.length > 0) {
        console.log('Filtering mock tasks by client:', clientIds);
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

      // For non-admin users who aren't clients, only show tasks assigned to them
      if (userRole !== 'Admin' && userRole !== 'Client') {
        return mockTasks.filter(task => {
          // Check if the task is assigned to this user
          if (task.AssignedTo) {
            if (Array.isArray(task.AssignedTo)) {
              return task.AssignedTo.includes(userId);
            } else {
              return task.AssignedTo === userId;
            }
          }
          return false;
        });
      }
    }

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
      const allTaskComments = allComments.filter((record: any) => {
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
        return allTaskComments.map((record: any) => ({
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
    return mockComments.filter((comment: any) => comment.Task.includes(taskId));
  }
}

// Brief functions - now using Keywords table
export async function getBriefs(userId?: string | null, userRole?: string | null, clientIds?: string[] | null, month?: string | null) {
  if (!hasAirtableCredentials) {
    console.log('Using mock briefs data');
    return mockBriefs;
  }

  try {
    console.log('Fetching briefs from Keywords table in Airtable...');
    console.log('Using base ID:', baseId);
    console.log('Using table name:', TABLES.KEYWORDS);

    // Check if the Keywords table exists and we can access it
    try {
      // First, try to get just one record to verify the table exists and is accessible
      const checkRecord = await base(TABLES.KEYWORDS).select({ maxRecords: 1 }).firstPage();
      console.log('Keywords table check:', checkRecord.length > 0 ? 'Table exists and has records' : 'Table exists but is empty');

      if (checkRecord.length > 0) {
        console.log('Sample Keywords record structure:', checkRecord[0].fields);
        console.log('Available fields in Keywords:', Object.keys(checkRecord[0].fields));
      } else {
        console.log('Keywords table is empty. Using mock data...');
        return mockBriefs;
      }
    } catch (checkError: any) {
      console.error('Error checking Keywords table:', checkError.message);

      if (checkError.message && checkError.message.includes('Table not found')) {
        console.error('The Keywords table does not exist in this base');
        return mockBriefs;
      }

      if (checkError.message && checkError.message.includes('authorized')) {
        console.error('Authorization error. Your token may not have the correct permissions.');
        console.error('Make sure your token has the following scopes: data.records:read, data.records:write, schema.bases:read');
        return mockBriefs;
      }

      // For other errors, fall back to mock data
      return mockBriefs;
    }

    // Build the query with appropriate filters
    let filterFormula = '';
    let filterParts = [];

    // If user is a client, filter by client
    if (userRole === 'Client' && clientIds && clientIds.length > 0) {
      console.log('Filtering keywords by client:', clientIds);

      // Create a filter formula for client IDs
      const clientFilters = clientIds.map(clientId =>
        `SEARCH('${clientId}', ARRAYJOIN(Client, ',')) > 0`
      );

      // Add client filter to filter parts
      filterParts.push(`OR(${clientFilters.join(',')})`);
    }
    // If user is not an admin or client, filter by assigned user
    else if (userId && userRole && userRole !== 'Admin') {
      console.log(`Filtering keywords for user: ${userId}, role: ${userRole}`);

      // Filter for keywords where this user is assigned
      const userFilters = [
        `SEARCH('${userId}', ARRAYJOIN({SEO Strategist}, ',')) > 0`,
        `SEARCH('${userId}', ARRAYJOIN({Content Writer}, ',')) > 0`,
        `SEARCH('${userId}', ARRAYJOIN({Content Editor}, ',')) > 0`
      ];

      // Add user filter to filter parts
      filterParts.push(`OR(${userFilters.join(',')})`);
    }

    // If month is specified, add month filter
    if (month) {
      console.log('Filtering keywords by month:', month);

      try {
        // Check for both exact match and month-only match
        // For example, if month is "January 2025", we should match both "January 2025" and "January"
        const monthOnly = month.split(' ')[0]; // Extract just the month name

        // Create month filter using the correct field name
        // The field name is "Month (Keyword Targets)" as shown in the screenshot
        const monthFilters = [
          `{Month (Keyword Targets)} = '${month}'`
        ];

        // If we extracted a month name, also check for that
        if (monthOnly && monthOnly !== month) {
          monthFilters.push(`{Month (Keyword Targets)} = '${monthOnly}'`);
        }

        // Add month filter to filter parts
        const monthFilter = `OR(${monthFilters.join(',')})`;
        console.log('Month filter formula:', monthFilter);
        filterParts.push(monthFilter);
      } catch (monthFilterError) {
        console.error('Error creating month filter:', monthFilterError);
        // Continue without month filter if there's an error
      }
    }

    // Combine all filter parts with AND
    if (filterParts.length > 0) {
      if (filterParts.length === 1) {
        filterFormula = filterParts[0];
      } else {
        filterFormula = `AND(${filterParts.join(',')})`;
      }
    }

    // Apply the filter if one was created
    let query;
    if (filterFormula) {
      console.log('Using filter formula:', filterFormula);
      query = base(TABLES.KEYWORDS).select({
        filterByFormula: filterFormula
      });
    } else {
      query = base(TABLES.KEYWORDS).select();
    }

    // Fetch the records
    const records = await query.all();
    console.log(`Successfully fetched ${records.length} keywords records from Airtable`);

    // Log the first record to see what fields are available
    if (records.length > 0) {
      console.log('First keyword record fields:', records[0].fields);
      console.log('First keyword record field keys:', Object.keys(records[0].fields));

      // Check specifically for the status field
      console.log('Status field value:', records[0].fields['Keyword/Content Status']);
      console.log('Alternative Status field value:', records[0].fields.Status);

      // Check for other common field names that might contain status
      const possibleStatusFields = [
        'Keyword/Content Status',
        'Status',
        'Content Status',
        'KeywordStatus',
        'Keyword Status',
        'Brief Status',
        'Article Status'
      ];

      possibleStatusFields.forEach(fieldName => {
        console.log(`Field "${fieldName}" exists:`, fieldName in records[0].fields);
        if (fieldName in records[0].fields) {
          console.log(`Field "${fieldName}" value:`, records[0].fields[fieldName]);
        }
      });

      // Log all field names and values for the first record
      console.log('All fields in first record:');
      Object.entries(records[0].fields).forEach(([key, value]) => {
        console.log(`Field: "${key}", Value:`, value);
      });
    }

    // Filter and map the records to our expected Brief format
    // We'll consider keywords with Status containing "Brief" as briefs
    // Log each record's status to debug the filtering issue
    console.log('Checking records for Brief status...');
    records.forEach((record: any, index) => {
      const status = record.fields['Keyword/Content Status'] || record.fields.Status || '';
      console.log(`Record ${index} status: "${status}", includes 'Brief': ${status.includes('Brief')}`);
    });

    // Log all records for debugging
    console.log(`Total records fetched: ${records.length}`);
    if (records.length > 0) {
      console.log('First 3 records field keys:');
      records.slice(0, 3).forEach((record, index) => {
        console.log(`Record ${index} field keys:`, Object.keys(record.fields));
      });
    }

    // Try to find the field that contains status information
    const statusFieldName = records.length > 0 ?
      Object.keys(records[0].fields).find(key =>
        key === 'Brief Status' ||
        key === 'Keyword/Content Status' ||
        key === 'Status' ||
        key.toLowerCase().includes('status')
      ) : null;

    console.log('Found status field name:', statusFieldName);

    // Log all available fields in the first record
    if (records.length > 0) {
      console.log('All available fields in first record:', Object.keys(records[0].fields));
    }

    // Log all status values for debugging
    console.log('All status values:');
    records.forEach((record, index) => {
      const statusValue = statusFieldName ? record.fields[statusFieldName] :
                         (record.fields['Keyword/Content Status'] || record.fields.Status || 'No status');
      console.log(`Record ${index} status: "${statusValue}"`);
    });

    // Use the identified status field or fall back to our previous approach
    // For debugging, log all status values first
    console.log('All status values in records:');
    records.forEach((record, index) => {
      const status = statusFieldName ? record.fields[statusFieldName] :
                    (record.fields['Keyword/Content Status'] || record.fields.Status || 'No status');
      console.log(`Record ${index} status: "${status}"`);
    });

    // Try different approaches to find briefs
    // 1. First try to find records with status containing "Brief"
    let briefRecords = records.filter((record: any) => {
      if (statusFieldName && record.fields[statusFieldName]) {
        const status = record.fields[statusFieldName];
        return status.includes('Brief') || status.toLowerCase().includes('brief');
      }

      const status = record.fields['Keyword/Content Status'] || record.fields.Status || '';
      return status.includes('Brief') || status.toLowerCase().includes('brief');
    });

    console.log(`Found ${briefRecords.length} briefs with status containing "Brief"`);

    // Log the status values of the first few records to help debug
    if (briefRecords.length > 0) {
      console.log('First 3 brief records with their status:');
      briefRecords.slice(0, 3).forEach((record, index) => {
        const status = statusFieldName ? record.fields[statusFieldName] :
                      (record.fields['Keyword/Content Status'] || record.fields.Status || 'No status');
        console.log(`Brief ${index} ID: ${record.id}, Status: "${status}"`);
      });
    }

    console.log(`Found ${briefRecords.length} briefs with status containing "Brief"`);

    // 2. If no briefs found, try to find records with specific brief-related statuses
    if (briefRecords.length === 0) {
      console.log('No briefs found with "Brief" in status, trying specific brief statuses');
      briefRecords = records.filter((record: any) => {
        const status = statusFieldName ? record.fields[statusFieldName] :
                      (record.fields['Keyword/Content Status'] || record.fields.Status || '');

        // Check for specific brief statuses (both exact match and case-insensitive)
        const statusLower = status.toLowerCase();

        // Check for the exact status values from your Airtable screenshot
        return status === 'Brief Creation Needed' || statusLower === 'brief creation needed' ||
               status === 'Brief Approved' || statusLower === 'brief approved' ||
               status === 'Brief Under Internal Review' || statusLower === 'brief under internal review' ||

               // Also check for generic brief statuses
               status === 'In Progress' || statusLower === 'in progress' ||
               status === 'Needs Input' || statusLower === 'needs input' ||
               status === 'Review Brief' || statusLower === 'review brief' ||

               // Add more potential brief statuses from your Airtable
               status === 'Brief In Progress' || statusLower === 'brief in progress' ||
               status === 'Brief Needs Input' || statusLower === 'brief needs input' ||
               status === 'Brief Review' || statusLower === 'brief review' ||
               status === 'Approved Brief' || statusLower === 'approved brief';
      });

      // Log the status values of the first few records to help debug
      if (briefRecords.length > 0) {
        console.log('First 3 brief records with specific statuses:');
        briefRecords.slice(0, 3).forEach((record, index) => {
          const status = statusFieldName ? record.fields[statusFieldName] :
                        (record.fields['Keyword/Content Status'] || record.fields.Status || 'No status');
          console.log(`Brief ${index} ID: ${record.id}, Status: "${status}"`);
        });
      }

      console.log(`Found ${briefRecords.length} briefs with specific brief statuses`);
    }

    // 3. If still no briefs found, try to find records with "brief" in any field
    if (briefRecords.length === 0) {
      console.log('No briefs found with specific statuses, looking for "brief" in any field');
      briefRecords = records.filter((record: any) => {
        // Check if any field contains "brief"
        return Object.values(record.fields).some(value =>
          typeof value === 'string' && value.toLowerCase().includes('brief')
        );
      });

      console.log(`Found ${briefRecords.length} briefs with "brief" in any field`);
    }

    // 4. If still no briefs found, try to use records with specific status values from your screenshot
    if (briefRecords.length === 0) {
      console.log('No briefs found with any method, trying to use records with specific status values from screenshot');

      // Log all status values to help debug
      console.log('All status values in records:');
      records.forEach((record, index) => {
        const status = statusFieldName ? record.fields[statusFieldName] :
                      (record.fields['Keyword/Content Status'] || record.fields.Status || 'No status');
        console.log(`Record ${index} status: "${status}"`);
      });

      // Try to find records with the exact status values from your screenshot
      briefRecords = records.filter((record: any) => {
        const status = record.fields['Brief Status'] ||
                      (statusFieldName ? record.fields[statusFieldName] : '') ||
                      record.fields['Keyword/Content Status'] ||
                      record.fields.Status ||
                      '';

        return status === 'Brief Creation Needed' ||
               status === 'Brief Approved' ||
               status === 'Brief Under Internal Review' ||
               status === 'In Progress' ||
               status === 'Needs Input' ||
               status === 'Review Brief';
      });

      console.log(`Found ${briefRecords.length} briefs with exact status values from screenshot`);
    }

    // 5. If still no briefs found, return all records as briefs
    if (briefRecords.length === 0) {
      console.log('No briefs found with any method, returning all records as briefs');
      briefRecords = records;
    }

    console.log(`Filtered ${briefRecords.length} records as briefs`);

    // Map the records to our expected format
    return briefRecords.map((record: any) => {
      const fields = record.fields;

      // Process the Client field - check multiple possible field names
      let clientValue = fields['All Clients'] || fields.Client || fields['Client'];

      // If no client field is found, use "Example Client" as a fallback
      if (!clientValue) {
        clientValue = "Example Client";
      }

      // Log the client value for debugging
      console.log(`Brief ${record.id} client value:`, clientValue);

      // Map the brief status to our UI status
      let briefStatus = 'In Progress';

      // First check for the 'Brief Status' field that we're now using for updates
      const briefStatusField = fields['Brief Status'] || fields['Keyword/Content Status'] || fields.Status || '';
      const briefStatusLower = briefStatusField.toLowerCase();

      console.log(`Brief ${record.id} status field value:`, briefStatusField);

      // Map the specific Airtable status values to our four Kanban columns
      // In Progress
      if (briefStatusField === 'Brief Creation Needed' ||
          briefStatusLower === 'brief creation needed' ||
          briefStatusField === 'Brief In Progress' ||
          briefStatusLower === 'brief in progress' ||
          briefStatusField === 'In Progress' ||
          briefStatusLower === 'in progress') {
        briefStatus = 'In Progress';
      }
      // Review Brief
      else if (briefStatusField === 'Brief Under Internal Review' ||
               briefStatusLower === 'brief under internal review' ||
               briefStatusField === 'Brief Awaiting Client Review' ||
               briefStatusLower === 'brief awaiting client review' ||
               briefStatusField === 'Brief Review' ||
               briefStatusLower === 'brief review' ||
               briefStatusField === 'Review Brief' ||
               briefStatusLower === 'review brief') {
        briefStatus = 'Review Brief';
      }
      // Needs Input
      else if (briefStatusField === 'Brief Awaiting Client Depth' ||
               briefStatusLower === 'brief awaiting client depth' ||
               briefStatusField === 'Brief Needs Revision' ||
               briefStatusLower === 'brief needs revision' ||
               briefStatusField === 'Brief Needs Input' ||
               briefStatusLower === 'brief needs input' ||
               briefStatusField === 'Needs Input' ||
               briefStatusLower === 'needs input') {
        briefStatus = 'Needs Input';
      }
      // Brief Approved
      else if (briefStatusField === 'Brief Approved' ||
               briefStatusLower === 'brief approved' ||
               briefStatusField === 'Approved Brief' ||
               briefStatusLower === 'approved brief') {
        briefStatus = 'Brief Approved';
      }
      // For any other status that includes "Brief", default to In Progress
      else if (briefStatusField.includes('Brief') || briefStatusLower.includes('brief')) {
        console.log(`Unmapped brief status: "${briefStatusField}", defaulting to "In Progress"`);
        briefStatus = 'In Progress';
      }

      // Return an object with our expected structure
      return {
        id: record.id,
        Title: fields['Main Keyword'],
        SEOStrategist: fields['SEO Assignee'],
        DueDate: fields['Due Date (Publication)'],
        DocumentLink: fields['Content Brief Link (G Doc)'],
        Month: fields['Month (Keyword Targets)'],
        Status: briefStatus,
        Client: clientValue,
        ContentWriter: fields['Content Writer'] || fields.ContentWriter || fields.Writer || '',
        ContentEditor: fields.ContentEditor || fields['Content Editor'] || fields.Editor || '',
        // Include all original fields as well
        ...fields
      };
    });
  } catch (error) {
    console.error('Error fetching briefs from Keywords table:', error);

    // Log more detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    } else {
      console.error('Unknown error type:', typeof error);
      console.error('Error stringified:', JSON.stringify(error));
    }

    // Fall back to mock data
    console.log('Falling back to mock briefs data');
    return mockBriefs;
  }
}

export async function updateBriefStatus(briefId: string, status: string) {
  if (!hasAirtableCredentials) {
    console.log('Using mock data for updating brief status (no credentials):', briefId, status);
    const updatedBrief = mockBriefs.find(brief => brief.id === briefId);
    if (updatedBrief) {
      updatedBrief.Status = status;
    }
    return updatedBrief || { id: briefId, Status: status };
  }

  try {
    console.log(`Updating brief ${briefId} status to ${status} in Airtable...`);
    console.log('Using base ID:', baseId);
    console.log('Using table name:', TABLES.KEYWORDS);

    // First, check if the brief exists
    try {
      const checkRecord = await base(TABLES.KEYWORDS).find(briefId);
      console.log('Found brief to update:', checkRecord.id);
      console.log('Current brief fields:', checkRecord.fields);
    } catch (findError) {
      console.error(`Brief with ID ${briefId} not found:`, findError);
      throw new Error(`Brief with ID ${briefId} not found`);
    }

    // Prepare update object with only Brief Status field
    const updateObject = {
      'Brief Status': status
    };

    console.log('Updating brief with:', updateObject);

    // Now update the brief
    const updatedRecord = await base(TABLES.KEYWORDS).update(briefId, updateObject);

    console.log('Brief updated successfully:', updatedRecord.id);
    console.log('Updated fields:', updatedRecord.fields);

    return {
      id: updatedRecord.id,
      ...updatedRecord.fields,
    };
  } catch (error) {
    console.error('Error updating brief status:', error);

    // Log more detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    // Fall back to mock data
    console.log('Falling back to mock data for updating brief status');
    const updatedBrief = mockBriefs.find(brief => brief.id === briefId);
    if (updatedBrief) {
      updatedBrief.Status = status;
    }
    return updatedBrief || { id: briefId, Status: status };
  }
}

// Article functions - now using Keywords table
export async function getArticles(userId?: string | null, userRole?: string | null, clientIds?: string[] | null, month?: string | null) {
  if (!hasAirtableCredentials) {
    console.log('Using mock articles data');
    return mockArticles;
  }

  try {
    console.log('Fetching articles from Keywords table in Airtable...');
    console.log('Using base ID:', baseId);
    console.log('Using table name:', TABLES.KEYWORDS);

    // Check if the Keywords table exists and we can access it
    try {
      // First, try to get just one record to verify the table exists and is accessible
      const checkRecord = await base(TABLES.KEYWORDS).select({ maxRecords: 1 }).firstPage();
      console.log('Keywords table check:', checkRecord.length > 0 ? 'Table exists and has records' : 'Table exists but is empty');

      if (checkRecord.length > 0) {
        console.log('Sample Keywords record structure:', checkRecord[0].fields);
        console.log('Available fields in Keywords:', Object.keys(checkRecord[0].fields));
      } else {
        console.log('Keywords table is empty. Using mock data...');
        return mockArticles;
      }
    } catch (checkError: any) {
      console.error('Error checking Keywords table:', checkError.message);

      if (checkError.message && checkError.message.includes('Table not found')) {
        console.error('The Keywords table does not exist in this base');
        return mockArticles;
      }

      if (checkError.message && checkError.message.includes('authorized')) {
        console.error('Authorization error. Your token may not have the correct permissions.');
        console.error('Make sure your token has the following scopes: data.records:read, data.records:write, schema.bases:read');
        return mockArticles;
      }

      // For other errors, fall back to mock data
      return mockArticles;
    }

    // Build the query with appropriate filters
    let filterFormula = '';
    let filterParts = [];

    // If user is a client, filter by client
    if (userRole === 'Client' && clientIds && clientIds.length > 0) {
      console.log('Filtering keywords by client:', clientIds);

      // Create a filter formula for client IDs
      const clientFilters = clientIds.map(clientId =>
        `SEARCH('${clientId}', ARRAYJOIN(Client, ',')) > 0`
      );

      // Add client filter to filter parts
      filterParts.push(`OR(${clientFilters.join(',')})`);
    }
    // If user is not an admin or client, filter by assigned user
    else if (userId && userRole && userRole !== 'Admin') {
      console.log(`Filtering keywords for user: ${userId}, role: ${userRole}`);

      // Filter for keywords where this user is assigned
      const userFilters = [
        `SEARCH('${userId}', ARRAYJOIN({Content Writer}, ',')) > 0`,
        `SEARCH('${userId}', ARRAYJOIN({Content Editor}, ',')) > 0`
      ];

      // Add user filter to filter parts
      filterParts.push(`OR(${userFilters.join(',')})`);
    }

    // If month is specified, add month filter
    if (month) {
      console.log('Filtering keywords by month:', month);

      try {
        // Check for both exact match and month-only match
        // For example, if month is "January 2025", we should match both "January 2025" and "January"
        const monthOnly = month.split(' ')[0]; // Extract just the month name

        // Create month filter using the correct field name
        // The field name is "Month (Keyword Targets)" as shown in the screenshot
        const monthFilters = [
          `{Month (Keyword Targets)} = '${month}'`
        ];

        // If we extracted a month name, also check for that
        if (monthOnly && monthOnly !== month) {
          monthFilters.push(`{Month (Keyword Targets)} = '${monthOnly}'`);
        }

        // Add month filter to filter parts
        const monthFilter = `OR(${monthFilters.join(',')})`;
        console.log('Month filter formula:', monthFilter);
        filterParts.push(monthFilter);
      } catch (monthFilterError) {
        console.error('Error creating month filter:', monthFilterError);
        // Continue without month filter if there's an error
      }
    }

    // Combine all filter parts with AND
    if (filterParts.length > 0) {
      if (filterParts.length === 1) {
        filterFormula = filterParts[0];
      } else {
        filterFormula = `AND(${filterParts.join(',')})`;
      }
    }

    // Apply the filter if one was created
    let query;
    if (filterFormula) {
      console.log('Using filter formula:', filterFormula);
      query = base(TABLES.KEYWORDS).select({
        filterByFormula: filterFormula
      });
    } else {
      query = base(TABLES.KEYWORDS).select();
    }

    // Fetch the records
    const records = await query.all();
    console.log(`Successfully fetched ${records.length} keywords records from Airtable`);

    // Log the first record to see what fields are available
    if (records.length > 0) {
      console.log('First keyword record fields:', records[0].fields);
      console.log('First keyword record field keys:', Object.keys(records[0].fields));
    }

    // Try to find the field that contains status information
    const statusFieldName = records.length > 0 ?
      Object.keys(records[0].fields).find(key =>
        key === 'Keyword/Content Status' ||
        key === 'Status' ||
        key.toLowerCase().includes('status')
      ) : null;

    console.log('Found status field name for articles:', statusFieldName);

    // Filter and map the records to our expected Article format
    // We'll consider keywords with Status containing "Article" or specific article statuses as articles
    const articleRecords = records.filter((record: any) => {
      // If we found a specific status field, use it
      if (statusFieldName && record.fields[statusFieldName]) {
        const status = record.fields[statusFieldName];
        const statusLower = status.toLowerCase();

        return status.includes('Article') ||
               statusLower.includes('article') ||
               status === 'In Production' ||
               statusLower === 'in production' ||
               status === 'Review Draft' ||
               statusLower === 'review draft' ||
               status === 'Client Review' ||
               statusLower === 'client review' ||
               status === 'Published' ||
               statusLower === 'published';
      }

      // Otherwise try our previous approach
      const status = record.fields['Keyword/Content Status'] || record.fields.Status || '';
      const statusLower = status.toLowerCase();

      return status.includes('Article') ||
             statusLower.includes('article') ||
             status === 'In Production' ||
             statusLower === 'in production' ||
             status === 'Review Draft' ||
             statusLower === 'review draft' ||
             status === 'Client Review' ||
             statusLower === 'client review' ||
             status === 'Published' ||
             statusLower === 'published';
    });

    console.log(`Filtered ${articleRecords.length} records as articles`);

    // Map the records to our expected format
    return articleRecords.map((record: any) => {
      const fields = record.fields;

      // Process the Client field - check multiple possible field names
      let clientValue = fields['All Clients'] || fields.Client || fields['Client'];

      // If no client field is found, use "Example Client" as a fallback
      if (!clientValue) {
        clientValue = "Example Client";
      }

      // Log the client value for debugging
      console.log(`Article ${record.id} client value:`, clientValue);

      // Map the keyword status to article status
      let articleStatus = 'In Production';
      const keywordStatus = fields['Article Status'] || fields.Status || '';

      if (keywordStatus.includes('Article')) {
        // Extract the article status from the keyword status
        articleStatus = keywordStatus;
      } else if (keywordStatus === 'In Production') {
        articleStatus = 'In Production';
      } else if (keywordStatus === 'Review Draft') {
        articleStatus = 'Review Draft';
      } else if (keywordStatus === 'Draft Approved') {
        articleStatus = 'Draft Approved';
      } else if (keywordStatus === 'To Be Published') {
        articleStatus = 'To Be Published';
      } else if (keywordStatus === 'Live') {
        articleStatus = 'Live';
      }

      // Return an object with our expected structure
      return {
        id: record.id,
        Title: fields['Main Keyword'],
        Writer: fields['Content Writer'],
        Editor: fields.ContentEditor || fields['Content Editor'],
        WordCount: fields['Final Word Count']|| 0,
        DueDate: fields['Due Date (Publication)'],
        DocumentLink: fields['Written Content (G Doc)'],
        ArticleURL: fields['Target Page URL'],
        Month: fields['Month (Keyword Targets)'],
        Status: articleStatus,
        Client: clientValue,
        // Include all original fields as well
        ...fields
      };
    });
  } catch (error) {
    console.error('Error fetching articles from Keywords table:', error);
    // Fall back to mock data
    console.log('Falling back to mock articles data');
    return mockArticles;
  }
}

export async function updateArticleStatus(articleId: string, status: string) {
  if (!hasAirtableCredentials) {
    console.log('Using mock data for updating article status (no credentials):', articleId, status);
    const updatedArticle = mockArticles.find(article => article.id === articleId);
    if (updatedArticle) {
      updatedArticle.Status = status;
    }
    return updatedArticle || { id: articleId, Status: status };
  }

  try {
    console.log(`Updating article ${articleId} status to ${status} in Airtable...`);
    console.log('Using base ID:', baseId);
    console.log('Using table name:', TABLES.KEYWORDS);

    // First, check if the article exists
    try {
      const checkRecord = await base(TABLES.KEYWORDS).find(articleId);
      console.log('Found article to update:', checkRecord.id);
      console.log('Current article fields:', checkRecord.fields);
    } catch (findError) {
      console.error(`Article with ID ${articleId} not found:`, findError);
      throw new Error(`Article with ID ${articleId} not found`);
    }

    // Check what fields are available in the record
    const checkRecord = await base(TABLES.KEYWORDS).find(articleId);
    console.log('Available fields in article record:', Object.keys(checkRecord.fields));

    // Check if 'Keyword/Content Status' field exists
    const hasKeywordContentStatus = 'Keyword/Content Status' in checkRecord.fields;
    console.log('Has Keyword/Content Status field:', hasKeywordContentStatus);

    // Check for other possible status field names
    const possibleStatusFields = [
      'Keyword/Content Status',
      'Status',
      'Content Status',
      'KeywordStatus',
      'Keyword Status',
      'Article Status'
    ];

    const existingStatusFields = possibleStatusFields.filter(field => field in checkRecord.fields);
    console.log('Existing status fields:', existingStatusFields);

    // Prepare update object
    const updateObject: Record<string, any> = {};

    // Use the first available status field, preferring 'Keyword/Content Status'
    if (hasKeywordContentStatus) {
      updateObject['Keyword/Content Status'] = status;
    } else if (existingStatusFields.length > 0) {
      // Use the first available status field
      updateObject[existingStatusFields[0]] = status;
    } else {
      // If no status field exists, create one
      updateObject['Keyword/Content Status'] = status;
    }

    console.log('Updating article with:', updateObject);

    // Now update the article
    const updatedRecord = await base(TABLES.KEYWORDS).update(articleId, updateObject);

    console.log('Article updated successfully:', updatedRecord.id);
    console.log('Updated fields:', updatedRecord.fields);

    return {
      id: updatedRecord.id,
      ...updatedRecord.fields,
    };
  } catch (error) {
    console.error('Error updating article status:', error);

    // Log more detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    // Fall back to mock data
    console.log('Falling back to mock data for updating article status');
    const updatedArticle = mockArticles.find(article => article.id === articleId);
    if (updatedArticle) {
      updatedArticle.Status = status;
    }
    return updatedArticle || { id: articleId, Status: status };
  }
}

// Backlink functions
export async function getBacklinks(month?: string | null) {
  console.log('getBacklinks called');
  console.log('hasAirtableCredentials:', hasAirtableCredentials);
  console.log('baseId:', baseId);
  console.log('TABLES.BACKLINKS:', TABLES.BACKLINKS);

  if (!hasAirtableCredentials) {
    console.log('Using mock backlinks data (no credentials)');
    return mockBacklinks;
  }

  try {
    console.log('Fetching backlinks from Airtable...');
    console.log('Using base ID:', baseId);
    console.log('Using table name:', TABLES.BACKLINKS);

    // Try to list all tables in the base to see what's available
    try {
      console.log('Attempting to list all tables in the base...');
      // This is a workaround to list tables - we try to access a non-existent table
      // which will fail, but the error message will contain the list of valid tables
      try {
        await base('__nonexistent_table__').select().firstPage();
      } catch (listError: any) {
        if (listError.message && listError.message.includes('Table "__nonexistent_table__" not found. Available tables:')) {
          const availableTables = listError.message
            .split('Available tables:')[1]
            .trim()
            .split(',')
            .map((t: string) => t.trim());

          console.log('Available tables in this base:', availableTables);

          // Check if our required tables exist
          const backlinksExists = availableTables.some((t: string) =>
            t === TABLES.BACKLINKS ||
            t === TABLES.BACKLINKS.toLowerCase() ||
            t === 'Backlinks' ||
            t === 'backlinks'
          );

          console.log(`Backlinks table exists: ${backlinksExists}`);

          // If table doesn't exist, use mock data
          if (!backlinksExists) {
            console.log('Backlinks table does not exist in this base. Using mock data.');
            return mockBacklinks;
          }
        }
      }
    } catch (listTablesError) {
      console.error('Error listing tables:', listTablesError);
    }

    // Check if the table exists and we can access it
    try {
      // First, try to get just one record to verify the table exists and is accessible
      const checkRecord = await base(TABLES.BACKLINKS).select({ maxRecords: 1 }).firstPage();
      console.log('Backlinks table check:', checkRecord.length > 0 ? 'Table exists and has records' : 'Table exists but is empty');

      if (checkRecord.length > 0) {
        console.log('Sample Backlinks record structure:', checkRecord[0].fields);

        // Map the fields from your Airtable schema to our expected format
        const sampleFields = checkRecord[0].fields;
        console.log('Available fields in Backlinks:', Object.keys(sampleFields));

        // Log all available fields to understand what's in the Airtable
        console.log('Available fields in Backlinks table:', Object.keys(sampleFields));

        // Instead of requiring specific fields, we'll use whatever fields are available
        // and map them to our expected structure in the return statement

        // We'll only check if there's at least one field to make sure the table has data
        if (Object.keys(sampleFields).length === 0) {
          console.warn('Backlinks table has no fields. Using mock data.');
          return mockBacklinks;
        }
      } else {
        console.log('Backlinks table is empty. Using mock data...');
        return mockBacklinks;
      }
    } catch (checkError: any) {
      console.error('Error checking Backlinks table:', checkError.message);

      if (checkError.message && checkError.message.includes('Table not found')) {
        console.error('The Backlinks table does not exist in this base');
        return mockBacklinks;
      }

      if (checkError.message && checkError.message.includes('authorized')) {
        console.error('Authorization error. Your token may not have the correct permissions.');
        console.error('Make sure your token has the following scopes: data.records:read, data.records:write, schema.bases:read');
        return mockBacklinks;
      }

      // For other errors, fall back to mock data
      return mockBacklinks;
    }

    // Build query with month filter if specified
    let query;
    if (month) {
      console.log('Filtering backlinks by month:', month);

      try {
        // Check for both exact match and month-only match
        // For example, if month is "January 2025", we should match both "January 2025" and "January"
        const monthOnly = month.split(' ')[0]; // Extract just the month name

        // Create month filter using the correct field name for backlinks
        // The field name is "Month" for backlinks
        const monthFilters = [
          `{Month} = '${month}'`
        ];

        // If we extracted a month name, also check for that
        if (monthOnly && monthOnly !== month) {
          monthFilters.push(`{Month} = '${monthOnly}'`);
        }

        // Create the filter formula
        const filterFormula = `OR(${monthFilters.join(',')})`;
        console.log('Using filter formula for backlinks:', filterFormula);

        query = base(TABLES.BACKLINKS).select({
          filterByFormula: filterFormula
        });
      } catch (monthFilterError) {
        console.error('Error creating month filter for backlinks:', monthFilterError);
        // If there's an error with the filter, fetch all records
        query = base(TABLES.BACKLINKS).select();
      }
    } else {
      // No month filter, fetch all records
      query = base(TABLES.BACKLINKS).select();
    }

    // Fetch the records
    const records = await query.all();
    console.log(`Successfully fetched ${records.length} backlinks records from Airtable`);

    // Log the first record to see what fields are available
    if (records.length > 0) {
      console.log('First backlink record fields:', records[0].fields);
      console.log('First backlink record field keys:', Object.keys(records[0].fields));
    }

    // Map the records to our expected format
    return records.map((record: any) => {
      const fields = record.fields;
      const fieldKeys = Object.keys(fields);

      // Log each record's fields for debugging
      console.log(`Record ${record.id} fields:`, fieldKeys);

      // Find field names that might correspond to our expected fields
      // For each expected field, look for variations in the actual field names

      // Domain field - look for any field containing "domain" but not "rating"
      const domainField = fieldKeys.find(key =>
        key.toLowerCase().includes('domain') && !key.toLowerCase().includes('rating') && !key.toLowerCase().includes('dr')
      ) || 'Domain URL';

      // Domain Rating field - look for any field containing "rating" or "dr"
      const ratingField = fieldKeys.find(key =>
        key.toLowerCase().includes('dr') || key.toLowerCase().includes('rating') || key.toLowerCase().includes('authority')
      ) || 'DR ( API )';

      // Link Type field - look for any field containing "type"
      const typeField = fieldKeys.find(key =>
        key.toLowerCase().includes('type') || key.toLowerCase().includes('link type')
      ) || 'Link Type';

      // Target Page field - look for any field containing "target", "page", or "url"
      const targetField = fieldKeys.find(key =>
        key.toLowerCase().includes('target') || key.toLowerCase().includes('page url') || key.toLowerCase().includes('client target')
      ) || 'Client Target Page URL';

      // Status field - look for any field containing "status"
      const statusField = fieldKeys.find(key =>
        key.toLowerCase().includes('portal status')
      ) || 'Portal Status';

      // Went Live On field - look for any field containing "live", "date", or "published"
      const liveField = fieldKeys.find(key =>
        key.toLowerCase().includes('live') || key.toLowerCase().includes('date') || key.toLowerCase().includes('published')
      ) || 'Went Live On';

      // Notes field - look for any field containing "note", "comment", or "description"
      const notesField = fieldKeys.find(key =>
        key.toLowerCase().includes('note') || key.toLowerCase().includes('comment') || key.toLowerCase().includes('description')
      ) || 'Notes';

      // Month field - look for any field containing "month" or "period"
      const monthField = fieldKeys.find(key =>
        key.toLowerCase().includes('month') || key.toLowerCase().includes('period')
      ) || 'Month';

      // Return an object with our expected structure, using the fields we found
      // or empty values if we couldn't find a matching field
      return {
        id: record.id,
        Domain: domainField && fields[domainField] ? fields[domainField] : '',
        'Domain URL': fields['Domain URL'] || '',
        DomainRating: ratingField && fields[ratingField] ? fields[ratingField] : 0,
        'DR ( API )': fields['DR ( API )'] || 0,
        'Domain Authority/Rating': fields['Domain Authority/Rating'] || fields['DR ( API )'] || 0,
        LinkType: typeField && fields[typeField] ? fields[typeField] : '',
        'Link Type': fields['Link Type'] || '',
        TargetPage: targetField && fields[targetField] ? fields[targetField] : '',
        'Client Target Page URL': fields['Client Target Page URL'] || '',
        'Target URL': fields['Target URL'] || fields['Client Target Page URL'] || '',
        Status: statusField && fields[statusField] ? fields[statusField] : 'Pending',
        WentLiveOn: liveField && fields[liveField] ? fields[liveField] : '',
        'Went Live On': fields['Went Live On'] || '',
        Notes: notesField && fields[notesField] ? fields[notesField] : '',
        Month: monthField && fields[monthField] ? fields[monthField] : '',
        // Include all original fields as well
        ...fields
      };
    });
  } catch (error: any) {
    console.error('Error fetching backlinks:', error);
    console.error('Error details:', error.message || 'No error message available');

    if (error.message && error.message.includes('Rate Limit')) {
      console.error('Airtable rate limit exceeded. Try again later.');
    }

    if (error.message && error.message.includes('Authentication')) {
      console.error('Airtable authentication failed. Check your API key.');
    }

    if (error.message && error.message.includes('authorized')) {
      console.error('Authorization error. Your token may not have the correct permissions.');
      console.error('Make sure your token has the following scopes: data.records:read, data.records:write, schema.bases:read');
    }

    // Fall back to mock data
    console.log('Falling back to mock backlinks data due to error');
    return mockBacklinks;
  }
}

export async function updateBacklinkStatus(backlinkId: string, status: string) {
  if (!hasAirtableCredentials) {
    console.log('Using mock data for updating backlink status:', backlinkId, status);
    const updatedBacklink = mockBacklinks.find(backlink => backlink.id === backlinkId);
    if (updatedBacklink) {
      updatedBacklink.Status = status;
    }
    return updatedBacklink || { id: backlinkId, Status: status };
  }

  try {
    const updatedRecord = await base(TABLES.BACKLINKS).update(backlinkId, {
      Status: status,
    });

    return {
      id: updatedRecord.id,
      ...updatedRecord.fields,
    };
  } catch (error) {
    console.error('Error updating backlink status:', error);
    // Fall back to mock data
    console.log('Falling back to mock data for updating backlink status');
    const updatedBacklink = mockBacklinks.find(backlink => backlink.id === backlinkId);
    if (updatedBacklink) {
      updatedBacklink.Status = status;
    }
    return updatedBacklink || { id: backlinkId, Status: status };
  }
}

// KPI Metrics functions
export async function getKPIMetrics() {
  if (!hasAirtableCredentials) {
    console.log('Using mock KPI metrics data (no credentials)');
    return mockKPIMetrics;
  }

  try {
    console.log('Fetching KPI metrics from Airtable...');
    console.log('Using base ID:', baseId);
    console.log('Using table name:', TABLES.KPI_METRICS);

    // Try to list all tables in the base to see what's available
    try {
      console.log('Attempting to list all tables in the base...');
      // This is a workaround to list tables - we try to access a non-existent table
      // which will fail, but the error message will contain the list of valid tables
      try {
        await base('__nonexistent_table__').select().firstPage();
      } catch (listError: any) {
        if (listError.message && listError.message.includes('Table "__nonexistent_table__" not found. Available tables:')) {
          const availableTables = listError.message
            .split('Available tables:')[1]
            .trim()
            .split(',')
            .map((t: string) => t.trim());

          console.log('Available tables in this base:', availableTables);

          // Check if our required tables exist
          const kpiMetricsExists = availableTables.some((t: string) => t === TABLES.KPI_METRICS || t === TABLES.KPI_METRICS.toLowerCase() || t === 'KPI Metrics' || t === 'kpi metrics');
          const urlPerformanceExists = availableTables.some((t: string) => t === TABLES.URL_PERFORMANCE || t === TABLES.URL_PERFORMANCE.toLowerCase() || t === 'URL Performance' || t === 'url performance');
          const keywordsExists = availableTables.some((t: string) => t === TABLES.KEYWORDS || t === TABLES.KEYWORDS.toLowerCase() || t === 'Keywords' || t === 'keywords');

          console.log(`KPI Metrics table exists: ${kpiMetricsExists}`);
          console.log(`URL Performance table exists: ${urlPerformanceExists}`);
          console.log(`Keywords table exists: ${keywordsExists}`);

          // If tables don't exist, use mock data
          if (!kpiMetricsExists) {
            console.log('KPI Metrics table does not exist in this base. Using mock data.');
            return mockKPIMetrics;
          }
        }
      }
    } catch (listTablesError) {
      console.error('Error listing tables:', listTablesError);
    }

    // Check if the table exists and we can access it
    try {
      // First, try to get just one record to verify the table exists and is accessible
      const checkRecord = await base(TABLES.KPI_METRICS).select({ maxRecords: 1 }).firstPage();
      console.log('KPI Metrics table check:', checkRecord.length > 0 ? 'Table exists and has records' : 'Table exists but is empty');

      if (checkRecord.length > 0) {
        console.log('Sample KPI Metrics record structure:', checkRecord[0].fields);

        // Map the fields from your Airtable schema to our expected format
        const sampleFields = checkRecord[0].fields;
        console.log('Available fields in KPI Metrics:', Object.keys(sampleFields));

        // Check if we have the necessary fields or their equivalents
        const hasMetricName = 'Metric Name' in sampleFields || 'MetricName' in sampleFields;
        const hasCurrentValue = 'Current Value' in sampleFields || 'CurrentValue' in sampleFields;
        const hasTargetValue = 'Target Value' in sampleFields || 'TargetValue' in sampleFields || 'Goal' in sampleFields;
        const hasDelta = 'Delta/Change' in sampleFields || 'ChangePercentage' in sampleFields;
        const hasUnit = 'Unit' in sampleFields;

        console.log(`Has Metric Name: ${hasMetricName}`);
        console.log(`Has Current Value: ${hasCurrentValue}`);
        console.log(`Has Target Value: ${hasTargetValue}`);
        console.log(`Has Delta: ${hasDelta}`);
        console.log(`Has Unit: ${hasUnit}`);

        if (!hasMetricName || !hasCurrentValue) {
          console.warn('KPI Metrics table is missing required fields. Using mock data.');
          return mockKPIMetrics;
        }
      } else {
        console.log('KPI Metrics table is empty. Using mock data...');
        return mockKPIMetrics;
      }
    } catch (checkError: any) {
      console.error('Error checking KPI Metrics table:', checkError.message);

      if (checkError.message.includes('Table not found')) {
        console.error('The KPI Metrics table does not exist in this base');
        return mockKPIMetrics;
      }

      if (checkError.message.includes('authorized')) {
        console.error('Authorization error. Your token may not have the correct permissions.');
        console.error('Make sure your token has the following scopes: data.records:read, data.records:write, schema.bases:read');
        return mockKPIMetrics;
      }

      // For other errors, fall back to mock data
      return mockKPIMetrics;
    }

    // Proceed with fetching all records
    const records = await base(TABLES.KPI_METRICS).select().all();
    console.log(`Successfully fetched ${records.length} KPI metrics records from Airtable`);

    // Map the records to our expected format
    return records.map((record: any) => {
      const fields = record.fields;

      // Map fields from your Airtable schema to our expected format
      return {
        id: record.id,
        MetricName: fields['Metric Name'] || fields['MetricName'] || '',
        CurrentValue: fields['Current Value'] || fields['CurrentValue'] || 0,
        PreviousValue: fields['Previous Value'] || fields['PreviousValue'] || 0,
        ChangePercentage: fields['Delta/Change'] || fields['ChangePercentage'] || 0,
        Goal: fields['Target Value'] || fields['TargetValue'] || fields['Goal'] || 0,
        Date: fields['KPI Timestamp'] || fields['Date'] || new Date().toISOString(),
        Unit: fields['Unit'] || '',
        Trend: fields['Trend'] || 'Up',
        // Include all original fields as well
        ...fields
      };
    });
  } catch (error: any) {
    console.error('Error fetching KPI metrics:', error);
    console.error('Error details:', error.message || 'No error message available');

    if (error.message && error.message.includes('Rate Limit')) {
      console.error('Airtable rate limit exceeded. Try again later.');
    }

    if (error.message && error.message.includes('Authentication')) {
      console.error('Airtable authentication failed. Check your API key.');
    }

    if (error.message && error.message.includes('authorized')) {
      console.error('Authorization error. Your token may not have the correct permissions.');
      console.error('Make sure your token has the following scopes: data.records:read, data.records:write, schema.bases:read');
    }

    // Fall back to mock data
    console.log('Falling back to mock KPI metrics data due to error');
    return mockKPIMetrics;
  }
}

// URL Performance functions
export async function getURLPerformance() {
  if (!hasAirtableCredentials) {
    console.log('Using mock URL performance data (no credentials)');
    return mockURLPerformance;
  }

  try {
    console.log('Fetching URL performance from Airtable...');
    console.log('Using base ID:', baseId);
    console.log('Using table name:', TABLES.URL_PERFORMANCE);

    // Check if the table exists
    try {
      // First, try to get just one record to verify the table exists and is accessible
      const checkRecord = await base(TABLES.URL_PERFORMANCE).select({ maxRecords: 1 }).firstPage();
      console.log('URL Performance table check:', checkRecord.length > 0 ? 'Table exists and has records' : 'Table exists but is empty');

      if (checkRecord.length > 0) {
        console.log('Sample URL Performance record structure:', checkRecord[0].fields);

        // Map the fields from your Airtable schema to our expected format
        const sampleFields = checkRecord[0].fields;
        console.log('Available fields in URL Performance:', Object.keys(sampleFields));

        // Check if we have the necessary fields or their equivalents
        const hasURLPath = 'URL Path' in sampleFields || 'URLPath' in sampleFields;
        const hasClicks = 'Clicks Last Month' in sampleFields || 'Clicks' in sampleFields || 'Traffic' in sampleFields;
        const hasImpressions = 'Impressions' in sampleFields || 'Traffic' in sampleFields;
        const hasPageType = 'Page Type (Main)' in sampleFields || 'Page Type' in sampleFields || 'PageType' in sampleFields;

        console.log(`Has URL Path: ${hasURLPath}`);
        console.log(`Has Clicks: ${hasClicks}`);
        console.log(`Has Impressions: ${hasImpressions}`);
        console.log(`Has Page Type: ${hasPageType}`);

        if (!hasURLPath) {
          console.warn('URL Performance table is missing required fields. Using mock data.');
          return mockURLPerformance;
        }
      } else {
        console.log('URL Performance table is empty. Using mock data...');
        return mockURLPerformance;
      }
    } catch (checkError: any) {
      console.error('Error checking URL Performance table:', checkError.message);
      if (checkError.message.includes('Table not found')) {
        console.error('The URL Performance table does not exist in this base');
        return mockURLPerformance;
      }

      if (checkError.message.includes('authorized')) {
        console.error('Authorization error. Your token may not have the correct permissions.');
        console.error('Make sure your token has the following scopes: data.records:read, data.records:write, schema.bases:read');
        return mockURLPerformance;
      }
    }

    // Proceed with fetching all records
    const records = await base(TABLES.URL_PERFORMANCE).select().all();
    console.log(`Successfully fetched ${records.length} URL performance records from Airtable`);

    // Map the records to our expected format
    return records.map((record: any) => {
      const fields = record.fields;

      // Map fields from your Airtable schema to our expected format
      return {
        id: record.id,
        URLPath: fields['URL Path'] || fields['URLPath'] || '',
        PageTitle: fields['Title'] || fields['PageTitle'] || '',
        PageType: fields['Page Type (Main)'] || fields['Page Type'] || fields['PageType'] || '',
        Clicks: fields['Clicks Last Month'] || fields['Clicks'] || fields['Traffic'] || 0,
        Impressions: fields['Impressions'] || fields['Traffic'] || 0,
        CTR: fields['CTR'] || 0,
        AveragePosition: fields['Current Rank'] || fields['AveragePosition'] || 0,
        // Include all original fields as well
        ...fields
      };
    });
  } catch (error: any) {
    console.error('Error fetching URL performance:', error);
    console.error('Error details:', error.message || 'No error message available');

    if (error.message && error.message.includes('Rate Limit')) {
      console.error('Airtable rate limit exceeded. Try again later.');
    }

    if (error.message && error.message.includes('Authentication')) {
      console.error('Airtable authentication failed. Check your API key.');
    }

    if (error.message && error.message.includes('authorized')) {
      console.error('Authorization error. Your token may not have the correct permissions.');
      console.error('Make sure your token has the following scopes: data.records:read, data.records:write, schema.bases:read');
    }

    // Fall back to mock data
    console.log('Falling back to mock URL performance data due to error');
    return mockURLPerformance;
  }
}

// Keyword Performance functions
export async function getKeywordPerformance() {
  if (!hasAirtableCredentials) {
    console.log('Using mock keyword performance data (no credentials)');
    return mockKeywordPerformance;
  }

  try {
    console.log('Fetching keyword performance from Airtable...');
    console.log('Using base ID:', baseId);
    console.log('Using table name:', TABLES.KEYWORDS);

    // Check if the table exists
    try {
      // Try different table names to find the right one
      let tableName = TABLES.KEYWORDS;
      let checkRecord = null;
      let tableFound = false;

      // First try the default table name
      try {
        console.log('Trying default table name:', tableName);
        checkRecord = await base(tableName).select({ maxRecords: 1 }).firstPage();
        tableFound = true;
        console.log('Found table with name:', tableName);
      } catch (defaultTableError: any) {
        console.log('Default table name not found, trying alternatives...');

        // If that fails, try alternative names
        for (const altName of ALT_TABLES.KEYWORDS) {
          try {
            console.log('Trying alternative table name:', altName);
            checkRecord = await base(altName).select({ maxRecords: 1 }).firstPage();
            tableName = altName; // Update the table name to the one that worked
            tableFound = true;
            console.log('Found table with name:', tableName);
            break;
          } catch (altTableError: any) {
            console.log(`Table name "${altName}" not found`);
          }
        }
      }

      // If we still haven't found the table, try listing all tables
      if (!tableFound) {
        console.log('Could not find Keyword Performance table with any known names. Trying to list all tables...');
        try {
          // This is a workaround to list tables - we try to access a non-existent table
          // which will fail, but the error message will contain the list of valid tables
          await base('__nonexistent_table__').select().firstPage();
        } catch (listError: any) {
          if (listError.message && listError.message.includes('Table "__nonexistent_table__" not found. Available tables:')) {
            const availableTables = listError.message
              .split('Available tables:')[1]
              .trim()
              .split(',')
              .map((t: string) => t.trim());

            console.log('Available tables in this base:', availableTables);

            // Try each available table to see if it has the right structure
            for (const availableTable of availableTables) {
              try {
                console.log('Checking table:', availableTable);
                checkRecord = await base(availableTable).select({ maxRecords: 1 }).firstPage();

                if (checkRecord && checkRecord.length > 0) {
                  const fields = checkRecord[0].fields;

                  // Check if this table has keyword-related fields
                  if ('Keyword' in fields || 'keyword' in fields || 'Keywords' in fields) {
                    console.log('Found potential Keyword Performance table:', availableTable);
                    tableName = availableTable;
                    tableFound = true;
                    break;
                  }
                }
              } catch (tableCheckError) {
                console.log(`Error checking table ${availableTable}:`, tableCheckError);
              }
            }
          }
        }
      }

      if (!tableFound || !checkRecord) {
        console.error('Could not find Keyword Performance table in this base');
        return mockKeywordPerformance;
      }

      console.log('Keyword Performance table check:', checkRecord.length > 0 ? 'Table exists and has records' : 'Table exists but is empty');

      if (checkRecord.length > 0) {
        console.log('Sample Keyword Performance record structure:', checkRecord[0].fields);

        // Map the fields from your Airtable schema to our expected format
        const sampleFields = checkRecord[0].fields;
        console.log('Available fields in Keyword Performance:', Object.keys(sampleFields));

        // Check if we have the necessary fields or their equivalents
        const hasKeyword = 'Keyword' in sampleFields || 'keyword' in sampleFields || 'Keywords' in sampleFields;
        const hasVolume = 'Search Volume' in sampleFields || 'Volume' in sampleFields || 'search_volume' in sampleFields;
        const hasDifficulty = 'Difficulty' in sampleFields || 'difficulty' in sampleFields || 'Keyword Difficulty' in sampleFields;
        const hasCurrentPosition = 'Current Rank' in sampleFields || 'Current Position' in sampleFields || 'CurrentPosition' in sampleFields || 'current_position' in sampleFields || 'Position' in sampleFields;
        const hasPositionChange = 'Position Change' in sampleFields || 'PositionChange' in sampleFields || 'position_change' in sampleFields;

        console.log(`Has Keyword: ${hasKeyword}`);
        console.log(`Has Volume: ${hasVolume}`);
        console.log(`Has Difficulty: ${hasDifficulty}`);
        console.log(`Has Current Position: ${hasCurrentPosition}`);
        console.log(`Has Position Change: ${hasPositionChange}`);

        if (!hasKeyword) {
          console.warn('Keyword Performance table is missing required fields. Using mock data.');
          return mockKeywordPerformance;
        }

        // Note the table name that worked
        console.log('Using table name for keywords:', tableName);
      } else {
        console.log('Keyword Performance table is empty. Using mock data...');
        return mockKeywordPerformance;
      }
    } catch (checkError: any) {
      console.error('Error checking Keyword Performance table:', checkError.message);
      if (checkError.message.includes('Table not found')) {
        console.error('The Keyword Performance table does not exist in this base');
        return mockKeywordPerformance;
      }

      if (checkError.message.includes('authorized')) {
        console.error('Authorization error. Your token may not have the correct permissions.');
        console.error('Make sure your token has the following scopes: data.records:read, data.records:write, schema.bases:read');
        return mockKeywordPerformance;
      }
    }

    // Proceed with fetching all records
    const records = await base(TABLES.KEYWORDS).select().all();
    console.log(`Successfully fetched ${records.length} keyword performance records from Airtable`);

    // Map the records to our expected format
    return records.map((record: any) => {
      const fields = record.fields;

      // Map fields from your Airtable schema to our expected format
      return {
        id: record.id,
        Keyword: fields['Keyword'] || '',
        Volume: fields['Search Volume'] || fields['Volume'] || 0,
        Difficulty: fields['Difficulty'] || 0,
        CurrentPosition: fields['Current Rank'] || fields['Current Position'] || fields['CurrentPosition'] || 0,
        PreviousPosition: fields['Starting Keyword Position'] || fields['Previous Position'] || fields['PreviousPosition'] || 0,
        PositionChange: fields['Position Change'] || fields['PositionChange'] || 0,
        URL: fields['Target Page'] || fields['URL'] || '',
        // Include all original fields as well
        ...fields
      };
    });
  } catch (error: any) {
    console.error('Error fetching keyword performance:', error);
    console.error('Error details:', error.message || 'No error message available');

    if (error.message && error.message.includes('Rate Limit')) {
      console.error('Airtable rate limit exceeded. Try again later.');
    }

    if (error.message && error.message.includes('Authentication')) {
      console.error('Airtable authentication failed. Check your API key.');
    }

    if (error.message && error.message.includes('authorized')) {
      console.error('Authorization error. Your token may not have the correct permissions.');
      console.error('Make sure your token has the following scopes: data.records:read, data.records:write, schema.bases:read');
    }

    // Fall back to mock data
    console.log('Falling back to mock keyword performance data due to error');
    return mockKeywordPerformance;
  }
}

// Function to get available months from Keywords table
export async function getAvailableMonths() {
  if (!hasAirtableCredentials) {
    console.log('Using mock months data (no credentials)');
    return [
      'May 2024',
      'June 2024',
      'July 2024',
      'August 2024',
      'September 2024',
      'October 2024',
      'November 2024',
      'December 2024',
      'January 2025',
      'February 2025'
    ];
  }

  try {
    console.log('Fetching available months from Keywords table in Airtable...');

    // Use a more efficient query that only fetches the month field
    // This significantly reduces the data transferred
    const query = base(TABLES.KEYWORDS).select({
      fields: ['Month (Keyword Targets)', 'Month'],
      maxRecords: 1000, // Limit to 1000 records for faster response
    });

    // Use a timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout fetching months')), 8000);
    });

    // Race the Airtable query against the timeout
    const records = await Promise.race([
      query.all(),
      timeoutPromise
    ]) as any[];

    console.log(`Successfully fetched ${records.length} keyword records from Airtable`);

    // Extract unique month values from the records
    const uniqueMonths = new Set<string>();

    // Log the first record to see what fields are available
    if (records.length > 0) {
      console.log('First keyword record field keys:', Object.keys(records[0].fields));
    }

    // Try different possible field names for the month
    records.forEach((record: any) => {
      const fields = record.fields;

      // Check for 'Month (Keyword Targets)' field first (from your screenshot)
      const monthValue = fields['Month (Keyword Targets)'] || fields.Month || '';

      if (monthValue && typeof monthValue === 'string') {
        uniqueMonths.add(monthValue);
      }
    });

    // Convert Set to Array and sort by date
    let months = Array.from(uniqueMonths);

    // Sort months chronologically
    months.sort((a, b) => {
      // Extract year and month
      const getYearMonth = (str: string) => {
        const monthNames = [
          'january', 'february', 'march', 'april', 'may', 'june',
          'july', 'august', 'september', 'october', 'november', 'december'
        ];

        const parts = str.toLowerCase().split(' ');
        let year = new Date().getFullYear();
        let month = 0;

        // Find the year (4-digit number)
        const yearPart = parts.find(part => /^\d{4}$/.test(part));
        if (yearPart) {
          year = parseInt(yearPart);
        }

        // Find the month name
        const monthPart = parts.find(part => monthNames.includes(part));
        if (monthPart) {
          month = monthNames.indexOf(monthPart);
        }

        return { year, month };
      };

      const dateA = getYearMonth(a);
      const dateB = getYearMonth(b);

      // Compare years first
      if (dateA.year !== dateB.year) {
        return dateA.year - dateB.year;
      }

      // If years are the same, compare months
      return dateA.month - dateB.month;
    });

    // If no months were found, fall back to hardcoded values
    if (months.length === 0) {
      console.log('No month data found in Airtable, using fallback months');
      months = [
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
    }

    console.log('Available months from Airtable:', months);
    return months;
  } catch (error) {
    console.error('Error fetching available months:', error);

    // Fall back to hardcoded months
    console.log('Falling back to hardcoded months data');
    return [
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
  }
}
