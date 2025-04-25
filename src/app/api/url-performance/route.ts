import { NextResponse } from 'next/server';
import { getURLPerformance } from '@/lib/airtable';
import { mockURLPerformance } from '@/lib/mock-data';

// Configure for Netlify deployment
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    console.log('API route: Fetching URL performance from Airtable');
    console.log('API Key exists:', !!process.env.AIRTABLE_API_KEY);
    console.log('Base ID exists:', !!process.env.AIRTABLE_BASE_ID);

    const urlPerformance = await getURLPerformance();

    if (!urlPerformance || urlPerformance.length === 0) {
      console.log('API route: No URL performance data found, using mock data');
      return NextResponse.json({ urlPerformance: mockURLPerformance });
    }

    console.log(`API route: Found ${urlPerformance.length} URL performance records`);
    return NextResponse.json({ urlPerformance });
  } catch (error) {
    console.error('Error fetching URL performance:', error);
    console.log('API route: Error fetching URL performance, using mock data');
    return NextResponse.json({ urlPerformance: mockURLPerformance });
  }
}
