import Airtable from 'airtable';
import { mockBriefs, mockArticles, mockKeywordPerformance, mockBacklinks } from './mock-data';
import { TABLES, ALT_TABLES } from './airtable-tables';
import { formatDate } from '@/utils/field-utils';

// Check if we have the required API keys
const apiKey = process.env.AIRTABLE_API_KEY || process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;

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

// Function to get data from cache
function getCache(key: string): any | null {
  if (!cache[key]) {
    return null;
  }

  const cacheItem = cache[key];
  const now = Date.now();

  // Check if cache has expired
  if (now - cacheItem.timestamp > cacheItem.expiresIn) {
    // Cache has expired, remove it
    delete cache[key];
    return null;
  }

  return cacheItem.data;
}

// Function to set data in cache
function setCache(key: string, data: any, expiresIn: number = 5 * 60 * 1000): void {
  cache[key] = {
    data,
    timestamp: Date.now(),
    expiresIn
  };
}

// Function to get full dataset from cache
function getFullDatasetCache(key: string): any | null {
  return getCache(key);
}

// Function to set full dataset in cache
function setFullDatasetCache(key: string, data: any, expiresIn: number = 5 * 60 * 1000): void {
  setCache(key, data, expiresIn);
}

// Function to check if we have API credentials
function hasAirtableCredentials(): boolean {
  return !!(apiKey && baseId);
}

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

// Add type definition for ApprovalItem
interface ApprovalItem {
  id: string;
  item: string;
  status: string;
  lastUpdated?: string;
  clients?: string[] | string;
  clientRecordId?: string;
  strategist?: any;
  writer?: any;
  editor?: any;
  dateSubmitted?: string;
  dateApproved?: string;
  revisionReason?: string;
  documentLink?: string;
  resourceLink?: string;
  [key: string]: any; // Allow additional properties
}

// Function to format a keyword item from an Airtable record
function formatKeywordItem(record: any): ApprovalItem {
  const fields = record.fields;
  
  return {
    id: record.id,
    item: fields["Main Keyword"] || "Untitled Keyword",
    status: normalizeStatus(fields["Keyword Approvals"] || "not_started"),
    lastUpdated: formatDate(fields["Any Statuses Last Modified"], 'N/A'),
    clients: fields["Clients"] || [],
    clientRecordId: fields["Client Record ID"] || "",
    strategist: fields["SEO Assignee"] || "Unassigned",
    volume: fields["Main Keyword VOL"] || 0,
    difficulty: fields["Main Keyword KD"] || 0,
    keywordScore: fields["Target KW Score"] || 0,
    dateSubmitted: formatDate(fields["Created Time"], 'N/A'),
    dateApproved: formatDate(fields["Keyword Approval Date"], ''),
    revisionReason: fields["Revision Reason"] || "",
    documentLink: fields["Content Brief Link (G Doc)"] || "",
    currentPosition: fields["Current Position"] || "Not Ranked",
    keywordUplift: fields["Keyword Uplift"] || 0
  };
}

// Function to format a brief item from an Airtable record
function formatBriefItem(record: any): ApprovalItem {
  const fields = record.fields;
  
  return {
    id: record.id,
    item: fields["Main Keyword"] || "Untitled Brief",
    status: normalizeStatus(fields["Brief Approvals"] || "not_started"),
    lastUpdated: formatDate(fields["Any Statuses Last Modified"], 'N/A'),
    clients: fields["Clients"] || [],
    clientRecordId: fields["Client Record ID"] || "",
    strategist: fields["SEO Assignee"] || "Unassigned",
    writer: fields["Content Writer"] || "Unassigned",
    editor: fields["Content Editor"] || "Unassigned",
    volume: fields["Main Keyword VOL"] || 0,
    difficulty: fields["Main Keyword KD"] || 0,
    type: fields["Page Type ( Main )"] || "Not Specified",
    wordCount: fields["Final Word Count"] || fields["Target Word Count"] || 0,
    dateSubmitted: formatDate(fields["Created Time"], 'N/A'),
    dateApproved: formatDate(fields["Brief Approval Date"], ''),
    revisionReason: fields["Brief Revision Reason"] || "",
    documentLink: fields["Content Brief Link (G Doc)"] || fields["Brief Document Link"] || "",
    // Store the original field values for use in the UI
    "Content Brief Link (G Doc)": fields["Content Brief Link (G Doc)"] || "",
    "Brief Document Link": fields["Brief Document Link"] || ""
  };
}

