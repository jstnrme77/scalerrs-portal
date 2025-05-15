// Netlify function to get approval items from Airtable
const { getApprovalItems } = require('../../.netlify/server/chunks/airtable.js');

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
    console.log('Netlify function: get-approvals called');

    // Get approval type from query parameters
    const queryParams = event.queryStringParameters || {};
    const type = queryParams.type || 'briefs';

    // Get pagination parameters
    const page = parseInt(queryParams.page || '1', 10);
    const pageSize = parseInt(queryParams.pageSize || '10', 10);
    const offset = queryParams.offset || undefined;

    // Get user information from headers
    const userId = event.headers['x-user-id'];
    const userRole = event.headers['x-user-role'];
    const userClient = event.headers['x-user-client'];

    console.log('User ID:', userId);
    console.log('User Role:', userRole);
    console.log('User Client:', userClient);
    console.log('Approval Type:', type);
    console.log('Page:', page, 'Page Size:', pageSize, 'Offset:', offset);

    // Parse client IDs if present
    const clientIds = userClient ? JSON.parse(userClient) : [];

    // Fetch approval items with user filtering and pagination
    const result = await getApprovalItems(type, userId, userRole, clientIds, page, pageSize, offset);

    console.log(`Netlify function: Found ${result.items.length} ${type} approval items (page ${page} of ${result.pagination.totalPages})`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Error in get-approvals function:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch approval items' })
    };
  }
};
