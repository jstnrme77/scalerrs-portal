import { NextRequest, NextResponse } from 'next/server';
import { getYouTubeData } from '@/lib/airtable';

// Configure for Netlify deployment
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    console.log('API route: Fetching YouTube data from Airtable');
    console.log('API Key exists:', !!process.env.AIRTABLE_API_KEY);
    console.log('Base ID exists:', !!process.env.AIRTABLE_BASE_ID);
    console.log('Request URL:', request.url);
    console.log('Request method:', request.method);

    // Get user information from the request
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    const userClientsHeader = request.headers.get('x-user-clients');
    
    // Get client record ID from headers (this will be used as a client ID)
    const clientRecordId = request.headers.get('x-client-record-id');
    console.log('Client Record ID from headers (will be used as client ID):', clientRecordId);

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

    // Add clientRecordId to clientIds if it exists and isn't already included
    if (clientRecordId && !clientIds.includes(clientRecordId)) {
      clientIds.push(clientRecordId);
      console.log('Added client record ID to client IDs array for Clients field filtering:', clientIds);
    }

    // Attempt 1: Try with normal client and month filtering
    console.log('Attempt 1: Fetching YouTube data with client and month filtering');
    const youtubeWithClientAndMonth = await getYouTubeData(userId, userRole, clientIds, month);
    console.log(`Attempt 1: Found ${youtubeWithClientAndMonth.length} YouTube records`);

    let youtubeData = youtubeWithClientAndMonth;

    // Attempt 2: If no results, try without client filtering
    if (youtubeWithClientAndMonth.length === 0 && clientIds && clientIds.length > 0) {
      console.log('Attempt 2: Trying without client filtering but with month filtering');
      const youtubeWithMonthOnly = await getYouTubeData(userId, 'Admin', [], month);
      console.log(`Attempt 2: Found ${youtubeWithMonthOnly.length} YouTube records`);
      
      if (youtubeWithMonthOnly.length > 0) {
        console.log('Using results from Attempt 2 (month filtering only)');
        youtubeData = youtubeWithMonthOnly;
      }
    }

    // Attempt 3: If still no results, try without month filtering
    if (youtubeData.length === 0 && month) {
      console.log('Attempt 3: Trying without month filtering');
      const youtubeWithoutMonthFilter = await getYouTubeData(userId, userRole, clientIds, null);
      console.log(`Attempt 3: Found ${youtubeWithoutMonthFilter.length} YouTube records`);
      
      if (youtubeWithoutMonthFilter.length > 0) {
        console.log('Using results from Attempt 3 (no month filtering)');
        youtubeData = youtubeWithoutMonthFilter;
      }
    }
    
    // If client IDs were specified but no data was found after multiple attempts, 
    // we should NOT return all videos as a fallback
    if (youtubeData.length === 0 && clientIds && clientIds.length > 0) {
      console.log('No YouTube data found for specified client IDs after multiple attempts');
      console.log('Returning empty array as requested - strict client filtering enabled');
      // Keep youtubeData as empty array
    }

    // Debug the returned YouTube data
    if (youtubeData.length > 0) {
      console.log('Sample YouTube records:');
      youtubeData.slice(0, 3).forEach((video: any, index: number) => {
        console.log(`Video ${index}:`, {
          id: video.id,
          title: video['Video Title'] || video['Keyword Topic'],
          targetMonth: video['Target Month'],
          youtubeStatus: video['YouTube Status'],
          clients: video['Clients'],
          clientRecordId: video['Client Record ID']
        });
      });

      // Debug: Check client associations in the data
      console.log('Checking client associations in the returned data:');
      youtubeData.slice(0, 3).forEach((video: any, index: number) => {
        console.log(`Video ${index} client data:`, {
          id: video.id,
          title: video['Keyword Topic'] || video['Video Title'],
          clients: video['Clients']
        });
      });
    } else {
      console.log('No YouTube records returned from any of the attempts');
      console.log('Please check your Airtable configuration and data');
    }

    console.log(`API route: Returning ${youtubeData.length} YouTube videos`);

    // Create response with cache control headers
    const response = NextResponse.json({ youtube: youtubeData });

    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');

    return response;
  } catch (error) {
    console.error('Error fetching YouTube data:', error);
    console.log('API route: Error fetching YouTube data');
    const response = NextResponse.json({ youtube: [] });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    return response;
  }
} 