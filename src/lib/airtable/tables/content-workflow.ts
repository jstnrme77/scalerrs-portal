import { base } from '../config';
import { hasAirtableCredentials, TABLES } from '../config';
import { Brief, Article, Backlink } from '../types';
import { YouTube, Reddit } from '../../../types';
import {
  handleAirtableError,
  createClientFilter,
  createUserFilter,
  createMonthFilter,
  combineFilters
} from '../utils';

/**
 * Get briefs from Airtable, filtered by user role, client, and month
 * @param userId Optional user ID to filter briefs
 * @param userRole Optional user role to filter briefs
 * @param clientIds Optional client IDs to filter briefs
 * @param month Optional month to filter briefs
 * @returns Array of brief objects
 */
export async function getBriefs(
  userId?: string | null,
  userRole?: string | null,
  clientIds?: string[] | null,
  month?: string | null
): Promise<Brief[]> {
  if (!hasAirtableCredentials) {
    console.log('No Airtable credentials available');
    return [];
  }

  try {
    console.log('Fetching briefs from Keywords table in Airtable...');
    console.log('Using base ID:', base._id);
    console.log('Using table name:', TABLES.KEYWORDS);

    // Check if the Keywords table exists and we can access it
    try {
      // First, try to get just one record to verify the table exists and is accessible
      const checkRecord = await base(TABLES.KEYWORDS).select({ maxRecords: 1 }).firstPage();
      console.log('Keywords table check:', checkRecord.length > 0 ? 'Table exists and has records' : 'Table exists but is empty');

      if (checkRecord.length > 0) {
        console.log('Sample Keywords record structure:', checkRecord[0].fields);
        console.log('Available fields in Keywords:', Object.keys(checkRecord[0].fields));
      } else {
        console.log('Keywords table is empty. Returning empty array...');
        return [];
      }
    } catch (checkError: any) {
      console.error('Error checking Keywords table:', checkError.message);

      if (checkError.message && checkError.message.includes('Table not found')) {
        console.error('The Keywords table does not exist in this base');
        return [];
      }

      if (checkError.message && checkError.message.includes('authorized')) {
        console.error('Authorization error. Your token may not have the correct permissions.');
        console.error('Make sure your token has the following scopes: data.records:read, data.records:write, schema.bases:read');
        return [];
      }

      // For other errors, return empty array
      return [];
    }

    // Build the query with appropriate filters
    const filterParts: string[] = [];

    // If user is a client, filter by client
    if (userRole === 'Client' && clientIds && clientIds.length > 0) {
      console.log('Filtering keywords by client:', clientIds);
      filterParts.push(createClientFilter(clientIds));
    }
    // If user is not an admin or client, filter by assigned user
    else if (userId && userRole && userRole !== 'Admin') {
      console.log(`Filtering keywords for user: ${userId}, role: ${userRole}`);
      filterParts.push(createUserFilter(userId, ['SEO Strategist', 'Content Writer', 'Content Editor']));
    }

    // If month is specified, add month filter
    if (month) {
      console.log('Filtering keywords by month:', month);
      filterParts.push(createMonthFilter(month, 'Month (Keyword Targets)'));
    }

    // Combine all filter parts
    const filterFormula = combineFilters(filterParts);

    // Apply the filter if one was created
    let query;
    if (filterFormula) {
      console.log('Using filter formula:', filterFormula);
      query = base(TABLES.KEYWORDS).select({
        filterByFormula: filterFormula
      });
    } else {
      query = base(TABLES.KEYWORDS).select();
    }

    // Fetch the records
    const records = await query.all();
    console.log(`Successfully fetched ${records.length} keywords records from Airtable`);

    // Log the first record to see what fields are available
    if (records.length > 0) {
      console.log('First keyword record fields:', records[0].fields);
      console.log('First keyword record field keys:', Object.keys(records[0].fields));

      // Check specifically for the status field
      console.log('Status field value:', records[0].fields['Keyword/Content Status']);
      console.log('Alternative Status field value:', records[0].fields.Status);
    }

    // Try to find the field that contains status information
    const statusFieldName = records.length > 0 ?
      Object.keys(records[0].fields).find(key =>
        key === 'Brief Status' ||
        key === 'Keyword/Content Status' ||
        key === 'Status' ||
        key.toLowerCase().includes('status')
      ) : null;

    console.log('Found status field name:', statusFieldName);

    // Filter for briefs based on status
    const briefRecords = records.filter((record: any) => {
      // If we found a specific status field, use it
      if (statusFieldName && record.fields[statusFieldName]) {
        const status = record.fields[statusFieldName];
        const statusLower = status.toLowerCase();

        return status.includes('Brief') ||
               statusLower.includes('brief') ||
               status === 'Brief Creation Needed' ||
               status === 'Brief Approved' ||
               status === 'Brief Under Internal Review' ||
               status === 'In Progress' ||
               status === 'Needs Input' ||
               status === 'Review Brief';
      }

      // Otherwise try our previous approach
      const status = record.fields['Keyword/Content Status'] || record.fields.Status || '';
      const statusLower = status.toLowerCase();

      return status.includes('Brief') ||
             statusLower.includes('brief') ||
             status === 'Brief Creation Needed' ||
             status === 'Brief Approved' ||
             status === 'Brief Under Internal Review' ||
             status === 'In Progress' ||
             status === 'Needs Input' ||
             status === 'Review Brief';
    });

    console.log(`Filtered ${briefRecords.length} records as briefs`);

    // Map the records to our expected format
    return briefRecords.map((record: any) => {
      const fields = record.fields;

      // Process the Client field - check multiple possible field names
      let clientValue = fields['Clients'] || fields.Client || fields['Client'];

      // If no client field is found, use "Example Client" as a fallback
      if (!clientValue) {
        clientValue = "Example Client";
      }

      // Map the brief status to our UI status
      let briefStatus = 'Brief Creation Needed';

      // Use the "Keyword/Content Status" field as the primary source of status information
      const briefStatusField = fields['Keyword/Content Status'] || fields['Brief Status'] || fields.Status || '';
      const briefStatusLower = briefStatusField.toLowerCase();

      // Use the status values from the "Keyword/Content Status" field
      if (briefStatusField === 'Brief Creation Needed') {
        briefStatus = 'Brief Creation Needed';
      }
      else if (briefStatusField === 'Brief Under Internal Review') {
        briefStatus = 'Brief Under Internal Review';
      }
      else if (briefStatusField === 'Brief Awaiting Client Depth') {
        briefStatus = 'Brief Awaiting Client Depth';
      }
      else if (briefStatusField === 'Brief Awaiting Client Review') {
        briefStatus = 'Brief Awaiting Client Review';
      }
      else if (briefStatusField === 'Brief Needs Revision') {
        briefStatus = 'Brief Needs Revision';
      }
      else if (briefStatusField === 'Brief Approved') {
        briefStatus = 'Brief Approved';
      }
      // Legacy status mappings for backward compatibility
      else if (briefStatusField.includes('In Progress') || briefStatusLower.includes('in progress') ||
          briefStatusField.includes('Creation Needed') || briefStatusLower.includes('creation needed')) {
        briefStatus = 'Brief Creation Needed';
      }
      else if (briefStatusField.includes('Review') || briefStatusLower.includes('review')) {
        briefStatus = 'Brief Under Internal Review';
      }
      else if (briefStatusField.includes('Needs Input') || briefStatusLower.includes('needs input') ||
               briefStatusField.includes('Revision') || briefStatusLower.includes('revision')) {
        briefStatus = 'Brief Needs Revision';
      }
      else if (briefStatusField.includes('Approved') || briefStatusLower.includes('approved')) {
        briefStatus = 'Brief Approved';
      }
      // For any other status that includes "Brief", default to Brief Creation Needed
      else if (briefStatusField.includes('Brief') || briefStatusLower.includes('brief')) {
        briefStatus = 'Brief Creation Needed';
      }

      // Return an object with our expected structure
      return {
        id: record.id,
        Title: fields['Main Keyword'],
        SEOStrategist: fields['SEO Assignee'],
        DueDate: fields['Due Date (Publication)'],
        DocumentLink: fields['Content Brief Link (G Doc)'],
        Month: fields['Month (Keyword Targets)'],
        Status: briefStatus,
        Client: clientValue,
        ContentWriter: fields['Content Writer'] || fields.ContentWriter || fields.Writer || '',
        ContentEditor: fields.ContentEditor || fields['Content Editor'] || fields.Editor || '',
        // Include all original fields as well
        ...fields
      };
    });
  } catch (error) {
    return handleAirtableError(error, [], 'getBriefs');
  }
}

