import { NextRequest, NextResponse } from 'next/server';
import { mockBriefs, mockArticles, mockBacklinks } from '@/lib/mock-data';
import { updateApprovalStatus } from '@/lib/airtable';
import { getApprovalItemsEfficient } from '@/lib/efficient-airtable';

// Configure for Netlify deployment
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Fallback implementation for getApprovalItems if the imported one doesn't work
const fallbackGetApprovalItems = (
  type: string,
  userId?: string | null,
  userRole?: string | null,
  clientIds?: string[] | null,
  page: number = 1,
  pageSize: number = 10
) => {
  // Determine which mock data to use based on type
  let mockItems: any[] = [];
  if (type === 'briefs') {
    mockItems = mockBriefs;
  } else if (type === 'articles') {
    mockItems = mockArticles;
  } else if (type === 'backlinks') {
    mockItems = mockBacklinks;
  }

  // Filter by client if needed
  if (userRole === 'Client' && clientIds && clientIds.length > 0) {
    mockItems = mockItems.filter(item => {
      if (item.Client) {
        if (Array.isArray(item.Client)) {
          return item.Client.some((client: string) => clientIds.includes(client));
        } else {
          return clientIds.includes(item.Client);
        }
      }
      return false;
    });
  }

  // Calculate pagination
  const totalItems = mockItems.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = mockItems.slice(startIndex, endIndex);

  return {
    items: paginatedItems,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      nextOffset: page < totalPages ? String(page + 1) : null,
      prevOffset: page > 1 ? String(page - 1) : null
    }
  };
};

// Fallback implementation for updateApprovalStatus if the imported one doesn't work
const fallbackUpdateApprovalStatus = (
  type: string,
  itemId: string,
  status: string,
  revisionReason?: string
) => {
  // Find the item in the appropriate mock data
  let mockItem: any = null;
  if (type === 'briefs') {
    mockItem = mockBriefs.find(item => item.id === itemId);
    if (mockItem) {
      mockItem.Status = status;
      if (revisionReason) {
        mockItem.RevisionReason = revisionReason;
      }
    }
  } else if (type === 'articles') {
    mockItem = mockArticles.find(item => item.id === itemId);
    if (mockItem) {
      mockItem.Status = status;
      if (revisionReason) {
        mockItem.RevisionReason = revisionReason;
      }
    }
  } else if (type === 'backlinks') {
    mockItem = mockBacklinks.find(item => item.id === itemId);
    if (mockItem) {
      mockItem.Status = status;
      if (revisionReason) {
        mockItem.RevisionReason = revisionReason;
      }
    }
  }

  return mockItem;
};

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

    // Get client ID from query parameters
    const clientIdParam = searchParams.get('clientId');

    // Get user information from the request
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    const userClient = request.headers.get('x-user-client');

    // Use client ID from query parameters if available, otherwise use client ID from headers
    let clientId = clientIdParam;
    if (!clientId && userClient) {
      try {
        const clientIds = JSON.parse(userClient);
        clientId = clientIds && clientIds.length > 0 ? clientIds[0] : null;
      } catch (e) {
        console.error('Error parsing client ID from headers:', e);
      }
    }

    // If clientId is null or undefined, set it to 'all'
    if (!clientId) {
      clientId = 'all';
    }

    console.log('Using client ID:', clientId);

    console.log('User ID:', userId);
    console.log('User Role:', userRole);
    console.log('User Client:', userClient);
    console.log('Approval Type:', type);
    console.log('Page:', page, 'Page Size:', pageSize, 'Offset:', offset);

    // Use our new efficient Airtable integration
    try {
      console.log('Using efficient Airtable integration...');

      const result = await getApprovalItemsEfficient(
        type as any,
        page,
        pageSize,
        offset,
        clientId || undefined
      );

      console.log(`API route: Found ${result.items.length} ${type} approval items (page ${page})`);
      return NextResponse.json(result);
    } catch (airtableError) {
      console.error('Error fetching from Airtable:', airtableError);

      // Fall back to mock data if Airtable fails
      console.log('Falling back to mock data due to Airtable error');
      const result = fallbackGetApprovalItems(type, userId, userRole, userClient ? JSON.parse(userClient) : [], page, pageSize);
      console.log(`API route: Found ${result.items.length} ${type} approval items using fallback (page ${page} of ${result.pagination.totalPages})`);
      return NextResponse.json(result);
    }
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

    try {
      // Try to use the imported function
      const updatedItem = await updateApprovalStatus(type as any, itemId, status, revisionReason);
      return NextResponse.json({ updatedItem });
    } catch (functionError) {
      console.error('Error using imported updateApprovalStatus function:', functionError);
      console.log('Falling back to local implementation');

      // Use the fallback implementation
      const updatedItem = fallbackUpdateApprovalStatus(type, itemId, status, revisionReason);
      return NextResponse.json({ updatedItem });
    }
  } catch (error) {
    console.error('Error updating approval status:', error);
    return NextResponse.json({ error: 'Failed to update approval status' }, { status: 500 });
  }
}
