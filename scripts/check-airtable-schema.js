// Script to check Airtable schema
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

async function checkSchema() {
  try {
    // Try to get the list of tables
    console.log('\nAttempting to list tables in the base...');
    
    // This is a workaround to list tables - we try to access a non-existent table
    // which will fail, but the error message will contain the list of valid tables
    try {
      await base('__nonexistent_table__').select().firstPage();
    } catch (error) {
      if (error.message && error.message.includes('Table "__nonexistent_table__" not found. Available tables:')) {
        const availableTables = error.message
          .split('Available tables:')[1]
          .trim()
          .split(',')
          .map(t => t.trim());

        console.log('\nAvailable tables in this base:');
        availableTables.forEach(table => console.log(`- ${table}`));
        
        // Now check the schema of each table
        console.log('\nFetching schema for each table...');
        
        for (const tableName of availableTables) {
          try {
            console.log(`\n=== Table: ${tableName} ===`);
            
            // Get one record to see the fields
            const records = await base(tableName).select({ maxRecords: 1 }).firstPage();
            
            if (records.length > 0) {
              const fields = Object.keys(records[0].fields);
              console.log('Fields:');
              fields.forEach(field => console.log(`- ${field}`));
            } else {
              console.log('No records found in this table');
            }
          } catch (tableError) {
            console.error(`Error fetching schema for table ${tableName}:`, tableError.message);
          }
        }
      } else {
        console.error('Error listing tables:', error.message);
      }
    }
  } catch (error) {
    console.error('Error checking schema:', error.message);
  }
}

// Run the function
checkSchema();
