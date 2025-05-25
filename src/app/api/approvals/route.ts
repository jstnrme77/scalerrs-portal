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
  userClientJson?: string | null,
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
  
  // Parse client IDs from the JSON string
  let clientIds: string[] = [];
  if (userClientJson) {
    try {
      clientIds = JSON.parse(userClientJson);
      if (!Array.isArray(clientIds)) {
        clientIds = [clientIds];
      }
    } catch (e) {
      console.error('Error parsing client IDs:', e);
    }
  }

  // Filter by client if needed
  if (userRole === 'Client' && clientIds && clientIds.length > 0) {
    mockItems = mockItems.filter(item => {
      // Check Clients field for all content types
      if (item['Clients']) {
        if (Array.isArray(item['Clients'])) {
          return item['Clients'].some((client: string) => clientIds.includes(client));
        } else {
          return clientIds.includes(item['Clients']);
        }
      }
      // Fallback to client field for backward compatibility
      else if (item.client) {
        if (Array.isArray(item.client)) {
          return item.client.some((client: string) => clientIds.includes(client));
        } else {
          return clientIds.includes(item.client);
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

    // Get status parameter
    const status = searchParams.get('status') || undefined;

    // Get client ID parameter - IMPORTANT for filtering by client
    const clientId = searchParams.get('clientId') || undefined;
    
    // Log the request parameters for debugging
    console.log(`API route: Fetching ${type} approval items (page ${page}, pageSize ${pageSize})`);
    if (clientId) {
      console.log(`API route: Filtering by client ID: ${clientId}`);
    }
    if (status) {
      console.log(`API route: Filtering by status: ${status}`);
    }

    // Import the efficient-airtable function
    const { getApprovalItemsEfficient } = require('../../../lib/efficient-airtable');

    // Use the efficient function to get approval items
    // Pass all parameters including clientId and status
    const result = await getApprovalItemsEfficient(
      type as 'briefs' | 'articles' | 'keywords' | 'backlinks',
      page,
      pageSize,
      offset,
      clientId,
      5 * 60 * 1000, // 5 minutes cache time
      status
    );

    // Log the results
    console.log(`API route: Found ${result.items.length} ${type} approval items (page ${page})`);
    if (clientId) {
      console.log(`API route: Items filtered by client ID: ${clientId}`);
    }

    // Return the results
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching approval items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch approval items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('API route: Updating approval status in Airtable');

    // Parse request body
    const body = await request.json();
    const { type, itemId, status, revisionReason } = body;

    if (!type || !itemId || !status) {
      const response = NextResponse.json(
        { error: 'Missing required fields: type, itemId, and status are required' },
        { status: 400 }
      );
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      return response;
    }

    console.log(`Updating ${type} approval status for item ${itemId} to ${status}`);

    try {
      // Try to use the imported function
      const updatedItem = await updateApprovalStatus(type as any, itemId, status, revisionReason);
      const response = NextResponse.json({ updatedItem });
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      return response;
    } catch (functionError) {
      console.error('Error using imported updateApprovalStatus function:', functionError);
      console.log('Falling back to local implementation');

      // Use the fallback implementation
      const updatedItem = fallbackUpdateApprovalStatus(type, itemId, status, revisionReason);
      const response = NextResponse.json({ updatedItem });
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      return response;
    }
  } catch (error) {
    console.error('Error updating approval status:', error);
    const response = NextResponse.json({ error: 'Failed to update approval status' }, { status: 500 });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    return response;
  }
}
