import { NextRequest, NextResponse } from 'next/server';
import { mockBriefs, mockArticles, mockBacklinks } from '@/lib/mock-data';
import { updateApprovalStatus } from '@/lib/airtable';
import { getApprovalItems } from '@/lib/efficient-airtable';

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
      // Check Clients field only
      if (item['Clients']) {
        if (Array.isArray(item['Clients'])) {
          return item['Clients'].some((client: string) => clientIds.includes(client));
        } else {
          return clientIds.includes(item['Clients']);
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
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const clientId = searchParams.get('clientId');
    const status = searchParams.get('status');

    // IMPORTANT: Add validation for clientId to ensure we don't return wrong data
    if (clientId && clientId !== 'all') {
      console.log(`API route: Filtering by client ID: ${clientId}`);
    } else {
      console.log(`API route: No specific client filtering (all clients)`);
    }

    // Check if this is a cache clearing request
    const clearCache = searchParams.get('clearCache') === 'true';
    if (clearCache) {
      console.log(`API route: Clearing cache for ${type || 'all types'}`);
      
      // Import the cache clearing functions
      const { clearCache: clearAllCache, clearCacheForType, clearFullDatasetCache } = require('@/lib/efficient-airtable');
      
      if (type) {
        // Clear cache for a specific type
        console.log(`API route: Clearing cache for ${type}`);
        await clearCacheForType(type);
        
        // Also clear full dataset cache
        console.log(`API route: Clearing full dataset cache`);
        await clearFullDatasetCache();
      } else {
        // Clear all cache
        console.log(`API route: Clearing all cache`);
        await clearAllCache();
      }
      
      console.log(`API route: Cache cleared for ${type || 'all types'}`);
      
      return NextResponse.json({ success: true, message: `Cache cleared for ${type || 'all types'}` });
    }

    // Import the getApprovalItems function
    const { getApprovalItems } = require('@/lib/efficient-airtable');

    // Call getApprovalItems with query parameters
    console.log(`API route: Fetching ${type} approval items (page ${page}, pageSize ${pageSize})`);
    if (clientId) {
      console.log(`API route: Filtering by client ID: ${clientId}`);
    }
    if (status) {
      console.log(`API route: Filtering by status: ${status}`);
    }

    // IMPORTANT: Always pass clientId even if it's null to ensure proper filtering
    const approvalItems = await getApprovalItems(
      type,
      page,
      pageSize,
      clientId,
      status,
      false, // skipCache
      false  // fullDataset
    );

    // If no items were found, return empty array
    if (!approvalItems || !approvalItems.items) {
      console.log(`API route: No ${type} approval items found`);
      return NextResponse.json({ items: [], pagination: { currentPage: page, totalPages: 0, totalItems: 0 } });
    }

    // Verify client filtering in the response for debugging
    if (clientId && clientId !== 'all' && approvalItems.items.length > 0) {
      const sampleSize = Math.min(approvalItems.items.length, 3);
      console.log(`API route: Client filtering validation - checking ${sampleSize} items:`);
      
      for (let i = 0; i < sampleSize; i++) {
        const item = approvalItems.items[i];
        console.log(`- Item ${i+1} (${item.id}) client fields:`, {
          clients: item.clients,
          clientRecordId: item.clientRecordId
        });
      }
    }

    console.log(`API route: Found ${approvalItems.items.length} ${type} approval items`);
    return NextResponse.json(approvalItems);
  } catch (error) {
    console.error('API route: Error fetching approval items:', error);
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
