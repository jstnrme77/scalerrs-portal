// Netlify function to update approval status in Airtable
const { updateApprovalStatus } = require('../../.netlify/server/chunks/airtable.js');

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
    console.log('Netlify function: update-approval called');
    
    // Parse request body
    const body = JSON.parse(event.body);
    const { type, itemId, status, revisionReason } = body;
    
    if (!type || !itemId || !status) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields: type, itemId, and status are required' })
      };
    }
    
    console.log(`Updating ${type} approval status for item ${itemId} to ${status}`);
    
    // Update approval status
    const updatedItem = await updateApprovalStatus(type, itemId, status, revisionReason);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ updatedItem })
    };
  } catch (error) {
    console.error('Error in update-approval function:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to update approval status' })
    };
  }
};
