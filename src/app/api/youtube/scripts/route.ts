import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';
import { mockYouTube } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    console.log('API route: Fetching YouTube scripts from Airtable');
    
    // Get Airtable credentials from environment variables
    const apiKey = process.env.AIRTABLE_API_KEY || process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;
    
    console.log('API Key exists:', !!apiKey);
    console.log('Base ID exists:', !!baseId);
    console.log('Request URL:', request.url);
    console.log('Request method:', request.method);

    if (!apiKey || !baseId) {
      console.error('Missing Airtable credentials');
      return NextResponse.json(
        { error: 'Missing Airtable credentials' },
        { status: 500 }
      );
    }

    // Initialize Airtable
    const airtable = new Airtable({ apiKey });
    const base = airtable.base(baseId);
    
    // Fetch YouTube scripts from the "Youtube Management" table
    const tableName = 'Youtube Management';
    
    try {
      console.log(`Attempting to fetch records from table: ${tableName}`);
      
      // First, try to get just one record to verify table exists and is accessible
      const testRecord = await base(tableName).select({ maxRecords: 1 }).firstPage();
      console.log(`Table access check: ${testRecord.length > 0 ? 'Success - found records' : 'Table exists but empty'}`);
      
      if (testRecord.length > 0) {
        console.log('Sample record fields:', Object.keys(testRecord[0].fields));
        console.log('Sample Target Month value:', testRecord[0].fields['Target Month']);
        console.log('Sample Script Status value:', testRecord[0].fields['Script Status']);
      }
      
      // Now fetch all records
      const records = await base(tableName).select().all();
      console.log(`Successfully fetched ${records.length} YouTube scripts from Airtable`);
      
      // Log all records with June 2025
      const juneRecords = records.filter((record: any) => {
        const targetMonth = record.fields['Target Month'];
        return targetMonth && String(targetMonth).toLowerCase().includes('june 2025');
      });
      
      console.log(`Found ${juneRecords.length} records with 'June 2025' in Target Month`);
      if (juneRecords.length > 0) {
        console.log('June 2025 records:', juneRecords.map((record: any) => ({
          id: record.id,
          keyword: record.fields['Keyword Topic'],
          targetMonth: record.fields['Target Month'],
          scriptStatus: record.fields['Script Status']
        })));
      }
      
      // Map the records to our expected format
      const scripts = records.map((record: any) => {
        const fields = record.fields;
        
        // Process client field - ensure it's an array
        let clientsValue: string[] = [];
        if (fields['Clients']) {
          if (Array.isArray(fields['Clients'])) {
            clientsValue = fields['Clients'];
          } else if (typeof fields['Clients'] === 'string') {
            clientsValue = [fields['Clients']];
          }
        }
        
        return {
          id: record.id,
          'Keyword Topic': fields['Keyword Topic'] || '',
          'Video Title': fields['Video Title'] || '',
          'Script Title': fields['Script Title'] || '',
          'Competitor video URL': fields['Competitor video URL'] || '',
          'YouTube Status': fields['YouTube Status'] || 'Idea Proposed',
          'Script Status': fields['Script Status'] || fields['YouTube Status'] || 'Idea Proposed',
          'Script Status for Deliverables': fields['Script Status'] || fields['YouTube Status'] || 'Idea Proposed',
          'Target Month': fields['Target Month'] || '',
          'Month': fields['Target Month'] || '',  // Add Month field as alias for Target Month
          'Video Type': fields['Video Type'] || '',
          'Related blog embeds': fields['Related blog embeds'] || '',
          'Script (G-Doc URL)': fields['Script (G-Doc URL)'] || '',
          'Notes': fields['Notes'] || '',
          'Clients': clientsValue,
          'YouTube Strategist': fields['YouTube Strategist'] || '',
          'YouTube Host': fields['YouTube Host'] || '',
          'YouTube Scripter': fields['YouTube Scripter'] || '',
          'Thumbnail Editor': fields['Thumbnail Editor'] || '',
          'Video Editor': fields['Video Editor'] || '',
          // Include all original fields as well
          ...fields
        };
      });
      
      console.log(`API route: Returning ${scripts.length} YouTube scripts`);
      
      // Check for June 2025 records in processed data
      const processedJuneRecords = scripts.filter(script => 
        script['Target Month'] && String(script['Target Month']).toLowerCase().includes('june 2025')
      );
      console.log(`Processed data contains ${processedJuneRecords.length} records with June 2025`);

      // Create response with cache control headers
      const response = NextResponse.json({ scripts });
      
      // Add cache control headers to prevent caching
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      
      return response;
    } catch (tableError) {
      console.error(`Error accessing table "${tableName}":`, tableError);
      throw tableError;
    }
  } catch (error) {
    console.error('Error fetching YouTube scripts:', error);
    
    const response = NextResponse.json({ scripts: [] });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    
    return response;
  }
} 