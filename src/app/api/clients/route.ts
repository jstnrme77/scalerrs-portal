import { NextResponse } from 'next/server';
import { getClients } from '@/lib/airtable';
import { mockClients } from '@/lib/mock-data';
import { headers } from 'next/headers';
import { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';

export async function GET() {
  try {
    console.log('API route: Fetching clients from Airtable');
    console.log('Environment variables check:');
    console.log('- AIRTABLE_API_KEY exists:', !!process.env.AIRTABLE_API_KEY);
    console.log('- NEXT_PUBLIC_AIRTABLE_API_KEY exists:', !!process.env.NEXT_PUBLIC_AIRTABLE_API_KEY);
    console.log('- AIRTABLE_BASE_ID exists:', !!process.env.AIRTABLE_BASE_ID);
    console.log('- NEXT_PUBLIC_AIRTABLE_BASE_ID exists:', !!process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID);

    // Get request headers using async/await as per Next.js 15 documentation
    const headersList = await headers();
    const userId = headersList.get('x-user-id');
    const userRole = headersList.get('x-user-role');
    const userClientsHeader = headersList.get('x-user-clients');
    const requestId = headersList.get('x-request-id') || `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    
    console.log(`[${requestId}] API route clients: User ID:`, userId);
    console.log(`[${requestId}] API route clients: User Role:`, userRole);
    console.log(`[${requestId}] API route clients: User Clients:`, userClientsHeader);
    
    // Parse user clients if available
    let userClients: string[] = [];
    if (userClientsHeader) {
      try {
        userClients = JSON.parse(userClientsHeader);
        console.log(`[${requestId}] API route clients: Parsed User Clients:`, userClients);
      } catch (e) {
        console.error(`[${requestId}] API route clients: Error parsing user clients header:`, e);
      }
    }

    // Ensure we have the API key and base ID
    if (!process.env.AIRTABLE_API_KEY && !process.env.NEXT_PUBLIC_AIRTABLE_API_KEY) {
      console.error(`[${requestId}] No Airtable API key found in environment variables!`);
      throw new Error('Missing Airtable API key');
    }

    if (!process.env.AIRTABLE_BASE_ID && !process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID) {
      console.error(`[${requestId}] No Airtable base ID found in environment variables!`);
      throw new Error('Missing Airtable base ID');
    }

    // Add a timeout to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Airtable request timed out')), 10000);
    });

    // Create a promise for the Airtable request
    const airtablePromise = getClients();

    // Race the timeout against the actual request
    const clients = await Promise.race([airtablePromise, timeoutPromise]) as any[];
    console.log(`[${requestId}] Raw clients data:`, clients ? `${clients.length} clients received` : 'No clients received');

    if (!clients || !Array.isArray(clients) || clients.length === 0) {
      console.log(`[${requestId}] API route: No clients found or invalid response, using mock data`);

      // Create response with cache control headers
      const response = NextResponse.json({ 
        clients: mockClients,
        timestamp: Date.now(),
        requestId,
        source: 'mock-data'
      });

      // Add cache control headers to prevent caching
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('X-Request-ID', requestId);

      return response;
    }

    console.log(`[${requestId}] API route: Found ${clients.length} clients`);

    // Log a sample of the clients data
    if (clients.length > 0) {
      console.log(`[${requestId}] Sample client:`, JSON.stringify(clients[0]));
    }
    
    // Filter clients if user is a client
    let filteredClients = clients;
    if (userRole === 'Client' && userClients.length > 0) {
      console.log(`[${requestId}] API route: Filtering clients for client user`);
      filteredClients = clients.filter((client: { id: string }) => userClients.includes(client.id));
      console.log(`[${requestId}] API route: Filtered ${filteredClients.length} out of ${clients.length} clients for client user`);
    }

    // Create response with cache control headers
    const response = NextResponse.json({ 
      clients: filteredClients,
      timestamp: Date.now(), // Add timestamp to help client identify fresh responses
      requestId,
      source: 'airtable'
    });

    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    response.headers.set('X-Response-Time', Date.now().toString());
    response.headers.set('X-Request-ID', requestId);

    return response;
  } catch (error: any) {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    console.error(`[${errorId}] Error fetching clients:`, error);
    console.log(`[${errorId}] API route: Error fetching clients, using mock data`);
    
    // Get request headers for filtering mock data using async/await
    const headersList = await headers();
    const userRole = headersList.get('x-user-role');
    const userClientsHeader = headersList.get('x-user-clients');
    const requestId = headersList.get('x-request-id') || `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    
    // Parse user clients if available
    let userClients: string[] = [];
    if (userClientsHeader) {
      try {
        userClients = JSON.parse(userClientsHeader);
      } catch (e) {
        console.error(`[${errorId}] API route clients: Error parsing user clients header:`, e);
      }
    }
    
    // Filter mock clients if user is a client
    let filteredMockClients = mockClients;
    if (userRole === 'Client' && userClients.length > 0) {
      console.log(`[${errorId}] API route: Filtering mock clients for client user`);
      filteredMockClients = mockClients.filter((client: { id: string }) => userClients.includes(client.id));
      console.log(`[${errorId}] API route: Filtered ${filteredMockClients.length} out of ${mockClients.length} mock clients for client user`);
    }

    // Create response with cache control headers
    const response = NextResponse.json({ 
      clients: filteredMockClients,
      timestamp: Date.now(), // Add timestamp to help client identify fresh responses
      requestId,
      errorId,
      error: error.message || 'Unknown error',
      source: 'mock-data-fallback'
    });

    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    response.headers.set('X-Response-Time', Date.now().toString());
    response.headers.set('X-Request-ID', requestId);
    response.headers.set('X-Error-ID', errorId);

    return response;
  }
}
