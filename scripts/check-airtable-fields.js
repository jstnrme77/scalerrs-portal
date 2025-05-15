// Script to check Airtable field names
require('dotenv').config({ path: '.env.local' });
const Airtable = require('airtable');

// Get API key and base ID from environment variables
const apiKey = process.env.AIRTABLE_API_KEY || process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;

if (!apiKey || !baseId) {
  console.error('Error: Airtable API key or Base ID not found in environment variables');
  process.exit(1);
}

console.log('Using Airtable API Key:', apiKey.substring(0, 10) + '...');
console.log('Using Airtable Base ID:', baseId);

// Initialize Airtable
const airtable = new Airtable({ apiKey });
const base = airtable.base(baseId);

// Tables to check - add all possible table names we might be using
const tables = [
  'Keywords',
  'Backlinks',
  'Tasks',
  'Comments',
  'URL Performance',
  'KPI Metrics',
  'Monthly Projections',
  'Clusters',
  'Integrations',
  'Notifications',
  'Reports',
  'Activity Log',
  'Clients',
  'Users'
];

async function checkTables() {
  console.log('Checking Airtable tables and fields...');

  try {
    // We can't easily list all tables, so we'll just try each one
    console.log('\n=== Checking Tables ===');

    // Then check each specified table
    for (const tableName of tables) {
      console.log(`\n=== Checking fields for table: ${tableName} ===`);

      try {
        // Try to get a single record to see the field structure
        const records = await base(tableName).select({ maxRecords: 1 }).firstPage();

        if (records.length > 0) {
          const record = records[0];
          console.log('Fields available:');
          const fields = Object.keys(record.fields);
          fields.sort().forEach(field => {
            console.log(`- "${field}"`);
          });

          // Show a sample of the data
          console.log('\nSample record:');
          console.log(JSON.stringify(record.fields, null, 2));
        } else {
          console.log(`No records found in table ${tableName}`);
        }
      } catch (error) {
        console.error(`Error checking table ${tableName}:`, error.message);
      }
    }
  } catch (error) {
    console.error('Error listing tables:', error.message);
  }
}

checkTables().catch(error => {
  console.error('Script failed:', error);
});
