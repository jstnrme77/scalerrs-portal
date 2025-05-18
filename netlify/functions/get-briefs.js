// Netlify Function to get briefs from Airtable
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

  console.log('Get Briefs function called');

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
      console.log('Filtering briefs by month:', month);
      filterParts.push(`{Month (Keyword Targets)} = '${month}'`);
    }

    // Add client filter if user is not an admin and has assigned clients
    if (userRole !== 'admin' && clientIds && clientIds.length > 0) {
      const clientFilters = clientIds.map(clientId =>
        `FIND("${clientId}", {Client})`
      );
      filterParts.push(`OR(${clientFilters.join(',')})`);
    }

    // Add brief type filter - only get records that are briefs
    // We need to filter for records that have "Brief" in their content type
    // Use a more flexible approach to handle potential missing Content Type field
    try {
      // First check if the Content Type field exists
      const testRecord = await base('Keywords').select({ maxRecords: 1 }).firstPage();
      if (testRecord && testRecord.length > 0) {
        const fields = Object.keys(testRecord[0].fields);
        if (fields.includes('Content Type')) {
          filterParts.push(`{Content Type} = 'Brief'`);
          console.log('Added Content Type filter for briefs');
        } else {
          console.log('Content Type field not found, skipping filter');
          // Try to use other fields to identify briefs
          filterParts.push(`OR(
            NOT({Brief Approval} = ''),
            NOT({Content Brief Link (G Doc)} = '')
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

    // Query the Keywords table (which contains briefs)
    const records = await base('Keywords').select(queryParams).all();
    console.log(`Found ${records.length} briefs`);

    // Map records to match the expected brief structure
    const briefs = records.map(record => {
      const fields = record.fields;

      // Determine the brief status
      let briefStatus = fields['Keyword/Content Status'] || fields['Status'] || 'Not Started';

      return {
        id: record.id,
        Title: fields['Main Keyword'] || fields['Title'] || 'Untitled Brief',
        SEOStrategist: fields['SEO Strategist'] || fields['SEO Specialist'] || '',
        DueDate: fields['Due Date (Publication)'] || fields['Due Date'] || '',
        DocumentLink: fields['Content Brief Link (G Doc)'] || fields['Document Link'] || '',
        Month: fields['Month (Keyword Targets)'] || fields['Month'] || '',
        Status: briefStatus,
        Client: fields['Client'] || [],
        ContentWriter: fields['Content Writer'] || fields['Writer'] || '',
        ContentEditor: fields['Content Editor'] || fields['Editor'] || '',
        // Include all original fields as well
        ...fields
      };
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ briefs })
    };
  } catch (error) {
    console.error('Error fetching briefs:', error);

    // Return mock data as fallback
    const mockBriefs = [
      {
        id: 'mock-brief-1',
        Title: 'The Future of Remote Work',
        SEOStrategist: 'John Smith',
        DueDate: '2025-05-10',
        DocumentLink: 'https://docs.google.com/document/d/1',
        Month: month || 'May 2025',
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
        Month: month || 'May 2025',
        Status: 'Needs Input',
        ContentWriter: 'Sarah Williams',
        ContentEditor: 'John Smith',
        Client: ['client1'],
        'Content Type': 'Brief'
      }
    ];

    // Log that we're returning mock data
    console.log('Returning mock briefs data due to error');

    return {
      statusCode: 200, // Return 200 with mock data instead of 500
      headers,
      body: JSON.stringify({
        briefs: mockBriefs,
        isMockData: true,
        error: 'Failed to fetch real data: ' + error.message
      })
    };
  }
};
