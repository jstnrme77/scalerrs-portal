import Airtable from 'airtable';
import { mockBriefs, mockArticles, mockKeywordPerformance, mockBacklinks } from './mock-data';

// Check if we have the required API keys
const apiKey = process.env.AIRTABLE_API_KEY || process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;

// Table names
const TABLES = {
  KEYWORDS: 'Keywords',
  BACKLINKS: 'Backlinks',
  ARTICLES: 'Keywords',
  BRIEFS: 'Keywords'
};

// Log available tables for debugging
console.log('Available tables:', TABLES);

// Initialize Airtable with API key if available
let base: any;

if (apiKey && baseId) {
  const airtable = new Airtable({ apiKey });
  base = airtable.base(baseId);
}

// Utility function to create a filter formula for linked record fields
function createLinkedRecordFilter(fieldName: string, recordId: string): string {
  // Create a formula that's more reliable with Airtable's API for linked records
  // This checks for exact matches in the linked record field in multiple formats
  return `OR(
    FIND("${recordId},", ARRAYJOIN({${fieldName}}, ",")) > 0,
    FIND(",${recordId},", ARRAYJOIN({${fieldName}}, ",")) > 0,
    FIND(",${recordId}", ARRAYJOIN({${fieldName}}, ",")) > 0,
    FIND("${recordId}", ARRAYJOIN({${fieldName}}, ",")) = 1,
    {${fieldName}} = "${recordId}"
  )`;
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
    } else if (type === 'articles') {
      tableName = TABLES.ARTICLES;
      console.log(`Using Articles table for articles`);
    } else if (type === 'briefs') {
      tableName = TABLES.BRIEFS;
      console.log(`Using Briefs table for briefs`);
    } else {
      // Default to Keywords table for keywords and any other types
      tableName = TABLES.KEYWORDS;
      console.log(`Using Keywords table for ${type}`);
    }

    console.log(`Selected table for ${type}: ${tableName}`);

    // Check if we have a valid cache entry for the full dataset
    let allRecords: any[] = [];
    
    // Create a special cache key for fallback queries (without client filter)
    // This lets us reuse these results when switching between clients
    const fallbackCacheKey = `approvals_${type}_fallback_dataset`;

    if (cache[fullDatasetCacheKey] && now - cache[fullDatasetCacheKey].timestamp < cache[fullDatasetCacheKey].expiresIn) {
      console.log(`Using cached full dataset for ${type}`);
      allRecords = cache[fullDatasetCacheKey].data;
    } 
    // Check if we have a valid cache entry for the fallback dataset
    // This is useful when switching between clients - we can reuse the fallback dataset
    else if (clientId && clientId !== 'all' && cache[fallbackCacheKey] && 
             now - cache[fallbackCacheKey].timestamp < cache[fallbackCacheKey].expiresIn) {
      console.log(`Using cached fallback dataset for ${type}`);
      allRecords = cache[fallbackCacheKey].data;
      // Mark that we're using the fallback dataset
      console.log(`Using fallback dataset for client filtering, will filter ${allRecords.length} records client-side`);
    }
    else {
      console.log(`Fetching all ${type} records from Airtable...`);

      // Prepare query options for fetching all records
      const queryOptions: Record<string, any> = {
        // Use a larger page size to reduce the number of API calls
        pageSize: 100 // Maximum allowed by Airtable
      };

      // Apply specific filters based on the dedicated approval fields
      // Only use the filter that's relevant for the current table type
      let filterFormula = '';
      
      try {
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
          
          // If filtering fails, try a simple query without client filter
          if (clientId && clientId !== 'all') {
            console.log('Trying again with a permission-friendly approach...');
            
            // Create a simpler query without any complex filters
            // This approach works even with limited API permissions
            const simpleQueryOptions: Record<string, any> = { 
              // Only fetch essential fields to reduce data transfer - specific to each table type
              fields: [
                // Common identifying fields for all tables
                'Main Keyword', 'Keyword', 'Title', 'Name', 'Domain', 'Domain URL', 'Source Domain',
                // Client fields - include all possible variations to ensure proper filtering
                'Clients', 'Client', 'clients', 'client',
                // Status fields
                'Status', 'Keyword/Content Status',
                // Metadata fields
                'Created Time', 'Last Updated', 'Last Modified',
                
                // Add content type specific fields and approval fields
                ...(type === 'keywords' ? [
                  'Keyword Approvals', // Only include keyword approvals for keywords table
                  'Search Volume', 'Volume', 'Main Keyword VOL', 'Difficulty', 'Keyword Difficulty'
                ] : []),
                
                ...(type === 'briefs' ? [
                  'Brief Approvals', // Only include brief approvals for briefs table
                  'SEO Assignee', 'SEO Strategist', 'Assignee', 'Due Date'
                ] : []),
                
                ...(type === 'articles' ? [
                  'Article Approvals', // Only include article approvals for articles table
                  'Final Word Count', 'Word Count', 'Due Date'
                ] : []),
                
                ...(type === 'backlinks' ? [
                  'Backlink Approvals', // Only include backlink approvals for backlinks table
                  'Domain Authority/Rating', 'DR ( API )', 'Link Type', 'Target URL', 'Went Live On', 'Notes'
                ] : [])
              ],
              // Use a larger page size for efficiency
              pageSize: 100
            };
            
            // Use a very simple content type filter only - this has the highest chance of working
            // with limited permissions - only for the current table type
            let contentTypeFilter = '';
            if (type === 'briefs') {
              contentTypeFilter = `NOT({Brief Approvals} = '')`;
            } else if (type === 'articles') {
              contentTypeFilter = `NOT({Article Approvals} = '')`;
            } else if (type === 'keywords') {
              contentTypeFilter = `NOT({Keyword Approvals} = '')`;
            } else if (type === 'backlinks') {
              contentTypeFilter = `NOT({Backlink Approvals} = '')`;
            }
            
            // Set the filter formula
            simpleQueryOptions.filterByFormula = contentTypeFilter;
            
            try {
              console.log(`Using permission-friendly approach with simple filter: ${contentTypeFilter}`);
              
              // Create the query with minimal filtering
              const simpleQuery = base(tableName).select(simpleQueryOptions);
              
              // Fetch all records
              allRecords = await simpleQuery.all();
              console.log(`Successfully fetched ${allRecords.length} records with permission-friendly approach.`);
              
              // Cache the results with a shorter expiration time
              cache[fullDatasetCacheKey] = {
                data: allRecords,
                timestamp: now,
                expiresIn: cacheTime / 2 // Cache for half the normal time since this is a fallback
              };
              
              console.log(`Cached ${allRecords.length} records in full dataset cache (shorter expiration)`);
              console.log(`Will filter by client ID: ${clientId} on the client side`);
            } catch (permissionError) {
              console.error('Permission-friendly approach also failed:', permissionError);
              
              // If even the simplest approach fails, we have to return an empty result
              console.log('All approaches failed due to permission issues. Returning empty result set.');
              allRecords = [];
            }
          }
        }
      } catch (filterError) {
        console.error('Error constructing filter formula:', filterError);
        // Use a simple filter if there was an error with the complex one
        if (type === 'briefs') {
          filterFormula = `NOT({Brief Approvals} = '')`;
        } else if (type === 'articles') {
          filterFormula = `NOT({Article Approvals} = '')`;
        } else if (type === 'keywords') {
          filterFormula = `NOT({Keyword Approvals} = '')`;
        } else if (type === 'backlinks') {
          filterFormula = `NOT({Backlink Approvals} = '')`;
        }
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
        try {
          allRecords = await query.all();
          console.log(`Successfully fetched all ${allRecords.length} records for ${type}`);
        } catch (queryError) {
          console.error(`Error fetching records with filter: ${queryError}`);
          
          // If filtering fails, try a simple query without client filter
          if (clientId && clientId !== 'all') {
            console.log('Trying again with a permission-friendly approach...');
            
            // Create a simpler query without any complex filters
            // This approach works even with limited API permissions
            const simpleQueryOptions: Record<string, any> = { 
              // Only fetch essential fields to reduce data transfer - specific to each table type
              fields: [
                // Common identifying fields for all tables
                'Main Keyword', 'Keyword', 'Title', 'Name', 'Domain', 'Domain URL', 'Source Domain',
                // Client fields - include all possible variations to ensure proper filtering
                'Clients', 'Client', 'clients', 'client',
                // Status fields
                'Status', 'Keyword/Content Status',
                // Metadata fields
                'Created Time', 'Last Updated', 'Last Modified',
                
                // Add content type specific fields and approval fields
                ...(type === 'keywords' ? [
                  'Keyword Approvals', // Only include keyword approvals for keywords table
                  'Search Volume', 'Volume', 'Main Keyword VOL', 'Difficulty', 'Keyword Difficulty'
                ] : []),
                
                ...(type === 'briefs' ? [
                  'Brief Approvals', // Only include brief approvals for briefs table
                  'SEO Assignee', 'SEO Strategist', 'Assignee', 'Due Date'
                ] : []),
                
                ...(type === 'articles' ? [
                  'Article Approvals', // Only include article approvals for articles table
                  'Final Word Count', 'Word Count', 'Due Date'
                ] : []),
                
                ...(type === 'backlinks' ? [
                  'Backlink Approvals', // Only include backlink approvals for backlinks table
                  'Domain Authority/Rating', 'DR ( API )', 'Link Type', 'Target URL', 'Went Live On', 'Notes'
                ] : [])
              ],
              // Use a larger page size for efficiency
              pageSize: 100
            };
            
            // Use a very simple content type filter only - this has the highest chance of working
            // with limited permissions - only for the current table type
            let contentTypeFilter = '';
            if (type === 'briefs') {
              contentTypeFilter = `NOT({Brief Approvals} = '')`;
            } else if (type === 'articles') {
              contentTypeFilter = `NOT({Article Approvals} = '')`;
            } else if (type === 'keywords') {
              contentTypeFilter = `NOT({Keyword Approvals} = '')`;
            } else if (type === 'backlinks') {
              contentTypeFilter = `NOT({Backlink Approvals} = '')`;
            }
            
            // Set the filter formula
            simpleQueryOptions.filterByFormula = contentTypeFilter;
            
            try {
              console.log(`Using permission-friendly approach with simple filter: ${contentTypeFilter}`);
              
              // Create the query with minimal filtering
              const simpleQuery = base(tableName).select(simpleQueryOptions);
              
              // Fetch all records
              allRecords = await simpleQuery.all();
              console.log(`Successfully fetched ${allRecords.length} records with permission-friendly approach.`);
              
              // Cache the results with a shorter expiration time
              cache[fullDatasetCacheKey] = {
                data: allRecords,
                timestamp: now,
                expiresIn: cacheTime / 2 // Cache for half the normal time since this is a fallback
              };
              
              console.log(`Cached ${allRecords.length} records in full dataset cache (shorter expiration)`);
              console.log(`Will filter by client ID: ${clientId} on the client side`);
            } catch (permissionError) {
              console.error('Permission-friendly approach also failed:', permissionError);
              
              // If even the simplest approach fails, we have to return an empty result
              console.log('All approaches failed due to permission issues. Returning empty result set.');
              allRecords = [];
            }
          } else {
            // If not filtering by client or second attempt also failed, re-throw
            throw queryError;
          }
        }

        // If we're filtering by client but got zero results, try a simpler query as fallback
        if (clientId && clientId !== 'all' && allRecords.length === 0) {
          console.log(`No records found with client filter. Trying fallback query for ${type}...`);
          
          // Create a simpler query without client filter to get at least some results
          const fallbackQuery = base(tableName).select({
            filterByFormula: filterFormula.split('AND(')[0].replace(',', '')  // Just keep the content type filter
          });
          
          // Fetch all records
          const fallbackRecords = await fallbackQuery.all();
          console.log(`Fallback query returned ${fallbackRecords.length} records. Will filter by client on client side.`);
          
          // Use these records and rely on client-side filtering
          allRecords = fallbackRecords;
        }

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

      // Debug client fields if filtering by client
      if (clientId && clientId !== 'all') {
        console.log('\n--- DEBUGGING CLIENT FIELDS ---');
        const recordsWithClient = allRecords.filter(r => 
          r.fields['Clients'] || r.fields['Client']
        );
        
        console.log(`Records with client fields: ${recordsWithClient.length} out of ${allRecords.length}`);
        
        if (recordsWithClient.length > 0) {
          const sampleRecord = recordsWithClient[0];
          console.log('Sample record client fields:');
          console.log('- Clients field:', sampleRecord.fields['Clients']);
          console.log('- Client field:', sampleRecord.fields['Client']);
          
          // Try to detect the correct field structure
          if (sampleRecord.fields['Clients']) {
            if (Array.isArray(sampleRecord.fields['Clients'])) {
              console.log('Clients field is an array with structure:', 
                JSON.stringify(sampleRecord.fields['Clients']).substring(0, 200));
            } else {
              console.log('Clients field is not an array, type:', typeof sampleRecord.fields['Clients']);
            }
          }
          
          if (sampleRecord.fields['Client']) {
            if (Array.isArray(sampleRecord.fields['Client'])) {
              console.log('Client field is an array with structure:', 
                JSON.stringify(sampleRecord.fields['Client']).substring(0, 200));
            } else {
              console.log('Client field is not an array, type:', typeof sampleRecord.fields['Client']);
            }
          }
        }
        console.log('--- END DEBUGGING CLIENT FIELDS ---\n');
      }

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

      // Debug client fields for the first few records
      if (clientId && clientId !== 'all' && allRecords.indexOf(record) < 5) {
        console.log(`Record ${record.id} - Clients field:`, fields['Clients']);
        if (fields['Clients']) {
          if (Array.isArray(fields['Clients'])) {
            console.log(`  Clients is an array with ${fields['Clients'].length} items`);
            if (fields['Clients'].length > 0) {
              console.log(`  First client item:`, fields['Clients'][0]);
            }
          } else {
            console.log(`  Clients is not an array:`, typeof fields['Clients']);
          }
        }
      }

      // Use the new dedicated approval fields
      let rawStatus = 'awaiting_approval';
      let contentType = type; // Default to the requested type

      // ONLY use the dedicated approval fields to determine content type
      // This ensures strict separation between tabs
      // Only check for fields that should exist in the current table type
      if (type === 'keywords' && fields['Keyword Approvals'] && fields['Keyword Approvals'].trim() !== '') {
        rawStatus = fields['Keyword Approvals'];
        contentType = 'keywords';
        console.log(`Record ${record.id} assigned to keywords tab based on Keyword Approvals field: "${rawStatus}"`);
      } else if (type === 'briefs' && fields['Brief Approvals'] && fields['Brief Approvals'].trim() !== '') {
        rawStatus = fields['Brief Approvals'];
        contentType = 'briefs';
        console.log(`Record ${record.id} assigned to briefs tab based on Brief Approvals field: "${rawStatus}"`);
      } else if (type === 'articles' && fields['Article Approvals'] && fields['Article Approvals'].trim() !== '') {
        rawStatus = fields['Article Approvals'];
        contentType = 'articles';
        console.log(`Record ${record.id} assigned to articles tab based on Article Approvals field: "${rawStatus}"`);
      } else if (type === 'backlinks' && fields['Backlink Approvals'] && fields['Backlink Approvals'].trim() !== '') {
        rawStatus = fields['Backlink Approvals'];
        contentType = 'backlinks';
        console.log(`Record ${record.id} assigned to backlinks tab based on Backlink Approvals field: "${rawStatus}"`);
      } else {
        // If the dedicated approval field for this type doesn't have a value, don't assign to any tab
        // This record won't appear in any tab
        contentType = type; // Keep the requested type but we'll filter it out later
        rawStatus = fields['Approval Status'] || fields['Status'] || fields['Keyword/Content Status'] || 'awaiting_approval';
        console.log(`Record ${record.id} not assigned to any tab (no dedicated approval field for ${type})`);
      }

      // Normalize the status to match our UI status values
      const normalizedStatus = normalizeStatus(rawStatus);

      // Get the original approval status for debugging - only for the current type
      let keywordApproval = '';
      let briefApproval = '';
      let articleApproval = '';
      let backlinksApproval = '';
      
      // Only set the approval field that corresponds to the current type
      if (type === 'keywords') {
        keywordApproval = fields['Keyword Approvals'] || '';
      } else if (type === 'briefs') {
        briefApproval = fields['Brief Approvals'] || '';
      } else if (type === 'articles') {
        articleApproval = fields['Article Approvals'] || '';
      } else if (type === 'backlinks') {
        backlinksApproval = fields['Backlink Approvals'] || '';
      }
      
      const originalStatus = fields['Keyword/Content Status'] || fields['Status'] || '';

      // Map the client field correctly
      let client = null;
      
      // Check for client fields in various formats and capitalization
      if (fields['Clients'] && Array.isArray(fields['Clients'])) {
        client = fields['Clients'];
      } else if (fields['Client'] && Array.isArray(fields['Client'])) {
        client = fields['Client'];
      } else if (fields['clients'] && Array.isArray(fields['clients'])) {
        client = fields['clients'];
      } else if (fields['client'] && Array.isArray(fields['client'])) {
        client = fields['client'];
      } 
      // Handle string values
      else if (fields['Clients'] && typeof fields['Clients'] === 'string') {
        client = [fields['Clients']];
      } else if (fields['Client'] && typeof fields['Client'] === 'string') {
        client = [fields['Client']];
      } else if (fields['clients'] && typeof fields['clients'] === 'string') {
        client = [fields['clients']];
      } else if (fields['client'] && typeof fields['client'] === 'string') {
        client = [fields['client']];
      }
      // Handle object values with id property
      else if (fields['Clients'] && typeof fields['Clients'] === 'object') {
        client = [fields['Clients']];
      } else if (fields['Client'] && typeof fields['Client'] === 'object') {
        client = [fields['Client']];
      } else if (fields['clients'] && typeof fields['clients'] === 'object') {
        client = [fields['clients']];
      } else if (fields['client'] && typeof fields['client'] === 'object') {
        client = [fields['client']];
      }

      // Create the item object with all necessary fields
      const item = {
        id: record.id,
        item: fields['Main Keyword'] || fields['Keyword'] || fields['Title'] || fields['Name'] || fields['Domain'] || fields['Domain URL'] || fields['Source Domain'] || 'Unnamed Item',
        status: normalizedStatus,
        dateSubmitted: fields['Created Time'] || null,
        lastUpdated: fields['Last Updated'] || fields['Last Modified'] || null,
        strategist: fields['SEO Assignee'] || fields['SEO Strategist'] || fields['Assignee'] || null,
        client: client, // Use the mapped client field
        contentType: contentType as 'keywords' | 'briefs' | 'articles' | 'backlinks',
        originalStatus: rawStatus,
        keywordApproval: keywordApproval,
        briefApproval: briefApproval,
        articleApproval: articleApproval,
        backlinksApproval: backlinksApproval,
        // Include the raw fields for client-side filtering
        fields: fields
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
      // First check if the item's contentType matches the requested type
      if (item.contentType !== type) {
        return false;
      }

      // Additional check to ensure the item has the appropriate approval field based on the content type
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

    // Filter by client ID if needed (client-side filtering)
    // Always apply client-side filtering if we have a client ID
    if (clientId && clientId !== 'all' && items.length > 0) {
      console.log(`Applying client-side filtering for ${items.length} items by client ID: ${clientId}`);
      
      // Client-side filtering for the client ID - optimize for performance
      const filteredItems = items.filter(item => {
        // Cast item to any to avoid TypeScript errors with dynamic properties
        const itemAny = item as any;
        
        // Check all possible client field variations
        // 1. Check the standard client field
        if (itemAny.client) {
          const clientField = itemAny.client;
          
          // Handle array of client IDs
          if (Array.isArray(clientField)) {
            for (const entry of clientField) {
              // Handle string IDs
              if (typeof entry === 'string' && entry === clientId) {
                return true;
              }
              // Handle object IDs with id property
              if (entry && typeof entry === 'object' && 'id' in entry && entry.id === clientId) {
                return true;
              }
            }
          }
          // Handle string client ID
          else if (typeof clientField === 'string' && clientField === clientId) {
            return true;
          }
          // Handle object with id property
          else if (clientField && typeof clientField === 'object' && 'id' in clientField && clientField.id === clientId) {
            return true;
          }
        }
        
        // 2. Check alternative client field names that might exist in different tables
        const clientFieldNames = ['Clients', 'Client', 'clients'];
        for (const fieldName of clientFieldNames) {
          if (itemAny[fieldName]) {
            const field = itemAny[fieldName];
            
            // Handle array of client IDs
            if (Array.isArray(field)) {
              for (const entry of field) {
                // Handle string IDs
                if (typeof entry === 'string' && entry === clientId) {
                  return true;
                }
                // Handle object IDs with id property
                if (entry && typeof entry === 'object' && 'id' in entry && entry.id === clientId) {
                  return true;
                }
              }
            }
            // Handle string client ID
            else if (typeof field === 'string' && field === clientId) {
              return true;
            }
            // Handle object with id property
            else if (field && typeof field === 'object' && 'id' in field && field.id === clientId) {
              return true;
            }
          }
        }
        
        // 3. Check raw fields from Airtable
        if (itemAny.fields) {
          const fields = itemAny.fields;
          
          // Check client fields in the raw fields
          const clientFieldNames = ['Clients', 'Client', 'clients', 'client'];
          for (const fieldName of clientFieldNames) {
            if (fields[fieldName]) {
              const field = fields[fieldName];
              
              // Handle array of client IDs
              if (Array.isArray(field)) {
                for (const entry of field) {
                  // Handle string IDs
                  if (typeof entry === 'string' && entry === clientId) {
                    return true;
                  }
                  // Handle object IDs with id property
                  if (entry && typeof entry === 'object' && 'id' in entry && entry.id === clientId) {
                    return true;
                  }
                }
              }
              // Handle string client ID
              else if (typeof field === 'string' && field === clientId) {
                return true;
              }
              // Handle object with id property
              else if (field && typeof field === 'object' && 'id' in field && field.id === clientId) {
                return true;
              }
            }
          }
        }
        
        // No match found, exclude the item
        return false;
      });
      
      console.log(`After client-side filtering: ${filteredItems.length} items remaining out of ${items.length}`);
      items = filteredItems;
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
