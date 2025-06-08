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
  YOUTUBE_MANAGEMENT: 'Youtube Management',
  REDDIT_THREADS: 'Reddit Threads',

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
  KEYWORDS: ['keyword_performance', 'keywordperformance', 'keyword performance', 'KeywordPerformance', 'keywords'],
  BACKLINKS: ['backlinks', 'back_links', 'back links', 'BackLinks']
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
  mockClients,
  mockYouTube,
  mockReddit
} from './mock-data';

// Mock data for monthly projections
export const mockMonthlyProjections = [
  {
    id: 'proj1',
    Month: 'January',
    Year: '2024',
    'Current Trajectory': 12500,
    'KPI Goal/Target': 15000,
    'Required Trajectory': 16000,
    Client: ['client1']
  },
  {
    id: 'proj2',
    Month: 'February',
    Year: '2024',
    'Current Trajectory': 13200,
    'KPI Goal/Target': 15500,
    'Required Trajectory': 16500,
    Client: ['client1']
  },
  {
    id: 'proj3',
    Month: 'March',
    Year: '2024',
    'Current Trajectory': 14000,
    'KPI Goal/Target': 16000,
    'Required Trajectory': 17000,
    Client: ['client1']
  }
];

// Client functions
export async function getClients() {
  console.log('getClients function called');
  console.log('Environment variables check:');
  console.log('- AIRTABLE_API_KEY exists:', !!process.env.AIRTABLE_API_KEY);
  console.log('- NEXT_PUBLIC_AIRTABLE_API_KEY exists:', !!process.env.NEXT_PUBLIC_AIRTABLE_API_KEY);
  console.log('- AIRTABLE_BASE_ID exists:', !!process.env.AIRTABLE_BASE_ID);
  console.log('- NEXT_PUBLIC_AIRTABLE_BASE_ID exists:', !!process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID);
  console.log('hasAirtableCredentials:', hasAirtableCredentials);

  if (!hasAirtableCredentials) {
    console.log('Using mock clients data - no Airtable credentials');
    return mockClients;
  }

  try {
    console.log('Fetching clients from Airtable...');
    console.log('Using base:', !!base);
    console.log('Using table:', TABLES.CLIENTS);

    // Check if base is properly initialized
    if (!base) {
      throw new Error('Airtable base is not initialized');
    }

    const records = await base(TABLES.CLIENTS).select().all();
    console.log(`Successfully fetched ${records.length} clients from Airtable`);

    // Log the first record for debugging
    if (records.length > 0) {
      console.log('Sample client record:', {
        id: records[0].id,
        fields: records[0].fields
      });
    }

    const clients = records.map((record: any) => ({
      id: record.id,
      ...record.fields
    }));

    console.log(`Mapped ${clients.length} client records`);

    // Clear any Airtable connection issues flag since we successfully fetched data
    if (typeof window !== 'undefined') {
      console.log('Clearing airtable-connection-issues flag');
      localStorage.removeItem('airtable-connection-issues');
      localStorage.removeItem('use-mock-data');
    }

    return clients;
  } catch (error: any) {
    console.error('Error fetching clients:', error);
    console.error('Error details:', error.message || 'No error message available');
    console.error('Error stack:', error.stack);

    // Set a flag in localStorage to indicate Airtable connection issues
    if (typeof window !== 'undefined') {
      console.log('Setting airtable-connection-issues flag in localStorage');
      localStorage.setItem('airtable-connection-issues', 'true');
    }

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
    console.log('[getUserByEmail] Processed user object before return:', JSON.parse(JSON.stringify(user)));
    console.log('[getUserByEmail] Clients field directly before return:', user.Clients);
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
  Clients?: string[];
}) {
  if (!hasAirtableCredentials) {
    console.log('Using mock data for creating user:', userData);
    // Create a mock user with an ID
    const newUser = {
      id: `rec${Date.now()}`,
      ...userData,
      Clients: userData.Clients || [], // Ensure Clients field is used
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
      Clients: userData.Clients || [], // Ensure Clients field is used
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

/**
 * Gets WQA (Web Quality Assurance) specific tasks from Airtable
 * This function filters tasks that are specifically for WQA purposes
 */
export async function getWQATasks(userId?: string | null, userRole?: string | null, clientIds?: string[] | null) {
  if (!hasAirtableCredentials) {
    console.log('Using mock tasks data - no Airtable credentials');
    console.log('API Key exists:', !!apiKey);
    console.log('Base ID exists:', !!baseId);

    // Filter mock data to only include WQA tasks
    const wqaTasks = mockTasks.filter(task => {
      // Check for WQA in task fields - adapt this to match your mock data structure
      const taskType = (task as any).Type;
      const taskTags = (task as any).Tags;
      
      return taskType === 'WQA' || 
        (taskTags && (Array.isArray(taskTags) ? 
          taskTags.some((tag: string) => tag.includes('WQA')) : 
          typeof taskTags === 'string' && taskTags.includes('WQA')))
    });

    // Further filter by user role and ID
    if (userId && userRole) {
      console.log(`Filtering mock WQA tasks for user: ${userId}, role: ${userRole}`);

      // For client users, filter by client IDs
      if (userRole === 'Client' && clientIds && clientIds.length > 0) {
        console.log('Filtering mock WQA tasks by client:', clientIds);
        return wqaTasks.filter(task => {
          // Check if task has Clients field that matches any of the user's clients
          if (task.Clients) {
            if (Array.isArray(task.Clients)) {
              return task.Clients.some(client => clientIds.includes(client));
            } else {
              return clientIds.includes(task.Clients);
            }
          }
          return false;
        });
      }

      // For non-admin users who aren't clients, only show tasks assigned to them
      if (userRole !== 'Admin' && userRole !== 'Client') {
        return wqaTasks.filter(task => {
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

    return wqaTasks;
  }

  try {
    console.log('Fetching WQA tasks from Airtable...');
    console.log('Using base ID:', baseId);

    // For now, let's not filter by client to match the working CRO implementation
    // Just fetch all records from the WQA table
    console.log('Querying WQA table in Airtable without client filtering');
    
    // Query without filter formula to match working CRO implementation
    const query = base('WQA').select();
    
    console.log('Querying WQA table in Airtable');

    const records = await query.all();
    console.log(`Successfully fetched ${records.length} WQA tasks from Airtable`);

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
    console.error('Error fetching WQA tasks from Airtable:', error);
    throw error;
  }
}

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
          // Check if task has Clients field that matches any of the user's clients
          if (task.Clients) {
            if (Array.isArray(task.Clients)) {
              return task.Clients.some(client => clientIds.includes(client));
            } else {
              return clientIds.includes(task.Clients);
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

    // If we have client IDs, filter by them regardless of user role
    if (clientIds && clientIds.length > 0) {
      console.log('Filtering tasks by client IDs:', clientIds);

      // Only use the 'Clients' field with exact capitalization
      // Airtable error shows that 'client' (lowercase) doesn't exist in the schema
      const clientFilters = clientIds.map(clientId => 
        `FIND('${clientId}', {Clients})`
      );

      // Combine filters with OR
      filterFormula = `OR(${clientFilters.join(',')})`;
    }
    // No client-specific filtering needed for other cases
    // Admin users will see all records when no filter is applied

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

      // Ensure we have both Client and Clients fields for compatibility
      if (fields.Client && !fields.Clients) {
        fields.Clients = fields.Client;
      } else if (fields.Clients && !fields.Client) {
        fields.Client = fields.Clients;
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
          // Check if task has Clients field that matches any of the user's clients
          if (task.Clients) {
            if (Array.isArray(task.Clients)) {
              return task.Clients.some(client => clientIds.includes(client));
            } else {
              return clientIds.includes(task.Clients);
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

      // Log each record to see what fields are available
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

    // TEMPORARY DEBUGGING: First try with no filters at all to see if API works
    try {
      console.log('DEBUGGING: First testing connection with NO filters');
      const testQuery = base(TABLES.KEYWORDS).select({
        maxRecords: 5 // Just get a few records to verify connection
      });
      const testRecords = await testQuery.all();
      console.log(`CONNECTION TEST: Successfully fetched ${testRecords.length} records with NO filters`);
      
      if (testRecords.length > 0) {
        console.log('Sample record fields:', Object.keys(testRecords[0].fields));
        console.log('Does "Client Record ID" field exist?', Object.keys(testRecords[0].fields).includes('Client Record ID'));
        
        // Try to find any record that has our target client ID
        const hasTargetClient = testRecords.some((record: { id: string; fields: Record<string, any> }) => {
          const clientRecordID = record.fields['Client Record ID'];
          const includes = clientRecordID && clientRecordID.includes('rec37fwEV09GUJccr');
          console.log(`Record ${record.id} - Client Record ID: ${clientRecordID} - Includes target? ${includes}`);
          return includes;
        });
        
        console.log(`Found records with target client ID: ${hasTargetClient}`);
      }
    } catch (error) {
      console.error('TEST QUERY ERROR:', error);
    }

    // Now try the original query with client filter
    let filterFormula = '';
    const filterParts = [];

    // REMOVED CLIENT-SPECIFIC FILTERING: Now using same logic as admin for all users
    // Only filtering by month, client filtering will be done on the frontend
    console.log('Using admin-style data fetching for all users (including clients)');

    // If user is not an admin or client, still filter by assigned user
    if (userId && userRole && userRole !== 'Admin' && userRole !== 'Client') {
      console.log(`Filtering keywords for user: ${userId}, role: ${userRole}`);

      // Filter for keywords where this user is assigned
      const userFilters = [
        `SEARCH('${userId}', ARRAYJOIN({Content Writer}, ',')) > 0`,
        `SEARCH('${userId}', ARRAYJOIN({Content Editor}, ',')) > 0`
      ];

      // Add user filter to filter parts
      filterParts.push(`OR(${userFilters.join(',')})`);
    }

    // Re-enable month filtering for all users
    if (month) {
      console.log('Filtering keywords by month:', month);

      try {
        // Check for both exact match and month-only match
        // For example, if month is "January 2025", we should match both "January 2025" and "January"
        const monthOnly = month.split(' ')[0]; // Extract just the month name

        // For Multiple Select field, we need to use FIND() instead of equality
        const monthFilters = [
          `FIND('${month}', ARRAYJOIN({Month (Keyword Targets)}, ',')) > 0`
        ];

        // If we extracted a month name, also check for that
        if (monthOnly && monthOnly !== month) {
          monthFilters.push(`FIND('${monthOnly}', ARRAYJOIN({Month (Keyword Targets)}, ',')) > 0`);
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
    records.forEach((record: any, index: number) => {
      const statusValue = statusFieldName ? record.fields[statusFieldName] :
                         (record.fields['Keyword/Content Status'] || record.fields.Status || 'No status');
      console.log(`Record ${index} status: "${statusValue}"`);
    });

    // Use the identified status field or fall back to our previous approach
    // For debugging, log all status values first
    console.log('All status values in records:');
    records.forEach((record: any, index: number) => {
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
      briefRecords.slice(0, 3).forEach((record: any, index: number) => {
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
        const status = record.fields['Brief Status'] ||
                      (statusFieldName ? record.fields[statusFieldName] : '') ||
                      record.fields['Keyword/Content Status'] ||
                      record.fields.Status ||
                      '';

        return status === 'Brief Creation Needed' || status === 'Brief Approved' || status === 'Brief Under Internal Review' ||
               status === 'In Progress' || status === 'Needs Input' || status === 'Review Brief' ||
               status === 'Brief In Progress' || status === 'Brief Needs Input' || status === 'Brief Review' ||
               status === 'Approved Brief' || status === 'Brief Needs Revision';
      });

      // Log the status values of the first few records to help debug
      if (briefRecords.length > 0) {
        console.log('First 3 brief records with specific statuses:');
        briefRecords.slice(0, 3).forEach((record: any, index: number) => {
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
      records.forEach((record: any, index: number) => {
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
      let clientValue = fields['Clients'] || fields.Client || fields['Client'];

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
        Clients: clientValue, // Add Clients field for compatibility
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

    // Replace the filter logic section with our new approach
    let filterFormula = '';
    const filterParts = [];

    // REMOVED CLIENT-SPECIFIC FILTERING: Now using same logic as admin for all users
    // Only filtering by month, client filtering will be done on the frontend
    console.log('Using admin-style data fetching for articles for all users (including clients)');

    // If user is not an admin or client, still filter by assigned user
    if (userId && userRole && userRole !== 'Admin' && userRole !== 'Client') {
      console.log(`Filtering articles for user: ${userId}, role: ${userRole}`);

      // Filter for keywords where this user is assigned
      const userFilters = [
        `SEARCH('${userId}', ARRAYJOIN({Content Writer}, ',')) > 0`,
        `SEARCH('${userId}', ARRAYJOIN({Content Editor}, ',')) > 0`
      ];

      // Add user filter to filter parts
      filterParts.push(`OR(${userFilters.join(',')})`);
    }

    // Keep month filtering for all users
    if (month) {
      console.log('Filtering articles by month:', month);

      try {
        // Check for both exact match and month-only match
        // For example, if month is "January 2025", we should match both "January 2025" and "January"
        const monthOnly = month.split(' ')[0]; // Extract just the month name

        // For Multiple Select field, we need to use FIND() instead of equality
        const monthFilters = [
          `FIND('${month}', ARRAYJOIN({Month (Keyword Targets)}, ',')) > 0`
        ];

        // If we extracted a month name, also check for that
        if (monthOnly && monthOnly !== month) {
          monthFilters.push(`FIND('${monthOnly}', ARRAYJOIN({Month (Keyword Targets)}, ',')) > 0`);
        }

        // Add month filter to filter parts
        const monthFilter = `OR(${monthFilters.join(',')})`;
        console.log('Month filter formula for articles:', monthFilter);
        filterParts.push(monthFilter);
      } catch (monthFilterError) {
        console.error('Error creating month filter for articles:', monthFilterError);
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
        key === 'Article Status' ||
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

        // Return true if the status contains any of the article statuses from the screenshot
        return status.includes('Article') ||
               statusLower.includes('article') ||
               // Standard article workflow statuses from the screenshot
               status === 'Awaiting Writer Assignment' ||
               status === 'Writing In Progress' ||
               status === 'Under Client Review' ||
               status === 'Under Editor Review' ||
               status === 'Writer Revision Needed' ||
               status === 'Content Approved' ||
               status === 'Visual Assets Needed' ||
               status === 'Visual Assets Complete' ||
               status === 'Ready for CMS Upload' ||
               status === 'Internal Linking Needed' ||
               status === 'Ready for Publication' ||
               status === 'Published' ||
               status === 'Reverse Internal Linking Needed' ||
               status === 'Complete' ||
               status === 'Cancelled' ||
               status === 'On Hold' ||
               status === 'Content Published' ||
               // Legacy statuses still in use
               status === 'In Production' ||
               status === 'Review Draft' ||
               status === 'Client Review' ||
               status === 'Draft Approved' ||
               status === 'To Be Published' ||
               status === 'Live';
      }

      // Otherwise try our previous approach
      const status = record.fields['Keyword/Content Status'] || record.fields.Status || '';
      const statusLower = status.toLowerCase();

      // Return true if the status contains any of the article statuses from the screenshot
      return status.includes('Article') ||
             statusLower.includes('article') ||
             // Standard article workflow statuses from the screenshot
             status === 'Awaiting Writer Assignment' ||
             status === 'Writing In Progress' ||
             status === 'Under Client Review' ||
             status === 'Under Editor Review' ||
             status === 'Writer Revision Needed' ||
             status === 'Content Approved' ||
             status === 'Visual Assets Needed' ||
             status === 'Visual Assets Complete' ||
             status === 'Ready for CMS Upload' ||
             status === 'Internal Linking Needed' ||
             status === 'Ready for Publication' ||
             status === 'Published' ||
             status === 'Reverse Internal Linking Needed' ||
             status === 'Complete' ||
             status === 'Cancelled' ||
             status === 'On Hold' ||
             status === 'Content Published' ||
             // Legacy statuses still in use
             status === 'In Production' ||
             status === 'Review Draft' ||
             status === 'Client Review' ||
             status === 'Draft Approved' ||
             status === 'To Be Published' ||
             status === 'Live';
    });

    console.log(`Filtered ${articleRecords.length} records as articles`);

    // Map the records to our expected format
    return articleRecords.map((record: any) => {
      const fields = record.fields;

      // Process the Client field - check multiple possible field names
      let clientValue = fields['Clients'] || fields.Client || fields['Client'];

      // If no client field is found, use "Example Client" as a fallback
      if (!clientValue) {
        clientValue = "Example Client";
      }

      // Log the client value for debugging
      console.log(`Article ${record.id} client value:`, clientValue);

      // Map the keyword status to article status
      let articleStatus = 'In Production'; // Default status
      const keywordStatus = fields['Article Status'] || fields.Status || '';

      // Use a switch statement to handle all the possible statuses
      switch (keywordStatus) {
        // Standard article workflow statuses from the screenshot
        case 'Awaiting Writer Assignment':
        case 'Writing In Progress':
        case 'Under Client Review':
        case 'Under Editor Review':
        case 'Writer Revision Needed':
        case 'Content Approved':
        case 'Visual Assets Needed':
        case 'Visual Assets Complete':
        case 'Ready for CMS Upload':
        case 'Internal Linking Needed':
        case 'Ready for Publication':
        case 'Published':
        case 'Reverse Internal Linking Needed':
        case 'Complete':
        case 'Cancelled':
        case 'On Hold':
        case 'Content Published':
        // Legacy status values
        case 'In Production':
        case 'Review Draft':
        case 'Draft Approved':
        case 'To Be Published':
        case 'Live':
          articleStatus = keywordStatus;
          break;
        default:
          // If the status includes 'Article', use it directly
          if (keywordStatus.includes('Article')) {
            articleStatus = keywordStatus;
          } else {
            // Otherwise stick with the default 'In Production'
            articleStatus = 'In Production';
          }
          break;
      }

      // Return an object with our expected structure
      return {
        id: record.id,
        Title: fields['Main Keyword'],
        SEOStrategist: fields['SEO Assignee'],
        DueDate: fields['Due Date (Publication)'],
        DocumentLink: fields['Content Link (G Doc)'],
        'Target Page URL': fields['Target Page URL'] || fields['Target URL'] || fields['Page URL'] || '',
        'Final Word Count': fields['Final Word Count'] || '',
        Month: fields['Month (Keyword Targets)'],
        Status: articleStatus,
        Clients: clientValue, // Add Clients field for compatibility
        ContentWriter: fields['Content Writer'] || fields.ContentWriter || fields.Writer || '',
        ContentEditor: fields.ContentEditor || fields['Content Editor'] || fields.Editor || '',
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
            ALT_TABLES.BACKLINKS.includes(t) ||
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

        // For Single Select Month field in Backlinks table, use equality operator
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
        'Domain Traffic ( API )': fields['Domain Traffic ( API )'] || 0,
        LinkType: typeField && fields[typeField] ? fields[typeField] : '',
        'Link Type': fields['Link Type'] || '',
        TargetPage: targetField && fields[targetField] ? fields[targetField] : '',
        'Client Target Page URL': fields['Client Target Page URL'] || '',
        'Target URL': fields['Target URL'] || fields['Client Target Page URL'] || '',
        'N° RDs Of Referring Page ( API )': fields['N° RDs Of Referring Page ( API )'] || 0,
        'Backlink URL Page Traffic ( API )': fields['Backlink URL Page Traffic ( API )'] || 0,
        'Portal Status': fields['Portal Status'] || '',
        Status: fields['Portal Status'] || statusField && fields[statusField] ? fields[statusField] : 'Pending',
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

// Removed duplicate function - using the one at line 2790

// Helper function to map Airtable status to UI status
function mapAirtableStatusToUIStatus(airtableStatus: string, fields?: Record<string, any>): string {
  // If fields are provided, check for dedicated approval fields first
  if (fields) {
    if (fields['Keyword Approval']) {
      return mapStatusString(fields['Keyword Approval']);
    }
    if (fields['Brief Approval']) {
      return mapStatusString(fields['Brief Approval']);
    }
    if (fields['Article Approval']) {
      return mapStatusString(fields['Article Approval']);
    }
    if (fields['Backlinks Approval']) {
      return mapStatusString(fields['Backlinks Approval']);
    }
  }

  // Otherwise, map the provided status string
  return mapStatusString(airtableStatus);
}

// Helper function to map a status string to UI status
function mapStatusString(statusString: string): string {
  if (!statusString) return 'not_started';

  const statusLower = statusString.toLowerCase();

  // Map to new standardized statuses
  if (statusLower.includes('not started')) {
    return 'not_started';
  } else if (statusLower.includes('in progress')) {
    return 'in_progress';
  } else if (statusLower.includes('ready for review')) {
    return 'ready_for_review';
  } else if (statusLower.includes('awaiting') || statusLower.includes('pending')) {
    return 'awaiting_approval';
  } else if (statusLower.includes('revision') || statusLower.includes('changes')) {
    return 'revisions_needed';
  } else if (statusLower.includes('approved')) {
    return 'approved';
  } else if (statusLower.includes('published') || statusLower.includes('live')) {
    return 'published';
  }

  // Legacy status mappings for backward compatibility
  else if (statusLower.includes('resubmit')) {
    return 'resubmitted';
  } else if (statusLower.includes('needs revision')) {
    return 'needs_revision';
  } else if (statusLower.includes('rejected')) {
    return 'rejected';
  }

  // Default to not_started if no match
  return 'not_started';
}

// Function to update approval status in Airtable
export async function updateApprovalStatus(type: 'keywords' | 'briefs' | 'articles' | 'backlinks' | 'quickwins', itemId: string, status: string, reason?: string) {
  if (!hasAirtableCredentials) {
    console.log(`Using mock data for updating ${type} approval status:`, itemId, status);
    return { id: itemId, status };
  }

  try {
    console.log(`Attempting to update ${type} (itemId: ${itemId}) in Airtable. Received UI status: "${status}", reason: "${reason || 'N/A'}"`);

    const updateObject: Record<string, any> = {};
    let targetFieldName = '';
    let airtableStatusValue = '';

    // Determine the primary target field name based on the item type
    switch (type) {
      case 'keywords':
        targetFieldName = 'Keyword Approvals';
        break;
      case 'briefs':
        targetFieldName = 'Brief Approvals';
        break;
      case 'articles':
        targetFieldName = 'Article Approvals';
        break;
      case 'backlinks':
        targetFieldName = 'Backlink Approvals';
        break;
      case 'quickwins':
        targetFieldName = 'Status';
        break;
      default:
        console.error(`Invalid type "${type}" specified for target field name determination.`);
        return { id: itemId, status: `Error: Invalid type '${type}'` };
    }

    // Determine the Airtable status value and handle revision notes
    if (status === 'Approved' || status.toLowerCase().includes('approval')) {
      airtableStatusValue = 'Approved';
    } else if (status === 'Needs Revision' || status.toLowerCase().includes('revision')) {
      airtableStatusValue = 'Needs Revision';
      if (reason) {
        updateObject['Revision Notes'] = reason; // Update Revision Notes if provided
      }
    } else {
      console.error(`Status "${status}" is not a recognized approval/revision UI status. No update performed.`);
      return { id: itemId, status: `Error: Unrecognized UI status '${status}'` };
    }

    // Set the main status in the determined target field
    if (targetFieldName && airtableStatusValue) {
      updateObject[targetFieldName] = airtableStatusValue;
      console.log(`Will attempt to set Airtable field "${targetFieldName}" to "${airtableStatusValue}"`);
    } else {
      // This case should ideally not be reached if type and status are valid
      console.warn(`Could not determine target field or Airtable status value for type '${type}' and UI status '${status}'.`);
      // If only Revision Notes is in updateObject, we might still proceed if that's desired.
      if (!Object.keys(updateObject).includes('Revision Notes')) {
        return { id: itemId, status: `No update action for '${status}' on '${type}'` };
      }
    }

    if (Object.keys(updateObject).length === 0) {
        console.warn(`No fields to update for itemId ${itemId} with UI status ${status}. Aborting Airtable update.`);
        return { id: itemId, status: "No update performed due to empty updateObject" };
    }

    console.log('Final updateObject to be sent to Airtable:', updateObject);

    // Determine the correct Airtable table name
    let tableName = '';
    switch (type) {
      case 'keywords':
        tableName = TABLES.KEYWORDS;
        break;
      case 'briefs':
        // Briefs are stored in the Keywords table, not in a separate Briefs table
        tableName = TABLES.KEYWORDS;
        break;
      case 'articles':
        // Articles are also stored in the Keywords table
        tableName = TABLES.KEYWORDS;
        break;
      case 'backlinks':
        tableName = TABLES.BACKLINKS;
        break;
      default:
        console.error(`Invalid type "${type}" specified for Airtable table name selection.`);
        throw new Error(`Invalid type for table name: ${type}`);
    }

    const updatedRecord = await base(tableName).update(itemId, updateObject);
    console.log(`Successfully updated ${type} in ${tableName} for item ${itemId}. Record ID: ${updatedRecord.id}`);

    // Determine which field to primarily check for the status from the Airtable record for UI mapping
    // For keywords, briefs, articles, the source of truth is 'Keyword/Content Status'.
    let statusFieldToCheckInAirtable = 'Keyword/Content Status';
    if (type === 'backlinks') {
      // If backlinks use a direct field (e.g., 'Backlinks Approval') and not 'Keyword/Content Status'
      statusFieldToCheckInAirtable = 'Backlinks Approval';
    }

    const returnedAirtableStatusValue = updatedRecord.fields[statusFieldToCheckInAirtable] || updatedRecord.fields['Approval Status'] || '';

    return {
      id: updatedRecord.id,
      status: mapAirtableStatusToUIStatus(returnedAirtableStatusValue as string) // Ensure mapAirtableStatusToUIStatus can handle these values
    };
  } catch (error) {
    console.error(`Error updating ${type} approval status in Airtable for itemId ${itemId}:`, error);
    // Return the original status string passed from the UI to avoid UI confusion on error
    return { id: itemId, status: status }; // Or map to a generic 'error' UI status
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
          const kpiMetricsExists = availableTables.some((t: string) =>
            t === TABLES.KPI_METRICS ||
            t === TABLES.KPI_METRICS.toLowerCase() ||
            t === 'KPI Metrics' ||
            t === 'kpi metrics'
          );

          console.log(`KPI Metrics table exists: ${kpiMetricsExists}`);

          // If table doesn't exist, use mock data
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

      if (checkError.message && checkError.message.includes('Table not found')) {
        console.error('The KPI Metrics table does not exist in this base');
        return mockKPIMetrics;
      }

      if (checkError.message && checkError.message.includes('authorized')) {
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
      fields: ['Month (Keyword Targets)'], // Removed 'Month' as it was causing an UNKNOWN_FIELD_NAME error
      maxRecords: 500, // Reduced maxRecords to 500
    });

    // Use a timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout fetching months')), 15000); // Increased timeout to 15 seconds
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
      console.log('Month (Keyword Targets) field:', records[0].fields['Month (Keyword Targets)']);
    }

    // Try different possible field names for the month
    records.forEach((record: any) => {
      const fields = record.fields;

      // Check for 'Month (Keyword Targets)' field first (from your screenshot)
      const monthValue = fields['Month (Keyword Targets)'] || fields.Month || '';
      
      // Handle array values (Multiple Select fields)
      if (Array.isArray(monthValue)) {
        // Add each month from the array
        monthValue.forEach(month => {
          if (month && typeof month === 'string') {
            uniqueMonths.add(month);
          }
        });
      } 
      // Handle string values (Single Select fields)
      else if (monthValue && typeof monthValue === 'string') {
        uniqueMonths.add(monthValue);
      }
    });

    // Convert Set to Array and sort by date
    let months = Array.from(uniqueMonths);
    console.log('Found unique months:', months);

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

/**
 * Get monthly projections from Airtable
 * @param clientIds Optional client IDs to filter by
 * @returns Array of monthly projections
 */
export async function getMonthlyProjections(clientIds?: string[] | null) {
  if (!hasAirtableCredentials) {
    console.log('Using mock monthly projections data (no credentials)');

    // If client IDs are provided, filter the mock data
    if (clientIds && clientIds.length > 0) {
      return mockMonthlyProjections.filter(projection => {
        if (projection.Client) {
          if (Array.isArray(projection.Client)) {
            return projection.Client.some(client => clientIds.includes(client));
          } else {
            return clientIds.includes(projection.Client);
          }
        }
        return false;
      });
    }

    return mockMonthlyProjections;
  }

  try {
    console.log('Fetching monthly projections from Airtable...');

    // Build the query with appropriate filters
    let query;
    if (clientIds && clientIds.length > 0) {
      console.log('Filtering monthly projections by client:', clientIds);

      // Create a filter formula for client IDs
      const clientFilters = clientIds.map(clientId =>
        `SEARCH('${clientId}', ARRAYJOIN(Clients, ',')) > 0`
      );

      // Combine filters with OR
      const filterFormula = `OR(${clientFilters.join(',')})`;

      query = base(TABLES.MONTHLY_PROJECTIONS).select({
        filterByFormula: filterFormula
      });
    } else {
      query = base(TABLES.MONTHLY_PROJECTIONS).select();
    }

    const records = await query.all();
    console.log(`Successfully fetched ${records.length} monthly projections from Airtable`);

    return records.map((record: any) => ({
      id: record.id,
      ...record.fields
    }));
  } catch (error) {
    console.error('Error fetching monthly projections:', error);

    // Fall back to mock data
    console.log('Falling back to mock monthly projections data');
    return mockMonthlyProjections;
  }
}

// Mock activity logs data
const mockActivityLogs = [
  {
    id: 'log1',
    Timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    Description: 'Brief for "SEO Strategy for E-commerce" has been approved',
    Category: 'brief_updates',
    UserSource: 'John Smith'
  },
  {
    id: 'log2',
    Timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    Description: 'New backlink opportunity identified for client website',
    Category: 'backlink_updates',
    UserSource: { name: 'Emma Johnson' }
  },
  {
    id: 'log3',
    Timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    Description: 'Content article "Top 10 SEO Strategies" submitted for review',
    Category: 'content_updates',
    UserSource: 'Michael Brown'
  },
  {
    id: 'log4',
    Timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    Description: 'Monthly SEO performance report generated',
    Category: 'reports',
    UserSource: { name: 'Sarah Davis' }
  },
  {
    id: 'log5',
    Timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    Description: 'New keyword cluster created for product pages',
    Category: 'keyword_updates',
    UserSource: 'Alex Wilson'
  }
];

/**
 * Get the latest activity logs from Airtable
 * @param limit Optional number of logs to return (default: 10)
 * @param clientIds Optional client IDs to filter by
 * @returns Array of activity logs
 */
export const getLatestActivityLogs = async (limit: number = 10, clientIds?: string[] | null) => {
  // If we don't have Airtable credentials, return mock data
  if (!hasAirtableCredentials || !base) {
    console.log('Using mock activity logs data');
    return mockActivityLogs;
  }

  try {
    // Get the Activity Log table
    const table = base(TABLES.ACTIVITY_LOG);

    // Build the filter formula if clientIds are provided
    let filterFormula = '';
    if (clientIds && clientIds.length > 0) {
      // Create a formula that checks if any of the client IDs are in the Client field
      // Note: Adjust field name if different in your Airtable
      const clientFormulas = clientIds.map(id => `FIND("${id}", {Client})`).join(', ');
      filterFormula = `OR(${clientFormulas})`;
    }

    // Fetch records from Airtable
    const records = await table.select({
      filterByFormula: filterFormula || '',
      sort: [{ field: 'Timestamp', direction: 'desc' }],
      maxRecords: limit
    }).all();

    // Map the records to our data structure
    return records.map((record: any) => ({
      id: record.id,
      Timestamp: record.get('Timestamp') as string,
      Description: record.get('Description') as string,
      Category: record.get('Category') as string,
      UserSource: record.get('UserSource') as string | { name: string },
      // Add any other fields you need from the Activity Log table
    }));
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return mockActivityLogs;
  }
}

/**
 * Get approval items from Airtable
 * @param type Type of approval items to fetch (briefs, articles, etc.)
 * @param userId User ID for filtering
 * @param userRole User role for filtering
 * @param clientIds Client IDs for filtering
 * @param page Page number for pagination
 * @param pageSize Number of items per page
 * @param offset Offset for pagination
 * @returns Object with items and pagination info or array of items if no pagination is requested
 */
export async function getApprovalItems(
  type: string,
  userId?: string | null,
  userRole?: string | null,
  clientIds?: string[] | null,
  page?: number,
  pageSize?: number,
  offset?: string
) {
  // Check if this is a simple request (no pagination) or a paginated request
  const isPaginatedRequest = page !== undefined && pageSize !== undefined;

  // Set default values for pagination if needed
  const currentPage = page || 1;
  const itemsPerPage = pageSize || 10;

  // Default response structure for paginated requests
  const defaultResponse = {
    items: [],
    pagination: {
      currentPage,
      totalPages: 1,
      totalItems: 0,
      hasNextPage: false,
      hasPrevPage: false,
      nextOffset: null,
      prevOffset: null
    }
  };

  if (!hasAirtableCredentials) {
    console.log('Using mock data for approval items (no credentials)');

    // Determine which mock data to use based on type
    let mockItems: Record<string, any>[] = [];

    if (type === 'keywords') {
      mockItems = mockKeywordPerformance.map(item => ({
        id: item.id,
        item: item.Keyword,
        volume: item.Volume,
        difficulty: 'Medium',
        status: 'awaiting_approval',
        dateSubmitted: new Date().toISOString().split('T')[0],
        lastUpdated: '2 days ago',
        strategist: 'SEO Specialist'
      }));
    } else if (type === 'briefs') {
      mockItems = mockBriefs.map(item => ({
        id: item.id,
        item: item.Title,
        status: 'awaiting_approval',
        dateSubmitted: new Date().toISOString().split('T')[0],
        lastUpdated: '2 days ago',
        strategist: item.SEOStrategist || 'SEO Specialist'
      }));
    } else if (type === 'articles') {
      mockItems = mockArticles.map(item => ({
        id: item.id,
        item: item.Title,
        wordCount: item.WordCount || 1500,
        status: 'awaiting_approval',
        dateSubmitted: new Date().toISOString().split('T')[0],
        lastUpdated: '3 days ago',
        strategist: item.Writer || 'Content Writer'
      }));
    } else if (type === 'backlinks') {
      mockItems = mockBacklinks;
    }

    // Filter by client if needed
    if (userRole === 'Client' && clientIds && clientIds.length > 0) {
      mockItems = mockItems.filter(item => {
        if (item.Client) {
          if (Array.isArray(item.Client)) {
            return item.Client.some((client: string) => clientIds.includes(client));
          } else {
            return clientIds.includes(item.Client);
          }
        }
        return false;
      });
    }

    // If this is a simple request (no pagination), return the items directly
    if (!isPaginatedRequest) {
      return mockItems;
    }

    // Calculate pagination
    const totalItems = mockItems.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = mockItems.slice(startIndex, endIndex);

    return {
      items: paginatedItems,
      pagination: {
        currentPage,
        totalPages,
        totalItems,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
        nextOffset: currentPage < totalPages ? String(currentPage + 1) : null,
        prevOffset: currentPage > 1 ? String(currentPage - 1) : null
      }
    };
  }

  try {
    console.log(`Fetching ${type} approval items from Airtable...`);

    // Determine which table to use based on type
    let tableName = '';
    if (type === 'keywords' || type === 'briefs' || type === 'articles') {
      tableName = TABLES.KEYWORDS;
    } else if (type === 'backlinks') {
      tableName = TABLES.BACKLINKS; // This was in the original code
    } else {
      console.error(`Unknown approval type: ${type}`);
      return defaultResponse;
    }

    // Build the query with appropriate filters
    let filterFormula = '';
    const filterParts = [];

    // If user is a client, filter by client
    if (userRole === 'Client' && clientIds && clientIds.length > 0) {
      console.log('Filtering approval items by client:', clientIds);

      // Create a filter formula for client IDs that checks both Clients and Client fields
      const clientFilters = clientIds.map(clientId =>
        `SEARCH('${clientId}', ARRAYJOIN({Clients}, ',')) > 0`
      );

      // Add client filter to filter parts
      filterParts.push(`OR(${clientFilters.join(',')})`);
    }

    // Use simplified filtering based on the dedicated approval fields
    if (type === 'briefs') {
      // Use the dedicated Brief Approvals field
      filterParts.push(`NOT({Brief Approvals} = '')`);
    } else if (type === 'articles') {
      // Use the dedicated Article Approvals field
      filterParts.push(`NOT({Article Approvals} = '')`);
    } else if (type === 'keywords') {
      // Use the dedicated Keyword Approvals field
      filterParts.push(`NOT({Keyword Approvals} = '')`);
    } else if (type === 'backlinks') {
      // Use the dedicated Backlink Approvals field
      filterParts.push(`NOT({Backlink Approvals} = '')`);
    }

    // Combine all filter parts with AND
    if (filterParts.length > 0) {
      if (filterParts.length === 1) {
        filterFormula = filterParts[0];
      } else {
        filterFormula = `AND(${filterParts.join(',')})`;
      }
    }

    // Prepare query options
    const queryOptions: Record<string, string | number | boolean | undefined> = {
      pageSize: itemsPerPage
    };

    // Only add filter if we have one
    if (filterFormula && filterParts.length > 0) {
      queryOptions.filterByFormula = filterFormula;
    }

    // Only add offset if it's provided
    if (offset) {
      queryOptions.offset = offset;
    }

    console.log('Using query options:', queryOptions);
    const query = base(tableName).select(queryOptions);

    // Fetch only the first page of records
    console.log('Calling query.firstPage() to fetch records...');
    const result = await query.firstPage();
    console.log(`Successfully fetched ${result.length} records from Airtable for ${type} approvals`);

    // Get the offset for the next page
    const nextOffset = query.offset || null;
    console.log(`Next page offset: ${nextOffset || 'None (last page)'}`);

    // Log the first record to see its structure
    if (result.length > 0) {
      console.log(`Sample record for ${type}:`, {
        id: result[0].id,
        fields: result[0].fields,
        fieldKeys: Object.keys(result[0].fields)
      });
    } else {
      console.log(`No records found for ${type} with the current filter`);
      console.log('Filter formula:', filterFormula);

      // Return empty array if no records found
      if (isPaginatedRequest) {
        return defaultResponse;
      } else {
        return [];
      }
    }

    // Map the records to our expected format
    const items = result.map((record: Record<string, unknown>) => {
      const fields = record.fields as Record<string, unknown>;

      // Try to find the right field names by checking multiple possibilities
      const getFieldValue = <T>(possibleNames: string[], defaultValue: T): T => {
        for (const name of possibleNames) {
          if (fields[name] !== undefined) {
            return fields[name] as T;
          }
        }
        return defaultValue;
      };

      // Common fields for all types
      const commonFields = {
        id: record.id,
        item: getFieldValue([
          'Main Keyword',
          'Keyword',
          'Title',
          'Name',
          'Content',
          'Brief Title'
        ], 'Untitled'),
        status: mapAirtableStatusToUIStatus(getFieldValue([
          'Approval Status',
          'Status',
          'Content Status',
          'Keyword/Content Status'
        ], '')),
        dateSubmitted: getFieldValue([
          'Created Time',
          'Created',
          'Date Created',
          'Submission Date'
        ], new Date().toISOString().split('T')[0]),
        lastUpdated: getFieldValue([
          'Last Updated',
          'Last Modified',
          'Modified Time',
          'Last Modified Time',
          'Update Date'
        ], '3 days ago'),
      };

      // Type-specific fields
      if (type === 'keywords') {
        return {
          ...commonFields,
          volume: getFieldValue(['Search Volume', 'Volume', 'Monthly Volume'], 0),
          difficulty: getFieldValue(['Difficulty', 'Keyword Difficulty', 'SEO Difficulty'], 'Medium'),
          strategist: getFieldValue([
            'Content Writer',
            'Writer',
            'SEO Strategist',
            'SEO Specialist',
            'Assigned To'
          ], 'Not Assigned')
        };
      } else if (type === 'briefs') {
        return {
          ...commonFields,
          strategist: getFieldValue([
            'SEO Assignee',
            'SEO Strategist',
            'SEO Specialist',
            'Assigned To',
            'Brief Owner'
          ], 'Not Assigned')
        };
      } else if (type === 'articles') {
        return {
          ...commonFields,
          wordCount: getFieldValue([
            'Final Word Count',
            'Word Count',
            'Content Length',
            'Length'
          ], 0),
          strategist: getFieldValue([
            'Content Writer',
            'Writer',
            'Author',
            'Assigned To'
          ], 'Not Assigned')
        };
      } else if (type === 'backlinks') {
        return {
          ...commonFields,
          domainRating: getFieldValue([
            'Domain Authority/Rating',
            'DR ( API )',
            'DomainRating',
            'Domain Rating'
          ], 0),
          linkType: getFieldValue([
            'Link Type',
            'LinkType',
            'Type'
          ], 'Guest Post'),
          targetPage: getFieldValue([
            'Target URL',
            'Client Target Page URL',
            'TargetPage',
            'Target Page'
          ], ''),
          wentLiveOn: getFieldValue([
            'Went Live On',
            'WentLiveOn',
            'Live Date',
            'Published Date'
          ], ''),
          notes: getFieldValue([
            'Notes',
            'Comments',
            'Description'
          ], '')
        };
      }

      return commonFields;
    });

    // If this is a simple request (no pagination), return the items directly
    if (!isPaginatedRequest) {
      return items;
    }

    // Calculate pagination info
    // We don't know the total count from Airtable, so we'll estimate
    // We know there's a next page if we have an offset
    const hasNextPage = !!nextOffset;

    // For total items, we'll use a rough estimate
    // If we have a full page and there's a next page, we'll estimate 100 items total
    // Otherwise, we'll just use the current items length
    const totalItems = hasNextPage ? Math.max(items.length * 5, 100) : items.length;
    const totalPages = hasNextPage ? Math.max(currentPage + 1, Math.ceil(totalItems / itemsPerPage)) : currentPage;

    return {
      items,
      pagination: {
        currentPage,
        totalPages,
        totalItems,
        hasNextPage,
        hasPrevPage: currentPage > 1,
        nextOffset: nextOffset,
        prevOffset: currentPage > 1 ? String(currentPage - 1) : null
      }
    };
  } catch (error) {
    console.error(`Error fetching ${type} approval items:`, error);

    // Fall back to mock data
    console.log(`Falling back to mock ${type} data for approval items`);
    return defaultResponse;
  }
}

// Helper function to map raw Airtable status values to predefined YouTube statuses
function mapToYouTubeStatus(rawStatus: string): 'Idea Proposed' | 'Idea Awaiting Client Approval' | 'Idea Approved' | 'Idea To Do Next' | 'Script Creation Needed' | 'Script Under Internal Review' | 'Script Awaiting Client Depth' | 'Script Needs Revision' | 'Script Approved' | 'Video In Recording' | 'Video In Editing' | 'Video Ready' | 'Thumbnail In Creation' | 'Thumbnail Done' | 'Ready To Upload' {
  if (!rawStatus) return 'Idea Proposed';
  
  const status = rawStatus.toLowerCase().trim();
  
  // Exact matches first
  if (rawStatus === 'Idea Proposed') return 'Idea Proposed';
  if (rawStatus === 'Idea Awaiting Client Approval') return 'Idea Awaiting Client Approval';
  if (rawStatus === 'Idea Approved') return 'Idea Approved';
  if (rawStatus === 'Idea To Do Next') return 'Idea To Do Next';
  if (rawStatus === 'Script Creation Needed') return 'Script Creation Needed';
  if (rawStatus === 'Script Under Internal Review') return 'Script Under Internal Review';
  if (rawStatus === 'Script Awaiting Client Depth') return 'Script Awaiting Client Depth';
  if (rawStatus === 'Script Needs Revision') return 'Script Needs Revision';
  if (rawStatus === 'Script Approved') return 'Script Approved';
  if (rawStatus === 'Video In Recording') return 'Video In Recording';
  if (rawStatus === 'Video In Editing') return 'Video In Editing';
  if (rawStatus === 'Video Ready') return 'Video Ready';
  if (rawStatus === 'Thumbnail In Creation') return 'Thumbnail In Creation';
  if (rawStatus === 'Thumbnail Done') return 'Thumbnail Done';
  if (rawStatus === 'Ready To Upload') return 'Ready To Upload';
  
  // Pattern matching for common variations
  if (status.includes('idea') && status.includes('proposed')) return 'Idea Proposed';
  if (status.includes('idea') && (status.includes('awaiting') || status.includes('waiting')) && status.includes('client')) return 'Idea Awaiting Client Approval';
  if (status.includes('idea') && status.includes('approved')) return 'Idea Approved';
  if (status.includes('idea') && (status.includes('to do') || status.includes('todo') || status.includes('next'))) return 'Idea To Do Next';
  
  if (status.includes('script') && (status.includes('creation') || status.includes('needed') || status.includes('create'))) return 'Script Creation Needed';
  if (status.includes('script') && status.includes('internal') && status.includes('review')) return 'Script Under Internal Review';
  if (status.includes('script') && status.includes('client') && (status.includes('depth') || status.includes('awaiting'))) return 'Script Awaiting Client Depth';
  if (status.includes('script') && (status.includes('revision') || status.includes('needs'))) return 'Script Needs Revision';
  if (status.includes('script') && status.includes('approved')) return 'Script Approved';
  
  if (status.includes('video') && status.includes('recording')) return 'Video In Recording';
  if (status.includes('video') && status.includes('editing')) return 'Video In Editing';
  if (status.includes('video') && (status.includes('ready') || status.includes('complete'))) return 'Video Ready';
  
  if (status.includes('thumbnail') && (status.includes('creation') || status.includes('creating') || status.includes('review') || status.includes('progress'))) return 'Thumbnail In Creation';
  if (status.includes('thumbnail') && (status.includes('done') || status.includes('complete') || status.includes('approved'))) return 'Thumbnail Done';
  
  if (status.includes('ready') && status.includes('upload')) return 'Ready To Upload';
  if (status.includes('upload') && status.includes('ready')) return 'Ready To Upload';
  
  // Default fallback
  console.log(`Unknown YouTube status: "${rawStatus}", defaulting to "Idea Proposed"`);
  return 'Idea Proposed';
}

// YouTube functions
export async function getYouTubeData(userId?: string | null, userRole?: string | null, clientIds?: string[] | null, month?: string | null) {
  if (!hasAirtableCredentials) {
    console.log('Error: Airtable credentials are missing. Cannot fetch YouTube data.');
    return [];
  }

  try {
    console.log('Fetching YouTube data from Airtable...');
    console.log('Using base ID:', baseId);
    console.log('Using table name:', TABLES.YOUTUBE_MANAGEMENT || 'Youtube Management');

    // Check if the YouTube table exists and we can access it
    const tableName = TABLES.YOUTUBE_MANAGEMENT || 'Youtube Management';
    
    try {
      // First, let's get all records without any filtering to see what fields exist
      const allRecords = await base(tableName).select({ maxRecords: 50 }).firstPage();
      console.log('YouTube table check:', allRecords.length > 0 ? 'Table exists and has records' : 'Table exists but is empty');
      console.log(`Total records fetched for field inspection: ${allRecords.length}`);

      if (allRecords.length > 0) {
        // Find all unique field names across all records
        const allFieldNames = new Set<string>();
        allRecords.forEach((record: any) => {
          Object.keys(record.fields).forEach(field => allFieldNames.add(field));
        });
        
        console.log('All unique field names across all records:', Array.from(allFieldNames).sort());
        
        // Look for records that have Target Month populated
        const recordsWithTargetMonth = allRecords.filter((record: any) => record.fields['Target Month']);
        console.log(`Records with Target Month field: ${recordsWithTargetMonth.length}`);
        
        if (recordsWithTargetMonth.length > 0) {
          console.log('Sample record with Target Month:', {
            id: recordsWithTargetMonth[0].id,
            'Target Month': recordsWithTargetMonth[0].fields['Target Month'],
            'Keyword Topic': recordsWithTargetMonth[0].fields['Keyword Topic'],
            'All fields': Object.keys(recordsWithTargetMonth[0].fields)
          });
          
          // Show all Target Month values that exist
          const targetMonthValues = recordsWithTargetMonth.map((r: any) => r.fields['Target Month']).filter(Boolean);
          console.log('All Target Month values found:', [...new Set(targetMonthValues)]);
        } else {
          console.log('No records found with Target Month field populated');
          
          // Look for any field that might be related to month/date
          const sampleRecord = allRecords[0];
          console.log('Sample record structure:', sampleRecord.fields);
          
          const potentialMonthFields = Array.from(allFieldNames).filter(field => 
            field.toLowerCase().includes('month') || 
            field.toLowerCase().includes('target') ||
            field.toLowerCase().includes('date') ||
            field.toLowerCase().includes('time')
          );
          console.log('Potential month-related fields found:', potentialMonthFields);
        }
      } else {
        console.log('YouTube table is empty.');
        return [];
      }
    } catch (checkError: any) {
      console.error('Error checking YouTube table:', checkError.message);
      if (checkError.message && checkError.message.includes('Table not found')) {
        console.error('The YouTube Management table does not exist in this base');
        return [];
      }
      return [];
    }

    // Build the query with appropriate filters
    let filterFormula = '';
    const filterParts = [];

    // If user is a client, filter by client
    if (userRole === 'Client' && clientIds && clientIds.length > 0) {
      console.log('Filtering YouTube by client:', clientIds);
      
      // Use only Clients field for filtering (linked records)
      const clientFilters = clientIds.map(clientId => 
        `SEARCH('${clientId}', ARRAYJOIN({Clients}, ',')) > 0`
      );
      
      filterParts.push(`OR(${clientFilters.join(',')})`);
      console.log('Client filter created:', `OR(${clientFilters.join(',')})`);
    } else {
      console.log('Not filtering by client - userRole:', userRole, 'clientIds:', clientIds);
    }

    // If month is specified, add month filter
    if (month) {
      console.log('Filtering YouTube by month:', month);
      const monthOnly = month.split(' ')[0]; // Extract just the month name
      
      // Try multiple approaches for finding month matches in Target Month field
      const monthFilters = [
        // Exact match
        `{Target Month} = '${month}'`,
        // Contains match (for multi-select fields)
        `FIND('${month}', ARRAYJOIN({Target Month}, ',')) > 0`
      ];
      
      // Also try with just the month name (e.g., "May" instead of "May 2025")
      if (monthOnly && monthOnly !== month) {
        monthFilters.push(`{Target Month} = '${monthOnly}'`);
        monthFilters.push(`FIND('${monthOnly}', ARRAYJOIN({Target Month}, ',')) > 0`);
      }
      
      // Combine with OR
      const monthFilter = `OR(${monthFilters.join(',')})`;
      filterParts.push(monthFilter);
      console.log('YouTube month filter created:', monthFilter);
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
      query = base(tableName).select({
        filterByFormula: filterFormula
      });
    } else {
      query = base(tableName).select();
    }

    // Fetch the records
    const records = await query.all();
    console.log(`Successfully fetched ${records.length} YouTube records from Airtable`);
    
    // Debug: Log all Target Month values to see what we have
    if (records.length > 0) {
      console.log('All Target Month values found:', records.map((r: any) => r.fields['Target Month']).filter(Boolean));
      console.log('All records preview:', records.map((r: any) => ({
        id: r.id,
        'Keyword Topic': r.fields['Keyword Topic'],
        'Target Month': r.fields['Target Month'],
        'YouTube Status': r.fields['YouTube Status'],
        'Thumbnail Status': r.fields['Thumbnail Status']
      })));
    }

    // Map the records to our expected format
    return records.map((record: any) => {
      const fields = record.fields;

      // Handle linked Clients field - extract IDs from linked field objects
      let clientsValue = fields['Clients'];
      if (Array.isArray(clientsValue) && clientsValue.length > 0) {
        if (typeof clientsValue[0] === 'object' && clientsValue[0].id) {
          clientsValue = clientsValue.map((client: any) => client.id);
        }
      }

      // Map actual Airtable status values to predefined YouTube statuses
      const rawStatus = fields['YouTube Status'] || fields['Thumbnail Status'] || '';
      const youtubeStatus = mapToYouTubeStatus(rawStatus);
      
      // Log what we found for debugging
      console.log(`YouTube record ${record.id}:`, {
        'YouTube Status': fields['YouTube Status'],
        'Thumbnail Status': fields['Thumbnail Status'],
        'Resolved Status': youtubeStatus,
        'Target Month': fields['Target Month'],
        'Clients': clientsValue
      });

      return {
        id: record.id,
        'Keyword Topic': fields['Keyword Topic'] || '',
        'Video Title': fields['Video Title'],
        'Competitor video URL': fields['Competitor video URL'],
        'YouTube Status': youtubeStatus,
        'Thumbnail Status': fields['Thumbnail Status'],
        'Target Month': fields['Target Month'],
        'Video Type': fields['Video Type'],
        'Related blog embeds': fields['Related blog embeds'],
        'Script (G-Doc URL)': fields['Script (G-Doc URL)'],
        'Notes': fields['Notes'],
        'Clients': clientsValue,
        'YouTube Strategist': fields['YouTube Strategist'],
        'YouTube Host': fields['YouTube Host'],
        'Thumbnail Editor': fields['Thumbnail Editor'],
        'Video Editor': fields['Video Editor'],
        'YouTube Scripter': fields['YouTube Scripter'],
        'Script Title': fields['Script Title'],
        // Include all original fields as well
        ...fields
      };
    });
  } catch (error) {
    console.error('Error fetching YouTube data:', error);
    return [];
  }
}

// Reddit functions  
export async function getRedditData(userId?: string | null, userRole?: string | null, clientIds?: string[] | null, month?: string | null) {
  if (!hasAirtableCredentials) {
    console.log('Error: Airtable credentials are missing. Cannot fetch Reddit data.');
    return [];
  }

  try {
    console.log('Fetching Reddit data from Airtable...');
    console.log('Using base ID:', baseId);
    console.log('Using table name:', TABLES.REDDIT_THREADS || 'Reddit Threads');
    console.log('Client IDs for filtering:', clientIds);
    console.log('Month for filtering:', month);

    // Check if the Reddit table exists and we can access it
    const tableName = TABLES.REDDIT_THREADS || 'Reddit Threads';
    
    try {
      const checkRecord = await base(tableName).select({ maxRecords: 1 }).firstPage();
      console.log('Reddit table check:', checkRecord.length > 0 ? 'Table exists and has records' : 'Table exists but is empty');

      if (checkRecord.length > 0) {
        console.log('Sample Reddit record structure:', checkRecord[0].fields);
        console.log('Available fields in Reddit:', Object.keys(checkRecord[0].fields));
      } else {
        console.log('Reddit table is empty.');
        return [];
      }
    } catch (checkError: any) {
      console.error('Error checking Reddit table:', checkError.message);
      if (checkError.message && checkError.message.includes('Table not found')) {
        console.error('The Reddit Threads table does not exist in this base');
        return [];
      }
      return [];
    }

    // Build the query with appropriate filters
    let filterFormula = '';
    const filterParts = [];

    // If user is a client or admin with specific client selected, filter by client
    if (clientIds && clientIds.length > 0) {
      console.log('Filtering Reddit by client IDs:', clientIds);
      
      // Create an OR filter for each client ID using SEARCH to find it in the Clients field
      const clientFilters = clientIds.map(clientId => 
        `SEARCH('${clientId}', ARRAYJOIN({Clients}, ',')) > 0`
      );
      
      // Combine the client filters with OR
      if (clientFilters.length === 1) {
        filterParts.push(clientFilters[0]);
      } else if (clientFilters.length > 1) {
        filterParts.push(`OR(${clientFilters.join(',')})`);
      }
      
      console.log('Client filter created:', filterParts[filterParts.length - 1]);
    } else {
      console.log('No client IDs provided for filtering Reddit data');
    }

    // If month is specified, add month filter
    if (month) {
      console.log('Filtering Reddit by month:', month);
      
      // Extract just the month name for partial matching
      const monthOnly = month.split(' ')[0]; 
      
      // Try different matching approaches for the Month field
      const monthFilters = [
        // Exact match
        `{Month} = '${month}'`,
        // Contains match (for multi-select fields)
        `FIND('${month}', ARRAYJOIN({Month}, ',')) > 0`
      ];
      
      // Also try with just the month name (January instead of January 2023)
      if (monthOnly && monthOnly !== month) {
        monthFilters.push(`{Month} = '${monthOnly}'`);
        monthFilters.push(`FIND('${monthOnly}', ARRAYJOIN({Month}, ',')) > 0`);
      }
      
      // Combine with OR
      const monthFilter = `OR(${monthFilters.join(',')})`;
      filterParts.push(monthFilter);
      console.log('Month filter created:', monthFilter);
    }

    // Combine all filter parts with AND
    if (filterParts.length > 0) {
      if (filterParts.length === 1) {
        filterFormula = filterParts[0];
      } else {
        filterFormula = `AND(${filterParts.join(',')})`;
      }
      console.log('Final filter formula:', filterFormula);
    } else {
      console.log('No filters applied, fetching all Reddit threads');
    }

    // Apply the filter if one was created
    let query;
    if (filterFormula) {
      console.log('Using filter formula:', filterFormula);
      query = base(tableName).select({
        filterByFormula: filterFormula
      });
    } else {
      query = base(tableName).select();
    }

    // Fetch the records
    const records = await query.all();
    console.log(`Successfully fetched ${records.length} Reddit records from Airtable`);

    // Debug logging for the first few records
    if (records.length > 0) {
      console.log('First few Reddit records:');
      records.slice(0, 3).forEach((record: any, index: number) => {
        console.log(`Record ${index}:`, {
          id: record.id,
          keyword: record.fields['Keyword'] || 'No keyword',
          month: record.fields['Month'] || 'No month',
          status: record.fields['Reddit Thread Status (General)'] || 'No status',
          clients: record.fields['Clients'] || 'No clients'
        });
      });
    }

    // Map the records to our expected format
    return records.map((record: any) => {
      const fields = record.fields;

      // Handle linked Clients field - extract IDs from linked field objects
      let clientsValue = fields['Clients'];
      if (Array.isArray(clientsValue) && clientsValue.length > 0) {
        if (typeof clientsValue[0] === 'object' && clientsValue[0].id) {
          clientsValue = clientsValue.map((client: any) => client.id);
        }
      }

      return {
        id: record.id,
        'Keyword': fields['Keyword'] || '',
        'Reddit Thread URL': fields['Reddit Thread URL'],
        'Clients': clientsValue,

        'Thread Success Pulse': fields['Thread Success Pulse'],
        'Reddit Thread Status (General)': fields['Reddit Thread Status (General)'] || 'Thread Proposed',
        'Reddit Assignee': fields['Reddit Assignee'],
        'SEO Assignee': fields['SEO Assignee'],
        'Thread Type': fields['Thread Type'],
        'Notes': fields['Notes'],
        'Related SEO Keyword': fields['Related SEO Keyword'],
        'Reddit Comments': fields['Reddit Comments'],
        'Thread SEO Traffic': fields['Thread SEO Traffic'],
        'Thread SEO Traffic Value': fields['Thread SEO Traffic Value'],
        'Month': fields['Month'],
        // Include all original fields as well
        ...fields
      };
    });
  } catch (error) {
    console.error('Error fetching Reddit data:', error);
    return [];
  }
}

// Function to get a specific Airtable table
export async function getAirtableTable(tableName: string) {
  if (!hasAirtableCredentials) {
    throw new Error('Airtable credentials not found');
  }

  // Check if base is properly initialized
  if (!base) {
    throw new Error('Airtable base is not initialized');
  }

  return base(tableName);
}

/**
 * Create a new WQA task in Airtable
 * @param taskData Task data to create
 * @returns Created task or null if failed
 */
export async function createWQATask(taskData: {
  Name: string;
  Status: string;
  Title?: string;
  Priority?: string;
  // Type field has been removed as it causes errors with Airtable
  'Impact'?: string;
  'Effort'?: string;
  'Notes By Scalerrs During Audit'?: string;
  'Action Type'?: string;
  'Who Is Responsible'?: string;
  'Explication: Why?'?: string;
  Clients?: string[];
  // 'Assigned To' has been removed as it requires special handling
}) {
  if (!hasAirtableCredentials) {
    console.log('Using mock data for creating WQA task:', taskData);
    
    // Create a mock task with the provided data
    const newTask = {
      id: `task-${Date.now()}`,
      Name: taskData.Name, // Use Name as the primary field
      Title: taskData.Title || taskData.Name, // Keep Title as an alias if provided
      Description: taskData['Notes By Scalerrs During Audit'] || '',
      Status: taskData.Status,
      AssignedTo: ['Unassigned'], // Default value
      Priority: taskData.Priority || 'Medium',
      Category: 'Technical SEO', // Hard-code a default category
      'Impact': taskData['Impact'] || '3', // Use string format for impact (1-5)
      'Effort': taskData['Effort'] || 'M', // Use S, M, L directly
      'Created At': new Date().toISOString(),
      Clients: taskData.Clients || []
    };
    
    // Add to mock tasks - safe conversion to match the mockTasks type
    mockTasks.push(newTask as any);
    return newTask;
  }

  try {
    console.log('Creating new WQA task in Airtable:', taskData);
    
    // Create the task in Airtable with the Name field
    // Important: We're not setting 'Assigned To' since it needs special handling
    const createdRecord = await base('WQA').create(taskData);
    
    console.log('Successfully created WQA task:', createdRecord.id);
    
    return {
      id: createdRecord.id,
      ...createdRecord.fields
    };
  } catch (error) {
    console.error('Error creating WQA task in Airtable:', error);
    
    // Return mock data as fallback
    const newTask = {
      id: `task-${Date.now()}`,
      Name: taskData.Name, // Use Name as the primary field
      Title: taskData.Title || taskData.Name, // Keep Title as an alias if provided
      Description: taskData['Notes By Scalerrs During Audit'] || '',
      Status: taskData.Status,
      AssignedTo: ['Unassigned'], // Default value
      Priority: taskData.Priority || 'Medium',
      Category: 'Technical SEO', // Hard-code a default category
      'Impact': taskData['Impact'] || '3', // Use string format for impact (1-5)
      'Effort': taskData['Effort'] || 'M', // Use S, M, L directly
      'Created At': new Date().toISOString(),
      Clients: taskData.Clients || []
    };
    
    return newTask;
  }
}

/**
 * Gets CRO tasks from Airtable
 * This function retrieves tasks specifically from the CRO table
 */
export async function getCROTasks(userId?: string | null, userRole?: string | null, clientIds?: string[] | null) {
  if (!hasAirtableCredentials) {
    console.log('Using mock tasks data for CRO - no Airtable credentials');
    
    // Create mock CRO tasks as fallback
    const mockCROTasks = mockTasks.slice(0, 5).map(task => ({
      ...task,
      Type: 'CRO',
      Title: `CRO: ${task.Title || 'Task'}`,
      Status: ['To Do', 'In Progress', 'Complete'][Math.floor(Math.random() * 3)]
    }));
    
    return mockCROTasks;
  }

  try {
    console.log('Fetching CRO tasks from Airtable...');
    
    
    // Create filter formula if needed
    let filterFormula = '';
    
    // If we have client IDs, filter by them regardless of user role
    if (clientIds && clientIds.length > 0) {
      console.log('Filtering CRO tasks by client IDs:', clientIds);
      
      try {
        // Only use the 'Clients' field with exact capitalization
        // Airtable error shows that 'client' (lowercase) doesn't exist in the schema
        const clientFilters = clientIds.map(clientId => 
          `FIND('${clientId}', {Clients})`
        );
        
        filterFormula = `OR(${clientFilters.join(',')})`;  
        console.log('Using client filter:', filterFormula);
      } catch (error) {
        console.warn('Error creating client filter, fetching all records instead:', error);
      }
    }
    // No client-specific filtering needed for other cases
    // Admin users will see all records when no filter is applied

    // Query the CRO table
    let query;
    if (filterFormula) {
      query = base('CRO').select({
        filterByFormula: filterFormula
      });
    } else {
      query = base('CRO').select();
    }
    
    console.log('Querying CRO table in Airtable');

    const records = await query.all();
    console.log(`Successfully fetched ${records.length} CRO tasks from Airtable`);

    return records.map((record: any) => {
      const fields = record.fields;
      
      // Map Airtable field names to our expected structure
      return {
        id: record.id,
        Name: fields['Action Item Name'] || '', // Map from "Action Item Name" to "Name"
        Title: fields['Action Item Name'] || '', // Also map to Title for consistency
        Status: fields['Status'] || 'Not Started',
        Priority: fields['Portal Priority'] || '-', // Provide a default value
        Impact: fields['Portal Impact'] || '-', // Provide a default value
        Effort: fields['Portal Effort'] || '-', // Provide a default value
        CROType: fields['Type'] || '-', // CRO-specific Type field
        AssignedTo: fields['Assignee'] || 'Unassigned',
        Notes: fields['Description'] || '',
        Comments: fields['Comments'] || '',
        Created: fields['Created'] || new Date().toISOString(),
        Type: 'CRO', // Hardcode type for frontend filtering
        ...fields // Include all other fields too
      };
    });
  } catch (error) {
    console.error('Error fetching CRO tasks from Airtable:', error);
    throw error;
  }
}

/**
 * Create a new CRO task in Airtable
 * @param taskData Task data to create
 * @returns Created task or null if failed
 */
export async function createCROTask(taskData: {
  'Action Item Name': string;
  Status: string;
  Priority?: string;
  Impact?: string;
  Effort?: string;
  Comments?: string;
  Assignee?: string;
  Clients?: string[];
  Type?: string;
  Example?: string;
  'Example Screenshot'?: string;
}) {
  if (!hasAirtableCredentials) {
    console.log('Using mock data for creating CRO task:', taskData);
    
    // Create a mock task with the provided data
    const newTask = {
      id: `cro-task-${Date.now()}`,
      Name: taskData['Action Item Name'],
      Title: taskData['Action Item Name'],
      Status: taskData.Status,
      Priority: taskData.Priority || 'Medium',
      Impact: taskData.Impact || '3',
      Effort: taskData.Effort || 'M',
      AssignedTo: taskData.Assignee || 'Unassigned',
      Notes: taskData.Comments || '',
      Created: new Date().toISOString(),
      Type: 'CRO',
      Clients: taskData.Clients || []
    };
    
    // Add to mock tasks
    mockTasks.push(newTask as any);
    return newTask;
  }

  try {
    console.log('Creating new CRO task in Airtable:', taskData);
    
    // Create the task in Airtable with the correct field mappings
    const createdRecord = await base('CRO').create(taskData);
    
    console.log('Successfully created CRO task:', createdRecord.id);
    
    // Map the Airtable response to our expected structure
    return {
      id: createdRecord.id,
      Name: createdRecord.fields['Action Item Name'] || '',
      Title: createdRecord.fields['Action Item Name'] || '',
      Status: createdRecord.fields['Status'] || '',
      Priority: createdRecord.fields['Priority'] || '',
      Impact: createdRecord.fields['Impact'] || '',
      Effort: createdRecord.fields['Effort'] || '',
      AssignedTo: createdRecord.fields['Assignee'] || 'Unassigned',
      Notes: createdRecord.fields['Description'] || '',
      Created: createdRecord.fields['Created'] || new Date().toISOString(),
      Type: 'CRO',
      ...createdRecord.fields
    };
  } catch (error) {
    console.error('Error creating CRO task in Airtable:', error);
  }
}

/**
 * Update a CRO task's status in Airtable
 * @param taskId Task ID to update
 * @param newStatus New status
 * @returns Updated task or null if failed
 */
export async function updateCROTaskStatus(taskId: string, newStatus: string) {
  if (!hasAirtableCredentials) {
    console.log('Using mock data for updating CRO task status:', taskId, newStatus);
    
    // Find the task in the mock data
    const taskIndex = mockTasks.findIndex(task => task.id === taskId);
    
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    
    // Update the task status
    mockTasks[taskIndex].Status = newStatus;
    
    // Return the updated task
    return {
      ...mockTasks[taskIndex],
      id: taskId
    };
  }

  try {
    console.log('Updating CRO task status in Airtable:', taskId, newStatus);
    
    // Update the task in Airtable
    const updatedRecord = await base('CRO').update(taskId, {
      'Status': newStatus
    });
    
    console.log('Successfully updated CRO task status:', updatedRecord.id);
    
    return {
      id: updatedRecord.id,
      ...updatedRecord.fields
    };
  } catch (error) {
    console.error('Error updating CRO task status in Airtable:', error);
    throw error;
  }
}


/**
 * Gets Strategy / Ad-hoc tasks from Airtable (table: "Strategy Tasks")
 * Mirrors getCROTasks but targets the Strategy board.
 */
export async function getStrategyTasks(
  userId?: string | null,
  userRole?: string | null,
  clientIds?: string[] | null
) {
  if (!hasAirtableCredentials) {
    console.log('Using mock tasks data for Strategy – no Airtable credentials');

    // Provide a small mocked subset tagged as Strategy
    const mockStrategyTasks = mockTasks.slice(0, 5).map(task => ({
      ...task,
      Type : 'Strategy',
      Title: `Strategy: ${task.Title || 'Task'}`,
      Status: ['To Do', 'In Progress', 'Complete'][Math.floor(Math.random() * 3)]
    }));

    return mockStrategyTasks;
  }

  try {
    console.log('Fetching Strategy tasks from Airtable ...');

    // Build optional filter formula – identical approach to getCROTasks
    let filterFormula = '';

    if (userRole === 'Client' && clientIds && clientIds.length > 0) {
      console.log('Filtering Strategy tasks by client:', clientIds);
      try {
        const clientFilters = clientIds.map(id => "SEARCH('" + id + "', {Client Record ID})");
        filterFormula = `OR(${clientFilters.join(',')})`;
      } catch (err) {
        console.warn('Error creating client filter for Strategy tasks:', err);
      }
    } else if (userId && userRole && userRole !== 'Admin') {
      console.log(`Filtering Strategy tasks for user: ${userId}`);
      try {
        filterFormula = `SEARCH('${userId}', {Assignee})`;
      } catch (err) {
        console.warn('Error creating assignee filter for Strategy tasks:', err);
      }
    }

    // Query the "Strategy Tasks" table
    let query;
    if (filterFormula) {
      query = base('Strategy Tasks').select({ filterByFormula: filterFormula });
    } else {
      query = base('Strategy Tasks').select();
    }

    const records = await query.all();
    console.log(`Fetched ${records.length} Strategy tasks from Airtable`);

    return records.map((rec: any) => {
      const fields = rec.fields;

      // Normalise Name/Title
      if (fields.Title && !fields.Name) fields.Name = fields.Title as any;
      else if (fields.Name && !fields.Title) fields.Title = fields.Name as any;

      return {
        id: rec.id,
        ...fields,
        Type: 'Strategy'
      };
    });
  } catch (error) {
    console.error('Error fetching Strategy tasks from Airtable:', error);
    throw error;
  }
}

/**
 * Create a new Strategy / Ad-hoc task in the "Strategy Tasks" table
 */
export async function createStrategyTask(taskData: {
  Name: string;
  Status: string;
  Priority?: string;
  Impact?: string;
  Effort?: string;
  Comments?: string;
  Assignee?: string;
  Clients?: string[];
}) {
  if (!hasAirtableCredentials) {
    console.log('Using mock data for creating Strategy task:', taskData);

    const newTask = {
      id       : `strategy-task-${Date.now()}`,
      Name     : taskData.Name,
      Title    : taskData.Name,
      Status   : taskData.Status,
      Priority : taskData.Priority || 'Medium',
      Impact   : taskData.Impact || '3',
      Effort   : taskData.Effort || 'M',
      AssignedTo: taskData.Assignee || 'Unassigned',
      Notes    : taskData.Comments || '',
      Created  : new Date().toISOString(),
      Type     : 'Strategy',
      Clients  : taskData.Clients || []
    };
    return newTask;
  }

  try {
    console.log('Creating new Strategy task in Airtable:', taskData);

    const created = await base('Strategy Tasks').create(taskData);

    return {
      id       : created.id,
      ...created.fields,
      Type     : 'Strategy'
    };
  } catch (err) {
    console.error('Error creating Strategy task in Airtable:', err);
    // graceful fallback
    return {
      id       : `strategy-task-${Date.now()}`,
      Name     : taskData.Name,
      Status   : taskData.Status,
      Priority : taskData.Priority || 'Medium',
      Impact   : taskData.Impact || '3',
      Effort   : taskData.Effort || 'M',
      Type     : 'Strategy'
    };
  }
}
