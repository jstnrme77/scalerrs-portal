import { fetchFromAirtable } from '../helpers';

export async function fetchBacklinks() {
    const clientRecordID = localStorage.getItem('clientRecordID');
    if (!clientRecordID) {
        throw new Error('Missing clientRecordID');
    }

    const formula = `{clientRecordID} = '${clientRecordID}'`;
    return (await fetchFromAirtable<any>('Backlinks', formula)).map(r => r.fields);
} 