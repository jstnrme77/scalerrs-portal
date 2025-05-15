import { base } from '../config';
import { hasAirtableCredentials, TABLES } from '../config';
import { mockClients } from '../mock-data';
import { Client } from '../types';
import { handleAirtableError } from '../utils';

/**
 * Get all clients from Airtable
 * @returns Array of client objects
 */
export async function getClients(): Promise<Client[]> {
  if (!hasAirtableCredentials) {
    console.log('Using mock clients data - no Airtable credentials');
    return mockClients;
  }

  try {
    console.log('Fetching clients from Airtable...');
    const records = await base(TABLES.CLIENTS).select().all();
    console.log(`Successfully fetched ${records.length} clients from Airtable`);

    return records.map((record: any) => ({
      id: record.id,
      ...record.fields
    }));
  } catch (error: any) {
    return handleAirtableError(error, mockClients, 'getClients');
  }
}
