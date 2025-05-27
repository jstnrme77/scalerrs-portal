import { fetchFromAirtable } from '../helpers';
import { getClientId } from '../getClientId';

export async function fetchClientsByWeek(clientId?: string | null) {
  // Use provided clientId or fall back to getClientId()
  const clientRecordID = clientId || getClientId();
  
  if (!clientRecordID) {
    console.log('fetchClientsByWeek: No clientId available');
    // First render (e.g. dev Strict-Mode) → return empty list instead of throwing
    return [];
  }

  console.log(`fetchClientsByWeek: Fetching data for client ${clientRecordID}`);
  
  /* Special case for 'all' - fetch all weeks without filtering by client */
  if (clientRecordID === 'all') {
    console.log('fetchClientsByWeek: Fetching all weeks for all clients');
    return await fetchFromAirtable<any>('Clients By Week');
  }
  
  /* Faster + simpler: "Client Record ID" is a plain text column that stores   */
  /* the Airtable id of the linked Client → 1-to-1 match, no ARRAYJOIN needed */
  const formula = `{Client Record ID} = '${clientRecordID}'`;

  /* Return full Airtable records so the caller can access both id and fields */
  return await fetchFromAirtable<any>('Clients By Week', formula);
} 