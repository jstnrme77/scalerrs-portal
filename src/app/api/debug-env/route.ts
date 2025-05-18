import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';

// Helper function to get Airtable base
function getAirtableBase() {
  const apiKey = process.env.AIRTABLE_API_KEY || process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    console.error('Missing Airtable credentials');
    throw new Error('Missing Airtable credentials');
  }

  const airtable = new Airtable({ apiKey });
  return airtable.base(baseId);
}

/**
 * Debug endpoint to check environment variables and Airtable connection
 */
export async function GET(request: NextRequest) {
  try {
    console.log('API route: debug-env called');

    // Get environment variables (mask sensitive values)
    const envVars = {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY ? `${process.env.AIRTABLE_API_KEY.substring(0, 10)}...` : 'not set',
      AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID || 'not set',
      NEXT_PUBLIC_AIRTABLE_API_KEY: process.env.NEXT_PUBLIC_AIRTABLE_API_KEY ? `${process.env.NEXT_PUBLIC_AIRTABLE_API_KEY.substring(0, 10)}...` : 'not set',
      NEXT_PUBLIC_AIRTABLE_BASE_ID: process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || 'not set',
      NEXT_PUBLIC_USE_MOCK_DATA: process.env.NEXT_PUBLIC_USE_MOCK_DATA || 'not set'
    };

    // Test Airtable connection
    let airtableConnection = 'not tested';
    let airtableError = null;

    try {
      // Get the Airtable base
      const base = getAirtableBase();

      // Try to fetch a single record from any table to test the connection
      const tables = ['Keywords', 'Articles', 'Briefs', 'Backlinks', 'Tasks', 'Comments'];

      // Try each table until we find one that works
      let connectionSuccessful = false;

      for (const table of tables) {
        try {
          console.log(`Trying to fetch a record from ${table} table...`);
          const records = await base(table).select({
            maxRecords: 1
          }).firstPage();

          if (records && records.length > 0) {
            airtableConnection = `success (found ${records.length} record in ${table} table)`;
            connectionSuccessful = true;
            break;
          }
        } catch (tableError) {
          console.error(`Error fetching from ${table} table:`, tableError);
          // Continue to the next table
        }
      }

      if (!connectionSuccessful) {
        airtableConnection = 'failed (no records found in any table)';
      }
    } catch (error: any) {
      console.error('Error testing Airtable connection:', error);
      airtableConnection = 'failed';
      airtableError = error.message;
    }

    // Get available API routes
    const apiRoutes = [
      '/api/tasks',
      '/api/comments',
      '/api/briefs',
      '/api/articles',
      '/api/backlinks',
      '/api/approvals',
      '/api/url-performance',
      '/api/keyword-performance',
      '/api/kpi-metrics',
      '/api/monthly-projections',
      '/api/homepage-data',
      '/api/auth',
      '/api/login',
      '/api/debug-env'
    ];

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: envVars,
      airtable: {
        connection: airtableConnection,
        error: airtableError
      },
      apiRoutes
    });
  } catch (error: any) {
    console.error('Error in debug-env API route:', error);

    return NextResponse.json({
      error: 'Failed to get debug information',
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
