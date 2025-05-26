import { fetchFromAirtable } from '../helpers';
import { getClientId } from '../getClientId';

// Fetches rows from the "Clients By Quarters" table for the current client.
export async function fetchClientsByQuarter() {
  const clientRecordID = getClientId();
  if (!clientRecordID) return [];

  const formula = `{Client Record ID} = '${clientRecordID}'`;
  return await fetchFromAirtable<any>('Clients By Quarters', formula);
} 