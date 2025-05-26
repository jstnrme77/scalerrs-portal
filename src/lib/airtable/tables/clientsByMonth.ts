import { fetchFromAirtable } from '../helpers';
import { getClientId } from '../getClientId';

// Fetches rows from the "Clients By Month" table that belong to the
// client identified by `clientRecordID` in localStorage.
// Returns full Airtable records so that callers have access to both the
// record `id` and the `fields` payload.
export async function fetchClientsByMonth() {
  const clientRecordID = getClientId();
  if (!clientRecordID) return [];

  const formula = `{Client Record ID} = '${clientRecordID}'`;
  return await fetchFromAirtable<any>('Clients By Month', formula);
} 