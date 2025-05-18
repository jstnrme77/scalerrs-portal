// Netlify Function to get briefs from Airtable
const Airtable = require('airtable');

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

  // Get month parameter from query string
  const month = event.queryStringParameters?.month;
  console.log('Month parameter:', month);

  // Initialize Airtable with API key from environment variables
  const apiKey = process.env.AIRTABLE_API_KEY || process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    console.error('Missing Airtable credentials');
    // Return mock data instead of error
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        briefs: mockBriefs.map(brief => ({
          ...brief,
          Month: month || brief.Month
        })),
        isMockData: true,
        error: 'Missing Airtable credentials'
      })
    };
  }

  try {
    // Initialize Airtable with a timeout
    const airtable = new Airtable({
      apiKey,
      requestTimeout: 30000 // 30 second timeout
    });
    const base = airtable.base(baseId);

    // Simplified query - just filter by month if provided
    let filterFormula = '';
    if (month) {
      filterFormula = `{Month (Keyword Targets)} = '${month}'`;
    }

    // Set up query parameters - limit to 100 records for performance
    const queryParams = {
      maxRecords: 100,
      view: 'Grid view'
    };

    if (filterFormula) {
      queryParams.filterByFormula = filterFormula;
    }

    console.log('Query params:', queryParams);

    // Query the Keywords table with a simpler approach
    const records = await base('Keywords').select(queryParams).firstPage();
    console.log(`Found ${records.length} records`);

    // Filter for briefs on the client side
    const briefs = records
      .filter(record => {
        const fields = record.fields;
        // Consider it a brief if it has Content Type = Brief OR has a brief-related field
        return (
          fields['Content Type'] === 'Brief' ||
          fields['Brief Approval'] ||
          fields['Content Brief Link (G Doc)']
        );
      })
      .map(record => {
        const fields = record.fields;

        // Simplified mapping
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
          ContentEditor: fields['Content Editor'] || fields['Editor'] || ''
        };
      });

    console.log(`Filtered to ${briefs.length} briefs`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ briefs })
    };
  } catch (error) {
    console.error('Error fetching briefs:', error);

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
};
