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
  const apiKey = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
  const baseId = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;
  
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
    
    // Get comments for the task from Airtable
    const records = await base('Comments')
      .select({
        filterByFormula: `FIND('${taskId}', {Task})`,
        sort: [{ field: 'CreatedAt', direction: 'asc' }]
      })
      .all();
    
    const comments = records.map(record => ({
      id: record.id,
      ...record.fields
    }));
    
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
