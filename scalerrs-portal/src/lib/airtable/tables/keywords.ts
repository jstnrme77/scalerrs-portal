import { fetchFromAirtable } from '../helpers';

export async function fetchKeywords() {
    const clientRecordID = localStorage.getItem('clientRecordID');
    if (!clientRecordID) {
        throw new Error('Missing clientRecordID - localStorage');
    }

    /* Airtable formula does the filtering **on the server** */
    const formula = `{clientRecordID} = '${clientRecordID}'`;

    const raw = await fetchFromAirtable<any>('Keywords', formula);

    /* If you also need to exclude rows without "Keyword Approvals" */
    return raw
        .map(r => r.fields)
        .filter(k => !!k['Keyword Approvals']);
} 