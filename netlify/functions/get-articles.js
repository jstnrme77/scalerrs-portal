// Netlify Function to get articles from Airtable
const Airtable = require('airtable');

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
        articles: mockArticles.map(article => ({
          ...article,
          Month: month || article.Month
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

    // Filter for articles on the client side
    const articles = records
      .filter(record => {
        const fields = record.fields;
        // Consider it an article if it has Content Type = Article OR has an article-related field
        return (
          fields['Content Type'] === 'Article' ||
          fields['Article Approval'] ||
          fields['Content Link (G Doc)']
        );
      })
      .map(record => {
        const fields = record.fields;

        // Simplified mapping
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
          Client: fields['Client'] || []
        };
      });

    console.log(`Filtered to ${articles.length} articles`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ articles })
    };
  } catch (error) {
    console.error('Error fetching articles:', error);

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
};
