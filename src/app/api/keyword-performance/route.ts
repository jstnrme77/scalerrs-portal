import { NextResponse } from 'next/server';
import { getKeywordPerformance } from '@/lib/airtable';
import { mockKeywordPerformance } from '@/lib/mock-data';

// Configure for Netlify deployment
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    console.log('API route: Fetching keyword performance from Airtable');
    console.log('API Key exists:', !!process.env.AIRTABLE_API_KEY);
    console.log('Base ID exists:', !!process.env.AIRTABLE_BASE_ID);

    const keywordPerformance = await getKeywordPerformance();

    if (!keywordPerformance || keywordPerformance.length === 0) {
      console.log('API route: No keyword performance data found, using mock data');
      return NextResponse.json({ keywordPerformance: mockKeywordPerformance });
    }

    console.log(`API route: Found ${keywordPerformance.length} keyword performance records`);
    return NextResponse.json({ keywordPerformance });
  } catch (error) {
    console.error('Error fetching keyword performance:', error);
    console.log('API route: Error fetching keyword performance, using mock data');
    return NextResponse.json({ keywordPerformance: mockKeywordPerformance });
  }
}
