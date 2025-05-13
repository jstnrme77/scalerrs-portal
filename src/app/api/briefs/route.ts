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

    // Get user information from the request
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    const userClient = request.headers.get('x-user-client');

    console.log('User ID:', userId);
    console.log('User Role:', userRole);
    console.log('User Client:', userClient);

    // Parse client IDs if present
    const clientIds = userClient ? JSON.parse(userClient) : [];

    // Fetch briefs with user filtering
    const briefs = await getBriefs(userId, userRole, clientIds);

    if (!briefs || briefs.length === 0) {
      console.log('API route: No briefs found, using mock data');

      // Filter mock data based on user role and ID
      let filteredMockBriefs = [...mockBriefs];

      if (userId && userRole) {
        // For client users, filter by client IDs
        if (userRole === 'Client' && clientIds.length > 0) {
          filteredMockBriefs = mockBriefs.filter(brief => {
            // Check if brief has client field that matches any of the user's clients
            if (brief.Client) {
              if (Array.isArray(brief.Client)) {
                return brief.Client.some(client => clientIds.includes(client));
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

      return NextResponse.json({ briefs: filteredMockBriefs });
    }

    console.log(`API route: Found ${briefs.length} briefs`);
    return NextResponse.json({ briefs });
  } catch (error) {
    console.error('Error fetching briefs:', error);
    console.log('API route: Error fetching briefs, using mock data');
    return NextResponse.json({ briefs: mockBriefs });
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

    const updatedBrief = await updateBriefStatus(briefId, status);
    return NextResponse.json({ brief: updatedBrief });
  } catch (error) {
    console.error('Error updating brief:', error);
    return NextResponse.json(
      { error: 'Failed to update brief' },
      { status: 500 }
    );
  }
}
