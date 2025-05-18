// Netlify function to get available months from Airtable
const { getAirtableBase } = require('./utils/airtable');

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
    'Cache-Control': 'max-age=3600' // Allow caching for 1 hour
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
    console.log('Netlify function: get-available-months called');

    // Initialize Airtable
    const base = getAirtableBase();

    // Get unique months from the Keywords table
    console.log('Fetching available months from Keywords table...');
    const records = await base('Keywords')
      .select({
        fields: ['Month (Keyword Targets)'],
        sort: [{ field: 'Month (Keyword Targets)', direction: 'desc' }]
      })
      .all();

    // Extract unique months
    const months = new Set();
    records.forEach(record => {
      const month = record.fields['Month (Keyword Targets)'];
      if (month) {
        months.add(month);
      }
    });

    // Convert to array and sort
    const monthsArray = Array.from(months);
    console.log(`Found ${monthsArray.length} available months`);

    // If no months found, return hardcoded fallback
    if (monthsArray.length === 0) {
      console.log('No months found in Airtable, using fallback months');
      const fallbackMonths = [
        'May 2024',
        'June 2024',
        'July 2024',
        'August 2024',
        'September 2024',
        'October 2024',
        'November 2024',
        'December 2024',
        'January 2025',
        'February 2025',
        'March 2025',
        'April 2025'
      ];
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ months: fallbackMonths })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ months: monthsArray })
    };
  } catch (error) {
    console.error('Error fetching available months:', error);
    
    // Return fallback months on error
    const fallbackMonths = [
      'May 2024',
      'June 2024',
      'July 2024',
      'August 2024',
      'September 2024',
      'October 2024',
      'November 2024',
      'December 2024',
      'January 2025',
      'February 2025',
      'March 2025',
      'April 2025'
    ];
    
    return {
      statusCode: 200, // Still return 200 with fallback data
      headers,
      body: JSON.stringify({
        months: fallbackMonths,
        error: 'Failed to fetch months from Airtable',
        details: error.message
      })
    };
  }
};
