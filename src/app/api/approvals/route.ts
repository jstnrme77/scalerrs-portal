import { NextRequest, NextResponse } from 'next/server';
import { getApprovalItems, updateApprovalStatus } from '@/lib/airtable';

// Configure for Netlify deployment
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    console.log('API route: Fetching approval items from Airtable');
    console.log('API Key exists:', !!process.env.AIRTABLE_API_KEY);
    console.log('Base ID exists:', !!process.env.AIRTABLE_BASE_ID);

    // Get approval type from query parameters
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'briefs';

    // Get pagination parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const offset = searchParams.get('offset') || undefined;

    // Get user information from the request
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    const userClient = request.headers.get('x-user-client');

    console.log('User ID:', userId);
    console.log('User Role:', userRole);
    console.log('User Client:', userClient);
    console.log('Approval Type:', type);
    console.log('Page:', page, 'Page Size:', pageSize, 'Offset:', offset);

    // Parse client IDs if present
    const clientIds = userClient ? JSON.parse(userClient) : [];

    // Fetch approval items with user filtering and pagination
    const result = await getApprovalItems(type, userId, userRole, clientIds, page, pageSize, offset);

    console.log(`API route: Found ${result.items.length} ${type} approval items (page ${page} of ${result.pagination.totalPages})`);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching approval items:', error);
    return NextResponse.json({ error: 'Failed to fetch approval items' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('API route: Updating approval status in Airtable');

    // Parse request body
    const body = await request.json();
    const { type, itemId, status, revisionReason } = body;

    if (!type || !itemId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: type, itemId, and status are required' },
        { status: 400 }
      );
    }

    console.log(`Updating ${type} approval status for item ${itemId} to ${status}`);

    // Update approval status
    const updatedItem = await updateApprovalStatus(type, itemId, status, revisionReason);

    return NextResponse.json({ updatedItem });
  } catch (error) {
    console.error('Error updating approval status:', error);
    return NextResponse.json({ error: 'Failed to update approval status' }, { status: 500 });
  }
}
