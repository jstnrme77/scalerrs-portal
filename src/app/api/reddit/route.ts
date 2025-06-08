import { NextRequest, NextResponse } from 'next/server';
import { getRedditData } from '@/lib/airtable';

// Configure for Netlify deployment
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    console.log('API route: Fetching Reddit data from Airtable');
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
    console.log('Attempt 1: Fetching Reddit data with client and month filtering');
    const redditWithClientAndMonth = await getRedditData(userId, userRole, clientIds, month);
    console.log(`Attempt 1: Found ${redditWithClientAndMonth.length} Reddit records`);

    let redditData = redditWithClientAndMonth;

    // Attempt 2: If no results, try without client filtering
    if (redditWithClientAndMonth.length === 0 && clientIds && clientIds.length > 0) {
      console.log('Attempt 2: Trying without client filtering but with month filtering');
      const redditWithMonthOnly = await getRedditData(userId, 'Admin', [], month);
      console.log(`Attempt 2: Found ${redditWithMonthOnly.length} Reddit records`);
      
      if (redditWithMonthOnly.length > 0) {
        console.log('Using results from Attempt 2 (month filtering only)');
        redditData = redditWithMonthOnly;
      }
    }

    // Attempt 3: If still no results, try without month filtering
    if (redditData.length === 0 && month) {
      console.log('Attempt 3: Trying without month filtering');
      const redditWithoutMonthFilter = await getRedditData(userId, userRole, clientIds, null);
      console.log(`Attempt 3: Found ${redditWithoutMonthFilter.length} Reddit records`);
      
      if (redditWithoutMonthFilter.length > 0) {
        console.log('Using results from Attempt 3 (no month filtering)');
        redditData = redditWithoutMonthFilter;
      }
    }

    // If client IDs were specified but no data was found after multiple attempts, 
    // we should NOT return all threads as a fallback
    if (redditData.length === 0 && clientIds && clientIds.length > 0) {
      console.log('No data found for specified client IDs after multiple attempts');
      console.log('Returning empty array as requested - strict client filtering enabled');
      // Keep redditData as empty array
    } 
    // Only use attempt 4 if no client IDs were specified
    else if (redditData.length === 0 && (!clientIds || clientIds.length === 0)) {
      console.log('Attempt 4: Getting all Reddit threads as last resort (no client filtering requested)');
      const allRedditThreads = await getRedditData(null, 'Admin', [], null);
      console.log(`Attempt 4: Found ${allRedditThreads.length} Reddit records`);
      
      if (allRedditThreads.length > 0) {
        console.log('Using results from Attempt 4 (all Reddit threads)');
        redditData = allRedditThreads;
      }
    }

    // Debug the returned Reddit data
    if (redditData.length > 0) {
      console.log('Sample Reddit records:');
      redditData.slice(0, 3).forEach((thread: any, index: number) => {
        console.log(`Thread ${index}:`, {
          id: thread.id,
          keyword: thread['Keyword'],
          month: thread['Month'],
          status: thread['Reddit Thread Status (General)'],
          clients: thread['Clients']
        });
      });

      // Debug: Check client associations in the data
      console.log('Checking client associations in the returned data:');
      redditData.slice(0, 3).forEach((thread: any, index: number) => {
        console.log(`Thread ${index} client data:`, {
          id: thread.id,
          title: thread['Keyword'],
          clients: thread['Clients']
        });
      });
    } else {
      console.log('No Reddit records returned from any of the attempts');
      console.log('Please check your Airtable configuration and data');
    }

    console.log(`API route: Returning ${redditData.length} Reddit threads`);

    // Create response with cache control headers
    const response = NextResponse.json({ reddit: redditData });

    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');

    return response;
  } catch (error) {
    console.error('Error fetching Reddit data:', error);
    console.log('API route: Error fetching Reddit data');
    const response = NextResponse.json({ reddit: [] });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    return response;
  }
} 