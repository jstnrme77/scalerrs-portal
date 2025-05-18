// Optimized Netlify Function to get briefs from Airtable
const {
  getAirtableBase,
  executeQuery,
  getFieldValue,
  createClientFilter,
  combineFilters
} = require('./utils/airtable-connection');

// Mock data for fallback
const mockBriefs = [
  {
    id: 'mock-brief-1',
    Title: 'The Future of Remote Work',
    SEOStrategist: 'John Smith',
    DueDate: '2025-05-10',
    DocumentLink: 'https://docs.google.com/document/d/1',
    Month: 'May 2025',
    Status: 'In Progress',
    ContentWriter: 'Alex Johnson',
    ContentEditor: 'Jane Doe',
    Client: ['client1'],
    'Content Type': 'Brief'
  },
  {
    id: 'mock-brief-2',
    Title: 'SEO Best Practices',
    SEOStrategist: 'Jane Doe',
    DueDate: '2025-05-14',
    DocumentLink: 'https://docs.google.com/document/d/2',
    Month: 'May 2025',
    Status: 'Needs Input',
    ContentWriter: 'Sarah Williams',
    ContentEditor: 'John Smith',
    Client: ['client1'],
    'Content Type': 'Brief'
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

    console.log('Get Briefs function called');
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
      const typeFilter = `OR({Content Type} = 'Brief', NOT({Brief Approval} = ''))`;
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
          'SEO Strategist',
          'SEO Specialist',
          'Due Date',
          'Due Date (Publication)',
          'Content Brief Link (G Doc)',
          'Document Link',
          'Month',
          'Month (Keyword Targets)',
          'Keyword/Content Status',
          'Status',
          'Client',
          'Content Writer',
          'Writer',
          'Content Editor',
          'Editor',
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

      // Map records to briefs (simplified)
      const briefs = records.map(record => {
        const fields = record.fields;
        return {
          id: record.id,
          Title: fields['Main Keyword'] || fields['Title'] || 'Untitled Brief',
          SEOStrategist: fields['SEO Strategist'] || fields['SEO Specialist'] || '',
          DueDate: fields['Due Date (Publication)'] || fields['Due Date'] || '',
          DocumentLink: fields['Content Brief Link (G Doc)'] || fields['Document Link'] || '',
          Month: fields['Month (Keyword Targets)'] || fields['Month'] || '',
          Status: fields['Keyword/Content Status'] || fields['Status'] || 'Not Started',
          Client: fields['Client'] || [],
          ContentWriter: fields['Content Writer'] || fields['Writer'] || '',
          ContentEditor: fields['Content Editor'] || fields['Editor'] || '',
          ContentType: fields['Content Type'] || 'Brief'
        };
      });

      console.log(`Mapped ${briefs.length} briefs`);

      // If no briefs found, return mock data
      if (briefs.length === 0) {
        console.log('No briefs found, returning mock data');
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            briefs: mockBriefs.map(brief => ({
              ...brief,
              Month: month || brief.Month
            })),
            isMockData: true,
            error: 'No matching briefs found in Airtable'
          })
        };
      }

      // Return successful response with real data
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          briefs,
          isMockData: false
        })
      };
    } catch (error) {
      console.error('Error in briefs function:', error.message);

      // Return mock data with the requested month
      return {
        statusCode: 200, // Return 200 with mock data instead of error
        headers,
        body: JSON.stringify({
          briefs: mockBriefs.map(brief => ({
            ...brief,
            Month: month || brief.Month
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
        briefs: mockBriefs.map(brief => ({
          ...brief,
          Month: month || brief.Month
        })),
        isMockData: true,
        error: 'Function timed out or failed: ' + error.message
      })
    };
  }
};
