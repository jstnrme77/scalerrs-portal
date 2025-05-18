// Optimized Netlify Function to get articles from Airtable
const {
  getAirtableBase,
  executeQuery,
  getFieldValue,
  createClientFilter,
  combineFilters
} = require('./utils/airtable-connection');

// Mock data for fallback
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
    Month: 'May 2025',
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
    Month: 'May 2025',
    Status: 'Review Draft',
    Client: ['client1'],
    'Content Type': 'Article'
  }
];

exports.handler = async function(event, context) {
  // Set execution timeout to avoid Netlify's 10s limit
  const EXECUTION_TIMEOUT = 8000; // 8 seconds
  const executionStart = Date.now();

  // Create a promise that rejects after the timeout
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Function execution timed out')), EXECUTION_TIMEOUT);
  });

  // The actual function logic wrapped in a promise
  const functionPromise = (async () => {
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
    console.log('Request ID:', event.headers['x-request-id'] || 'unknown');

    // Get user information from headers
    const userId = event.headers['x-user-id'];
    const userRole = event.headers['x-user-role'];
    const userClientHeader = event.headers['x-user-client'];

    console.log('User headers received:', { userId, userRole });

    // Parse client IDs if present
    let clientIds = [];
    if (userClientHeader) {
      try {
        clientIds = JSON.parse(userClientHeader);
        if (!Array.isArray(clientIds)) {
          clientIds = [clientIds];
        }
      } catch (error) {
        console.error('Error parsing client IDs:', error.message);
        // If parsing fails, try to use it as a single string
        if (userClientHeader) {
          clientIds = [userClientHeader];
        }
      }
    }

    // Get month parameter from query string
    const month = event.queryStringParameters?.month;
    console.log('Month parameter:', month);
    console.log('Client IDs:', clientIds);

    try {
      // Get Airtable base using our utility function with connection pooling
      const base = getAirtableBase();
      console.log('Airtable base initialized successfully');

      // Build a simplified filter formula
      let filterFormula = '';

      // 1. Add month filter if provided (simplified)
      if (month) {
        filterFormula = `OR({Month (Keyword Targets)} = '${month}', {Month} = '${month}')`;
        console.log('Added month filter:', filterFormula);
      }

      // 2. Add client filter if needed (only for non-admin users)
      if (userRole !== 'admin' && clientIds && clientIds.length > 0) {
        const clientFilter = createClientFilter(clientIds);
        if (clientFilter) {
          filterFormula = filterFormula
            ? `AND(${filterFormula}, ${clientFilter})`
            : clientFilter;
          console.log('Added client filter');
        }
      }

      // 3. Add content type filter (simplified)
      const typeFilter = `OR({Content Type} = 'Article', NOT({Article Approval} = ''))`;
      filterFormula = filterFormula
        ? `AND(${filterFormula}, ${typeFilter})`
        : typeFilter;

      console.log('Final filter formula:', filterFormula);

      // Set up optimized query parameters
      const queryParams = {
        maxRecords: 50, // Reduced for better performance
        pageSize: 50,   // Maximum page size for fewer API calls
        view: 'Grid view',
        filterByFormula: filterFormula,
        // Only select the fields we need
        fields: [
          'Main Keyword',
          'Title',
          'Content Writer',
          'Writer',
          'Content Editor',
          'Editor',
          'Word Count',
          'WordCount',
          'Due Date',
          'Due Date (Publication)',
          'Content Link (G Doc)',
          'Document Link',
          'Article URL',
          'Month',
          'Month (Keyword Targets)',
          'Keyword/Content Status',
          'Status',
          'Client',
          'Content Type'
        ]
      };

      // Check if we're approaching the timeout
      const timeElapsed = Date.now() - executionStart;
      if (timeElapsed > EXECUTION_TIMEOUT * 0.7) {
        console.log(`Execution time warning: ${timeElapsed}ms elapsed, returning mock data`);
        throw new Error('Function execution time approaching limit');
      }

      // Execute the query with our optimized utility
      console.log('Executing optimized Airtable query...');
      const records = await executeQuery(base, 'Keywords', queryParams);
      console.log(`Query successful, found ${records.length} records`);

      // Map records to articles (simplified)
      const articles = records.map(record => {
        const fields = record.fields;
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
          Status: fields['Keyword/Content Status'] || fields['Status'] || 'Not Started',
          Client: fields['Client'] || [],
          ContentType: fields['Content Type'] || 'Article'
        };
      });

      console.log(`Mapped ${articles.length} articles`);

      // If no articles found, return mock data
      if (articles.length === 0) {
        console.log('No articles found, returning mock data');
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            articles: mockArticles.map(article => ({
              ...article,
              Month: month || article.Month
            })),
            isMockData: true,
            error: 'No matching articles found in Airtable'
          })
        };
      }

      // Return successful response with real data
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          articles,
          isMockData: false
        })
      };
    } catch (error) {
      console.error('Error in articles function:', error.message);

      // Return mock data with the requested month
      return {
        statusCode: 200, // Return 200 with mock data instead of error
        headers,
        body: JSON.stringify({
          articles: mockArticles.map(article => ({
            ...article,
            Month: month || article.Month
          })),
          isMockData: true,
          error: 'Failed to fetch real data: ' + error.message
        })
      };
    }
  })();

  // Race the function promise against the timeout promise
  try {
    return await Promise.race([functionPromise, timeoutPromise]);
  } catch (error) {
    console.error('Function execution failed:', error.message);

    // If we hit a timeout or other error, return mock data
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, x-user-id, x-user-role, x-user-client',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Content-Type': 'application/json'
    };

    const month = event.queryStringParameters?.month;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        articles: mockArticles.map(article => ({
          ...article,
          Month: month || article.Month
        })),
        isMockData: true,
        error: 'Function timed out or failed: ' + error.message
      })
    };
  }
};
