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
 * GET handler for fetching conversation history
 * @param request NextRequest
 * @returns NextResponse with conversation history
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const contentType = searchParams.get('contentType');
    const itemId = searchParams.get('itemId');

    // Validate parameters
    if (!contentType || !itemId) {
      const response = NextResponse.json(
        { error: 'Missing required parameters: contentType and itemId' },
        { status: 400 }
      );

      // Add cache control headers to prevent caching
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      response.headers.set('Pragma', 'no-cache');

      return response;
    }

    // Only allow Keywords and Briefs content types
    if (contentType !== 'keywords' && contentType !== 'briefs') {
      const response = NextResponse.json(
        { error: 'Conversation history is only available for Keywords and Briefs content types' },
        { status: 400 }
      );

      // Add cache control headers to prevent caching
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      response.headers.set('Pragma', 'no-cache');

      return response;
    }

    // Get the Airtable base
    const base = getAirtableBase();

    // Determine which table to query based on content type
    let tableName = 'Comments';

    // Fetch comments from Airtable
    const comments = await base(tableName)
      .select({
        filterByFormula: `SEARCH("${itemId}", {RecordID})`,
        sort: [{ field: 'CreatedTime', direction: 'asc' }]
      })
      .all();

    // Map Airtable records to a more usable format
    const formattedComments = comments.map(record => {
      const fields = record.fields;
      return {
        id: record.id,
        text: fields.Comment || '',
        author: fields.Author || 'Unknown',
        timestamp: typeof fields.CreatedTime === 'string' ? new Date(fields.CreatedTime).toLocaleDateString() : '',
        contentType: fields.ContentType || contentType,
        itemId: fields.RecordID || itemId
      };
    });

    // Filter comments to ensure they match the requested content type and item ID
    const filteredComments = formattedComments.filter(comment =>
      comment.contentType === contentType && comment.itemId === itemId
    );

    const response = NextResponse.json(filteredComments);

    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');

    return response;
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    const response = NextResponse.json(
      { error: 'Failed to fetch conversation history' },
      { status: 500 }
    );

    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');

    return response;
  }
}
