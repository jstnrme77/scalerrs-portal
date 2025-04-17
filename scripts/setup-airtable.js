/**
 * This script sets up the Airtable base for the Scalerrs portal
 *
 * To run this script:
 * 1. Create an Airtable account and create a Personal Access Token
 * 2. Create a new base in Airtable
 * 3. Set the AIRTABLE_API_KEY (with your Personal Access Token) and AIRTABLE_BASE_ID environment variables
 * 4. Run this script with: node scripts/setup-airtable.js
 */

const Airtable = require('airtable');

// Get Personal Access Token and base ID from environment variables
const personalAccessToken = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
const baseId = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;

if (!personalAccessToken || !baseId) {
  console.error('Error: NEXT_PUBLIC_AIRTABLE_API_KEY (with your Personal Access Token) and NEXT_PUBLIC_AIRTABLE_BASE_ID environment variables are required');
  process.exit(1);
}

// Initialize Airtable
const airtable = new Airtable({ apiKey: personalAccessToken });
const base = airtable.base(baseId);

// Table schemas
const tables = [
  {
    name: 'Users',
    fields: [
      { name: 'Name', type: 'singleLineText' },
      { name: 'Email', type: 'email' },
      { name: 'Role', type: 'singleSelect', options: ['Admin', 'Client', 'Team Member'] },
      { name: 'CreatedAt', type: 'dateTime' },
    ],
    records: [
      {
        Name: 'Admin User',
        Email: 'admin@example.com',
        Role: 'Admin',
        CreatedAt: new Date().toISOString(),
      },
      {
        Name: 'Client User',
        Email: 'client@example.com',
        Role: 'Client',
        CreatedAt: new Date().toISOString(),
      },
    ],
  },
  {
    name: 'Tasks',
    fields: [
      { name: 'Name', type: 'singleLineText' },
      { name: 'Description', type: 'multilineText' },
      { name: 'Status', type: 'singleSelect', options: ['To Do', 'In Progress', 'Completed'] },
      { name: 'AssignedTo', type: 'foreignKey', options: { table: 'Users' } },
      { name: 'CreatedAt', type: 'dateTime' },
    ],
    records: [
      {
        Name: 'Create content brief',
        Description: 'Create a content brief for the new blog post',
        Status: 'To Do',
        CreatedAt: new Date().toISOString(),
      },
      {
        Name: 'Review keyword research',
        Description: 'Review the keyword research for the new campaign',
        Status: 'In Progress',
        CreatedAt: new Date().toISOString(),
      },
      {
        Name: 'Update meta descriptions',
        Description: 'Update meta descriptions for product pages',
        Status: 'Completed',
        CreatedAt: new Date().toISOString(),
      },
    ],
  },
  {
    name: 'Comments',
    fields: [
      { name: 'Title', type: 'singleLineText' }, // Primary field
      { name: 'Task', type: 'foreignKey', options: { table: 'Tasks' } },
      { name: 'User', type: 'foreignKey', options: { table: 'Users' } },
      { name: 'Comment', type: 'multilineText' },
      // Note: CreatedAt should be set up as a 'Created time' field type in Airtable
      // This is a special field that Airtable sets automatically
    ],
    records: [],
  },
];

// Create tables and records
async function setupAirtable() {
  try {
    console.log('Setting up Airtable base...');

    // Create tables
    for (const table of tables) {
      console.log(`Creating table: ${table.name}`);

      // Check if table exists
      const existingTables = await base.tables();
      const tableExists = existingTables.some(t => t.name === table.name);

      if (tableExists) {
        console.log(`Table ${table.name} already exists, skipping creation`);
      } else {
        // Create table
        // Note: Airtable API doesn't support creating tables programmatically
        console.log(`Please create the ${table.name} table manually in Airtable`);
      }

      // Create records
      if (table.records.length > 0) {
        console.log(`Creating records for table: ${table.name}`);

        await base(table.name).create(table.records);
      }
    }

    console.log('Airtable setup complete!');
  } catch (error) {
    console.error('Error setting up Airtable:', error);
    process.exit(1);
  }
}

setupAirtable();
