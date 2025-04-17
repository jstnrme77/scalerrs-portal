// Netlify Function to add a comment to Airtable
const Airtable = require('airtable');

exports.handler = async function(event, context) {
  // Get comment data from request body
  let data;
  try {
    data = JSON.parse(event.body);
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Invalid request body'
      })
    };
  }
  
  const { taskId, userId, comment } = data;
  
  if (!taskId || !userId || !comment) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Task ID, user ID, and comment are required'
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
    
    // First, verify that the task exists
    const taskRecords = await base('Tasks')
      .select({
        filterByFormula: `RECORD_ID() = '${taskId}'`
      })
      .all();
    
    if (taskRecords.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: `Task with ID ${taskId} not found`
        })
      };
    }
    
    // Create the comment
    const newComment = await base('Comments').create({
      Title: `Comment on task ${taskId}`,
      Task: [taskId],
      User: [userId],
      Comment: comment
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        comment: {
          id: newComment.id,
          ...newComment.fields
        }
      })
    };
  } catch (error) {
    console.error('Error adding comment to Airtable:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to add comment to Airtable',
        details: error.message
      })
    };
  }
};