// Function to format an article item from an Airtable record
function formatArticleItem(record: any): ApprovalItem {
  const fields = record.fields;
  
  return {
    id: record.id,
    item: fields["Main Keyword"] || fields["Title"] || "Untitled Article",
    status: normalizeStatus(fields["Article Approvals"] || "not_started"),
    lastUpdated: formatDate(fields["Any Statuses Last Modified"], 'N/A'),
    clients: fields["Clients"] || [],
    clientRecordId: fields["Client Record ID"] || "",
    strategist: fields["SEO Assignee"] || "Unassigned",
    writer: fields["Content Writer"] || "Unassigned",
    editor: fields["Content Editor"] || "Unassigned",
    wordCount: fields["Final Word Count"] || fields["Target Word Count"] || 0,
    type: fields["Content Type"] || fields["Page Type ( Main )"] || "Not Specified",
    dateSubmitted: formatDate(fields["Created Time"], 'N/A'),
    dateApproved: formatDate(fields["Article Approval Date"], ''),
    revisionReason: fields["Article Revision Reason"] || "",
    documentLink: fields["Written Content (G Doc)"] || fields["Article Google Doc"] || fields["Content Link (G Doc)"] || "",
    // Store the original field values for use in the UI
    "Written Content (G Doc)": fields["Written Content (G Doc)"] || "",
    "Content Link (G Doc)": fields["Content Link (G Doc)"] || "",
    "Article Google Doc": fields["Article Google Doc"] || ""
  };
}

// Function to format a backlink item from an Airtable record
function formatBacklinkItem(record: any): ApprovalItem {
  const fields = record.fields;
  
  return {
    id: record.id,
    item: fields["Domain URL"] || "Untitled Backlink",
    status: normalizeStatus(fields["Backlink Approvals"] || "not_started"),
    lastUpdated: formatDate(fields["Last Modified"], 'N/A'),
    clients: fields["Clients"] || [],
    clientRecordId: fields["Client Record ID"] || "",
    strategist: fields["Link Builder Assignee"] || "Unassigned",
    domainRating: fields["DR ( API )"] || 0,
    linkType: fields["Link Type"] || "Not Specified",
    targetPage: fields["Client Target Page URL"] || "",
    trafficDomain: fields["Domain Traffic ( API )"] || "",
    pageTraffic: fields["Backlink URL Page Traffic ( API )"] || "",
    pageRD: fields["N° RDs Of Referring Page ( API )"] || "",
    keywordScore: fields["Client Target Page URL"] || "",
    wentLiveOn: formatDate(fields["Went Live On"], ''),
    notes: fields["Notes"] || "",
    count: 1, // Default to 1 link
    dateSubmitted: formatDate(fields["Created Time"], 'N/A'),
    dateApproved: formatDate(fields["Backlink Approval Date"], ''),
    revisionReason: fields["Backlink Revision Reason"] || ""
  };
}

