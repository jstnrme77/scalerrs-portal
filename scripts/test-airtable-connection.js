// Test script to verify Airtable connection
require('dotenv').config();
const Airtable = require('airtable');

// Get API key and base ID from environment variables
const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;

console.log('Testing Airtable connection...');
console.log('API Key exists:', !!apiKey);
console.log('Base ID exists:', !!baseId);

if (!apiKey || !baseId) {
  console.error('Error: AIRTABLE_API_KEY and AIRTABLE_BASE_ID environment variables are required');
  process.exit(1);
}

// Initialize Airtable
const airtable = new Airtable({ apiKey });
const base = airtable.base(baseId);

// List all tables in the base
async function listTables() {
  try {
    console.log('Attempting to connect to Airtable...');
    
    // Try to access the Users table
    const usersTable = base('Users');
    const records = await usersTable.select({ maxRecords: 1 }).firstPage();
    
    console.log('Connection successful!');
    console.log(`Found ${records.length} records in the Users table`);
    
    if (records.length > 0) {
      console.log('Sample record:', JSON.stringify(records[0].fields, null, 2));
    }
    
    // Try to list all tables by querying the base metadata
    console.log('\nAttempting to list all tables in the base...');
    // Note: This is a workaround as Airtable API doesn't directly support listing tables
    // We'll try to access common table names and see which ones exist
    
    const commonTables = [
      'Users', 'Tasks', 'Comments', 'Briefs', 'Articles', 'Backlinks',
      'KPI Metrics', 'URL Performance', 'Keyword Performance'
    ];
    
    for (const tableName of commonTables) {
      try {
        const table = base(tableName);
        const tableRecords = await table.select({ maxRecords: 1 }).firstPage();
        console.log(`✅ Table '${tableName}' exists with ${tableRecords.length} records`);
      } catch (error) {
        console.log(`❌ Table '${tableName}' does not exist or is not accessible`);
      }
    }
    
  } catch (error) {
    console.error('Error connecting to Airtable:', error);
    process.exit(1);
  }
}

listTables();
