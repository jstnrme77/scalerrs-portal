/**
 * API route for fetching available months
 */
import { NextResponse } from 'next/server';
import { getAvailableMonths } from '@/lib/airtable';
import { mockMonths } from '@/lib/mock-data';

export async function GET() {
  try {
    console.log('API route: Fetching available months from Airtable');
    console.log('API Key exists:', !!process.env.AIRTABLE_API_KEY);
    console.log('Base ID exists:', !!process.env.AIRTABLE_BASE_ID);

    // Fetch available months from Airtable
    const months = await getAvailableMonths();

    // If no months found, use mock data
    if (!months || months.length === 0) {
      console.log('API route: No months found, using mock data');
      return NextResponse.json(mockMonths);
    }

    console.log(`API route: Found ${months.length} available months`);
    return NextResponse.json(months);
  } catch (error) {
    console.error('Error fetching available months:', error);
    
    // Return mock data as fallback
    console.log('API route: Error fetching months, using mock data');
    return NextResponse.json(mockMonths);
  }
}
