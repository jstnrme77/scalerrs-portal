import { NextResponse } from 'next/server';
import Airtable from 'airtable';

// Configure for Netlify deployment
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Get API key and base ID from environment variables
    const apiKey = process.env.AIRTABLE_API_KEY || process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;

    if (!apiKey || !baseId) {
      return NextResponse.json({ 
        error: 'Airtable API key or Base ID not found in environment variables' 
      }, { status: 500 });
    }

    console.log('Using Airtable API Key:', apiKey.substring(0, 10) + '...');
    console.log('Using Airtable Base ID:', baseId);

    // Initialize Airtable
    const airtable = new Airtable({ apiKey });
    const base = airtable.base(baseId);

    // Try to get tables by checking common table names
    const commonTables = [
      'Users', 'Tasks', 'Comments', 'Briefs', 'Articles', 'Backlinks', 
      'KPI Metrics', 'URL Performance', 'Keyword Performance', 'Clients',
      'Monthly Projections'
    ];
    
    const tablesInfo = [];
    
    for (const tableName of commonTables) {
      try {
        console.log(`Checking table: ${tableName}`);
        const records = await base(tableName).select({ maxRecords: 1 }).firstPage();
        
        const tableInfo = {
          name: tableName,
          exists: true,
          fields: records.length > 0 ? Object.keys(records[0].fields) : [],
          sampleRecord: records.length > 0 ? records[0].fields : null
        };
        
        tablesInfo.push(tableInfo);
        console.log(`Table ${tableName} exists with ${tableInfo.fields.length} fields`);
      } catch (error) {
        console.log(`Table ${tableName} error:`, error.message);
        if (!error.message.includes('not found')) {
          tablesInfo.push({
            name: tableName,
            exists: false,
            error: error.message
          });
        }
      }
    }

    return NextResponse.json({ 
      success: true,
      apiKeyPrefix: apiKey.substring(0, 10) + '...',
      baseId,
      tables: tablesInfo
    });
  } catch (error) {
    console.error('Error checking Airtable schema:', error);
    return NextResponse.json({ 
      error: 'Failed to check Airtable schema',
      details: error.message
    }, { status: 500 });
  }
}
