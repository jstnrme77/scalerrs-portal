import { fetchFromAirtable } from '../helpers';

export async function fetchActivityLogForWeek(weekLabel: string) {
  const clientRecordID = localStorage.getItem('clientRecordID');
  if (!clientRecordID) {
    throw new Error('Missing clientRecordID – localStorage');
  }

  /* "Record ID (from Related Client)" is Airtable's roll-up of the linked
     Client.  This is what actually stores the recXXXX identifier we need. */

  const formula =
    `AND(` +
      `{Week} = '${weekLabel}',` +
      `{Record ID (from Related Client)} = '${clientRecordID}'` +
    `)`;

  return await fetchFromAirtable<any>('Activity Log', formula);
} 