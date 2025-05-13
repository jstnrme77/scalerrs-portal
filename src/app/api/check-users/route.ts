import { NextResponse } from 'next/server';
import Airtable from 'airtable';
import { TABLES } from '@/lib/airtable';

// Configure for Netlify deployment
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

  console.log('Using Airtable API Key:', apiKey.substring(0, 10) + '...');
  console.log('Using Airtable Base ID:', baseId);

  try {
    // Initialize Airtable
    Airtable.configure({ apiKey });
    const base = Airtable.base(baseId);

    // Check if Users table exists
    try {
      console.log('Checking table:', TABLES.USERS);
      const checkRecord = await base(TABLES.USERS).select({ maxRecords: 1 }).firstPage();
      console.log(`Found ${checkRecord.length} records in Users table`);
      
      if (checkRecord.length > 0) {
        // Get all records from Users table
        const records = await base(TABLES.USERS).select().all();
        console.log(`Successfully fetched ${records.length} users from Airtable`);
        
        // Map records to our expected format
        const users = records.map(record => ({
          id: record.id,
          ...record.fields
        }));
        
        return NextResponse.json({
          success: true,
          users
        });
      } else {
        return NextResponse.json({
          success: true,
          message: 'Users table exists but is empty',
          users: []
        });
      }
    } catch (error: any) {
      console.error('Error checking Users table:', error.message);
      
      // Try to list all tables to see what's available
      try {
        // This is a workaround to list tables - we try to access a non-existent table
        // which will fail, but the error message will contain the list of valid tables
        await base('__nonexistent_table__').select().firstPage();
      } catch (listError: any) {
        if (listError.message && listError.message.includes('Table "__nonexistent_table__" not found. Available tables:')) {
          const availableTables = listError.message
            .split('Available tables:')[1]
            .split(',')
            .map((t: string) => t.trim());
          
          return NextResponse.json({
            success: false,
            error: 'Users table not found',
            availableTables
          });
        }
      }
      
      return NextResponse.json({
        success: false,
        error: `Error accessing Users table: ${error.message}`
      });
    }
  } catch (error: any) {
    console.error('Error initializing Airtable:', error);
    
    return NextResponse.json({
      success: false,
      error: `Error initializing Airtable: ${error.message}`
    });
  }
}
