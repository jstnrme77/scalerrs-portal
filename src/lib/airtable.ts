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

    return records.map((record) => ({
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
    return mockUsers.find(user => user.Email && user.Email.toLowerCase() === email.toLowerCase()) || null;
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
    const user = {
      id: records[0].id,
      ...records[0].fields
    };

    return user;
  } catch (error: any) {
    console.error('Error fetching user by email:', error.message);

    // Fall back to mock data
    console.log('Falling back to mock data for getUserByEmail');
    return mockUsers.find(user => user.Email && user.Email.toLowerCase() === email.toLowerCase()) || null;
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
export async function getTasks(userRole?: string | null, clientIds?: string[] | null) {
  if (!hasAirtableCredentials) {
    console.log('Using mock tasks data - no Airtable credentials');
    console.log('API Key exists:', !!apiKey);
    console.log('Base ID exists:', !!baseId);

    // If user info is provided, filter mock data
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

    return mockTasks;
  }

  try {
    console.log('Fetching tasks from Airtable...');
    console.log('Using base ID:', baseId);

    let query = base(TABLES.TASKS).select();

    // If user is a client, filter by client
    if (userRole === 'Client' && clientIds && clientIds.length > 0) {
      console.log('Filtering tasks by client:', clientIds);

      // Create a filter formula for client IDs
      // This handles the case where Client field is an array of record IDs
      const clientFilters = clientIds.map(clientId =>
        `SEARCH('${clientId}', ARRAYJOIN(Client, ',')) > 0`
      );

      // Combine filters with OR
      const filterFormula = `OR(${clientFilters.join(',')})`;
      console.log('Using filter formula:', filterFormula);

      query = base(TABLES.TASKS).select({
        filterByFormula: filterFormula
      });
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

    // If user info is provided, filter mock data
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

// Brief functions
export async function getBriefs() {
  if (!hasAirtableCredentials) {
    console.log('Using mock briefs data');
    return mockBriefs;
  }

  try {
    console.log('Fetching briefs from Airtable...');
    console.log('Using base ID:', baseId);
    console.log('Using table name:', TABLES.BRIEFS);

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
          const briefsExists = availableTables.some((t: string) =>
            t === TABLES.BRIEFS ||
            t === TABLES.BRIEFS.toLowerCase() ||
            t === 'Briefs' ||
            t === 'briefs'
          );

          console.log(`Briefs table exists: ${briefsExists}`);

          // If table doesn't exist, use mock data
          if (!briefsExists) {
            console.log('Briefs table does not exist in this base. Using mock data.');
            return mockBriefs;
          }
        }
      }
    } catch (listTablesError) {
      console.error('Error listing tables:', listTablesError);
    }

    // Check if the table exists and we can access it
    try {
      // First, try to get just one record to verify the table exists and is accessible
      const checkRecord = await base(TABLES.BRIEFS).select({ maxRecords: 1 }).firstPage();
      console.log('Briefs table check:', checkRecord.length > 0 ? 'Table exists and has records' : 'Table exists but is empty');

      if (checkRecord.length > 0) {
        console.log('Sample Briefs record structure:', checkRecord[0].fields);
        console.log('Available fields in Briefs:', Object.keys(checkRecord[0].fields));
      } else {
        console.log('Briefs table is empty. Using mock data...');
        return mockBriefs;
      }
    } catch (checkError: any) {
      console.error('Error checking Briefs table:', checkError.message);

      if (checkError.message && checkError.message.includes('Table not found')) {
        console.error('The Briefs table does not exist in this base');
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

    // Proceed with fetching all records
    const records = await base(TABLES.BRIEFS).select().all();
    console.log(`Successfully fetched ${records.length} briefs records from Airtable`);

    // Log the first record to see what fields are available
    if (records.length > 0) {
      console.log('First brief record fields:', records[0].fields);
      console.log('First brief record field keys:', Object.keys(records[0].fields));
    }

    // Map the records to our expected format
    return records.map((record: any) => {
      const fields = record.fields;
      const fieldKeys = Object.keys(fields);

      // Log each record's fields for debugging
      console.log(`Record ${record.id} fields:`, fieldKeys);

      // Process the Client field - it might be an array of record IDs in Airtable
      let clientValue = fields.Client;
      if (Array.isArray(clientValue) && clientValue.length > 0) {
        // If it's an array of record IDs, just use "Example Client" as a fallback
        clientValue = "Example Client";
      } else if (!clientValue) {
        clientValue = "Example Client";
      }

      // Return an object with our expected structure
      return {
        id: record.id,
        Title: fields.Title || '',
        SEOStrategist: fields.SEOStrategist || fields['SEO Strategist'] || '',
        DueDate: fields.DueDate || fields['Due Date'] || '',
        DocumentLink: fields.DocumentLink || fields['Document Link'] || '',
        Month: fields.Month || '',
        Status: fields.Status || 'In Progress',
        Client: clientValue,
        ContentWriter: fields.ContentWriter || fields['Content Writer'] || '',
        ContentEditor: fields.ContentEditor || fields['Content Editor'] || '',
        // Include all original fields as well
        ...fields
      };
    });
  } catch (error) {
    console.error('Error fetching briefs:', error);
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
    console.log('Using table name:', TABLES.BRIEFS);

    // First, check if the brief exists
    try {
      const checkRecord = await base(TABLES.BRIEFS).find(briefId);
      console.log('Found brief to update:', checkRecord.id);
      console.log('Current brief fields:', checkRecord.fields);
    } catch (findError) {
      console.error(`Brief with ID ${briefId} not found:`, findError);
      throw new Error(`Brief with ID ${briefId} not found`);
    }

    // Now update the brief
    const updatedRecord = await base(TABLES.BRIEFS).update(briefId, {
      Status: status,
    });

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

// Article functions
export async function getArticles() {
  if (!hasAirtableCredentials) {
    console.log('Using mock articles data');
    return mockArticles;
  }

  try {
    console.log('Fetching articles from Airtable...');
    console.log('Using base ID:', baseId);
    console.log('Using table name:', TABLES.ARTICLES);

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
          const articlesExists = availableTables.some((t: string) =>
            t === TABLES.ARTICLES ||
            t === TABLES.ARTICLES.toLowerCase() ||
            t === 'Articles' ||
            t === 'articles'
          );

          console.log(`Articles table exists: ${articlesExists}`);

          // If table doesn't exist, use mock data
          if (!articlesExists) {
            console.log('Articles table does not exist in this base. Using mock data.');
            return mockArticles;
          }
        }
      }
    } catch (listTablesError) {
      console.error('Error listing tables:', listTablesError);
    }

    // Proceed with fetching all records
    const records = await base(TABLES.ARTICLES).select().all();
    console.log(`Successfully fetched ${records.length} articles records from Airtable`);

    // Log the first record to see what fields are available
    if (records.length > 0) {
      console.log('First article record fields:', records[0].fields);
      console.log('First article record field keys:', Object.keys(records[0].fields));
    }

    // Map the records to our expected format
    return records.map((record: any) => {
      const fields = record.fields;

      // Process the Client field - it might be an array of record IDs in Airtable
      let clientValue = fields.Client;
      if (Array.isArray(clientValue) && clientValue.length > 0) {
        // If it's an array of record IDs, just use "Example Client" as a fallback
        clientValue = "Example Client";
      } else if (!clientValue) {
        clientValue = "Example Client";
      }

      // Process the Writer field - it might be an array of record IDs in Airtable
      let writerValue = fields.Writer || fields['Writer'] || fields['Content Writer'] || '';

      // Log the writer value for debugging
      console.log('Original Writer value:', writerValue);

      if (Array.isArray(writerValue) && writerValue.length > 0) {
        // If it's an array of record IDs, just use the first one as a string
        writerValue = writerValue[0];
        console.log('Writer value after array processing:', writerValue);
      } else if (!writerValue) {
        writerValue = "Unassigned";
      }

      // Check if the writer value looks like a record ID and replace with a name
      if (typeof writerValue === 'string' && writerValue.startsWith('rec') && writerValue.length === 17) {
        // This is likely a record ID, use a hardcoded name based on the mock data
        const writerMap: { [key: string]: string } = {
          // Add mappings for known record IDs if available
        };

        // Use the mapped name if available, otherwise use a default name
        writerValue = writerMap[writerValue] || "Alex Johnson";
        console.log('Writer value after record ID mapping:', writerValue);
      }

      // Process the Editor field - it might be under Content Editor in Airtable
      let editorValue = fields.Editor || fields['Editor'] || fields['Content Editor'] || '';

      // Log the editor value for debugging
      console.log('Original Editor value:', editorValue);

      if (Array.isArray(editorValue) && editorValue.length > 0) {
        // If it's an array of record IDs, just use the first one as a string
        editorValue = editorValue[0];
        console.log('Editor value after array processing:', editorValue);
      } else if (!editorValue) {
        editorValue = "Unassigned";
      }

      // Check if the editor value looks like a record ID and replace with a name
      if (typeof editorValue === 'string' && editorValue.startsWith('rec') && editorValue.length === 17) {
        // This is likely a record ID, use a hardcoded name based on the mock data
        const editorMap: { [key: string]: string } = {
          // Add mappings for known record IDs if available
        };

        // Use the mapped name if available, otherwise use a default name
        editorValue = editorMap[editorValue] || "Jane Doe";
        console.log('Editor value after record ID mapping:', editorValue);
      }

      // Return an object with our expected structure
      return {
        id: record.id,
        Title: fields.Title || '',
        Writer: writerValue,
        Editor: editorValue,
        WordCount: fields.WordCount || fields['Word Count'] || 0,
        DueDate: fields.DueDate || fields['Due Date'] || '',
        DocumentLink: fields.DocumentLink || fields['Document Link'] || '',
        ArticleURL: fields.ArticleURL || fields['Article URL'] || '',
        Month: fields.Month || '',
        Status: fields.Status || 'In Production',
        Client: clientValue,
        // Include all original fields as well
        ...fields
      };
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
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
    console.log('Using table name:', TABLES.ARTICLES);

    // First, check if the article exists
    try {
      const checkRecord = await base(TABLES.ARTICLES).find(articleId);
      console.log('Found article to update:', checkRecord.id);
      console.log('Current article fields:', checkRecord.fields);
    } catch (findError) {
      console.error(`Article with ID ${articleId} not found:`, findError);
      throw new Error(`Article with ID ${articleId} not found`);
    }

    // Now update the article
    const updatedRecord = await base(TABLES.ARTICLES).update(articleId, {
      Status: status,
    });

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
export async function getBacklinks() {
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

    // Proceed with fetching all records
    const records = await base(TABLES.BACKLINKS).select().all();
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
        key.toLowerCase().includes('domain') && !key.toLowerCase().includes('rating')
      );

      // Domain Rating field - look for any field containing "rating" or "dr"
      const ratingField = fieldKeys.find(key =>
        key.toLowerCase().includes('rating') || key.toLowerCase() === 'dr'
      );

      // Link Type field - look for any field containing "type"
      const typeField = fieldKeys.find(key =>
        key.toLowerCase().includes('type')
      );

      // Target Page field - look for any field containing "target", "page", or "url"
      const targetField = fieldKeys.find(key =>
        key.toLowerCase().includes('target') ||
        key.toLowerCase().includes('page') ||
        key.toLowerCase().includes('url')
      );

      // Status field - look for any field containing "status"
      const statusField = fieldKeys.find(key =>
        key.toLowerCase().includes('status')
      );

      // Went Live On field - look for any field containing "live", "date", or "published"
      const liveField = fieldKeys.find(key =>
        key.toLowerCase().includes('live') ||
        key.toLowerCase().includes('date') ||
        key.toLowerCase().includes('published')
      );

      // Notes field - look for any field containing "note", "comment", or "description"
      const notesField = fieldKeys.find(key =>
        key.toLowerCase().includes('note') ||
        key.toLowerCase().includes('comment') ||
        key.toLowerCase().includes('description')
      );

      // Month field - look for any field containing "month" or "period"
      const monthField = fieldKeys.find(key =>
        key.toLowerCase().includes('month') ||
        key.toLowerCase().includes('period')
      );

      // Return an object with our expected structure, using the fields we found
      // or empty values if we couldn't find a matching field
      return {
        id: record.id,
        Domain: domainField ? fields[domainField] : '',
        DomainRating: ratingField ? fields[ratingField] : 0,
        LinkType: typeField ? fields[typeField] : '',
        TargetPage: targetField ? fields[targetField] : '',
        Status: statusField ? fields[statusField] : 'Pending',
        WentLiveOn: liveField ? fields[liveField] : '',
        Notes: notesField ? fields[notesField] : '',
        Month: monthField ? fields[monthField] : '',
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
