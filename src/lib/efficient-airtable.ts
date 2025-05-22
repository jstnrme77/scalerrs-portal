import Airtable from 'airtable';
import { mockBriefs, mockArticles, mockKeywordPerformance, mockBacklinks } from './mock-data';

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
  if (!status) return 'not_started';

  // Convert to lowercase for case-insensitive comparison
  const lowercaseStatus = status.toLowerCase();

  // Map to new standardized statuses
  if (lowercaseStatus.includes('not started')) {
    return 'not_started';
  } else if (lowercaseStatus.includes('in progress')) {
    return 'in_progress';
  } else if (lowercaseStatus.includes('ready for review')) {
    return 'ready_for_review';
  } else if (lowercaseStatus.includes('awaiting') || lowercaseStatus.includes('pending')) {
    return 'awaiting_approval';
  } else if (lowercaseStatus.includes('revision') || lowercaseStatus.includes('changes')) {
    return 'revisions_needed';
  } else if (lowercaseStatus.includes('approved')) {
    return 'approved';
  } else if (lowercaseStatus.includes('published') || lowercaseStatus.includes('live')) {
    return 'published';
  }

  // Legacy status mappings for backward compatibility
  else if (lowercaseStatus.includes('resubmit')) {
    return 'resubmitted';
  } else if (lowercaseStatus.includes('needs revision')) {
    return 'needs_revision';
  } else if (lowercaseStatus.includes('rejected')) {
    return 'rejected';
  }

  // Map specific statuses that don't fit the pattern above
  else if (lowercaseStatus.includes('brief creation needed') ||
           lowercaseStatus.includes('keyword to do')) {
    return 'not_started';
  } else if (lowercaseStatus.includes('writing in progress') ||
             lowercaseStatus.includes('under internal review')) {
    return 'in_progress';
  } else if (lowercaseStatus.includes('under client review') ||
             lowercaseStatus.includes('under editor review')) {
    return 'ready_for_review';
  } else if (lowercaseStatus.includes('visual assets needed') ||
             lowercaseStatus.includes('internal linking needed')) {
    return 'revisions_needed';
  } else if (lowercaseStatus.includes('complete') ||
             lowercaseStatus.includes('ready for publication')) {
    return 'approved';
  }

  // Default to not_started if no match
  console.log(`No status match found for "${status}", defaulting to not_started`);
  return 'not_started';
}

