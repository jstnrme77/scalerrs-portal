import { NextRequest, NextResponse } from 'next/server';
import { getHomepageData } from '@/lib/airtable/homepage';

export async function GET(request: NextRequest) {
  try {
    // Get user information from headers
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    const selectedClientId = request.headers.get('x-selected-client');
    let clientIds: string[] = [];

    try {
      const clientIdsHeader = request.headers.get('x-user-client');
      if (clientIdsHeader) {
        clientIds = JSON.parse(clientIdsHeader);
      }
    } catch (error) {
      console.error('Error parsing client IDs:', error);
    }

    console.log('API route received headers - userId:', userId, 'userRole:', userRole, 'selectedClientId:', selectedClientId, 'clientIds:', clientIds);

    // Fetch homepage data
    // If we have a selected client ID that's not 'all' and the user is an admin, use that for filtering
    if (selectedClientId && selectedClientId !== 'all' && userRole === 'Admin') {
      console.log('Admin user with specific client selected:', selectedClientId);
      clientIds = [selectedClientId];
    }

    const homepageData = await getHomepageData(userId, userRole, clientIds);

    // Return the data
    return NextResponse.json({ homepageData }, { status: 200 });
  } catch (error: any) {
    console.error('Error in homepage-data API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch homepage data', details: error.message },
      { status: 500 }
    );
  }
}
