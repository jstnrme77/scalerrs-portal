// Netlify Function to get articles from Airtable
const { getAirtableBase } = require('./utils/airtable');
const { TABLES, FIELD_MAPPINGS } = require('./utils/constants');
const { getFieldValue, createClientFilter, combineFilters } = require('./utils/airtable-utils');

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

  // Get user information from headers
  const userId = event.headers['x-user-id'];
  const userRole = event.headers['x-user-role'];
  const userClientHeader = event.headers['x-user-client'];

  console.log('User headers received:');
  console.log('x-user-id:', userId);
  console.log('x-user-role:', userRole);
  console.log('x-user-client:', userClientHeader);

  // Parse client IDs if present
  let clientIds = [];
  if (userClientHeader) {
    try {
      clientIds = JSON.parse(userClientHeader);
      if (!Array.isArray(clientIds)) {
        clientIds = [clientIds];
      }
    } catch (error) {
      console.error('Error parsing client IDs:', error);
      // If parsing fails, try to use it as a single string
      if (userClientHeader) {
        clientIds = [userClientHeader];
      }
    }
  }

  console.log('Parsed client IDs:', clientIds);

  // Get month parameter from query string
  const month = event.queryStringParameters?.month;
  console.log('Month parameter:', month);

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
    // Get Airtable base using our utility function with connection pooling
    const base = getAirtableBase();
    console.log('Airtable base initialized successfully');

    // Try to get a sample record to check field names
    console.log('Fetching a sample record to check field names...');
    try {
      const sampleRecords = await base('Keywords').select({ maxRecords: 1 }).firstPage();
      if (sampleRecords && sampleRecords.length > 0) {
        console.log('Sample record fields:', Object.keys(sampleRecords[0].fields).join(', '));

        // Check for month field variations
        const hasMonthKeywordTargets = sampleRecords[0].fields.hasOwnProperty('Month (Keyword Targets)');
        const hasMonth = sampleRecords[0].fields.hasOwnProperty('Month');

        console.log('Has Month (Keyword Targets) field:', hasMonthKeywordTargets);
        console.log('Has Month field:', hasMonth);
      } else {
        console.log('No sample records found to check field names');
      }
    } catch (sampleError) {
      console.error('Error fetching sample record:', sampleError);
    }

    // Build filter formula with multiple conditions
    const filterParts = [];

    // Add month filter if provided
    if (month) {
      // Try different variations of the month field and format
      const monthParts = month.split(' ');
      const monthName = monthParts[0]; // e.g., "May" from "May 2025"
      const year = monthParts.length > 1 ? monthParts[1] : ''; // e.g., "2025" from "May 2025"

      const monthFilterParts = [];

      // Try exact match on different field names
      monthFilterParts.push(`{Month (Keyword Targets)} = '${month}'`);
      monthFilterParts.push(`{Month} = '${month}'`);

      // Try partial match (just month name)
      if (monthName) {
        monthFilterParts.push(`FIND('${monthName}', {Month (Keyword Targets)})`);
        monthFilterParts.push(`FIND('${monthName}', {Month})`);
      }

      // Try matching just the year in case format is different
      if (year) {
        monthFilterParts.push(`FIND('${year}', {Month (Keyword Targets)})`);
        monthFilterParts.push(`FIND('${year}', {Month})`);
      }

      filterParts.push(`OR(${monthFilterParts.join(',')})`);
      console.log('Added month filter');
    } else {
      console.log('No month filter provided');
    }

    // Add client filter if user is not an admin and has assigned clients
    if (userRole !== 'admin' && clientIds && clientIds.length > 0) {
      const clientFilter = createClientFilter(clientIds);
      if (clientFilter) {
        filterParts.push(clientFilter);
        console.log('Added client filter for clients:', clientIds);
      }
    } else {
      console.log('No client filter applied - user is admin or no client IDs provided');
    }

    // Add content type filter for articles
    filterParts.push(`OR({Content Type} = 'Article', NOT({Article Approval} = ''), NOT({Content Link (G Doc)} = ''))`);
    console.log('Added content type filter for articles');

    // Combine all filter parts
    const filterFormula = combineFilters(filterParts);
    console.log('Final filter formula:', filterFormula);

    // Set up query parameters - limit to 100 records for performance
    const queryParams = {
      maxRecords: 100,
      view: 'Grid view'
    };

    if (filterFormula) {
      queryParams.filterByFormula = filterFormula;
    }

    console.log('Query params:', JSON.stringify(queryParams));

    // Query the Keywords table with a simpler approach
    console.log('Executing Airtable query...');
    let records = [];
    try {
      records = await base('Keywords').select(queryParams).firstPage();
      console.log(`Found ${records.length} records with filter`);
    } catch (queryError) {
      console.error('Error with filtered query:', queryError);
      console.log('Trying without filter as fallback...');
      // If the filter query fails, try without filter
      records = await base('Keywords').select({ maxRecords: 20 }).firstPage();
      console.log(`Found ${records.length} records without filter`);
    }

    // Log details about the records found
    if (records.length > 0) {
      console.log('First record fields:', Object.keys(records[0].fields).join(', '));
      console.log('Sample record:', JSON.stringify({
        id: records[0].id,
        title: records[0].fields['Main Keyword'] || records[0].fields['Title'] || 'N/A',
        month: records[0].fields['Month (Keyword Targets)'] || records[0].fields['Month'] || 'N/A',
        contentType: records[0].fields['Content Type'] || 'N/A'
      }));
    } else {
      console.log('No records found in Airtable');
    }

    // Map records to articles using our utility functions
    const articles = records.map(record => {
      const fields = record.fields;

      // Use getFieldValue utility for consistent field access
      return {
        id: record.id,
        Title: getFieldValue(fields, FIELD_MAPPINGS.TITLE, 'Untitled Article'),
        Writer: getFieldValue(fields, FIELD_MAPPINGS.ARTICLE_WRITER, ''),
        Editor: getFieldValue(fields, FIELD_MAPPINGS.ARTICLE_EDITOR, ''),
        WordCount: getFieldValue(fields, FIELD_MAPPINGS.ARTICLE_WORD_COUNT, 0),
        DueDate: getFieldValue(fields, FIELD_MAPPINGS.BRIEF_DUE_DATE, ''),
        DocumentLink: getFieldValue(fields, FIELD_MAPPINGS.ARTICLE_DOCUMENT_LINK, ''),
        ArticleURL: getFieldValue(fields, FIELD_MAPPINGS.ARTICLE_URL, ''),
        Month: getFieldValue(fields, FIELD_MAPPINGS.MONTH, ''),
        Status: getFieldValue(fields, FIELD_MAPPINGS.STATUS, 'Not Started'),
        Client: getFieldValue(fields, FIELD_MAPPINGS.CLIENT, []),
        ContentType: getFieldValue(fields, FIELD_MAPPINGS.CONTENT_TYPE, 'Article')
      };
    });

    console.log(`Filtered to ${articles.length} articles`);

    // If no articles found, return mock data but indicate it's mock data
    if (articles.length === 0) {
      console.log('No articles found in Airtable, returning mock data');
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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        articles,
        isMockData: false
      })
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
