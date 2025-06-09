import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';

// Configure for Netlify deployment
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('API route: Fetching Reddit comments from Airtable');
    
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
    
    // Fetch Reddit comments from the "Reddit Comments" table
    const tableName = 'Reddit Comments';
    
    const records = await base(tableName).select().all();
    console.log(`Successfully fetched ${records.length} Reddit comments from Airtable`);
    
    // Log the first record to see its structure
    if (records.length > 0) {
      console.log('Sample Reddit comment record:', {
        id: records[0].id,
        fields: records[0].fields,
        threadRelation: records[0].fields['Reddit Thread']
      });

      // More detailed logging of the thread relation structure
      const threadRelation = records[0].fields['Reddit Thread'];
      if (threadRelation) {
        console.log('Thread relation type:', typeof threadRelation);
        if (Array.isArray(threadRelation)) {
          console.log('Thread relation is an array with length:', threadRelation.length);
          
          if (threadRelation.length > 0) {
            console.log('First item type:', typeof threadRelation[0]);
            console.log('First item content:', threadRelation[0]);
            
            // If it's an object, log its keys
            if (typeof threadRelation[0] === 'object' && threadRelation[0] !== null) {
              console.log('First item keys:', Object.keys(threadRelation[0]));
            }
          }
        }
      }
    }
    
    // Map the records to our expected format
    const comments = records.map((record: any) => {
      const fields = record.fields;
      
      // Preserve the full linked record structure for Reddit Thread relation
      const redditThreadRelation = fields['Reddit Thread'] || [];
      
      return {
        id: record.id,
        'Comment': fields['Comment'] || '',
        'Status': fields['Status'] || '',
        'Comment Text Proposition (Internal)': fields['Comment Text Proposition (Internal)'] || '',
        'Comment Text Proposition (External)': fields['Comment Text Proposition (External)'] || '',
        'Author Name (team pseudonym)': fields['Author Name (team pseudonym)'] || '',
        'Votes': fields['Votes'] || '',
        'Date Posted': fields['Date Posted'] || '',
        'Reddit Thread (Relation)': redditThreadRelation,
        // Include all original fields
        ...fields
      };
    });

    console.log(`API route: Returning ${comments.length} Reddit comments`);

    // Create response with cache control headers
    const response = NextResponse.json({ comments });
    
    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    
    return response;
  } catch (error) {
    console.error('Error fetching Reddit comments:', error);
    
    const response = NextResponse.json({ comments: [] });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    
    return response;
  }
} 