// Netlify Function to update a task status in Airtable
const Airtable = require('airtable');

exports.handler = async function(event, context) {
  // Check if the method is allowed
  if (event.httpMethod !== 'PATCH' && event.httpMethod !== 'PUT') {
    return {
      statusCode: 405,
      body: JSON.stringify({
        error: 'Method not allowed'
      })
    };
  }
  // Get task data from request body
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

  const { taskId, status } = data;

  if (!taskId || !status) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Task ID and status are required'
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

    // Update the task status
    const updatedRecord = await base('Tasks').update(taskId, {
      Status: status
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        task: {
          id: updatedRecord.id,
          ...updatedRecord.fields
        }
      })
    };
  } catch (error) {
    console.error('Error updating task in Airtable:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to update task in Airtable',
        details: error.message
      })
    };
  }
};
