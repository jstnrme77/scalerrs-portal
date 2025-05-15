// Netlify Function to get briefs from Airtable
const Airtable = require('airtable');

exports.handler = async function(event, context) {
  console.log('Get Briefs function called');

  // Initialize Airtable with API key from environment variables
  // Try both naming conventions for environment variables
  const apiKey = process.env.AIRTABLE_API_KEY || process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    console.error('Missing Airtable credentials');
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Missing Airtable credentials'
      })
    };
  }

  try {
    // Initialize Airtable
    const airtable = new Airtable({ apiKey });
    const base = airtable.base(baseId);

    // Get month parameter from query string
    const month = event.queryStringParameters?.month;
    console.log('Month parameter:', month);

    // Build query
    let query;
    if (month) {
      console.log('Filtering briefs by month:', month);

      // Extract just the month name
      const monthOnly = month.split(' ')[0];

      // Use the correct field name
      const monthFilters = [
        `{Month (Keyword Targets)} = '${month}'`
      ];

      // If we extracted a month name, also check for that
      if (monthOnly && monthOnly !== month) {
        monthFilters.push(`{Month (Keyword Targets)} = '${monthOnly}'`);
      }

      // Create the filter formula
      const filterFormula = `OR(${monthFilters.join(',')})`;
      console.log('Month filter formula:', filterFormula);

      query = base('Briefs').select({
        filterByFormula: filterFormula
      });
    } else {
      // No month filter, fetch all records
      query = base('Briefs').select();
    }

    // Get briefs
    const records = await query.all();
    console.log(`Found ${records.length} briefs`);

    // Map records to match your Airtable schema
    const briefs = records.map(record => ({
      id: record.id,
      ...record.fields
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ briefs })
    };
  } catch (error) {
    console.error('Error fetching briefs:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to fetch briefs',
        details: error.message
      })
    };
  }
};
