// Netlify function to get clients from Airtable
const { getAirtableBase } = require('./utils/airtable');

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-user-id, x-user-role, x-user-client',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  try {
    console.log('Netlify function: get-clients called');

    // Get user information from headers
    const userId = event.headers['x-user-id'];
    const userRole = event.headers['x-user-role'];
    const userClient = event.headers['x-user-client'];

    console.log('User ID:', userId);
    console.log('User Role:', userRole);
    console.log('User Client:', userClient);

    // Initialize Airtable
    const base = getAirtableBase();

    // Get clients
    console.log('Fetching clients from Airtable...');
    const records = await base('Clients').select().all();
    console.log(`Found ${records.length} clients`);

    // Map records to match your Airtable schema
    const clients = records.map(record => ({
      id: record.id,
      ...record.fields
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ clients })
    };
  } catch (error) {
    console.error('Error fetching clients:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to fetch clients',
        details: error.message
      })
    };
  }
};
