import { base } from './config';
import { hasAirtableCredentials, TABLES, ALT_TABLES } from './config';
// Import environment variables
const baseId = process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;
import { mockMonthlyProjections } from './mock-data';
import { MonthlyProjection } from './types';
import { handleAirtableError } from './utils';

/**
 * Get monthly projections from Airtable
 * @returns Array of monthly projection objects
 */
export async function getMonthlyProjections(): Promise<MonthlyProjection[]> {
  if (!hasAirtableCredentials) {
    console.log('Using mock monthly projections data (no credentials)');
    return mockMonthlyProjections;
  }

  try {
    console.log('Fetching monthly projections from Airtable...');
    console.log('Using base ID:', baseId);
    console.log('Using table name:', TABLES.MONTHLY_PROJECTIONS);

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
          const monthlyProjectionsExists = availableTables.some((t: string) =>
            t === TABLES.MONTHLY_PROJECTIONS ||
            t === TABLES.MONTHLY_PROJECTIONS.toLowerCase() ||
            t === 'Monthly Projections' ||
            t === 'monthly projections' ||
            ALT_TABLES.MONTHLY_PROJECTIONS.includes(t)
          );

          console.log(`Monthly Projections table exists: ${monthlyProjectionsExists}`);

          // If table doesn't exist, use mock data
          if (!monthlyProjectionsExists) {
            console.log('Monthly Projections table does not exist in this base. Using mock data.');
            return mockMonthlyProjections;
          }
        }
      }
    } catch (listTablesError) {
      console.error('Error listing tables:', listTablesError);
    }

    // Check if the table exists and we can access it
    try {
      // First, try to get just one record to verify the table exists and is accessible
      const checkRecord = await base(TABLES.MONTHLY_PROJECTIONS).select({ maxRecords: 1 }).firstPage();
      console.log('Monthly Projections table check:', checkRecord.length > 0 ? 'Table exists and has records' : 'Table exists but is empty');

      if (checkRecord.length > 0) {
        console.log('Sample Monthly Projections record structure:', checkRecord[0].fields);
        console.log('Available fields in Monthly Projections:', Object.keys(checkRecord[0].fields));
      } else {
        console.log('Monthly Projections table is empty. Using mock data...');
        return mockMonthlyProjections;
      }
    } catch (checkError: any) {
      console.error('Error checking Monthly Projections table:', checkError.message);

      if (checkError.message.includes('Table not found')) {
        console.error('The Monthly Projections table does not exist in this base');
        return mockMonthlyProjections;
      }

      if (checkError.message.includes('authorized')) {
        console.error('Authorization error. Your token may not have the correct permissions.');
        console.error('Make sure your token has the following scopes: data.records:read, data.records:write, schema.bases:read');
        return mockMonthlyProjections;
      }

      // For other errors, fall back to mock data
      return mockMonthlyProjections;
    }

    // Proceed with fetching all records
    const records = await base(TABLES.MONTHLY_PROJECTIONS).select().all();
    console.log(`Successfully fetched ${records.length} monthly projections records from Airtable`);

    // Map the records to our expected format
    return records.map((record: any) => {
      const fields = record.fields;

      // Map fields from your Airtable schema to our expected format
      return {
        id: record.id,
        Month: fields['Month'] || '',
        Year: fields['Year'] || '',
        'Current Trajectory': fields['Current Trajectory'] || 0,
        'KPI Goal/Target': fields['KPI Goal/Target'] || 0,
        'Required Trajectory': fields['Required Trajectory'] || 0,
        // Include all original fields as well
        ...fields
      };
    });
  } catch (error) {
    return handleAirtableError(error, mockMonthlyProjections, 'getMonthlyProjections');
  }
}
