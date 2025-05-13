import { NextResponse } from 'next/server';
import { getClients } from '@/lib/airtable';
import { mockClients } from '@/lib/mock-data';

export async function GET() {
  try {
    console.log('API route: Fetching clients from Airtable');
    console.log('API Key exists:', !!process.env.AIRTABLE_API_KEY);
    console.log('Base ID exists:', !!process.env.AIRTABLE_BASE_ID);

    const clients = await getClients();

    if (!clients || clients.length === 0) {
      console.log('API route: No clients found, using mock data');
      return NextResponse.json({ clients: mockClients });
    }

    console.log(`API route: Found ${clients.length} clients`);
    return NextResponse.json({ clients });
  } catch (error) {
    console.error('Error fetching clients:', error);
    console.log('API route: Error fetching clients, using mock data');
    return NextResponse.json({ clients: mockClients });
  }
}
