import { NextResponse } from 'next/server';
import Airtable from 'airtable';

// Configure for Netlify deployment
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Get API key and base ID from environment variables
    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;

    if (!apiKey || !baseId) {
      return NextResponse.json({
        error: 'Airtable API key or Base ID not found in environment variables'
      }, { status: 500 });
    }

    console.log('Using Airtable API Key:', apiKey.substring(0, 10) + '...');
    console.log('Using Airtable Base ID:', baseId);

    // Try to get metadata about the base
    try {
      const metaResponse = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!metaResponse.ok) {
        console.log('Metadata approach failed:', metaResponse.status, metaResponse.statusText);
        // Continue to alternative approach
      } else {
        const metaData = await metaResponse.json();

        if (metaData.tables) {
          return NextResponse.json({
            success: true,
            method: 'metadata',
            tables: metaData.tables.map((table: any) => ({
              id: table.id,
              name: table.name,
              primaryFieldId: table.primaryFieldId,
              fields: table.fields.map((field: any) => ({
                id: field.id,
                name: field.name,
                type: field.type
              }))
            }))
          });
        }
      }
    } catch (metaError: any) {
      console.log('Metadata approach failed:', metaError.message);
      // Continue to alternative approach
    }

    // Alternative approach: Try to access a non-existent table to get the error message
    try {
      // Initialize Airtable
      const airtable = new Airtable({ apiKey });
      const base = airtable.base(baseId);

      try {
        // This will fail, but the error message will contain the list of available tables
        await base('__nonexistent_table__').select().firstPage();
      } catch (error: any) {
        if (error.message && error.message.includes('Table "__nonexistent_table__" not found. Available tables:')) {
          const availableTables = error.message
            .split('Available tables:')[1]
            .trim()
            .split(',')
            .map((t: string) => t.trim());

          console.log('Available tables:', availableTables);

          // Try to get sample records and fields for each table
          const tablesInfo = [];

          for (const tableName of availableTables) {
            try {
              const records = await base(tableName).select({ maxRecords: 1 }).firstPage();

              tablesInfo.push({
                name: tableName,
                exists: true,
                fields: records.length > 0 ? Object.keys(records[0].fields) : [],
                sampleRecord: records.length > 0 ? records[0].fields : null
              });
            } catch (tableError: any) {
              tablesInfo.push({
                name: tableName,
                exists: false,
                error: tableError.message
              });
            }
          }

          return NextResponse.json({
            success: true,
            method: 'error_message',
            tables: tablesInfo
          });
        }
      }
    } catch (altError: any) {
      console.error('Alternative approach failed:', altError.message);
    }

    // If all approaches fail, return an error
    return NextResponse.json({
      error: 'Could not discover tables in the Airtable base',
      details: 'Both metadata and error message approaches failed'
    }, { status: 500 });
  } catch (error: any) {
    console.error('Error discovering tables:', error);
    return NextResponse.json({
      error: 'Failed to discover tables',
      details: error.message
    }, { status: 500 });
  }
}
