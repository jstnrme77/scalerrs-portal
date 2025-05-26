import { fetchFromAirtable } from '../helpers';
import { getClientId } from '../getClientId';

export async function fetchClientsByWeek() {
  const clientRecordID = getClientId();
  if (!clientRecordID) {
    // First render (e.g. dev Strict-Mode) → return empty list instead of throwing
    return [];
  }

  /* Faster + simpler: "Client Record ID" is a plain text column that stores   */
  /* the Airtable id of the linked Client → 1-to-1 match, no ARRAYJOIN needed */
  const formula = `{Client Record ID} = '${clientRecordID}'`;

  /* Return full Airtable records so the caller can access both id and fields */
  return await fetchFromAirtable<any>('Clients By Week', formula);
} 