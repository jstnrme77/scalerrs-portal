import { NextRequest, NextResponse } from 'next/server';
import { getBriefs, updateBriefStatus } from '@/lib/airtable';

// Configure for Netlify deployment
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    console.log('API route: Fetching briefs from Airtable');
    console.log('API Key exists:', !!process.env.AIRTABLE_API_KEY);
    console.log('Base ID exists:', !!process.env.AIRTABLE_BASE_ID);
    console.log('Request URL:', request.url);
    console.log('Request method:', request.method);

    // Get user information from the request
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    const userClientsHeader = request.headers.get('x-user-clients');

    // Get month from query parameters
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');

    console.log('User ID:', userId);
    console.log('User Role:', userRole);
    console.log('User Clients:', userClientsHeader);
    console.log('Month filter:', month);

    // Parse client IDs if present
    let clientIds: string[] = [];
    if (userClientsHeader) {
      try {
        clientIds = JSON.parse(userClientsHeader);
        console.log('Parsed client IDs:', clientIds);
      } catch (e) {
        console.error('Error parsing client IDs:', e);
      }
    }

    // Fetch briefs with user filtering and month filtering
    const briefs = await getBriefs(userId, userRole, clientIds, month);

    console.log(`API route: Found ${briefs.length} briefs`);

    // Create response with cache control headers
    const response = NextResponse.json({ briefs });

    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');

    return response;
  } catch (error) {
    console.error('Error fetching briefs:', error);
    const response = NextResponse.json({ 
      briefs: [], 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    return response;
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { briefId, status } = await request.json();

    if (!briefId || !status) {
      return NextResponse.json(
        { error: 'Brief ID and status are required' },
        { status: 400 }
      );
    }

    console.log(`API route: Updating brief ${briefId} status to ${status}`);

    // Call the updateBriefStatus function which now uses the 'Brief Status' field
    const updatedBrief = await updateBriefStatus(briefId, status);
    console.log('Brief updated successfully:', updatedBrief);

    return NextResponse.json({ brief: updatedBrief });
  } catch (error) {
    console.error('Error updating brief:', error);

    // Log more detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return NextResponse.json(
      { error: 'Failed to update brief', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}