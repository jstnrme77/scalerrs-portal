import { NextRequest, NextResponse } from 'next/server';
import { getBriefs, updateBriefStatus } from '@/lib/airtable';
import { mockBriefs } from '@/lib/mock-data';

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

    if (!briefs || briefs.length === 0) {
      console.log('API route: No briefs found, using mock data');

      // Filter mock data based on user role and ID
      let filteredMockBriefs = [...mockBriefs];

      if (userId && userRole) {
        // For client users, filter by client IDs
        if (userRole === 'Client' && clientIds.length > 0) {
          filteredMockBriefs = mockBriefs.filter(brief => {
            // Check if brief has Clients or Client field that matches any of the user's clients
            if (brief.Clients) {
              if (Array.isArray(brief.Clients)) {
                return brief.Clients.some((client: string) => clientIds.includes(client));
              } else {
                return clientIds.includes(brief.Clients);
              }
            }
            // Fallback to Client field for backward compatibility
            else if (brief.Client) {
              if (Array.isArray(brief.Client)) {
                return brief.Client.some((client: string) => clientIds.includes(client));
              } else {
                return clientIds.includes(brief.Client);
              }
            }
            return false;
          });
        }
        // For non-admin users who aren't clients, only show briefs assigned to them
        else if (userRole !== 'Admin') {
          filteredMockBriefs = mockBriefs.filter(brief => {
            // Check if the brief is assigned to this user
            return (
              (brief.SEOStrategist && brief.SEOStrategist === userId) ||
              (brief.ContentWriter && brief.ContentWriter === userId) ||
              (brief.ContentEditor && brief.ContentEditor === userId)
            );
          });
        }
      }

      const response = NextResponse.json({ briefs: filteredMockBriefs });
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      return response;
    }

    console.log(`API route: Found ${briefs.length} briefs`);

    // Create response with cache control headers
    const response = NextResponse.json({ briefs });

    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');

    return response;
  } catch (error) {
    console.error('Error fetching briefs:', error);
    console.log('API route: Error fetching briefs, using mock data');
    const response = NextResponse.json({ briefs: mockBriefs });
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