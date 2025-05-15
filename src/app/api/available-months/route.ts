/**
 * API route for fetching available months
 */
import { NextResponse } from 'next/server';
import { getAvailableMonths } from '@/lib/airtable';
import { mockMonths } from '@/lib/mock-data';

// Configure for Netlify deployment
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    console.log('API route: Fetching available months from Airtable');
    console.log('API Key exists:', !!process.env.AIRTABLE_API_KEY);
    console.log('Base ID exists:', !!process.env.AIRTABLE_BASE_ID);

    try {
      // Try to use the imported function
      const months = await getAvailableMonths();

      // If no months found, use mock data
      if (!months || months.length === 0) {
        console.log('API route: No months found, using mock data');
        return NextResponse.json({ months: mockMonths });
      }

      console.log(`API route: Found ${months.length} available months`);
      return NextResponse.json({ months });
    } catch (functionError) {
      console.error('Error using imported getAvailableMonths function:', functionError);
      console.log('Falling back to mock data');
      
      // Return mock data as fallback
      return NextResponse.json({ months: mockMonths });
    }
  } catch (error) {
    console.error('Error fetching available months:', error);
    
    // Return mock data as fallback
    console.log('API route: Error fetching months, using mock data');
    return NextResponse.json({ months: mockMonths });
  }
}
