import { NextRequest, NextResponse } from 'next/server';
import { getBacklinks, updateBacklinkStatus } from '@/lib/airtable';
import { mockBacklinks } from '@/lib/mock-data';

// Configure for Netlify deployment
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    console.log('API route: Fetching backlinks from Airtable');
    console.log('API Key exists:', !!process.env.AIRTABLE_API_KEY);
    console.log('Base ID exists:', !!process.env.AIRTABLE_BASE_ID);

    const backlinks = await getBacklinks();

    if (!backlinks || backlinks.length === 0) {
      console.log('API route: No backlinks found, using mock data');
      return NextResponse.json({ backlinks: mockBacklinks });
    }

    console.log(`API route: Found ${backlinks.length} backlinks`);
    return NextResponse.json({ backlinks });
  } catch (error) {
    console.error('Error fetching backlinks:', error);
    console.log('API route: Error fetching backlinks, using mock data');
    return NextResponse.json({ backlinks: mockBacklinks });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { backlinkId, status } = await request.json();

    if (!backlinkId || !status) {
      return NextResponse.json(
        { error: 'Backlink ID and status are required' },
        { status: 400 }
      );
    }

    const updatedBacklink = await updateBacklinkStatus(backlinkId, status);
    return NextResponse.json({ backlink: updatedBacklink });
  } catch (error) {
    console.error('Error updating backlink:', error);
    return NextResponse.json(
      { error: 'Failed to update backlink' },
      { status: 500 }
    );
  }
}
