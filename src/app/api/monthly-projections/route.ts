import { NextResponse } from 'next/server';
import { getMonthlyProjections } from '@/lib/airtable/index';
import { mockMonthlyProjections } from '@/lib/mock-data';

export async function GET() {
  try {
    console.log('API route: Fetching monthly projections from Airtable');
    console.log('API Key exists:', !!process.env.AIRTABLE_API_KEY);
    console.log('Base ID exists:', !!process.env.AIRTABLE_BASE_ID);

    const monthlyProjections = await getMonthlyProjections();

    if (!monthlyProjections || monthlyProjections.length === 0) {
      console.log('API route: No monthly projections found, using mock data');
      return NextResponse.json({ monthlyProjections: mockMonthlyProjections });
    }

    console.log(`API route: Found ${monthlyProjections.length} monthly projections`);
    return NextResponse.json({ monthlyProjections });
  } catch (error) {
    console.error('Error fetching monthly projections:', error);
    console.log('API route: Error fetching monthly projections, using mock data');
    return NextResponse.json({ monthlyProjections: mockMonthlyProjections });
  }
}
