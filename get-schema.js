// Simple script to get Airtable schema using direct credentials
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
    console.log(JSON.stringify(schema, null, 2));
  } catch (err) {
    console.error('Error fetching Airtable schema:', err.message || err);
    process.exit(1);
  }
})();
