import { NextResponse } from 'next/server';
import Airtable from 'airtable';
import { TABLES } from '@/lib/airtable';

// Configure for Netlify deployment
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Sample users to add to the Airtable base
const sampleUsers = [
  {
    Name: 'Admin User',
    Email: 'admin@example.com',
    Password: 'password123',
    Role: 'Admin',
    Client: '', // Admin can access all clients
    Status: 'Active'
  },
  {
    Name: 'Client User',
    Email: 'client@example.com',
    Password: 'password123',
    Role: 'Client',
    Client: '', // Will be updated with actual client IDs later
    Status: 'Active'
  },
  {
    Name: 'SEO Specialist',
    Email: 'seo@example.com',
    Password: 'password123',
    Role: 'SEO Specialist',
    Client: '', // Can work on any client
    Status: 'Active'
  },
  {
    Name: 'Content Writer',
    Email: 'writer@example.com',
    Password: 'password123',
    Role: 'Content Writer',
    Client: '', // Can work on any client
    Status: 'Active'
  }
];

export async function GET() {
  // Get Airtable credentials from environment variables
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    return NextResponse.json({
      success: false,
      error: 'Missing Airtable credentials',
      apiKeyExists: !!apiKey,
      baseIdExists: !!baseId
    });
  }

  try {
    // Initialize Airtable
    Airtable.configure({ apiKey });
    const base = Airtable.base(baseId);

    // Check if Users table exists
    try {
      console.log('Checking Users table...');
      const checkRecord = await base(TABLES.USERS).select({ maxRecords: 1 }).firstPage();
      console.log(`Found ${checkRecord.length} records in Users table`);
    } catch (error: any) {
      console.error('Error checking Users table:', error.message);
      return NextResponse.json({
        success: false,
        error: `Error accessing Users table: ${error.message}`
      });
    }

    // Add sample users to Airtable
    const createdUsers = [];
    const errors = [];

    for (const user of sampleUsers) {
      try {
        // Check if user with this email already exists
        const existingRecords = await base(TABLES.USERS)
          .select({
            filterByFormula: `{Email} = '${user.Email}'`,
            maxRecords: 1
          })
          .firstPage();

        if (existingRecords.length > 0) {
          console.log(`User with email ${user.Email} already exists. Skipping.`);
          createdUsers.push({
            id: existingRecords[0].id,
            ...existingRecords[0].fields,
            status: 'already_exists'
          });
          continue;
        }

        // Create the user
        const createdRecord = await base(TABLES.USERS).create(user);

        createdUsers.push({
          id: createdRecord.id,
          ...createdRecord.fields,
          status: 'created'
        });

        console.log(`Created user: ${user.Name} (${user.Email})`);
      } catch (error: any) {
        console.error(`Error creating user ${user.Email}:`, error.message);
        errors.push({
          user: user.Email,
          error: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Added ${createdUsers.length} sample users to Airtable`,
      users: createdUsers,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error: any) {
    console.error('Error adding sample users:', error);

    return NextResponse.json({
      success: false,
      error: `Error adding sample users: ${error.message}`
    });
  }
}
