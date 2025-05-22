import { fetchClients } from '@/lib/client-api';

// Cache for client data to avoid repeated API calls
let clientCache: { [key: string]: string } | null = null;

/**
 * Get client name from client ID
 * @param clientId The client ID to look up
 * @returns The client name, or a formatted version of the client ID if not found
 */
export async function getClientName(clientId: string | string[] | undefined): Promise<string> {
  if (!clientId) {
    return 'Unassigned';
  }

  // If it's an array, use the first item
  const id = Array.isArray(clientId) ? clientId[0] : clientId;

  // If no ID, return unassigned
  if (!id) {
    return 'Unassigned';
  }

  try {
    // Initialize the cache if it doesn't exist
    if (!clientCache) {
      const clients = await fetchClients();
      clientCache = {};

      // Build a map of client IDs to client names
      clients.forEach((client: { id?: string; Name?: string }) => {
        if (client.id && client.Name) {
          clientCache![client.id] = client.Name;
        }
      });

      console.log('Client cache initialized with', Object.keys(clientCache).length, 'clients');
    }

    // Look up the client name in the cache
    if (clientCache[id]) {
      return clientCache[id];
    }

    // If not found in cache, format the ID for display
    return id.length > 8 ? `${id.substring(0, 8)}...` : id;
  } catch (error) {
    console.error('Error getting client name:', error);

    // Return a formatted version of the ID
    return id.length > 8 ? `${id.substring(0, 8)}...` : id;
  }
}

/**
 * Get client names for a user's Clients array
 * @param clientIds Array of client IDs from user.Clients
 * @returns Array of client names
 */
export async function getUserClientNames(clientIds: string | string[] | undefined): Promise<string[]> {
  if (!clientIds) {
    return ['Unassigned'];
  }

  // Ensure we have an array of client IDs
  const ids = Array.isArray(clientIds) ? clientIds : [clientIds];
  
  try {
    // Initialize the cache if it doesn't exist
    if (!clientCache) {
      const clients = await fetchClients();
      clientCache = {};

      // Build a map of client IDs to client names
      clients.forEach((client: { id?: string; Name?: string }) => {
        if (client.id && client.Name) {
          clientCache![client.id] = client.Name;
        }
      });

      console.log('Client cache initialized with', Object.keys(clientCache).length, 'clients');
    }

    // Map each client ID to its name
    const clientNames = ids.map(id => {
      if (clientCache && clientCache[id]) {
        return clientCache[id];
      }
      // If not found in cache, format the ID for display
      return id.length > 8 ? `${id.substring(0, 8)}...` : id;
    });

    return clientNames;
  } catch (error) {
    console.error('Error getting client names:', error);
    
    // Return formatted IDs if there's an error
    return ids.map(id => id.length > 8 ? `${id.substring(0, 8)}...` : id);
  }
}

/**
 * Synchronous version that uses the cache only
 * @param clientId The client ID to look up
 * @returns The client name from cache, or a formatted version of the client ID if not found
 */
export function getClientNameSync(clientId: string | string[] | undefined): string {
  if (!clientId) {
    return 'Unassigned';
  }

  // If it's an array, use the first item
  const id = Array.isArray(clientId) ? clientId[0] : clientId;

  // If no ID, return unassigned
  if (!id) {
    return 'Unassigned';
  }

  // If cache exists, look up the client name
  if (clientCache && clientCache[id]) {
    return clientCache[id];
  }

  // If not found in cache, format the ID for display
  return id.length > 8 ? `${id.substring(0, 8)}...` : id;
}

/**
 * Get client names for a user's Clients array synchronously (using cache only)
 * @param clientIds Array of client IDs from user.Clients
 * @returns Array of client names
 */
export function getUserClientNamesSync(clientIds: string | string[] | undefined): string[] {
  if (!clientIds) {
    return ['Unassigned'];
  }

  // Ensure we have an array of client IDs
  const ids = Array.isArray(clientIds) ? clientIds : [clientIds];
  
  // Map each client ID to its name from cache
  return ids.map(id => {
    if (clientCache && clientCache[id]) {
      return clientCache[id];
    }
    // If not found in cache, format the ID for display
    return id.length > 8 ? `${id.substring(0, 8)}...` : id;
  });
}
