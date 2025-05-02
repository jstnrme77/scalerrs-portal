require('dotenv').config();

(async () => {
  const apiKey = process.env.AIRTABLE_API_KEY || process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    console.error('Error: Missing Airtable credentials. Please check your .env.local');
    process.exit(1);
  }

  try {
    const response = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const schema = await response.json();
    console.log(JSON.stringify(schema, null, 2));
  } catch (err) {
    console.error('Error fetching Airtable schema:', err.message || err);
    process.exit(1);
  }
})();
