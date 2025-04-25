import { NextRequest, NextResponse } from 'next/server';
import { getBriefs, updateBriefStatus } from '@/lib/airtable';
import { mockBriefs } from '@/lib/mock-data';

// Configure for Netlify deployment
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    console.log('API route: Fetching briefs from Airtable');
    console.log('API Key exists:', !!process.env.AIRTABLE_API_KEY);
    console.log('Base ID exists:', !!process.env.AIRTABLE_BASE_ID);

    const briefs = await getBriefs();

    if (!briefs || briefs.length === 0) {
      console.log('API route: No briefs found, using mock data');
      return NextResponse.json({ briefs: mockBriefs });
    }

    console.log(`API route: Found ${briefs.length} briefs`);
    return NextResponse.json({ briefs });
  } catch (error) {
    console.error('Error fetching briefs:', error);
    console.log('API route: Error fetching briefs, using mock data');
    return NextResponse.json({ briefs: mockBriefs });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { briefId, status } = await request.json();

    if (!briefId || !status) {
      return NextResponse.json(
        { error: 'Brief ID and status are required' },
        { status: 400 }
      );
    }

    const updatedBrief = await updateBriefStatus(briefId, status);
    return NextResponse.json({ brief: updatedBrief });
  } catch (error) {
    console.error('Error updating brief:', error);
    return NextResponse.json(
      { error: 'Failed to update brief' },
      { status: 500 }
    );
  }
}