// Function to get data from cache or fetch from Airtable
export async function getApprovalItems(
  type: string = 'briefs',
  page: number = 1,
  pageSize: number = 10,
  clientId: string | null = null,
  status: string | null = null,
  skipCache: boolean = false,
  fullDataset: boolean = false
) {
  console.log(`API route: Fetching ${type} approval items (page ${page}, pageSize ${pageSize})`);
  
  // CRITICAL: Always validate the clientId early to prevent showing wrong client data
  if (clientId && clientId !== 'all') {
    console.log(`API route: Filtering by client ID: ${clientId}`);
  } else {
    console.log(`API route: No client filter specified or using 'all'`);
  }
  
  // Cache keys for different scenarios
  // Include clientId in cache keys to prevent cache collisions between clients
  const clientSuffix = clientId && clientId !== 'all' ? `_client_${clientId}` : '';
  const statusSuffix = status ? `_status_${status}` : '';
  const fullDatasetCacheKey = `approvals_${type}_full_dataset${clientSuffix}${statusSuffix}`;
  const paginatedCacheKey = `approvals_${type}_${page}_${pageSize}${statusSuffix}${clientSuffix}`;
  
  console.log(`Cache keys: fullDatasetCacheKey=${fullDatasetCacheKey}, paginatedCacheKey=${paginatedCacheKey}`);
  
  // Return cached data if available and not skipping cache
  if (!skipCache) {
    // Check cache first
    const cachedData = fullDataset 
      ? getFullDatasetCache(fullDatasetCacheKey)
      : getCache(paginatedCacheKey);
    
    if (cachedData) {
      console.log(`Found cached data for ${type} with client filter: ${clientId || 'all'}`);
      return cachedData;
    }
  } else {
    console.log(`Skipping cache for ${type} approval items`);
  }
  
  // If API keys are missing, don't attempt to fetch from Airtable
  if (!apiKey || !baseId) {
    console.log('Missing Airtable API key or base ID');
    return {
      items: [],
      pagination: {
        currentPage: page,
        totalPages: 0,
        totalItems: 0
      }
    };
  }
  
  try {
    // DEBUG: Try fetching clients table to see what client records exist
    try {
      console.log('Attempting to fetch all clients to verify client IDs...');
      const clientsTable = base(TABLES.CLIENTS);
      const clientRecords = await clientsTable.select().all();
      
      if (clientRecords.length > 0) {
        console.log(`Found ${clientRecords.length} clients in Clients table`);
        console.log('Sample client record:', {
          id: clientRecords[0].id,
          name: clientRecords[0].get('Name'),
          fields: Object.keys(clientRecords[0].fields)
        });
        
        // If we're filtering by a specific client, check if it exists
        if (clientId && clientId !== 'all') {
          const matchingClient = clientRecords.find((record: any) => record.id === clientId);
          if (matchingClient) {
            console.log(`Found matching client for ID ${clientId}:`, matchingClient.get('Name'));
          } else {
            console.warn(`WARNING: Client ID ${clientId} not found in Clients table!`);
          }
        }
      } else {
        console.log('No clients found in Clients table');
      }
    } catch (clientError) {
      console.error('Error fetching clients:', clientError);
    }
    
    // Determine which table to use for the content type
    let tableName = '';
    switch (type) {
      case 'keywords':
        tableName = TABLES.KEYWORDS;
        console.log(`Using Keywords table for keywords`);
        break;
      case 'articles':
        tableName = TABLES.ARTICLES;
        console.log(`Using Articles table for articles`);
        break;
      case 'briefs':
        tableName = TABLES.BRIEFS;
        console.log(`Using Briefs table for briefs`);
        break;
      case 'backlinks':
      tableName = TABLES.BACKLINKS;
      console.log(`Using Backlinks table for backlinks`);
        break;
      default:
      tableName = TABLES.KEYWORDS;
        console.log(`No specific table for ${type}, using Keywords table`);
    }

    // Log the selected table for debugging
    console.log(`Selected table for ${type}: ${tableName}`);

    // Initialize filter formula based on type
      let filterFormula = '';
    
    // Define the needed client filtering
    const needsClientFiltering = clientId && clientId !== 'all';
      
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
        
      // Apply client filtering if a specific client is selected (not 'all')
      if (needsClientFiltering) {
          console.log(`Adding client filter for client ID: ${clientId}`);
          
        // Use OR with multiple ways to match the client ID for better compatibility
        const clientFilter = `OR(
          SEARCH("${clientId}", ARRAYJOIN({Clients}, ",")) > 0,
          SEARCH("${clientId}", {Client Record ID}) > 0,
          {Client Record ID} = "${clientId}"
        )`;
        
        // Combine with existing filter formula
          if (filterFormula) {
          filterFormula = `AND(${filterFormula}, ${clientFilter})`;
          } else {
          filterFormula = clientFilter;
        }
      }
      
      // Apply status filtering if status is provided
      if (status) {
        console.log(`Adding status filter for status: ${status}`);
        const statusField = type === 'briefs' ? 'Brief Approvals' : 
                           type === 'articles' ? 'Article Approvals' : 
                           type === 'keywords' ? 'Keyword Approvals' : 'Backlink Approvals';
        
        const statusFilter = `{${statusField}} = "${status}"`;
        
        // Combine with existing filter formula
        if (filterFormula) {
          filterFormula = `AND(${filterFormula}, ${statusFilter})`;
        } else {
          filterFormula = statusFilter;
        }
      }
      
      console.log(`Fetching ${type} from Airtable with options:`, {
        pageSize,
        filterByFormula: filterFormula
      });
      
      // Create fetch options with filtering
      const fetchOptions: any = {
        pageSize: pageSize
      };
      
      if (filterFormula) {
        fetchOptions.filterByFormula = filterFormula;
      }
      
      // Fetch records from Airtable
      console.log(`Starting to fetch all records for ${type}...`);
      
      // Instantiate Airtable
      const base = new Airtable({ apiKey }).base(baseId);
      const table = base.table(tableName);
      
      // Fetch records with retries
      let records = [];
      try {
        records = await fetchRecordsWithRetries(table, fetchOptions);
        console.log(`Fetched ${records.length} records for ${type}`);
      } catch (error) {
        console.error(`Error fetching ${type} with filter formula:`, error);
        console.log(`Trying again with a permission-friendly approach...`);
        
        // If the error was due to the filter formula, try a more basic approach
        const errorObj = error as Error;
        if (errorObj.message && (errorObj.message.includes('INVALID_FILTER_BY_FORMULA') || errorObj.message.includes('Unknown field names'))) {
          console.log(`Attempting fallback query without client filtering`);
          
          // Start with a more basic filter (only type-specific field)
          const basicFilter = type === 'briefs' ? `NOT({Brief Approvals} = '')` : 
                            type === 'articles' ? `NOT({Article Approvals} = '')` : 
                            type === 'keywords' ? `NOT({Keyword Approvals} = '')` : 
                            `NOT({Backlink Approvals} = '')`;
          
          // Retry the fetch with the basic filter
          try {
            console.log(`Fallback: fetching ${type} with basic filter: ${basicFilter}`);
            records = await fetchRecordsWithRetries(table, { 
              filterByFormula: basicFilter,
              pageSize: pageSize
            });
            console.log(`Fallback: fetched ${records.length} records for ${type}`);
            
            // Apply client filtering manually if needed
            if (needsClientFiltering) {
              console.log(`Fallback: applying manual client filtering for client ${clientId}`);
              records = records.filter(record => {
                // Check all possible client fields
                const clientsField = record.get('Clients');
                const clientRecordIdField = record.get('Client Record ID');
                
                // Check Clients array
                if (Array.isArray(clientsField) && clientsField.includes(clientId)) {
                  return true;
                }
                
                // Check Clients as string
                if (typeof clientsField === 'string' && 
                    (clientsField === clientId || clientsField.includes(clientId))) {
                  return true;
                }
                
                // Check Client Record ID
                if (clientRecordIdField === clientId) {
                  return true;
                }
                
                return false;
              });
              console.log(`Fallback: after manual filtering, ${records.length} records remain`);
            }
          } catch (fallbackError) {
            console.error(`Fallback approach also failed:`, fallbackError);
            // If both approaches fail, return empty data
            return {
              items: [],
              pagination: {
                currentPage: page,
                totalPages: 0,
                totalItems: 0
              }
            };
      }
    } else {
          // For other errors, return empty data
          console.error(`Unknown error fetching data:`, error);
          return {
            items: [],
            pagination: {
              currentPage: page,
              totalPages: 0,
              totalItems: 0
            }
          };
        }
      }
      
      console.log(`Working with ${records.length} records for ${type}`);
      
      // Log a sample record for debugging
      if (records.length > 0) {
        console.log(`Sample record fields:`, records[0].fields);
        
        // DEBUGGING: Log all field names to identify which client-related fields exist
        const sampleFields = Object.keys(records[0].fields);
        console.log('All field names in first record:', sampleFields);
        
        // Check specifically for client-related fields
        const clientFields = sampleFields.filter(field => 
          field.toLowerCase().includes('client') || 
          field.toLowerCase().includes('client record')
        );
        console.log('Client-related fields found:', clientFields);
      }
      
      // Count records with approval fields for debugging
      const keywordApprovals = records.filter(r => r.get('Keyword Approvals')).length;
      const briefApprovals = records.filter(r => r.get('Brief Approvals')).length;
      const articleApprovals = records.filter(r => r.get('Article Approvals')).length;
      const backlinkApprovals = records.filter(r => r.get('Backlink Approvals')).length;
      
      console.log(`Records with Keyword Approvals: ${keywordApprovals}`);
      console.log(`Records with Brief Approvals: ${briefApprovals}`);
      console.log(`Records with Article Approvals: ${articleApprovals}`);
      console.log(`Records with Backlink Approvals: ${backlinkApprovals}`);
      
      // Log sample records for each approval type
      if (keywordApprovals > 0) {
        const sample = records.find(r => r.get('Keyword Approvals'));
        console.log(`Sample Keyword Approvals record:`, {
          id: sample.id,
          keywordApproval: sample.get('Keyword Approvals'),
          mainKeyword: sample.get('Main Keyword')
        });
      }
      
      if (briefApprovals > 0) {
        const sample = records.find(r => r.get('Brief Approvals'));
        console.log(`Sample Brief Approvals record:`, {
          id: sample.id,
          briefApproval: sample.get('Brief Approvals'),
          mainKeyword: sample.get('Main Keyword')
        });
      }
      
      // Process records into formatted items
      const items: ApprovalItem[] = [];
      
      // Add detailed logging for each record's client field
      records.forEach(record => {
        const id = record.id;
        const clientField = record.get('Clients');
        
        // IMPORTANT: Add detailed client field debugging 
        if (needsClientFiltering && clientField) {
          console.log(`Record ${id} - Clients field:`, clientField);
          if (Array.isArray(clientField)) {
            console.log(`  Clients is an array with ${clientField.length} items`);
            if (clientField.length > 0) {
              console.log(`  First client item: ${clientField[0]}`);
            }
          } else if (typeof clientField === 'string') {
            console.log(`  Clients is a string: "${clientField}"`);
          }
        }
        
        // Determine the type based on approval fields
        if (record.get('Brief Approvals')) {
          const status = record.get('Brief Approvals');
          console.log(`Record ${id} assigned to briefs tab based on Brief Approvals field: "${status}"`);
        } else if (record.get('Article Approvals')) {
          const status = record.get('Article Approvals');
          console.log(`Record ${id} assigned to articles tab based on Article Approvals field: "${status}"`);
        } else if (record.get('Keyword Approvals')) {
          const status = record.get('Keyword Approvals');
          console.log(`Record ${id} assigned to keywords tab based on Keyword Approvals field: "${status}"`);
        } else if (record.get('Backlink Approvals')) {
          const status = record.get('Backlink Approvals');
          console.log(`Record ${id} assigned to backlinks tab based on Backlink Approvals field: "${status}"`);
        }
      });
      
      // Map Airtable records to formatted items based on content type
      console.log(`Filtering items by content type: ${type}`);
      
      // Process records based on content type
      switch (type) {
        case 'keywords':
          records.filter(record => record.get('Keyword Approvals')).forEach(record => {
            items.push(formatKeywordItem(record));
          });
          break;
        case 'briefs':
          records.filter(record => record.get('Brief Approvals')).forEach(record => {
            items.push(formatBriefItem(record));
          });
          break;
        case 'articles':
          records.filter(record => record.get('Article Approvals')).forEach(record => {
            items.push(formatArticleItem(record));
          });
          break;
        case 'backlinks':
          records.filter(record => record.get('Backlink Approvals')).forEach(record => {
            items.push(formatBacklinkItem(record));
          });
          break;
      }
      
      console.log(`After filtering by content type and approval fields, found ${items.length} items for type ${type}`);
      
      // CRITICAL: Apply client-side filtering one more time to ensure only the correct client's data is returned
      let filteredItems: ApprovalItem[] = items;
      if (needsClientFiltering) {
        console.log(`Applying client-side filtering for ${items.length} items by client ID: ${clientId}`);
        filteredItems = items.filter(item => {
          // Check all possible client fields
          if (Array.isArray(item.clients) && item.clients.includes(clientId!)) {
            return true;
          }
          
          if (typeof item.clients === 'string' && item.clients.includes(clientId!)) {
            return true;
          }
          
          // Check Client Record ID field
          if (item.clientRecordId === clientId) {
            return true;
          }
          
                return false;
              });
        console.log(`After client-side filtering: ${filteredItems.length} items remaining out of ${items.length}`);
        
        // Verify a few items to ensure client filtering worked correctly
        if (filteredItems.length > 0) {
          console.log(`Validation check on ${Math.min(3, filteredItems.length)} items after client filtering:`);
          for (let i = 0; i < Math.min(3, filteredItems.length); i++) {
            const item = filteredItems[i];
            console.log(`- Item ${i+1} (${item.id}) client field:`, item.clients || item.Clients || item.client || item.Client);
          }
        }
      }
      
      // Paginate the results
      const totalItems = filteredItems.length;
      const totalPages = Math.ceil(totalItems / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = Math.min(startIndex + pageSize, totalItems);
      const paginatedItems = filteredItems.slice(startIndex, endIndex);

    console.log(`Total items: ${totalItems}, Total pages: ${totalPages}, Current page: ${page}, Page size: ${pageSize}`);
      console.log(`Paginating items: page ${page}, showing items ${startIndex+1}-${endIndex} of ${totalItems}`);
      
      // Prepare the response object
      const result = {
      items: paginatedItems,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          nextOffset: page < totalPages ? (page + 1).toString() : null,
          prevOffset: page > 1 ? (page - 1).toString() : null
        }
      };
      
      // Cache the results
      if (fullDataset) {
        // Cache the full dataset
        setFullDatasetCache(fullDatasetCacheKey, result);
        
        // Also cache the paginated results
        setCache(paginatedCacheKey, {
          items: paginatedItems,
          pagination: result.pagination
        });
      } else {
        // Only cache the current page
        setCache(paginatedCacheKey, result);
      }
      
      console.log(`API route: Found ${paginatedItems.length} ${type} approval items (page ${page})`);
      if (needsClientFiltering) {
        console.log(`API route: Items filtered by client ID: ${clientId}`);
      }
      
      return result;
    } catch (error) {
      console.error(`Error in getApprovalItems:`, error);
      return {
        items: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalItems: 0
        }
      };
    }
  } catch (outerError) {
    console.error(`Critical error in getApprovalItems:`, outerError);
    return {
      items: [],
      pagination: {
        currentPage: page,
        totalPages: 0,
        totalItems: 0
      }
    };
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

// Utility function to fetch records with retries
async function fetchRecordsWithRetries(table: any, fetchOptions: any, maxRetries: number = 3): Promise<any[]> {
  let retries = 0;
  let records: any[] = [];

  while (retries < maxRetries) {
    try {
      console.log(`Attempt ${retries + 1} to fetch records with options:`, fetchOptions);
      
      // Fetch all records - Airtable automatically handles pagination
      records = await table.select(fetchOptions).all();
      console.log(`Successfully fetched ${records.length} records`);
      return records;
    } catch (fetchError: any) {
      retries++;
      console.error(`Error on attempt ${retries}:`, fetchError.message || fetchError);
      
      if (retries >= maxRetries) {
        console.error(`Max retries (${maxRetries}) reached, giving up`);
        throw fetchError;
      }
      
      // Wait before retrying (exponential backoff)
      const waitTime = 1000 * Math.pow(2, retries);
      console.log(`Waiting ${waitTime}ms before retry ${retries + 1}...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  return records;
}
