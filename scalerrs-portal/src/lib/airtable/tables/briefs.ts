import { fetchFromAirtable } from '../helpers';

export async function fetchBriefs() {
    const clientRecordID = localStorage.getItem('clientRecordID');
    if (!clientRecordID) {
        throw new Error('Missing clientRecordID');
    }

    const formula = `{clientRecordID} = '${clientRecordID}'`;
    return (await fetchFromAirtable<any>('Briefs', formula)).map(r => r.fields);
} 