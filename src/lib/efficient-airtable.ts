import Airtable from 'airtable';
import { mockBriefs, mockArticles, mockKeywordPerformance } from './mock-data';

// Check if we have the required API keys
const apiKey = process.env.AIRTABLE_API_KEY || process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;

// Table names
const TABLES = {
  KEYWORDS: 'Keywords',
  BACKLINKS: 'Backlinks',
  ARTICLES: 'Articles',
  BRIEFS: 'Briefs'
};

// Log available tables for debugging
console.log('Available tables:', TABLES);

// Initialize Airtable with API key if available
let base: any;

if (apiKey && baseId) {
  const airtable = new Airtable({ apiKey });
  base = airtable.base(baseId);
}

// Cache for Airtable data
interface CacheItem {
  data: any;
  timestamp: number;
  expiresIn: number; // milliseconds
}

const cache: Record<string, CacheItem> = {};

// Function to normalize status values from Airtable to our UI status values
function normalizeStatus(status: string): string {
  // Convert to lowercase for case-insensitive comparison
  const lowercaseStatus = status.toLowerCase();

  // Map Airtable status values to our UI status values based on your formula
  if (lowercaseStatus.includes('keywords awaiting client approval') ||
      lowercaseStatus.includes('brief awaiting client depth') ||
      lowercaseStatus.includes('brief awaiting client review') ||
      lowercaseStatus.includes('under client review') ||
      lowercaseStatus.includes('under editor review') ||
      lowercaseStatus.includes('visual assets needed') ||
      lowercaseStatus.includes('keyword to do') ||
      lowercaseStatus.includes('keyword to validate for next month') ||
      lowercaseStatus.includes('brief creation needed') ||
      lowercaseStatus.includes('awaiting writer assignment') ||
      lowercaseStatus.includes('writing in progress') ||
      lowercaseStatus.includes('on hold') ||
      lowercaseStatus.includes('awaiting approval')) {
    return 'awaiting_approval';
  } else if (lowercaseStatus.includes('brief under internal review') ||
             lowercaseStatus.includes('writer revision needed') ||
             lowercaseStatus.includes('resubmit')) {
    return 'resubmitted';
  } else if (lowercaseStatus.includes('brief needs revision') ||
             lowercaseStatus.includes('internal linking needed') ||
             lowercaseStatus.includes('reverse internal linking needed') ||
             lowercaseStatus.includes('revision') ||
             lowercaseStatus.includes('changes')) {
    return 'needs_revision';
  } else if (lowercaseStatus.includes('keywords approved') ||
             lowercaseStatus.includes('brief approved') ||
             lowercaseStatus.includes('content approved') ||
             lowercaseStatus.includes('visual assets complete') ||
             lowercaseStatus.includes('ready for cms upload') ||
             lowercaseStatus.includes('ready for publication') ||
             lowercaseStatus.includes('published') ||
             lowercaseStatus.includes('content published') ||
             lowercaseStatus.includes('complete') ||
             lowercaseStatus.includes('approved') ||
             lowercaseStatus.includes('approve')) {
    return 'approved';
  } else if (lowercaseStatus.includes('cancelled') ||
             lowercaseStatus.includes('reject')) {
    return 'rejected';
  }

  // Default to awaiting_approval if no match
  return 'awaiting_approval';
}

