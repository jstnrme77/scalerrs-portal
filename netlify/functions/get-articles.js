// Netlify Function to get articles from Airtable
const Airtable = require('airtable');

exports.handler = async function(event, context) {
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

  console.log('Get Articles function called');

  // Initialize Airtable with API key from environment variables
  // Try both naming conventions for environment variables
  const apiKey = process.env.AIRTABLE_API_KEY || process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    console.error('Missing Airtable credentials');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Missing Airtable credentials'
      })
    };
  }

  try {
    // Initialize Airtable
    const airtable = new Airtable({ apiKey });
    const base = airtable.base(baseId);

    // Get user information from headers
    const userId = event.headers['x-user-id'];
    const userRole = event.headers['x-user-role'];
    const userClient = event.headers['x-user-client'];

    console.log('User ID:', userId);
    console.log('User Role:', userRole);
    console.log('User Client:', userClient);

    // Get month parameter from query string
    const month = event.queryStringParameters?.month;
    console.log('Month parameter:', month);

    // Parse client IDs if present
    const clientIds = userClient ? JSON.parse(userClient) : [];

    // Build query
    let filterParts = [];

    // Add month filter if provided
    if (month) {
      console.log('Filtering articles by month:', month);
      filterParts.push(`{Month (Keyword Targets)} = '${month}'`);
    }

    // Add client filter if user is not an admin and has assigned clients
    if (userRole !== 'admin' && clientIds && clientIds.length > 0) {
      const clientFilters = clientIds.map(clientId =>
        `FIND("${clientId}", {Client})`
      );
      filterParts.push(`OR(${clientFilters.join(',')})`);
    }

    // Add article type filter - only get records that are articles
    // We need to filter for records that have "Article" in their content type
    filterParts.push(`{Content Type} = 'Article'`);

    // Combine all filter parts with AND
    let filterFormula = '';
    if (filterParts.length > 0) {
      filterFormula = filterParts.length === 1
        ? filterParts[0]
        : `AND(${filterParts.join(',')})`;
    }

    console.log('Filter formula:', filterFormula);

    // Set up query parameters
    const queryParams = {};
    if (filterFormula) {
      queryParams.filterByFormula = filterFormula;
    }

    // Query the Keywords table (which contains articles)
    const records = await base('Keywords').select(queryParams).all();
    console.log(`Found ${records.length} articles`);

    // Map records to match the expected article structure
    const articles = records.map(record => {
      const fields = record.fields;

      // Determine the article status
      let articleStatus = fields['Keyword/Content Status'] || fields['Status'] || 'Not Started';

      return {
        id: record.id,
        Title: fields['Main Keyword'] || fields['Title'] || 'Untitled Article',
        Writer: fields['Content Writer'] || fields['Writer'] || '',
        Editor: fields['Content Editor'] || fields['Editor'] || '',
        WordCount: fields['Word Count'] || fields['WordCount'] || 0,
        DueDate: fields['Due Date (Publication)'] || fields['Due Date'] || '',
        DocumentLink: fields['Content Link (G Doc)'] || fields['Document Link'] || '',
        ArticleURL: fields['Article URL'] || '',
        Month: fields['Month (Keyword Targets)'] || fields['Month'] || '',
        Status: articleStatus,
        Client: fields['Client'] || [],
        // Include all original fields as well
        ...fields
      };
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ articles })
    };
  } catch (error) {
    console.error('Error fetching articles:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to fetch articles',
        details: error.message
      })
    };
  }
};
