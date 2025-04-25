const Airtable = require('airtable');

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight response' })
    };
  }

  // Get Airtable credentials from environment variables
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    console.error('Missing Airtable credentials');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Missing Airtable credentials',
        apiKeyExists: !!apiKey,
        baseIdExists: !!baseId
      })
    };
  }

  try {
    // Initialize Airtable
    const airtable = new Airtable({ apiKey });
    const base = airtable.base(baseId);

    // Get all monthly projections
    const records = await base('Monthly Projections').select().all();
    console.log(`Found ${records.length} monthly projections`);

    // Map records to match your Airtable schema
    const monthlyProjections = records.map(record => ({
      id: record.id,
      ...record.fields
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ monthlyProjections })
    };
  } catch (error) {
    console.error('Error fetching monthly projections:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to fetch monthly projections',
        details: error.message
      })
    };
  }
};
