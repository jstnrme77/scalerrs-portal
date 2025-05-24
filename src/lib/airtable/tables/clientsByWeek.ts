import { fetchFromAirtable } from '../helpers';

export async function fetchClientsByWeek() {
  const clientRecordID = localStorage.getItem('clientRecordID');
  if (!clientRecordID) {
    throw new Error('Missing clientRecordID – localStorage');
  }

  /* Faster + simpler: "Client Record ID" is a plain text column that stores   */
  /* the Airtable id of the linked Client → 1-to-1 match, no ARRAYJOIN needed */
  const formula = `{Client Record ID} = '${clientRecordID}'`;

  /* Return full Airtable records so the caller can access both id and fields */
  return await fetchFromAirtable<any>('Clients By Week', formula);
} 