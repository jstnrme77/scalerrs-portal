export function getClientId(): string | null {
    if (typeof window === 'undefined') return null;
    // Primary key used by the portal when a client is selected
    const id = localStorage.getItem('clientRecordID')
             || localStorage.getItem('selected-client-id');
    return id || null;
  } 