export function getClientId(): string | null {
    if (typeof window === 'undefined') {
        console.log('getClientId called server-side, returning null');
        return null;
    }
    // Primary key used by the portal when a client is selected
    const id = localStorage.getItem('clientRecordID')
             || localStorage.getItem('selected-client-id');
    
    if (!id) {
        console.warn('getClientId: No client ID found in localStorage');
    } else {
        console.log(`getClientId: Found client ID: ${id}`);
    }
    
    return id || null;
  } 