import { base } from '../config';
import { hasAirtableCredentials, TABLES } from '../config';
import { mockBacklinks } from '../mock-data';
import { Backlink } from '../types';
import { handleAirtableError, createMonthFilter } from '../utils';

/**
 * Get backlinks from Airtable, filtered by month
 * @param month Optional month to filter backlinks
 * @returns Array of backlink objects
 */
export async function getBacklinks(month?: string | null): Promise<Backlink[]> {
  console.log('getBacklinks called');
  console.log('hasAirtableCredentials:', hasAirtableCredentials);

  if (!hasAirtableCredentials) {
    console.log('Using mock backlinks data (no credentials)');
    return mockBacklinks;
  }

  try {
    console.log('Fetching backlinks from Airtable...');
    console.log('Using base ID:', base._id);
    console.log('Using table name:', TABLES.BACKLINKS);

    // Try to list all tables in the base to see what's available
    try {
      console.log('Attempting to list all tables in the base...');
      // This is a workaround to list tables - we try to access a non-existent table
      // which will fail, but the error message will contain the list of valid tables
      try {
        await base('__nonexistent_table__').select().firstPage();
      } catch (listError: any) {
        if (listError.message && listError.message.includes('Table "__nonexistent_table__" not found. Available tables:')) {
          const availableTables = listError.message
            .split('Available tables:')[1]
            .trim()
            .split(',')
            .map((t: string) => t.trim());

          console.log('Available tables in this base:', availableTables);

          // Check if our required tables exist
          const backlinksExists = availableTables.some((t: string) =>
            t === TABLES.BACKLINKS ||
            t === TABLES.BACKLINKS.toLowerCase() ||
            t === 'Backlinks' ||
            t === 'backlinks'
          );

          console.log(`Backlinks table exists: ${backlinksExists}`);

          // If table doesn't exist, use mock data
          if (!backlinksExists) {
            console.log('Backlinks table does not exist in this base. Using mock data.');
            return mockBacklinks;
          }
        }
      }
    } catch (listTablesError) {
      console.error('Error listing tables:', listTablesError);
    }

    // Check if the table exists and we can access it
    try {
      // First, try to get just one record to verify the table exists and is accessible
      const checkRecord = await base(TABLES.BACKLINKS).select({ maxRecords: 1 }).firstPage();
      console.log('Backlinks table check:', checkRecord.length > 0 ? 'Table exists and has records' : 'Table exists but is empty');

      if (checkRecord.length > 0) {
        console.log('Sample Backlinks record structure:', checkRecord[0].fields);
        console.log('Available fields in Backlinks:', Object.keys(checkRecord[0].fields));
      } else {
        console.log('Backlinks table is empty. Using mock data...');
        return mockBacklinks;
      }
    } catch (checkError: any) {
      console.error('Error checking Backlinks table:', checkError.message);

      if (checkError.message && checkError.message.includes('Table not found')) {
        console.error('The Backlinks table does not exist in this base');
        return mockBacklinks;
      }

      if (checkError.message && checkError.message.includes('authorized')) {
        console.error('Authorization error. Your token may not have the correct permissions.');
        console.error('Make sure your token has the following scopes: data.records:read, data.records:write, schema.bases:read');
        return mockBacklinks;
      }

      // For other errors, fall back to mock data
      return mockBacklinks;
    }

    // Build query with month filter if specified
    let query;
    if (month) {
      console.log('Filtering backlinks by month:', month);
      const monthFilter = createMonthFilter(month);
      console.log('Using filter formula for backlinks:', monthFilter);
      
      query = base(TABLES.BACKLINKS).select({
        filterByFormula: monthFilter
      });
    } else {
      // No month filter, fetch all records
      query = base(TABLES.BACKLINKS).select();
    }

    // Fetch the records
    const records = await query.all();
    console.log(`Successfully fetched ${records.length} backlinks records from Airtable`);

    // Log the first record to see what fields are available
    if (records.length > 0) {
      console.log('First backlink record fields:', records[0].fields);
      console.log('First backlink record field keys:', Object.keys(records[0].fields));
    }

    // Map the records to our expected format
    return records.map((record: any) => {
      const fields = record.fields;
      const fieldKeys = Object.keys(fields);

      // Find field names that might correspond to our expected fields
      // For each expected field, look for variations in the actual field names

      // Domain field - look for any field containing "domain" but not "rating"
      const domainField = fieldKeys.find(key =>
        key.toLowerCase().includes('domain') && !key.toLowerCase().includes('rating') && !key.toLowerCase().includes('dr')
      ) || 'Domain URL';

      // Domain Rating field - look for any field containing "rating" or "dr"
      const ratingField = fieldKeys.find(key =>
        key.toLowerCase().includes('dr') || key.toLowerCase().includes('rating') || key.toLowerCase().includes('authority')
      ) || 'DR ( API )';

      // Link Type field - look for any field containing "type"
      const typeField = fieldKeys.find(key =>
        key.toLowerCase().includes('type') || key.toLowerCase().includes('link type')
      ) || 'Link Type';

      // Target Page field - look for any field containing "target", "page", or "url"
      const targetField = fieldKeys.find(key =>
        key.toLowerCase().includes('target') || key.toLowerCase().includes('page url') || key.toLowerCase().includes('client target')
      ) || 'Client Target Page URL';

      // Status field - look for any field containing "status"
      const statusField = fieldKeys.find(key =>
        key.toLowerCase().includes('portal status')
      ) || 'Portal Status';

      // Went Live On field - look for any field containing "live", "date", or "published"
      const liveField = fieldKeys.find(key =>
        key.toLowerCase().includes('live') || key.toLowerCase().includes('date') || key.toLowerCase().includes('published')
      ) || 'Went Live On';

      // Notes field - look for any field containing "note", "comment", or "description"
      const notesField = fieldKeys.find(key =>
        key.toLowerCase().includes('note') || key.toLowerCase().includes('comment') || key.toLowerCase().includes('description')
      ) || 'Notes';

      // Month field - look for any field containing "month" or "period"
      const monthField = fieldKeys.find(key =>
        key.toLowerCase().includes('month') || key.toLowerCase().includes('period')
      ) || 'Month';

      // Return an object with our expected structure, using the fields we found
      // or empty values if we couldn't find a matching field
      return {
        id: record.id,
        Domain: domainField && fields[domainField] ? fields[domainField] : '',
        'Domain URL': fields['Domain URL'] || '',
        DomainRating: ratingField && fields[ratingField] ? fields[ratingField] : 0,
        'DR ( API )': fields['DR ( API )'] || 0,
        'Domain Authority/Rating': fields['Domain Authority/Rating'] || fields['DR ( API )'] || 0,
        LinkType: typeField && fields[typeField] ? fields[typeField] : '',
        'Link Type': fields['Link Type'] || '',
        TargetPage: targetField && fields[targetField] ? fields[targetField] : '',
        'Client Target Page URL': fields['Client Target Page URL'] || '',
        'Target URL': fields['Target URL'] || fields['Client Target Page URL'] || '',
        Status: statusField && fields[statusField] ? fields[statusField] : 'Pending',
        WentLiveOn: liveField && fields[liveField] ? fields[liveField] : '',
        'Went Live On': fields['Went Live On'] || '',
        Notes: notesField && fields[notesField] ? fields[notesField] : '',
        Month: monthField && fields[monthField] ? fields[monthField] : '',
        // Include all original fields as well
        ...fields
      };
    });
  } catch (error: any) {
    return handleAirtableError(error, mockBacklinks, 'getBacklinks');
  }
}

/**
 * Update a backlink's status in Airtable
 * @param backlinkId Backlink ID to update
 * @param status New status value
 * @returns Updated backlink object
 */
export async function updateBacklinkStatus(backlinkId: string, status: string): Promise<Backlink> {
  if (!hasAirtableCredentials) {
    console.log('Using mock data for updating backlink status:', backlinkId, status);
    const updatedBacklink = mockBacklinks.find(backlink => backlink.id === backlinkId);
    if (updatedBacklink) {
      updatedBacklink.Status = status;
    }
    return updatedBacklink || { id: backlinkId, Status: status };
  }

  try {
    const updatedRecord = await base(TABLES.BACKLINKS).update(backlinkId, {
      Status: status,
    });

    return {
      id: updatedRecord.id,
      ...updatedRecord.fields,
    };
  } catch (error) {
    const updatedBacklink = mockBacklinks.find(backlink => backlink.id === backlinkId);
    if (updatedBacklink) {
      updatedBacklink.Status = status;
    }
    return handleAirtableError(error, updatedBacklink || { id: backlinkId, Status: status }, 'updateBacklinkStatus');
  }
}