/**
 * Update a brief's status in Airtable
 * @param briefId Brief ID to update
 * @param status New status value
 * @returns Updated brief object
 */
export async function updateBriefStatus(briefId: string, status: string): Promise<Brief> {
  if (!hasAirtableCredentials) {
    console.log('No Airtable credentials available for updating brief status:', briefId, status);
    throw new Error('No Airtable credentials available');
  }

  try {
    console.log(`Updating brief ${briefId} status to ${status} in Airtable...`);

    // First, check if the brief exists
    try {
      const checkRecord = await base(TABLES.KEYWORDS).find(briefId);
      console.log('Found brief to update:', checkRecord.id);
      console.log('Current brief fields:', checkRecord.fields);
    } catch (findError) {
      console.error(`Brief with ID ${briefId} not found:`, findError);
      throw new Error(`Brief with ID ${briefId} not found`);
    }

    // Always use 'Keyword/Content Status' field for brief status
    const updateObject = {
      'Keyword/Content Status': status
    };

    console.log('Updating brief with:', updateObject);

    // Now update the brief
    const updatedRecord = await base(TABLES.KEYWORDS).update(briefId, updateObject);

    console.log('Brief updated successfully:', updatedRecord.id);
    console.log('Updated fields:', updatedRecord.fields);

    return {
      id: updatedRecord.id,
      ...updatedRecord.fields,
    };
  } catch (error) {
    throw new Error(`Failed to update brief status: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get YouTube data from Airtable, filtered by user role, client, and month
 * @param userId Optional user ID to filter data
 * @param userRole Optional user role to filter data
 * @param clientIds Optional client IDs to filter data
 * @param month Optional month to filter data
 * @returns Array of YouTube objects
 */
export async function getYouTubeData(
  userId?: string | null,
  userRole?: string | null,
  clientIds?: string[] | null,
  month?: string | null
): Promise<YouTube[]> {
  if (!hasAirtableCredentials) {
    console.log('No Airtable credentials available for YouTube data');
    return [];
  }

  try {
    console.log('Fetching YouTube data from Airtable...');
    console.log('Using table name:', TABLES.YOUTUBE_MANAGEMENT);
    console.log('Month parameter for YouTube data:', month);
    console.log('Client IDs for filtering YouTube data:', clientIds);

    // Check if the YouTube table exists and we can access it
    try {
      const checkRecord = await base(TABLES.YOUTUBE_MANAGEMENT).select({ maxRecords: 1 }).firstPage();
      console.log('YouTube table check:', checkRecord.length > 0 ? 'Table exists and has records' : 'Table exists but is empty');

      if (checkRecord.length > 0) {
        console.log('Sample YouTube record structure:', checkRecord[0].fields);
        console.log('Available fields in YouTube:', Object.keys(checkRecord[0].fields));
        
        // Debug client field structure
        if (checkRecord[0].fields['Clients']) {
          const clientField = checkRecord[0].fields['Clients'];
          console.log('Client field found in YouTube record:');
          console.log('- Type:', typeof clientField);
          console.log('- Is array:', Array.isArray(clientField));
          if (Array.isArray(clientField)) {
            console.log('- Array length:', clientField.length);
            console.log('- First item type:', clientField.length > 0 ? typeof clientField[0] : 'N/A');
            console.log('- First item sample:', clientField.length > 0 ? JSON.stringify(clientField[0]) : 'N/A');
          }
          console.log('- Raw value:', JSON.stringify(clientField));
        } else {
          console.log('No Client field found in the sample YouTube record');
        }
      } else {
        console.log('YouTube table is empty. Returning empty array...');
        return [];
      }
    } catch (checkError: any) {
      console.error('Error checking YouTube table:', checkError.message);
      if (checkError.message && checkError.message.includes('Table not found')) {
        console.error('The YouTube Management table does not exist in this base');
        return [];
      }
      return [];
    }

    // Retrieve a few records without filters to inspect client structure
    try {
      console.log('Retrieving sample YouTube records to inspect client structure...');
      const sampleRecords = await base(TABLES.YOUTUBE_MANAGEMENT).select({ maxRecords: 5 }).firstPage();
      console.log(`Retrieved ${sampleRecords.length} sample records for inspection`);
      
      // Log client field structure for each record
      sampleRecords.forEach((record: any, index: number) => {
        console.log(`Sample record ${index+1} (ID: ${record.id}):`);
        console.log(`- Has Clients field: ${!!record.fields['Clients']}`);
        console.log(`- Target Month: ${record.fields['Target Month']}`);
        console.log(`- Keyword Topic: ${record.fields['Keyword Topic']}`);
        
        if (record.fields['Clients']) {
          const clients = record.fields['Clients'];
          console.log(`- Clients field type: ${typeof clients}`);
          console.log(`- Clients is array: ${Array.isArray(clients)}`);
          console.log(`- Clients raw value: ${JSON.stringify(clients)}`);
          
          // If the client IDs are provided, check if this record matches
          if (clientIds && clientIds.length > 0) {
            const matchesClient = Array.isArray(clients) 
              ? clients.some(client => {
                  const clientId = typeof client === 'object' && client.id 
                    ? client.id 
                    : client;
                  const matches = clientIds.includes(clientId);
                  console.log(`  - Client "${clientId}" matches filter "${clientIds.join(',')}"? ${matches}`);
                  return matches;
                })
              : clientIds.includes(clients);
            
            console.log(`- Record matches client filter: ${matchesClient}`);
          }
        }
      });
    } catch (err) {
      console.error('Error inspecting sample records:', err);
    }

    // Build the query with appropriate filters
    const filterParts: string[] = [];

    // If user is a client, filter by client
    if (userRole === 'Client' && clientIds && clientIds.length > 0) {
      console.log('Filtering YouTube by client:', clientIds);
      
      // Create a more robust client filter that handles different field structures
      const clientFilters = clientIds.map(clientId => [
        // Standard client field (array of strings)
        `SEARCH("${clientId}", ARRAYJOIN({Clients}, ',')) > 0`,
        // Client field might be a direct string
        `{Clients} = "${clientId}"`,
        // Client field might be a linked record with different field name
        `SEARCH("${clientId}", ARRAYJOIN({Client}, ',')) > 0`,
        `{Client} = "${clientId}"`
      ]).flat();
      
      const clientFilter = `OR(${clientFilters.join(',')})`;
      filterParts.push(clientFilter);
      console.log('Using more robust client filter:', clientFilter);
    }

    // If month is specified, add month filter using the 'Target Month' field
    if (month) {
      console.log('Filtering YouTube by month:', month);
      
      try {
        // Extract just the month name (e.g., "June" from "June 2025")
        const monthOnly = month.split(' ')[0]; 
        
        // Use FIND() with ARRAYJOIN() like in articles filtering
        const monthFilters = [
          `FIND('${month}', ARRAYJOIN({Target Month}, ',')) > 0`
        ];
        
        // If we extracted a month name, also check for that
        if (monthOnly && monthOnly !== month) {
          monthFilters.push(`FIND('${monthOnly}', ARRAYJOIN({Target Month}, ',')) > 0`);
        }
        
        // Add month filter to filter parts
        const monthFilter = `OR(${monthFilters.join(',')})`;
        console.log('Month filter created:', monthFilter);
        filterParts.push(monthFilter);
      } catch (error) {
        console.error('Error creating month filter for YouTube:', error);
        // Continue without month filter if there's an error
      }
    }

    // Combine all filter parts
    const filterFormula = combineFilters(filterParts);
    console.log('Final YouTube filter formula:', filterFormula);

    // Apply the filter if one was created
    let query;
    if (filterFormula) {
      console.log('Using filter formula:', filterFormula);
      query = base(TABLES.YOUTUBE_MANAGEMENT).select({
        filterByFormula: filterFormula
      });
    } else {
      query = base(TABLES.YOUTUBE_MANAGEMENT).select();
    }

    // Fetch the records
    const records = await query.all();
    console.log(`Successfully fetched ${records.length} YouTube records from Airtable`);

    // Log sample record structure for debugging
    if (records.length > 0) {
      console.log('Sample YouTube record structure:');
      console.log('- Record ID:', records[0].id);
      console.log('- Target Month:', records[0].fields['Target Month']);
      console.log('- Clients field:', records[0].fields['Clients']);
      console.log('- YouTube Status:', records[0].fields['YouTube Status']);
      console.log('- Keyword Topic:', records[0].fields['Keyword Topic']);
    }

    // Map the records to our expected format
    return records.map((record: any) => {
      const fields = record.fields;

      // Handle linked Clients field - extract IDs from linked field objects
      let clientsValue = fields['Clients'];
      if (Array.isArray(clientsValue) && clientsValue.length > 0) {
        // If it's an array of objects (linked records), extract the IDs
        if (typeof clientsValue[0] === 'object' && clientsValue[0].id) {
          clientsValue = clientsValue.map((client: any) => client.id);
          console.log(`YouTube record ${record.id} clients (extracted IDs):`, clientsValue);
        } else {
          console.log(`YouTube record ${record.id} clients (direct array):`, clientsValue);
        }
      } else {
        console.log(`YouTube record ${record.id} clients (no clients or empty):`, clientsValue);
      }

      // Return an object with our expected structure
      return {
        id: record.id,
        'Keyword Topic': fields['Keyword Topic'] || '',
        'Video Title': fields['Video Title'],
        'Competitor video URL': fields['Competitor video URL'],
        'YouTube Status': fields['YouTube Status'] || 'Idea Proposed',
        'Thumbnail Status': fields['Thumbnail Status'],
        'Target Month': fields['Target Month'],
        'Video Type': fields['Video Type'],
        'Related blog embeds': fields['Related blog embeds'],
        'Script (G-Doc URL)': fields['Script (G-Doc URL)'],
        'Notes': fields['Notes'],
        'Clients': clientsValue,
        'YouTube Strategist': fields['YouTube Strategist'],
        'YouTube Host': fields['YouTube Host'],
        'Thumbnail Editor': fields['Thumbnail Editor'],
        'Video Editor': fields['Video Editor'],
        'YouTube Scripter': fields['YouTube Scripter'],
        'Script Title': fields['Script Title'],
        // Include all original fields as well
        ...fields
      };
    });
  } catch (error) {
    return handleAirtableError(error, [], 'getYouTubeData');
  }
}

/**
 * Get Reddit data from Airtable, filtered by user role, client, and month
 * @param userId Optional user ID to filter data
 * @param userRole Optional user role to filter data
 * @param clientIds Optional client IDs to filter data
 * @param month Optional month to filter data
 * @returns Array of Reddit objects
 */
export async function getRedditData(
  userId?: string | null,
  userRole?: string | null,
  clientIds?: string[] | null,
  month?: string | null
): Promise<Reddit[]> {
  if (!hasAirtableCredentials) {
    console.log('No Airtable credentials available for Reddit data');
    return [];
  }

  try {
    console.log('Fetching Reddit data from Airtable...');
    console.log('Using table name:', TABLES.REDDIT_THREADS);

    // Check if the Reddit table exists and we can access it
    try {
      const checkRecord = await base(TABLES.REDDIT_THREADS).select({ maxRecords: 1 }).firstPage();
      console.log('Reddit table check:', checkRecord.length > 0 ? 'Table exists and has records' : 'Table exists but is empty');

      if (checkRecord.length > 0) {
        console.log('Sample Reddit record structure:', checkRecord[0].fields);
        console.log('Available fields in Reddit:', Object.keys(checkRecord[0].fields));
      } else {
        console.log('Reddit table is empty. Returning empty array...');
        return [];
      }
    } catch (checkError: any) {
      console.error('Error checking Reddit table:', checkError.message);
      if (checkError.message && checkError.message.includes('Table not found')) {
        console.error('The Reddit Threads table does not exist in this base');
        return [];
      }
      return [];
    }

    // Build the query with appropriate filters
    const filterParts: string[] = [];

    // If user is a client, filter by client
    if (userRole === 'Client' && clientIds && clientIds.length > 0) {
      console.log('Filtering Reddit by client:', clientIds);
      filterParts.push(createClientFilter(clientIds));
    }

    // If month is specified, add month filter
    if (month) {
      console.log('Filtering Reddit by month:', month);
      
      try {
        // Extract just the month name (e.g., "June" from "June 2025")
        const monthOnly = month.split(' ')[0]; 
        
        // Use FIND() with ARRAYJOIN() like in articles filtering
        const monthFilters = [
          `FIND('${month}', ARRAYJOIN({Month}, ',')) > 0`
        ];
        
        // If we extracted a month name, also check for that
        if (monthOnly && monthOnly !== month) {
          monthFilters.push(`FIND('${monthOnly}', ARRAYJOIN({Month}, ',')) > 0`);
        }
        
        // Add month filter to filter parts
        const monthFilter = `OR(${monthFilters.join(',')})`;
        console.log('Month filter created for Reddit:', monthFilter);
        filterParts.push(monthFilter);
      } catch (error) {
        console.error('Error creating month filter for Reddit:', error);
        // Continue without month filter if there's an error
      }
    }

    // Combine all filter parts
    const filterFormula = combineFilters(filterParts);

    // Apply the filter if one was created
    let query;
    if (filterFormula) {
      console.log('Using filter formula:', filterFormula);
      query = base(TABLES.REDDIT_THREADS).select({
        filterByFormula: filterFormula
      });
    } else {
      query = base(TABLES.REDDIT_THREADS).select();
    }

    // Fetch the records
    const records = await query.all();
    console.log(`Successfully fetched ${records.length} Reddit records from Airtable`);

    // Map the records to our expected format
    return records.map((record: any) => {
      const fields = record.fields;

      // Handle linked Clients field - extract IDs from linked field objects
      let clientsValue = fields['Clients'];
      if (Array.isArray(clientsValue) && clientsValue.length > 0) {
        // If it's an array of objects (linked records), extract the IDs
        if (typeof clientsValue[0] === 'object' && clientsValue[0].id) {
          clientsValue = clientsValue.map((client: any) => client.id);
          console.log('Reddit record clients (extracted IDs):', clientsValue);
        } else {
          console.log('Reddit record clients (direct array):', clientsValue);
        }
      } else {
        console.log('Reddit record clients (no clients or empty):', clientsValue);
      }

      // Return an object with our expected structure
      return {
        id: record.id,
        'Keyword': fields['Keyword'] || '',
        'Reddit Thread URL': fields['Reddit Thread URL'],
        'Clients': clientsValue,
        'Thread Success Pulse': fields['Thread Success Pulse'],
        'Reddit Thread Status (General)': fields['Reddit Thread Status (General)'] || 'Thread Proposed',
        'Reddit Assignee': fields['Reddit Assignee'],
        'SEO Assignee': fields['SEO Assignee'],
        'Thread Type': fields['Thread Type'],
        'Notes': fields['Notes'],
        'Related SEO Keyword': fields['Related SEO Keyword'],
        'Reddit Comments': fields['Reddit Comments'],
        'Thread SEO Traffic': fields['Thread SEO Traffic'],
        'Thread SEO Traffic Value': fields['Thread SEO Traffic Value'],
        'Month': fields['Month'],
        // Include all original fields as well
        ...fields
      };
    });
  } catch (error) {
    return handleAirtableError(error, [], 'getRedditData');
  }
}
