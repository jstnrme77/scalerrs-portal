import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/api-utils';

// Configure for dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Helper function to get Airtable credentials
function getAirtableCredentials() {
  const apiKey = process.env.AIRTABLE_API_KEY || process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    console.error('Missing Airtable credentials');
    throw new Error('Missing Airtable credentials');
  }

  return { apiKey, baseId };
}

/**
 * POST handler to add a comment to a record using Airtable's built-in comments API
 * @param request NextRequest
 * @returns NextResponse with created comment
 */
export async function POST(request: NextRequest) {
  console.log('Airtable Add Comment API: POST request received');
  
  try {
    // Parse request body
    const body = await request.json();
    const { recordId, text, contentType, tableIdOrName } = body;

    // Use Keywords table for both keywords and backlinks as requested
    const tableName = tableIdOrName || 'Keywords';

    // Validate required fields
    if (!recordId || !text) {
      console.error('Airtable Add Comment API: Missing required fields');
      const response = NextResponse.json(
        { error: 'Missing required fields: recordId and text are required' },
        { status: 400 }
      );

      // Add cache control headers to prevent caching
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      response.headers.set('Pragma', 'no-cache');

      return response;
    }

    console.log(`Airtable Add Comment API: Adding comment to record: ${recordId} in table: ${tableName}`);

    // Get current user for author information (optional)
    let author = 'Anonymous User';
    try {
      const user = await getCurrentUser();
      if (user && user.name) {
        author = user.name;
      } else if (user && user.email) {
        author = user.email;
      }
    } catch (error) {
      console.warn('Could not get current user for comment author:', error);
    }

    // Get Airtable credentials
    const { apiKey, baseId } = getAirtableCredentials();

    // Use Airtable's built-in comments API endpoint
    const url = `https://api.airtable.com/v0/${baseId}/${tableName}/${recordId}/comments`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: text.trim()
      }),
      // 10 second timeout
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Airtable Add Comment API: HTTP ${response.status}: ${errorText}`);
      throw new Error(`Failed to add comment: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log(`Airtable Add Comment API: Successfully added comment to record ${recordId}`);

    // Format the response to match our expected structure
    const formattedComment = {
      id: data.id,
      text: data.text || text,
      author: data.author?.name || data.author?.email || author,
      timestamp: data.createdTime ? new Date(data.createdTime).toLocaleDateString() : new Date().toLocaleDateString(),
      contentType: contentType || '',
      recordId: recordId,
      createdAt: data.createdTime || new Date().toISOString()
    };

    const responseData = NextResponse.json({
      comment: formattedComment,
      success: true
    });

    // Add cache control headers to prevent caching
    responseData.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    responseData.headers.set('Pragma', 'no-cache');

    console.log(`Airtable Add Comment API: Successfully returned created comment`);

    return responseData;
  } catch (error) {
    console.error('Airtable Add Comment API: Error adding comment:', error);
    
    const response = NextResponse.json(
      { 
        error: 'Failed to add comment',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false
      },
      { status: 500 }
    );

    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');

    return response;
  }
} 