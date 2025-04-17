// Netlify Function to get tasks from Airtable
const Airtable = require('airtable');

exports.handler = async function(event, context) {
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

    // Get tasks from Airtable
    const records = await base('Tasks').select().all();

    const tasks = records.map(record => ({
      id: record.id,
      ...record.fields
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ tasks })
    };
  } catch (error) {
    console.error('Error fetching tasks from Airtable:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to fetch tasks from Airtable',
        details: error.message
      })
    };
  }
};
