import { fetchFromAirtable } from '../helpers';
import { getClientId } from '../getClientId';

export async function fetchActivityLogForWeek(weekLabel: string, clientId?: string | null) {
  // Use provided clientId or fall back to getClientId()
  const clientRecordID = clientId || getClientId();
  
  if (!clientRecordID) {
    console.error('Missing clientRecordID in fetchActivityLogForWeek');
    throw new Error('Missing clientRecordID');
  }

  /* "Record ID (from Related Client)" is Airtable's roll-up of the linked
     Client.  This is what actually stores the recXXXX identifier we need. */

  const formula =
    `AND(` +
      `{Week} = '${weekLabel}',` +
      `{Record ID (from Related Client)} = '${clientRecordID}'` +
    `)`;

  console.log(`Fetching activity log with formula: ${formula}`);
  return await fetchFromAirtable<any>('Activity Log', formula);
} 