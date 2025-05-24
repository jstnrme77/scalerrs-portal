import * as React from 'react';
import { useEffect } from 'react';
import { fetchKeywords } from '../../lib/airtable/tables/keywords';

export default function DocumentViewerModal() {
    useEffect(() => {
        (async () => {
            try {
                const keywords = await fetchKeywords();
                // set state with filtered keywords
            } catch (err) {
                console.error(err);
            }
        })();
    }, []);

    return (
        // existing code...
    );
} 