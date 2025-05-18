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
    // Use a more flexible approach to handle potential missing Content Type field
    try {
      // First check if the Content Type field exists
      const testRecord = await base('Keywords').select({ maxRecords: 1 }).firstPage();
      if (testRecord && testRecord.length > 0) {
        const fields = Object.keys(testRecord[0].fields);
        if (fields.includes('Content Type')) {
          filterParts.push(`{Content Type} = 'Article'`);
          console.log('Added Content Type filter for articles');
        } else {
          console.log('Content Type field not found, skipping filter');
          // Try to use other fields to identify articles
          filterParts.push(`OR(
            NOT({Article Approval} = ''),
            NOT({Content Link (G Doc)} = '')
          )`);
        }
      }
    } catch (error) {
      console.error('Error checking Content Type field:', error);
      // Skip the Content Type filter if there's an error
    }

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

    // Return mock data as fallback
    const mockArticles = [
      {
        id: 'mock-article-1',
        Title: 'The Future of Remote Work',
        Writer: 'Alex Johnson',
        Editor: 'Jane Doe',
        WordCount: 1500,
        DueDate: '2025-05-20',
        DocumentLink: 'https://docs.google.com/document/d/3',
        ArticleURL: 'https://example.com/remote-work',
        Month: month || 'May 2025',
        Status: 'In Production',
        Client: ['client1'],
        'Content Type': 'Article'
      },
      {
        id: 'mock-article-2',
        Title: 'SEO Best Practices',
        Writer: 'Sarah Williams',
        Editor: 'John Smith',
        WordCount: 1200,
        DueDate: '2025-05-25',
        DocumentLink: 'https://docs.google.com/document/d/4',
        ArticleURL: '',
        Month: month || 'May 2025',
        Status: 'Review Draft',
        Client: ['client1'],
        'Content Type': 'Article'
      }
    ];

    // Log that we're returning mock data
    console.log('Returning mock articles data due to error');

    return {
      statusCode: 200, // Return 200 with mock data instead of 500
      headers,
      body: JSON.stringify({
        articles: mockArticles,
        isMockData: true,
        error: 'Failed to fetch real data: ' + error.message
      })
    };
  }
};
