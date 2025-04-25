// Netlify Function to get backlinks from Airtable
const Airtable = require('airtable');

exports.handler = async function(event, context) {
  console.log('Get Backlinks function called');

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

    // Get all backlinks
    const records = await base('Backlinks').select().all();
    console.log(`Found ${records.length} backlinks`);

    // Map records to match your Airtable schema
    const backlinks = records.map(record => ({
      id: record.id,
      ...record.fields
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ backlinks })
    };
  } catch (error) {
    console.error('Error fetching backlinks:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to fetch backlinks',
        details: error.message
      })
    };
  }
};
