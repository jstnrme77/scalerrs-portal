import { fetchFromAirtable } from '../helpers';
import { getClientId } from '../getClientId';

export async function fetchActivityLogForWeek(weekLabel: string, clientId?: string | null) {
  // Use provided clientId or fall back to getClientId()
  const clientRecordID = clientId || getClientId();
  
  if (!clientRecordID || clientRecordID === 'all') {
    console.error(`Missing or invalid clientRecordID in fetchActivityLogForWeek: ${clientRecordID}`);
    console.log('Attempting to fetch activity logs without client filter');
    
    // For 'all' or missing client, just filter by week
    const formula = `{Week} = '${weekLabel}'`;
    console.log(`Fetching activity log with formula: ${formula}`);
    return await fetchFromAirtable<any>('Activity Log', formula);
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