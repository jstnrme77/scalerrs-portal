// Simple script to get just table names from Airtable
const fetch = require('node-fetch');

const apiKey = 'patDzIkqPGxe1t5jl.fe3e6fa1c25d7438e70de845827f7dcfa8ffb3d14baf0e17bff380bca8459175';
const baseId = 'appUtQLunL1f05FrQ';

(async () => {
  try {
    const response = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const schema = await response.json();
    
    // Extract just the table names and their primary fields
    const tableInfo = schema.tables.map(table => ({
      id: table.id,
      name: table.name,
      primaryField: table.fields.find(field => field.id === table.primaryFieldId)?.name || 'Unknown'
    }));
    
    console.log(JSON.stringify(tableInfo, null, 2));
  } catch (err) {
    console.error('Error fetching Airtable schema:', err.message || err);
    process.exit(1);
  }
})();
