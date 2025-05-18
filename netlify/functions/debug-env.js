// Netlify function to debug environment variables and configuration
const { getAirtableBase } = require('./utils/airtable');

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
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
    console.log('Netlify function: debug-env called');

    // Get environment variables (mask sensitive values)
    const envVars = {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY ? `${process.env.AIRTABLE_API_KEY.substring(0, 10)}...` : 'not set',
      AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID || 'not set',
      NEXT_PUBLIC_AIRTABLE_API_KEY: process.env.NEXT_PUBLIC_AIRTABLE_API_KEY ? `${process.env.NEXT_PUBLIC_AIRTABLE_API_KEY.substring(0, 10)}...` : 'not set',
      NEXT_PUBLIC_AIRTABLE_BASE_ID: process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || 'not set',
      NEXT_PUBLIC_USE_MOCK_DATA: process.env.NEXT_PUBLIC_USE_MOCK_DATA || 'not set'
    };

    // Test Airtable connection
    let airtableConnection = 'not tested';
    let airtableError = null;

    try {
      const base = getAirtableBase();
      // Try to fetch a single record from any table to test the connection
      const tables = ['Keywords', 'Articles', 'Briefs', 'Backlinks', 'Tasks', 'Comments'];
      
      // Try each table until we find one that works
      let connectionSuccessful = false;
      
      for (const table of tables) {
        try {
          console.log(`Trying to fetch a record from ${table} table...`);
          const records = await base(table).select({
            maxRecords: 1
          }).firstPage();
          
          if (records && records.length > 0) {
            airtableConnection = `success (found ${records.length} record in ${table} table)`;
            connectionSuccessful = true;
            break;
          }
        } catch (tableError) {
          console.error(`Error fetching from ${table} table:`, tableError);
          // Continue to the next table
        }
      }
      
      if (!connectionSuccessful) {
        airtableConnection = 'failed (no records found in any table)';
      }
    } catch (error) {
      console.error('Error testing Airtable connection:', error);
      airtableConnection = 'failed';
      airtableError = error.message;
    }

    // Get available Netlify functions
    const functionsList = [
      'get-approvals',
      'get-articles',
      'get-backlinks',
      'get-briefs',
      'get-comments',
      'get-homepage-data',
      'get-keyword-performance',
      'get-kpi-metrics',
      'get-monthly-projections',
      'get-tasks',
      'get-url-performance',
      'update-approval',
      'update-article',
      'update-brief',
      'update-task',
      'add-comment',
      'login',
      'auth',
      'debug-env'
    ];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        environment: envVars,
        airtable: {
          connection: airtableConnection,
          error: airtableError
        },
        functions: functionsList
      })
    };
  } catch (error) {
    console.error('Error in debug-env function:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to get debug information',
        message: error.message,
        stack: error.stack
      })
    };
  }
};
