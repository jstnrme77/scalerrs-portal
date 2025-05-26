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
 * GET handler to list comments for a record using Airtable's built-in comments API
 * @param request NextRequest
 * @returns NextResponse with comments array
 */
export async function GET(request: NextRequest) {
  console.log('Airtable Comments API: GET request received');
  
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const recordId = searchParams.get('recordId');
    const tableIdOrName = searchParams.get('tableIdOrName') || 'Keywords'; // Default to Keywords table

    // Validate recordId parameter
    if (!recordId) {
      console.error('Airtable Comments API: Missing recordId parameter');
      const response = NextResponse.json(
        { error: 'Missing required parameter: recordId' },
        { status: 400 }
      );

      // Add cache control headers to prevent caching
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      response.headers.set('Pragma', 'no-cache');

      return response;
    }

    console.log(`Airtable Comments API: Fetching comments for record: ${recordId} in table: ${tableIdOrName}`);

    // Get Airtable credentials
    const { apiKey, baseId } = getAirtableCredentials();

    // Use Airtable's built-in comments API endpoint
    const url = `https://api.airtable.com/v0/${baseId}/${tableIdOrName}/${recordId}/comments`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      // 10 second timeout
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Airtable Comments API: HTTP ${response.status}: ${errorText}`);
      throw new Error(`Failed to fetch comments: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log(`Airtable Comments API: Found ${data.comments?.length || 0} comments for record ${recordId}`);

    // Map Airtable comments to our format
    const formattedComments = (data.comments || []).map((comment: any) => ({
      id: comment.id,
      text: comment.text || '',
      author: comment.author?.name || comment.author?.email || 'Unknown',
      timestamp: comment.createdTime ? new Date(comment.createdTime).toLocaleDateString() : new Date().toLocaleDateString(),
      contentType: '', // Not available in built-in comments
      recordId: recordId,
      createdAt: comment.createdTime || new Date().toISOString()
    }));

    const responseData = NextResponse.json({
      comments: formattedComments,
      recordId,
      total: formattedComments.length
    });

    // Add cache control headers to prevent caching
    responseData.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    responseData.headers.set('Pragma', 'no-cache');

    console.log(`Airtable Comments API: Successfully returned ${formattedComments.length} comments`);

    return responseData;
  } catch (error) {
    console.error('Airtable Comments API: Error fetching comments:', error);
    
    const response = NextResponse.json(
      { 
        error: 'Failed to fetch comments',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );

    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');

    return response;
  }
} 