// Function to get data from cache or fetch from Airtable
export async function getApprovalItemsEfficient(
  type: 'keywords' | 'briefs' | 'articles' | 'backlinks',
  page: number = 1,
  pageSize: number = 10,
  offset?: string,
  clientId?: string,
  cacheTime: number = 5 * 60 * 1000, // 5 minutes in milliseconds
  status?: string // Add status parameter
) {
  // Create a cache key based on the parameters including clientId and status
  // For the full dataset, we'll use a special cache key
  const clientKey = clientId ? `_client_${clientId}` : '';
  const statusKey = status ? `_status_${status}` : '';

  // Create two cache keys:
  // 1. For the full dataset (all records)
  const fullDatasetCacheKey = `approvals_${type}_full_dataset${clientKey}`;

  // 2. For the paginated response (what we return to the client)
  const paginatedCacheKey = `approvals_${type}_${page}_${pageSize}_${offset || ''}${clientKey}${statusKey}`;

  // Check if we have a valid cache entry for the paginated response
  const now = Date.now();
  if (cache[paginatedCacheKey] && now - cache[paginatedCacheKey].timestamp < cache[paginatedCacheKey].expiresIn) {
    console.log(`Using cached paginated data for ${paginatedCacheKey}`);
    return cache[paginatedCacheKey].data;
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
    } else if (type === 'backlinks') {
      mockItems = mockBacklinks;
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
    cache[paginatedCacheKey] = {
      data: response,
      timestamp: now,
      expiresIn: cacheTime
    };

    return response;
  }

  try {
    // Determine which table to use
    let tableName = '';

    // Use the appropriate table for each type
    if (type === 'backlinks') {
      tableName = TABLES.BACKLINKS;
      console.log(`Using Backlinks table for backlinks`);
    } else {
      // For other types, use the Keywords table since we're getting authorization issues
      // This is a temporary solution until we can figure out the correct permissions
      tableName = TABLES.KEYWORDS;
      console.log(`Using Keywords table for ${type} due to authorization issues`);
    }

    console.log(`Selected table for ${type}: ${tableName}`);

    // Check if we have a valid cache entry for the full dataset
    let allRecords: any[] = [];

    if (cache[fullDatasetCacheKey] && now - cache[fullDatasetCacheKey].timestamp < cache[fullDatasetCacheKey].expiresIn) {
      console.log(`Using cached full dataset for ${type}`);
      allRecords = cache[fullDatasetCacheKey].data;
    } else {
      console.log(`Fetching all ${type} records from Airtable...`);

      // Prepare query options for fetching all records
      const queryOptions: Record<string, any> = {
        // Use a larger page size to reduce the number of API calls
        pageSize: 100 // Maximum allowed by Airtable
      };

      // Apply specific filters based on the dedicated approval fields
      let filterFormula = '';
      
      if (type === 'briefs') {
        // Only show records with a value in the "Brief Approvals" field
        filterFormula = `NOT({Brief Approvals} = '')`;
        console.log('Filtering briefs by Brief Approvals field');
      } else if (type === 'articles') {
        // Only show records with a value in the "Article Approvals" field
        filterFormula = `NOT({Article Approvals} = '')`;
        console.log('Filtering articles by Article Approvals field');
      } else if (type === 'keywords') {
        // Only show records with a value in the "Keyword Approvals" field
        filterFormula = `NOT({Keyword Approvals} = '')`;
        console.log('Filtering keywords by Keyword Approvals field');
      } else if (type === 'backlinks') {
        // Only show records with a value in the "Backlink Approvals" field
        filterFormula = `NOT({Backlink Approvals} = '')`;
        console.log('Filtering backlinks by Backlink Approvals field');
      }
      
      // Add client filtering if a specific client is selected (not 'all')
      if (clientId && clientId !== 'all') {
        console.log(`Adding client filter for client ID: ${clientId}`);
        
        // Use 'Clients' field name consistently across all tables
        const clientFieldName = 'Clients';
        console.log('Using "Clients" field for all content types');
        
        // FIND() is more reliable than SEARCH() for exact matches
        const clientFilter = `FIND('${clientId}', ARRAYJOIN({${clientFieldName}}, ',')) > 0`;
        
        // Combine with existing filter if there is one
        if (filterFormula) {
          filterFormula = `AND(${filterFormula}, ${clientFilter})`;
        } else {
          filterFormula = clientFilter;
        }
        
        console.log(`Final filter formula: ${filterFormula}`);
      }
      
      // Set the filter formula if we have one
      if (filterFormula) {
        queryOptions.filterByFormula = filterFormula;
      }

      console.log(`Fetching ${type} from Airtable with options:`, queryOptions);

      // Create the query
      const query = base(tableName).select(queryOptions);

      // Fetch all records using pagination
      try {
        console.log(`Starting to fetch all records for ${type}...`);

        // Use the all() method to fetch all records with automatic pagination
        allRecords = await query.all();

        console.log(`Successfully fetched all ${allRecords.length} records for ${type}`);

        // Cache the full dataset
        cache[fullDatasetCacheKey] = {
          data: allRecords,
          timestamp: now,
          expiresIn: cacheTime
        };
      } catch (error) {
        console.error(`Error fetching all records for ${type}:`, error);
        // Return default response on error
        return defaultResponse;
      }
    }

    // Log information about the fetched records
    if (allRecords.length > 0) {
      console.log(`Working with ${allRecords.length} records for ${type}`);
      console.log('Sample record fields:', allRecords[0].fields);

      // Count records with each approval field
      const keywordApprovalCount = allRecords.filter(r => r.fields['Keyword Approvals'] && r.fields['Keyword Approvals'].trim() !== '').length;
      const briefApprovalCount = allRecords.filter(r => r.fields['Brief Approvals'] && r.fields['Brief Approvals'].trim() !== '').length;
      const articleApprovalCount = allRecords.filter(r => r.fields['Article Approvals'] && r.fields['Article Approvals'].trim() !== '').length;
      const backlinksApprovalCount = allRecords.filter(r => r.fields['Backlink Approvals'] && r.fields['Backlink Approvals'].trim() !== '').length;

      console.log(`Records with Keyword Approvals: ${keywordApprovalCount}`);
      console.log(`Records with Brief Approvals: ${briefApprovalCount}`);
      console.log(`Records with Article Approvals: ${articleApprovalCount}`);
      console.log(`Records with Backlink Approvals: ${backlinksApprovalCount}`);

      // Log the first few records with each approval field for debugging
      if (keywordApprovalCount > 0) {
        const sampleKeyword = allRecords.find(r => r.fields['Keyword Approvals'] && r.fields['Keyword Approvals'].trim() !== '');
        console.log('Sample Keyword Approvals record:', {
          id: sampleKeyword.id,
          keywordApproval: sampleKeyword.fields['Keyword Approvals'],
          mainKeyword: sampleKeyword.fields['Main Keyword'] || sampleKeyword.fields['Keyword'] || 'N/A'
        });
      }

      if (briefApprovalCount > 0) {
        const sampleBrief = allRecords.find(r => r.fields['Brief Approvals'] && r.fields['Brief Approvals'].trim() !== '');
        console.log('Sample Brief Approvals record:', {
          id: sampleBrief.id,
          briefApproval: sampleBrief.fields['Brief Approvals'],
          mainKeyword: sampleBrief.fields['Main Keyword'] || sampleBrief.fields['Keyword'] || 'N/A'
        });
      }

      if (articleApprovalCount > 0) {
        const sampleArticle = allRecords.find(r => r.fields['Article Approvals'] && r.fields['Article Approvals'].trim() !== '');
        console.log('Sample Article Approvals record:', {
          id: sampleArticle.id,
          articleApproval: sampleArticle.fields['Article Approvals'],
          title: sampleArticle.fields['Title'] || sampleArticle.fields['Main Keyword'] || 'N/A'
        });
      }

      if (backlinksApprovalCount > 0) {
        const sampleBacklink = allRecords.find(r => r.fields['Backlink Approvals'] && r.fields['Backlink Approvals'].trim() !== '');
        console.log('Sample Backlink Approvals record:', {
          id: sampleBacklink.id,
          backlinksApproval: sampleBacklink.fields['Backlink Approvals'],
          domain: sampleBacklink.fields['Domain'] || sampleBacklink.fields['Domain URL'] || sampleBacklink.fields['Source Domain'] || 'N/A'
        });
      }
    } else {
      console.log('No records found in the dataset');
      return defaultResponse;
    }

    // Map the records to our expected format
    let items = allRecords.map((record: any) => {
      const fields = record.fields;

      // Use the new dedicated approval fields
      let rawStatus = 'awaiting_approval';
      let contentType = type; // Default to the requested type

      // ONLY use the dedicated approval fields to determine content type
      // This ensures strict separation between tabs
      if (fields['Keyword Approvals'] && fields['Keyword Approvals'].trim() !== '') {
        rawStatus = fields['Keyword Approvals'];
        contentType = 'keywords';
        console.log(`Record ${record.id} assigned to keywords tab based on Keyword Approvals field: "${rawStatus}"`);
      } else if (fields['Brief Approvals'] && fields['Brief Approvals'].trim() !== '') {
        rawStatus = fields['Brief Approvals'];
        contentType = 'briefs';
        console.log(`Record ${record.id} assigned to briefs tab based on Brief Approvals field: "${rawStatus}"`);
      } else if (fields['Article Approvals'] && fields['Article Approvals'].trim() !== '') {
        rawStatus = fields['Article Approvals'];
        contentType = 'articles';
        console.log(`Record ${record.id} assigned to articles tab based on Article Approvals field: "${rawStatus}"`);
      } else if (fields['Backlink Approvals'] && fields['Backlink Approvals'].trim() !== '') {
        rawStatus = fields['Backlink Approvals'];
        contentType = 'backlinks';
        console.log(`Record ${record.id} assigned to backlinks tab based on Backlink Approvals field: "${rawStatus}"`);
      } else {
        // If none of the dedicated approval fields have values, don't assign to any tab
        // This record won't appear in any tab
        contentType = 'keywords' as const; // Default to keywords but we'll filter it out later
        rawStatus = fields['Approval Status'] || fields['Status'] || fields['Keyword/Content Status'] || 'awaiting_approval';
        console.log(`Record ${record.id} not assigned to any tab (no dedicated approval field)`);
      }

      // Normalize the status to match our UI status values
      const normalizedStatus = normalizeStatus(rawStatus);

      // Get the original approval status for debugging
      const keywordApproval = fields['Keyword Approvals'] || '';
      const briefApproval = fields['Brief Approvals'] || '';
      const articleApproval = fields['Article Approvals'] || '';
      const backlinksApproval = fields['Backlink Approvals'] || '';
      const originalStatus = fields['Keyword/Content Status'] || fields['Status'] || '';

      // Get client field values for debugging
      const clientsField = fields['Clients'] || '';
      console.log(`Record ${record.id} client fields:`, { 
        'Clients': clientsField,
        contentType
      });

      // Use Clients field consistently for all content types
      const clientValue = fields['Clients'] || 'Unknown Client';
      console.log(`${type} item ${record.id} using Clients field:`, clientValue);

      const item = {
        id: record.id,
        item: fields['Main Keyword'] || fields['Keyword'] || fields['Title'] || fields['Name'] ||
              fields['Domain'] || fields['Domain URL'] || fields['Source Domain'] || 'Untitled',
        status: normalizedStatus,
        dateSubmitted: fields['Created Time'] || fields['Created'] || new Date().toISOString().split('T')[0],
        lastUpdated: fields['Last Updated'] || fields['Last Modified'] || '3 days ago',
        strategist: fields['Content Writer'] || fields['SEO Strategist'] || fields['SEO Specialist'] ||
                   fields['Assignee'] || fields['Person Responsible'] || 'Not Assigned',
        client: clientValue,
        contentType: contentType, // Add the content type
        originalStatus: originalStatus, // Keep the original status for debugging
        keywordApproval: keywordApproval, // Add the keyword approval status
        briefApproval: briefApproval, // Add the brief approval status
        articleApproval: articleApproval, // Add the article approval status
        backlinksApproval: backlinksApproval // Add the backlinks approval status
      };

      // Add type-specific fields
      if (type === 'keywords') {
        return {
          ...item,
          volume: fields['Search Volume'] || fields['Volume'] || fields['Main Keyword VOL'] || 0,
          difficulty: fields['Difficulty'] || fields['Keyword Difficulty'] || fields['Main Keyword KD'] || 'Medium'
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
      } else if (type === 'backlinks') {
        return {
          ...item,
          domainRating: fields['Domain Authority/Rating'] || fields['DR ( API )'] || fields['DomainRating'] || 0,
          linkType: fields['Link Type'] || fields['LinkType'] || 'Guest Post',
          targetPage: fields['Target URL'] || fields['Client Target Page URL'] || fields['TargetPage'] || '',
          wentLiveOn: fields['Went Live On'] || fields['WentLiveOn'] || '',
          notes: fields['Notes'] || ''
        };
      }

      return item;
    });

    // Filter items by their contentType to match the requested type
    console.log(`Filtering items by content type: ${type}`);

    // Only include items that have the correct contentType and have a value in the corresponding approval field
    items = items.filter((item: any) => {
      if (item.contentType !== type) {
        return false;
      }

      // Additional check to ensure the item has the appropriate approval field
      if (type === 'keywords' && (!item.keywordApproval || item.keywordApproval.trim() === '')) {
        console.log(`Excluding keyword item ${item.id} because Keyword Approvals field is empty`);
        return false;
      }
      if (type === 'briefs' && (!item.briefApproval || item.briefApproval.trim() === '')) {
        console.log(`Excluding brief item ${item.id} because Brief Approvals field is empty`);
        return false;
      }
      if (type === 'articles' && (!item.articleApproval || item.articleApproval.trim() === '')) {
        console.log(`Excluding article item ${item.id} because Article Approvals field is empty`);
        return false;
      }
      if (type === 'backlinks' && (!item.backlinksApproval || item.backlinksApproval.trim() === '')) {
        console.log(`Excluding backlink item ${item.id} because Backlink Approvals field is empty`);
        return false;
      }

      // Filter by status if provided
      if (status) {
        // Convert both to the same format for comparison
        const normalizedItemStatus = normalizeStatus(item.status);
        const normalizedRequestedStatus = status;

        if (normalizedItemStatus !== normalizedRequestedStatus) {
          console.log(`Excluding item ${item.id} because status ${item.status} (normalized: ${normalizedItemStatus}) doesn't match requested status ${status} (normalized: ${normalizedRequestedStatus})`);
          return false;
        }
      }

      return true;
    });

    console.log(`After filtering by content type and approval fields, found ${items.length} items for type ${type}`);

    // Additional client-side filtering for items that might have slipped through the server-side filter
    if (clientId && clientId !== 'all') {
      console.log(`Performing additional client-side filtering for client: ${clientId}`);
      
      items = items.filter((item: any) => {
        // Check the Clients field for all content types
        if (item['Clients']) {
          console.log(`Checking ${type} item ${item.id} Clients:`, item['Clients']);
          if (Array.isArray(item['Clients'])) {
            const includes = item['Clients'].includes(clientId);
            console.log(`${type} ${item.id} Clients array includes ${clientId}:`, includes);
            return includes;
          } else if (typeof item['Clients'] === 'string') {
            const matches = item['Clients'] === clientId;
            console.log(`${type} ${item.id} Clients string matches ${clientId}:`, matches);
            return matches;
          }
        }
        
        // Fall back to client field if it exists (for backward compatibility)
        if (item.client) {
          console.log(`Checking ${type} item ${item.id} client:`, item.client);
          if (Array.isArray(item.client)) {
            const includes = item.client.includes(clientId);
            console.log(`${type} ${item.id} client array includes ${clientId}:`, includes);
            return includes;
          } else if (typeof item.client === 'string') {
            const matches = item.client === clientId;
            console.log(`${type} ${item.id} client string matches ${clientId}:`, matches);
            return matches;
          }
        }
        
        // If neither field is present or no match, return false
        console.log(`${type} ${item.id} has no client field or no match`);
        return false;
      });
      
      console.log(`After additional client filtering, found ${items.length} items for client ${clientId}`);
    }

    // Calculate pagination info based on the full dataset
    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    console.log(`Total items: ${totalItems}, Total pages: ${totalPages}, Current page: ${page}, Page size: ${pageSize}`);

    // Paginate the items in memory
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedItems = items.slice(startIndex, Math.min(endIndex, items.length));

    console.log(`Paginating items: page ${page}, showing items ${startIndex + 1}-${Math.min(endIndex, items.length)} of ${items.length}`);

    // Calculate if there are next/previous pages
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Create the response object with accurate pagination info
    const response = {
      items: paginatedItems,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        hasNextPage,
        hasPrevPage,
        nextOffset: hasNextPage ? String(page + 1) : null,
        prevOffset: hasPrevPage ? String(page - 1) : null
      }
    };

    // Cache the paginated response
    cache[paginatedCacheKey] = {
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

// Function to clear the entire cache
export function clearCache() {
  console.log('Clearing all cache entries');
  Object.keys(cache).forEach(key => delete cache[key]);
}

// Function to clear a specific cache entry
export function clearCacheEntry(key: string) {
  console.log(`Clearing cache entry: ${key}`);
  if (cache[key]) {
    delete cache[key];
  }
}

// Function to clear all cache entries for a specific type
export function clearCacheForType(type: string) {
  console.log(`Clearing all cache entries for type: ${type}`);
  Object.keys(cache).forEach(key => {
    if (key.includes(`approvals_${type}`)) {
      delete cache[key];
    }
  });
}

// Function to clear all full dataset cache entries
export function clearFullDatasetCache() {
  console.log('Clearing all full dataset cache entries');
  Object.keys(cache).forEach(key => {
    if (key.includes('_full_dataset')) {
      delete cache[key];
    }
  });
}
