import { NextResponse } from 'next/server';
import { getClients } from '@/lib/airtable';
import { mockClients } from '@/lib/mock-data';
import { headers } from 'next/headers';

export async function GET() {
  try {
    console.log('API route: Fetching clients from Airtable');
    console.log('Environment variables check:');
    console.log('- AIRTABLE_API_KEY exists:', !!process.env.AIRTABLE_API_KEY);
    console.log('- NEXT_PUBLIC_AIRTABLE_API_KEY exists:', !!process.env.NEXT_PUBLIC_AIRTABLE_API_KEY);
    console.log('- AIRTABLE_BASE_ID exists:', !!process.env.AIRTABLE_BASE_ID);
    console.log('- NEXT_PUBLIC_AIRTABLE_BASE_ID exists:', !!process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID);

    // Get request headers
    const headersList = await headers();
    const userId = headersList.get('x-user-id');
    const userRole = headersList.get('x-user-role');
    const userClientsHeader = headersList.get('x-user-clients');
    
    console.log('API route clients: User ID:', userId);
    console.log('API route clients: User Role:', userRole);
    console.log('API route clients: User Clients:', userClientsHeader);
    
    // Parse user clients if available
    let userClients: string[] = [];
    if (userClientsHeader) {
      try {
        userClients = JSON.parse(userClientsHeader);
        console.log('API route clients: Parsed User Clients:', userClients);
      } catch (e) {
        console.error('API route clients: Error parsing user clients header:', e);
      }
    }

    // Ensure we have the API key and base ID
    if (!process.env.AIRTABLE_API_KEY && !process.env.NEXT_PUBLIC_AIRTABLE_API_KEY) {
      console.error('No Airtable API key found in environment variables!');
      throw new Error('Missing Airtable API key');
    }

    if (!process.env.AIRTABLE_BASE_ID && !process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID) {
      console.error('No Airtable base ID found in environment variables!');
      throw new Error('Missing Airtable base ID');
    }

    const clients = await getClients();
    console.log('Raw clients data:', JSON.stringify(clients).substring(0, 200) + '...');

    if (!clients || clients.length === 0) {
      console.log('API route: No clients found, using mock data');

      // Create response with cache control headers
      const response = NextResponse.json({ clients: mockClients });

      // Add cache control headers to prevent caching
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      response.headers.set('Pragma', 'no-cache');

      return response;
    }

    console.log(`API route: Found ${clients.length} clients`);

    // Log a sample of the clients data
    if (clients.length > 0) {
      console.log('Sample client:', JSON.stringify(clients[0]));
    }
    
    // Filter clients if user is a client
    let filteredClients = clients;
    if (userRole === 'Client' && userClients.length > 0) {
      console.log('API route: Filtering clients for client user');
      filteredClients = clients.filter((client: { id: string }) => userClients.includes(client.id));
      console.log(`API route: Filtered ${filteredClients.length} out of ${clients.length} clients for client user`);
    }

    // Create response with cache control headers
    const response = NextResponse.json({ clients: filteredClients });

    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');

    return response;
  } catch (error) {
    console.error('Error fetching clients:', error);
    console.log('API route: Error fetching clients, using mock data');
    
    // Get request headers for filtering mock data
    const headersList = await headers();
    const userRole = headersList.get('x-user-role');
    const userClientsHeader = headersList.get('x-user-clients');
    
    // Parse user clients if available
    let userClients: string[] = [];
    if (userClientsHeader) {
      try {
        userClients = JSON.parse(userClientsHeader);
      } catch (e) {
        console.error('API route clients: Error parsing user clients header:', e);
      }
    }
    
    // Filter mock clients if user is a client
    let filteredMockClients = mockClients;
    if (userRole === 'Client' && userClients.length > 0) {
      console.log('API route: Filtering mock clients for client user');
      filteredMockClients = mockClients.filter((client: { id: string }) => userClients.includes(client.id));
      console.log(`API route: Filtered ${filteredMockClients.length} out of ${mockClients.length} mock clients for client user`);
    }

    // Create response with cache control headers
    const response = NextResponse.json({ clients: filteredMockClients });

    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');

    return response;
  }
}