// Function to get data from cache or fetch from Airtable
export async function getApprovalItemsEfficient(
  type: 'keywords' | 'briefs' | 'articles' | 'backlinks',
  page: number = 1,
  pageSize: number = 10,
  offset?: string,
  clientId?: string,
  cacheTime: number = 5 * 60 * 1000 // 5 minutes in milliseconds
) {
  // Create a cache key based on the parameters including clientId
  const clientKey = clientId ? `_client_${clientId}` : '';
  const cacheKey = `approvals_${type}_${page}_${pageSize}_${offset || ''}${clientKey}`;

  // Check if we have a valid cache entry
  const now = Date.now();
  if (cache[cacheKey] && now - cache[cacheKey].timestamp < cache[cacheKey].expiresIn) {
    console.log(`Using cached data for ${cacheKey}`);
    return cache[cacheKey].data;
  }

  // Default response structure
  const defaultResponse = {
    items: [],
    pagination: {
      currentPage: page,
      totalPages: 1,
      totalItems: 0,
      hasNextPage: false,
      hasPrevPage: page > 1,
      nextOffset: null,
      prevOffset: page > 1 ? String(page - 1) : null
    }
  };

  // If no Airtable credentials, return mock data
  if (!apiKey || !baseId) {
    console.log('No Airtable credentials, using mock data');

    // Get mock data based on type
    let mockItems: any[] = [];
    if (type === 'briefs') {
      mockItems = mockBriefs;
    } else if (type === 'articles') {
      mockItems = mockArticles;
    } else if (type === 'keywords') {
      mockItems = mockKeywordPerformance;
    }

    // Apply pagination to mock data
    const totalItems = mockItems.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedItems = mockItems.slice(startIndex, endIndex);

    const response = {
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

    // Cache the response
    cache[cacheKey] = {
      data: response,
      timestamp: now,
      expiresIn: cacheTime
    };

    return response;
  }

  try {
    // Determine which table to use
    let tableName = '';

    // For all types, use the Keywords table since we're getting authorization errors
    // This is a temporary solution until we can figure out the correct permissions
    tableName = TABLES.KEYWORDS;
    console.log(`Using Keywords table for all types due to authorization issues`);

    console.log(`Selected table for ${type}: ${tableName}`);

    // Prepare query options - keep it simple to get data first
    const queryOptions: Record<string, any> = {
      // If clientId is 'all', fetch more items to ensure we have a good representation of all clients
      pageSize: clientId === 'all' ? Math.max(pageSize * 3, 30) : pageSize
    };

    // Add offset if provided
    if (offset) {
      queryOptions.offset = offset;
    }

    // Use a more inclusive filter or no filter at all to see what data is available
    console.log(`Fetching ${type} with minimal filtering to see what data is available`);

    // For debugging purposes, let's not use any filter initially
    // This will help us see what data is actually in the table
    /*
    if (type === 'briefs') {
      queryOptions.filterByFormula = `OR(SEARCH("Brief", {Approval Status}) > 0, SEARCH("brief", {Approval Status}) > 0)`;
    } else if (type === 'articles') {
      queryOptions.filterByFormula = `OR(SEARCH("Article", {Approval Status}) > 0, SEARCH("article", {Approval Status}) > 0, {Approval Status} = "In Production", {Approval Status} = "Published")`;
    } else if (type === 'keywords') {
      queryOptions.filterByFormula = `OR(SEARCH("Keyword", {Approval Status}) > 0, SEARCH("keyword", {Approval Status}) > 0, {Approval Status} = "Keyword Research")`;
    }
    */

    console.log(`Fetching ${type} from Airtable with options:`, queryOptions);

    // For now, let's not filter in Airtable and instead filter in memory
    // This is less efficient but will help us debug the issue
    console.log(`Not filtering by client in Airtable query, will filter in memory instead`);

    console.log(`Final query options:`, queryOptions);

    // Fetch only the first page of records
    const query = base(tableName).select(queryOptions);
    const result = await query.firstPage();

    // Get the offset for the next page
    const nextOffset = query.offset || null;

    console.log(`Fetched ${result.length} records for ${type}`);

    // Log the first record to see what fields are available
    if (result.length > 0) {
      console.log('Sample record fields:', result[0].fields);
    }

    // Map the records to our expected format
    let items = result.map((record: any) => {
      const fields = record.fields;

      // Use the new dedicated approval fields
      let rawStatus = 'awaiting_approval';
      let contentType = type; // Default to the requested type

      // Check for the new dedicated approval fields
      if (fields['Keyword Approval']) {
        rawStatus = fields['Keyword Approval'];
        contentType = 'keywords';
      } else if (fields['Brief Approval']) {
        rawStatus = fields['Brief Approval'];
        contentType = 'briefs';
      } else if (fields['Article Approval']) {
        rawStatus = fields['Article Approval'];
        contentType = 'articles';
      } else {
        // Fallback to the old method if the new fields aren't available
        rawStatus = fields['Approval Status'] || fields['Status'] || fields['Keyword/Content Status'] || 'awaiting_approval';

        // Get the original status for content type determination
        const originalStatus = fields['Keyword/Content Status'] || '';

        // Determine the content type based on the Keyword/Content Status
        if (originalStatus.includes('Keywords') ||
            originalStatus === 'Keyword To Do' ||
            originalStatus === 'Keyword To Validate For Next Month (By Client)' ||
            originalStatus === 'Keyword Research') {
          contentType = 'keywords';
        } else if (originalStatus.includes('Brief') ||
                 originalStatus === 'Brief Creation Needed' ||
                 originalStatus === 'Awaiting Writer Assignment') {
          contentType = 'briefs';
        } else if (originalStatus.includes('Content') ||
                 originalStatus === 'Writing In Progress' ||
                 originalStatus === 'Writer Revision Needed' ||
                 originalStatus === 'Internal Linking Needed' ||
                 originalStatus === 'Reverse Internal Linking Needed' ||
                 originalStatus === 'Visual Assets Needed' ||
                 originalStatus === 'Visual Assets Complete' ||
                 originalStatus === 'Ready for CMS Upload' ||
                 originalStatus === 'Ready for Publication' ||
                 originalStatus === 'Published' ||
                 originalStatus === 'Complete') {
          contentType = 'articles';
        }
      }

      // Normalize the status to match our UI status values
      const normalizedStatus = normalizeStatus(rawStatus);

      // Get the original approval status for debugging
      const keywordApproval = fields['Keyword Approval'] || '';
      const briefApproval = fields['Brief Approval'] || '';
      const articleApproval = fields['Article Approval'] || '';
      const originalStatus = fields['Keyword/Content Status'] || '';

      const item = {
        id: record.id,
        item: fields['Main Keyword'] || fields['Keyword'] || fields['Title'] || fields['Name'] || 'Untitled',
        status: normalizedStatus,
        dateSubmitted: fields['Created Time'] || fields['Created'] || new Date().toISOString().split('T')[0],
        lastUpdated: fields['Last Updated'] || fields['Last Modified'] || '3 days ago',
        strategist: fields['Content Writer'] || fields['SEO Strategist'] || fields['SEO Specialist'] || fields['Assignee'] || 'Not Assigned',
        client: fields['All Clients'] || fields['Client'] || 'Unknown Client',
        contentType: contentType, // Add the content type
        originalStatus: originalStatus, // Keep the original status for debugging
        keywordApproval: keywordApproval, // Add the keyword approval status
        briefApproval: briefApproval, // Add the brief approval status
        articleApproval: articleApproval // Add the article approval status
      };

      // Log the mapped item for debugging
      console.log(`Mapped ${type} item:`, item);

      // Add type-specific fields
      if (type === 'keywords') {
        return {
          ...item,
          volume: fields['Search Volume'] || fields['Volume'] || 0,
          difficulty: fields['Difficulty'] || fields['Keyword Difficulty'] || 'Medium'
        };
      } else if (type === 'briefs') {
        return {
          ...item,
          strategist: fields['SEO Assignee'] || fields['SEO Strategist'] || fields['Assignee'] || 'Not Assigned',
          dueDate: fields['Due Date (Publication)'] || fields['Due Date'] || 'No due date'
        };
      } else if (type === 'articles') {
        return {
          ...item,
          wordCount: fields['Final Word Count'] || fields['Word Count'] || 0,
          dueDate: fields['Due Date (Publication)'] || fields['Due Date'] || 'No due date'
        };
      }

      return item;
    });

    // Filter items by their contentType to match the requested type
    console.log(`Filtering items by content type: ${type}`);
    items = items.filter(item => item.contentType === type);
    console.log(`After filtering by content type, found ${items.length} items for type ${type}`);

    // Filter items by client if clientId is provided
    if (clientId) {
      // If clientId is 'all', don't filter
      if (clientId === 'all') {
        console.log('Client ID is "all", not filtering by client');
      } else {
        console.log(`Filtering items by client: ${clientId}`);

        // Filter items where the client field includes the clientId
        items = items.filter(item => {
          // Check if client is an array
          if (Array.isArray(item.client)) {
            return item.client.includes(clientId);
          }
          // Check if client is a string
          else if (typeof item.client === 'string') {
            return item.client === clientId;
          }
          // If client is neither an array nor a string, return false
          return false;
        });

        console.log(`After filtering, found ${items.length} items for client ${clientId}`);
      }
    } else {
      console.log('No client ID provided, not filtering by client');
    }

    // Calculate pagination info
    const hasNextPage = !!nextOffset;

    // For 'all' clients, we need to adjust the pagination calculation
    // to account for the larger dataset
    const adjustedPageSize = clientId === 'all' ? Math.min(pageSize, 10) : pageSize;
    const totalItems = hasNextPage ? Math.max(items.length * 5, 100) : items.length;
    const totalPages = hasNextPage
      ? Math.max(page + 1, Math.ceil(totalItems / adjustedPageSize))
      : Math.max(1, Math.ceil(items.length / adjustedPageSize));

    // For 'all' clients, we need to paginate the items in memory
    let paginatedItems = items;
    if (clientId === 'all') {
      const adjustedPageSize = Math.min(pageSize, 10);
      const startIndex = (page - 1) * adjustedPageSize;
      const endIndex = startIndex + adjustedPageSize;
      paginatedItems = items.slice(startIndex, Math.min(endIndex, items.length));

      console.log(`Paginating items for 'all' clients: page ${page}, showing items ${startIndex + 1}-${Math.min(endIndex, items.length)} of ${items.length}`);
    }

    const response = {
      items: paginatedItems,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        hasNextPage: clientId === 'all'
          ? page < totalPages
          : hasNextPage,
        hasPrevPage: page > 1,
        nextOffset,
        prevOffset: page > 1 ? String(page - 1) : null
      }
    };

    // Cache the response
    cache[cacheKey] = {
      data: response,
      timestamp: now,
      expiresIn: cacheTime
    };

    return response;
  } catch (error) {
    console.error(`Error fetching ${type} from Airtable:`, error);

    // Return default response on error
    return defaultResponse;
  }
}

// Function to clear the cache
export function clearCache() {
  Object.keys(cache).forEach(key => delete cache[key]);
}

// Function to clear a specific cache entry
export function clearCacheEntry(key: string) {
  if (cache[key]) {
    delete cache[key];
  }
}
