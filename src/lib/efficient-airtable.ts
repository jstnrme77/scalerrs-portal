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

// Utility function to create a filter formula for linked record fields
function createLinkedRecordFilter(fieldName: string, recordId: string): string {
  // Simplified formula that uses only supported Airtable functions
  // SEARCH is more reliable than FIND for this purpose
  return `OR(
    SEARCH("${recordId}", ARRAYJOIN({${fieldName}})),
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
    } else {
      // For other types, use the Keywords table since we're getting authorization issues
      // This is a temporary solution until we can figure out the correct permissions
      tableName = TABLES.KEYWORDS;
      console.log(`Using Keywords table for ${type} due to authorization issues`);
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
          
          // Only use the 'Clients' field with exact capitalization
          // The error shows that 'client' (lowercase) doesn't exist in the schema
          const clientsField = 'Clients'; // Preserve exact capitalization
          const clientsFilter = createLinkedRecordFilter(clientsField, clientId);
          
          // Combine with existing filter if there is one
          if (filterFormula) {
            filterFormula = `AND(${filterFormula}, ${clientsFilter})`;
          } else {
            filterFormula = clientsFilter;
          }
          
          console.log(`Final filter formula: ${filterFormula}`);
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
            console.log('Trying again without client filter...');
            
            // Create a simpler query without client filter
            const simpleQueryOptions: Record<string, any> = { 
              ...queryOptions,
              // Only fetch essential fields to reduce data transfer
              fields: [
                // Common identifying fields
                'Brief Approvals', 'Article Approvals', 'Keyword Approvals', 'Backlink Approvals',
                'Main Keyword', 'Keyword', 'Title', 'Name', 'Domain', 'Domain URL', 'Source Domain',
                // Client and status fields
                'Clients', 'Client', 'Status', 'Keyword/Content Status',
                // Metadata fields
                'Created Time', 'Last Updated', 'Last Modified',
                // Content-specific fields based on type
                ...(type === 'keywords' ? ['Search Volume', 'Volume', 'Main Keyword VOL', 'Difficulty', 'Keyword Difficulty'] : []),
                ...(type === 'briefs' ? ['SEO Assignee', 'SEO Strategist', 'Assignee', 'Due Date'] : []),
                ...(type === 'articles' ? ['Final Word Count', 'Word Count', 'Due Date'] : []),
                ...(type === 'backlinks' ? ['Domain Authority/Rating', 'DR ( API )', 'Link Type', 'Target URL', 'Went Live On', 'Notes'] : [])
              ]
            };
            
            // Use only the content type filter without client filter
            if (type === 'briefs') {
              simpleQueryOptions.filterByFormula = `NOT({Brief Approvals} = '')`;
            } else if (type === 'articles') {
              simpleQueryOptions.filterByFormula = `NOT({Article Approvals} = '')`;
            } else if (type === 'keywords') {
              simpleQueryOptions.filterByFormula = `NOT({Keyword Approvals} = '')`;
            } else if (type === 'backlinks') {
              simpleQueryOptions.filterByFormula = `NOT({Backlink Approvals} = '')`;
            }
            
            console.log('Optimized fallback query with field selection:', simpleQueryOptions);
            
            // Use pagination for the fallback query to improve performance
            // This fetches records in batches rather than all at once
            try {
              console.log('Using paginated approach for fallback query');
              allRecords = [];
              
              // Create the query with the optimized options
              const simpleQuery = base(tableName).select(simpleQueryOptions);
              
              // Use the eachPage method to process records in batches
              await new Promise<void>((resolve, reject) => {
                simpleQuery.eachPage(
                  (records: any[], fetchNextPage: () => void) => {
                    // Add this batch of records to our collection
                    allRecords = [...allRecords, ...records];
                    console.log(`Fetched batch of ${records.length} records, total so far: ${allRecords.length}`);
                    
                    // Check if we have enough records before continuing
                    // This is an early exit optimization - if we already have enough records
                    // for the current request, we can stop fetching more
                    const minimumNeeded = pageSize * 5; // Get at least 5 pages worth
                    if (allRecords.length >= minimumNeeded) {
                      console.log(`Early exit: Already have ${allRecords.length} records which is enough for current view`);
                      resolve();
                      return;
                    }
                    
                    // Get the next page of records
                    fetchNextPage();
                  },
                  (err: Error | null) => {
                    if (err) {
                      console.error('Error during paginated fetch:', err);
                      reject(err);
                      return;
                    }
                    resolve();
                  }
                );
              });
              
              console.log(`Successfully fetched ${allRecords.length} records with paginated approach. Will filter client-side.`);
              
              // Cache the fallback dataset
              cache[fallbackCacheKey] = {
                data: allRecords,
                timestamp: now,
                expiresIn: cacheTime
              };
              console.log(`Cached ${allRecords.length} records in fallback dataset cache`);
            } catch (paginationError) {
              console.error('Pagination approach failed, falling back to all() method:', paginationError);
              
              // If pagination fails, try the simpler all() method as last resort
              const simpleQuery = base(tableName).select(simpleQueryOptions);
              allRecords = await simpleQuery.all();
              console.log(`Successfully fetched ${allRecords.length} records with all() method. Will filter client-side.`);
              
              // Cache the fallback dataset
              cache[fallbackCacheKey] = {
                data: allRecords,
                timestamp: now,
                expiresIn: cacheTime
              };
              console.log(`Cached ${allRecords.length} records in fallback dataset cache`);
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
      
      const originalCount = items.length;
      items = items.filter((item: any) => {
        // Track if we found a match
        let hasClientMatch = false;
        
        // Check all possible client field formats
        
        // 1. Check item.client property (which we set during mapping)
        if (item.client) {
          // If it's an array of strings or objects
          if (Array.isArray(item.client)) {
            hasClientMatch = item.client.some((c: any) => {
              // Could be a string
              if (typeof c === 'string') {
                return c === clientId || c.includes(clientId);
              }
              // Could be an object with id, value, or name
              if (c && typeof c === 'object') {
                return (c.id === clientId) || 
                       (c.value === clientId) || 
                       (c.name === clientId) ||
                       // Check for ID at end of string (common Airtable format)
                       (typeof c.id === 'string' && c.id.endsWith(clientId));
              }
              return false;
            });
          } 
          // If it's a string
          else if (typeof item.client === 'string') {
            hasClientMatch = item.client === clientId || item.client.includes(clientId);
          }
          // If it's an object
          else if (item.client && typeof item.client === 'object') {
            hasClientMatch = (item.client.id === clientId) || 
                             (item.client.value === clientId) || 
                             (item.client.name === clientId) ||
                             // Check for ID at end of string (common Airtable format)
                             (typeof item.client.id === 'string' && item.client.id.endsWith(clientId));
          }
        }
        
        // 2. Also check item.fields object if available
        if (!hasClientMatch && item.fields) {
          // Check both Clients and Client fields
          ['Clients', 'Client'].forEach((fieldName: string) => {
            if (hasClientMatch) return; // Skip if we already found a match
            
            const field = item.fields[fieldName];
            if (!field) return; // Skip if field doesn't exist
            
            // If it's an array
            if (Array.isArray(field)) {
              hasClientMatch = field.some((c: any) => {
                // Could be a string
                if (typeof c === 'string') {
                  return c === clientId || c.includes(clientId);
                }
                // Could be an object
                if (c && typeof c === 'object') {
                  return (c.id === clientId) || 
                         (c.value === clientId) || 
                         (c.name === clientId) ||
                         // Check for ID at end of string (common Airtable format)
                         (typeof c.id === 'string' && c.id.endsWith(clientId));
                }
                return false;
              });
            }
            // If it's a string
            else if (typeof field === 'string') {
              hasClientMatch = field === clientId || field.includes(clientId);
            }
            // If it's an object
            else if (field && typeof field === 'object') {
              hasClientMatch = (field.id === clientId) || 
                               (field.value === clientId) || 
                               (field.name === clientId) ||
                               // Check for ID at end of string (common Airtable format)
                               (typeof field.id === 'string' && field.id.endsWith(clientId));
            }
          });
        }
        
        return hasClientMatch;
      });
      
      console.log(`After additional client filtering, found ${items.length} items for client ${clientId} (filtered out ${originalCount - items.length} items)`);
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
