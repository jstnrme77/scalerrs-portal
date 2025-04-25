// Netlify Function to update a brief status in Airtable
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

  // Parse the request body
  let requestBody;
  try {
    requestBody = JSON.parse(event.body);
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Invalid request body'
      })
    };
  }

  const { briefId, status } = requestBody;

  if (!briefId || !status) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Brief ID and status are required'
      })
    };
  }

  // Initialize Airtable with API key from environment variables
  // Try both naming conventions for environment variables
  const apiKey = process.env.AIRTABLE_API_KEY || process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    console.error('Missing Airtable credentials');
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Missing Airtable credentials'
      })
    };
  }

  try {
    // Initialize Airtable
    const airtable = new Airtable({ apiKey });
    const base = airtable.base(baseId);

    // Update the brief
    const updatedRecord = await base('Briefs').update(briefId, {
      Status: status
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        brief: {
          id: updatedRecord.id,
          ...updatedRecord.fields
        }
      })
    };
  } catch (error) {
    console.error('Error updating brief:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to update brief',
        details: error.message
      })
    };
  }
};
