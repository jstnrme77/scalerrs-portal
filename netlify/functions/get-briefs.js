// Netlify Function to get briefs from Airtable
const { getAirtableBase } = require('./utils/airtable');
const { TABLES, FIELD_MAPPINGS } = require('./utils/constants');
const { getFieldValue, createClientFilter, combineFilters } = require('./utils/airtable-utils');

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
    // Get Airtable base using our utility function with connection pooling
    const base = getAirtableBase();
    console.log('Airtable base initialized successfully');

    // Try to list available tables to verify connection
    try {
      console.log('Attempting to list tables in Airtable base...');
      // This is a workaround to list tables
      await base('__nonexistent__').select().firstPage();
    } catch (tableError) {
      // Extract table names from error message
      const errorMsg = tableError.message || '';
      const tableMatch = errorMsg.match(/Did you mean one of these\? (.*)/);
      if (tableMatch && tableMatch[1]) {
        console.log('Available tables:', tableMatch[1]);
      } else {
        console.log('Could not determine available tables:', errorMsg);
      }
    }

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

    // Add content type filter for briefs
    filterParts.push(`OR({Content Type} = 'Brief', NOT({Brief Approval} = ''), NOT({Content Brief Link (G Doc)} = ''))`);
    console.log('Added content type filter for briefs');

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

    // Map records to briefs using our utility functions
    const briefs = records.map(record => {
      const fields = record.fields;

      // Use getFieldValue utility for consistent field access
      return {
        id: record.id,
        Title: getFieldValue(fields, FIELD_MAPPINGS.TITLE, 'Untitled Brief'),
        SEOStrategist: getFieldValue(fields, FIELD_MAPPINGS.BRIEF_STRATEGIST, ''),
        DueDate: getFieldValue(fields, FIELD_MAPPINGS.BRIEF_DUE_DATE, ''),
        DocumentLink: getFieldValue(fields, FIELD_MAPPINGS.BRIEF_DOCUMENT_LINK, ''),
        Month: getFieldValue(fields, FIELD_MAPPINGS.MONTH, ''),
        Status: getFieldValue(fields, FIELD_MAPPINGS.STATUS, 'Not Started'),
        Client: getFieldValue(fields, FIELD_MAPPINGS.CLIENT, []),
        ContentWriter: getFieldValue(fields, FIELD_MAPPINGS.ARTICLE_WRITER, ''),
        ContentEditor: getFieldValue(fields, FIELD_MAPPINGS.ARTICLE_EDITOR, ''),
        ContentType: getFieldValue(fields, FIELD_MAPPINGS.CONTENT_TYPE, 'Brief')
      };
    });

    console.log(`Filtered to ${briefs.length} briefs`);

    // If no briefs found, return mock data but indicate it's mock data
    if (briefs.length === 0) {
      console.log('No briefs found in Airtable, returning mock data');
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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        briefs,
        isMockData: false
      })
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
