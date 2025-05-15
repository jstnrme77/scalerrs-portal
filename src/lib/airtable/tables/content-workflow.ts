import { base } from '../config';
import { hasAirtableCredentials, TABLES } from '../config';
import { mockBriefs, mockArticles, mockBacklinks } from '../mock-data';
import { Brief, Article, Backlink } from '../types';
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
    console.log('Using mock briefs data');
    return mockBriefs;
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
        console.log('Keywords table is empty. Using mock data...');
        return mockBriefs;
      }
    } catch (checkError: any) {
      console.error('Error checking Keywords table:', checkError.message);

      if (checkError.message && checkError.message.includes('Table not found')) {
        console.error('The Keywords table does not exist in this base');
        return mockBriefs;
      }

      if (checkError.message && checkError.message.includes('authorized')) {
        console.error('Authorization error. Your token may not have the correct permissions.');
        console.error('Make sure your token has the following scopes: data.records:read, data.records:write, schema.bases:read');
        return mockBriefs;
      }

      // For other errors, fall back to mock data
      return mockBriefs;
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
      let clientValue = fields['All Clients'] || fields.Client || fields['Client'];

      // If no client field is found, use "Example Client" as a fallback
      if (!clientValue) {
        clientValue = "Example Client";
      }

      // Map the brief status to our UI status
      let briefStatus = 'In Progress';

      // First check for the 'Brief Status' field that we're now using for updates
      const briefStatusField = fields['Brief Status'] || fields['Keyword/Content Status'] || fields.Status || '';
      const briefStatusLower = briefStatusField.toLowerCase();

      // Map the specific Airtable status values to our four Kanban columns
      if (briefStatusField.includes('In Progress') || briefStatusLower.includes('in progress') ||
          briefStatusField.includes('Creation Needed') || briefStatusLower.includes('creation needed')) {
        briefStatus = 'In Progress';
      }
      else if (briefStatusField.includes('Review') || briefStatusLower.includes('review')) {
        briefStatus = 'Review Brief';
      }
      else if (briefStatusField.includes('Needs Input') || briefStatusLower.includes('needs input') ||
               briefStatusField.includes('Revision') || briefStatusLower.includes('revision')) {
        briefStatus = 'Needs Input';
      }
      else if (briefStatusField.includes('Approved') || briefStatusLower.includes('approved')) {
        briefStatus = 'Brief Approved';
      }
      // For any other status that includes "Brief", default to In Progress
      else if (briefStatusField.includes('Brief') || briefStatusLower.includes('brief')) {
        briefStatus = 'In Progress';
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
    return handleAirtableError(error, mockBriefs, 'getBriefs');
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
    console.log('Using mock data for updating brief status (no credentials):', briefId, status);
    const updatedBrief = mockBriefs.find(brief => brief.id === briefId);
    if (updatedBrief) {
      updatedBrief.Status = status;
    }
    return updatedBrief || { id: briefId, Status: status };
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

    // Prepare update object with only Brief Status field
    const updateObject = {
      'Brief Status': status
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
    const updatedBrief = mockBriefs.find(brief => brief.id === briefId);
    if (updatedBrief) {
      updatedBrief.Status = status;
    }
    return handleAirtableError(error, updatedBrief || { id: briefId, Status: status }, 'updateBriefStatus');
  }
}
