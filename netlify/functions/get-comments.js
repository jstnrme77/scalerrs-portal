// Netlify Function to get comments from Airtable
const Airtable = require('airtable');

exports.handler = async function(event, context) {
  // Get taskId from query parameters
  const params = new URLSearchParams(event.queryStringParameters);
  const taskId = params.get('taskId') || event.queryStringParameters.taskId;

  if (!taskId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Task ID is required'
      })
    };
  }

  // Initialize Airtable with API key from environment variables
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Airtable API key or Base ID not configured'
      })
    };
  }

  try {
    // Initialize Airtable
    const airtable = new Airtable({ apiKey });
    const base = airtable.base(baseId);

    // First, let's get all comments to see what's available
    console.log('Searching for comments with Task ID:', taskId);
    const allComments = await base('Comments').select().all();
    console.log('All comments in Airtable:', allComments.length);

    if (allComments.length > 0) {
      // Log the first comment to see its structure
      console.log('Sample comment structure:', JSON.stringify(allComments[0].fields));
    }

    // For linked records in Airtable, we need to use a different approach
    // The Task field will be an array of record IDs
    const records = await base('Comments')
      .select({
        // Filter for comments where the Task field contains our taskId
        filterByFormula: `SEARCH('${taskId}', ARRAYJOIN(Task, ',')) > 0`,
        sort: [{ field: 'CreatedAt', direction: 'desc' }]
      })
      .all();

    console.log(`Found ${records.length} comments for task ${taskId}`);

    // If we didn't find any comments, try a different approach
    if (records.length === 0) {
      console.log('No comments found with first approach, trying alternative...');

      // Try getting all comments and filtering manually
      const allComments = await base('Comments').select().all();

      const allTaskComments = allComments.filter(record => {
        const taskField = record.fields.Task;

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
        const comments = allTaskComments.map(record => ({
          id: record.id,
          ...record.fields,
          // Ensure we have the expected fields
          Title: record.fields.Title || '',
          Comment: record.fields.Comment || '',
          Task: Array.isArray(record.fields.Task) ? record.fields.Task : [record.fields.Task || ''],
          User: Array.isArray(record.fields.User) ? record.fields.User : [record.fields.User || ''],
          CreatedAt: record.fields.CreatedAt || record.fields['Created Time'] || new Date().toISOString()
        }));

        return {
          statusCode: 200,
          body: JSON.stringify({ comments })
        };
      }
    }

    // Map records to match your Airtable schema
    const comments = records.map(record => {
      const fields = record.fields;
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

    return {
      statusCode: 200,
      body: JSON.stringify({ comments })
    };
  } catch (error) {
    console.error('Error fetching comments from Airtable:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to fetch comments from Airtable',
        details: error.message
      })
    };
  }
};
