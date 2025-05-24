'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getClientNameSync } from '@/utils/clientUtils';
import { clearCacheByPrefix } from '@/lib/client-cache';
import { fetchClients } from '@/lib/client-api';

interface ClientDataContextType {
  clientId: string | null;
  setClientId: (id: string | null) => void;
  availableClients: { id: string; name: string }[];
  isLoading: boolean;
  getClientName: (clientId: string) => string;
  filterDataByClient: <T extends {
    client?: string | string[];
    Client?: string | string[];
    clients?: string | string[];
    Clients?: string | string[];
    [key: string]: any;
  }>(data: T[]) => T[];
  clearClientDataCache: () => void;
  refreshClientData: () => Promise<void>;
}

export const ClientDataContext = createContext<ClientDataContextType>({
  clientId: 'all',
  setClientId: () => {},
  availableClients: [],
  isLoading: false,
  getClientName: () => '',
  filterDataByClient: (data) => data,
  clearClientDataCache: () => {},
  refreshClientData: async () => {},
});

export function ClientDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [clientId, setClientId] = useState<string | null>(null);
  const [availableClients, setAvailableClients] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Function to clear client data cache
  const clearClientDataCache = () => {
    console.log('Clearing client data cache');
    // Clear all approvals cache
    clearCacheByPrefix('approvals_');
    // Clear other client-specific caches as needed
    clearCacheByPrefix('wqa-tasks_');
    clearCacheByPrefix('cro-tasks_');
  };

  // Clear cache when client ID changes
  useEffect(() => {
    if (clientId) {
      console.log(`Client ID changed to ${clientId}, clearing cache`);
      clearClientDataCache();
    }
  }, [clientId]);

  // Helper function to format clients data
  const formatClientsData = (clientsData: any[]) => {
    return clientsData.map(client => ({
      id: client.id,
      name: client.Name || `Client ${client.id.substring(0, 5)}`
    }));
  };

  // Helper function to get default client ID based on user role
  const getDefaultClientId = (clients: { id: string; name: string }[], userRole?: string) => {
    if (clients.length === 0) return null;
    
    return userRole === 'Client' ? clients[0].id : 'all';
  };

  // Helper function to check if an item matches the client ID
  const itemMatchesClient = (item: any, clientIdToMatch: string) => {
    // Check all possible client field variations
    const clientFields = ['Clients', 'Client', 'clients', 'client'];
    
    for (const field of clientFields) {
      const value = item[field];
      if (value !== undefined) {
        if (Array.isArray(value)) {
          return value.includes(clientIdToMatch);
        } else {
          return value === clientIdToMatch;
        }
      }
    }
    
    return false;
  };

  // Function to filter data by client and user permissions
  const filterDataByClient = <T extends {
    client?: string | string[];
    Client?: string | string[];
    clients?: string | string[];
    Clients?: string | string[];
    [key: string]: any;
  }>(data: T[]): T[] => {
    console.log('filterDataByClient called with data length:', data.length);
    console.log('Current user:', user?.Name, 'Role:', user?.Role);
    console.log('Selected clientId:', clientId);

    // If no user is logged in, return empty array
    if (!user) {
      console.log('No user logged in, returning empty array');
      return [];
    }

    // If user is admin
    if (user.Role === 'Admin') {
      console.log('User is admin');
      // If 'all' is selected or no client is selected, return all data
      if (!clientId || clientId === 'all') {
        console.log('All clients selected, returning all data');
        return data;
      }

      console.log('Admin filtering by specific client:', clientId);
      
      // Filter based on client ID
      const filtered = data.filter(item => itemMatchesClient(item, clientId));
      console.log('Filtered data length:', filtered.length);
      return filtered;
    }

    // For client users, filter by client ID
    if (user.Role === 'Client') {
      console.log('[ClientDataContext] Client User Detected. User object:', JSON.parse(JSON.stringify(user)));
      console.log('[ClientDataContext] user.Clients raw:', user.Clients);

      // If no client ID selected, use the first client ID from the user's clients
      const filterClientId = clientId || (Array.isArray(user.Clients) && user.Clients.length > 0 ? user.Clients[0] : user.Clients);

      console.log('[ClientDataContext] Initial clientId from state:', clientId);
      console.log('[ClientDataContext] Calculated filterClientId:', filterClientId);

      if (!filterClientId) {
        console.log('[ClientDataContext] No filterClientId resolved, returning empty array.');
        return [];
      }

      console.log('Client user filtering by client ID:', filterClientId);
      
      // Filter based on client ID
      const filteredData = data.filter(item => itemMatchesClient(item, filterClientId as string));
      console.log(`Filtered data for client ${filterClientId}: ${filteredData.length} items out of ${data.length}`);
      
      return filteredData;
    }

    // For other users (not admin or client)
    // If no client ID is selected, filter by assignments
    if (!clientId) {
      console.log('Non-admin/client user with no client ID selected, filtering by assignments');
      
      return data.filter(item => {
        // Check if the item is assigned to this user in any capacity
        const assignmentFields = [
          'AssignedTo', 'Writer', 'Editor', 'SEOStrategist', 
          'ContentWriter', 'ContentEditor'
        ];
        
        return assignmentFields.some(field => {
          const value = item[field];
          if (!value) return false;
          
          if (Array.isArray(value)) {
            return value.includes(user.id);
          } else {
            return value === user.id;
          }
        });
      });
    }

    // If a client ID is selected, filter by that client ID
    console.log('Non-admin/client user with client ID selected, filtering by client:', clientId);
    
    // Filter based on client ID
    return data.filter(item => itemMatchesClient(item, clientId));
  };

  // Function to load clients from API with caching
  const loadClients = async () => {
    try {
      setIsLoading(true);
      console.log('Loading clients from API...');
      
      // Create an AbortController for the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      // Check for cached client data
      const cachedClients = typeof window !== 'undefined' ? 
        localStorage.getItem('cached-clients-data') : null;
      const cacheTimestamp = typeof window !== 'undefined' ? 
        localStorage.getItem('cached-clients-timestamp') : null;
      
      // Get current user from localStorage
      const currentUser = typeof window !== 'undefined' ? 
        JSON.parse(localStorage.getItem('scalerrs-user') || 'null') : null;
      
      // Use cache if it exists and is less than 15 minutes old
      if (cachedClients && cacheTimestamp) {
        const cacheAge = Date.now() - parseInt(cacheTimestamp);
        if (cacheAge < 15 * 60 * 1000) { // 15 minutes
          console.log('Using cached client data');
          try {
            const parsedClients = JSON.parse(cachedClients);
            if (Array.isArray(parsedClients) && parsedClients.length > 0) {
              setAvailableClients(parsedClients);
              
              // Set default client ID if needed
              if (parsedClients.length > 0 && !clientId) {
                setClientId(getDefaultClientId(parsedClients, currentUser?.Role));
              }
              
              // Still fetch fresh data in the background
              fetchClients(controller.signal)
                .then(freshClients => {
                  if (Array.isArray(freshClients) && freshClients.length > 0) {
                    console.log('Updating cached client data with fresh data');
                    
                    // Format clients properly
                    const formattedClients = formatClientsData(freshClients);
                    
                    // Add "All Clients" option for non-client users
                    const clientsWithAll = currentUser?.Role !== 'Client' ? 
                      [{ id: 'all', name: 'All Clients' }, ...formattedClients] : 
                      formattedClients;
                    
                    // Update state and cache
                    setAvailableClients(clientsWithAll);
                    localStorage.setItem('cached-clients-data', JSON.stringify(clientsWithAll));
                    localStorage.setItem('cached-clients-timestamp', Date.now().toString());
                  }
                })
                .catch(error => {
                  console.error('Background refresh of clients failed:', error);
                });
              
              clearTimeout(timeoutId);
              setIsLoading(false);
              return;
            }
          } catch (e) {
            console.error('Error parsing cached client data:', e);
            // Continue to fetch fresh data
          }
        }
      }
      
      // Fetch fresh data
      const fetchedClients = await fetchClients(controller.signal);
      clearTimeout(timeoutId);
      
      if (!Array.isArray(fetchedClients)) {
        console.error('fetchClients did not return an array:', fetchedClients);
        throw new Error('Invalid clients data format');
      }
      
      console.log('Successfully fetched clients:', fetchedClients.length);
      
      // Format clients properly
      const formattedClients = formatClientsData(fetchedClients);
      
      // Add "All Clients" option for non-client users
      const clientsWithAll = currentUser?.Role !== 'Client' ? 
        [{ id: 'all', name: 'All Clients' }, ...formattedClients] : 
        formattedClients;
      
      // Update state and cache
      setAvailableClients(clientsWithAll);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('cached-clients-data', JSON.stringify(clientsWithAll));
        localStorage.setItem('cached-clients-timestamp', Date.now().toString());
      }
      
      // If there are clients and no client is selected, select the first one
      if (clientsWithAll.length > 0 && !clientId) {
        setClientId(getDefaultClientId(clientsWithAll, currentUser?.Role));
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      
      // Handle error cases with fallbacks
      handleClientLoadingError();
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to handle client loading errors
  const handleClientLoadingError = () => {
    // Check for cached data as fallback
    const cachedClients = typeof window !== 'undefined' ? 
      localStorage.getItem('cached-clients-data') : null;
    
    const currentUser = typeof window !== 'undefined' ? 
      JSON.parse(localStorage.getItem('scalerrs-user') || 'null') : null;
    
    if (cachedClients) {
      try {
        const parsedClients = JSON.parse(cachedClients);
        console.log('Using cached client data after fetch error');
        setAvailableClients(parsedClients);
        
        // Set default client ID if needed
        if (parsedClients.length > 0 && !clientId) {
          setClientId(getDefaultClientId(parsedClients, currentUser?.Role));
        }
        return;
      } catch (e) {
        console.error('Error parsing cached client data:', e);
      }
    }
    
    // Last resort fallback - create a minimal client list
    if (currentUser?.Role === 'Client' && currentUser?.Clients) {
      // For client users, create entries based on their assigned clients
      const clientIds = Array.isArray(currentUser.Clients) ? 
        currentUser.Clients : [currentUser.Clients];
      
      const fallbackClients = clientIds.map((id: string) => ({
        id,
        name: `Client ${id.substring(0, 5)}` // Use part of ID as name
      }));
      
      setAvailableClients(fallbackClients);
      
      if (fallbackClients.length > 0 && !clientId) {
        setClientId(fallbackClients[0].id);
      }
    } else {
      // For admin/other users, just provide "All Clients" option
      setAvailableClients([{ id: 'all', name: 'All Clients' }]);
      
      if (!clientId) {
        setClientId('all');
      }
    }
  };

  // Initialize available clients based on user data
  useEffect(() => {
    if (user) {
      setIsLoading(true);

      const fetchClientData = async () => {
        // Initialize the client cache for the getClientName utility
        try {
          await getClientNameSync('init-cache');
          console.log('Client cache initialized');
        } catch (error) {
          console.error('Error initializing client cache:', error);
        }
        try {
          // If user has Clients field and is a Client role
          if (user.Clients && user.Role === 'Client') {
            // Ensure Clients is an array
            const clientIds = Array.isArray(user.Clients) ? user.Clients : [user.Clients];

            // Fetch all clients to get their names
            const allClients = await fetchClients();

            // Filter clients to only include those assigned to this user
            const userClients = allClients
              .filter((client: { id: string; Name?: string }) => clientIds.includes(client.id))
              .map((client: { id: string; Name?: string }) => ({
                id: client.id,
                name: client.Name || `Client ${client.id.substring(0, 5)}`
              }));

            setAvailableClients(userClients);

            // Set default client ID to first client only if clientId is not set
            if (userClients.length > 0 && !clientId) {
              setClientId(userClients[0].id);
            }
          } else if (user.Role === 'Admin') {
            // For admin users, fetch all clients from Airtable
            console.log('Fetching clients for admin user...');

            try {
              // Create an AbortController for the fetch request
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

              // Pass the signal to fetchClients
              const allClients = await fetchClients(controller.signal);
              clearTimeout(timeoutId);

              console.log('Successfully fetched clients:', allClients.length);

              // Clear any Airtable connection issues flag since we successfully fetched data
              if (typeof window !== 'undefined') {
                console.log('Clearing airtable-connection-issues flag');
                localStorage.removeItem('airtable-connection-issues');
                localStorage.removeItem('use-mock-data');
              }

              // Create client options with id and name
              const clientOptions = formatClientsData(allClients);

              console.log('Client options:', clientOptions);

              // Add "All Clients" option at the beginning
              setAvailableClients([
                { id: 'all', name: 'All Clients' },
                ...clientOptions
              ]);
            } catch (error) {
              console.error('Error fetching clients:', error);
              setIsLoading(false);

              // Set a fallback client list with just "All Clients"
              setAvailableClients([
                { id: 'all', name: 'All Clients' }
              ]);
            }

            // Set default client ID to 'all' only if clientId is not set
            if (!clientId) {
              setClientId('all');
            }
          }
        } catch (error) {
          console.error('Error fetching clients:', error);
          handleClientLoadingError();
        } finally {
          setIsLoading(false);
        }
      };

      fetchClientData();
    }
  }, [user]);

  useEffect(() => {
    // Load clients from API
    loadClients();
    
    // Set up periodic refresh every 10 minutes
    const refreshInterval = setInterval(() => {
      console.log('Performing periodic client data refresh...');
      loadClients();
    }, 10 * 60 * 1000); // 10 minutes
    
    // Also set up a refresh when the window regains focus
    const handleFocus = () => {
      console.log('Window regained focus, refreshing client data...');
      loadClients();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Sync selected client id into localStorage so that legacy helpers that
  // still read `clientRecordID` continue to work (Reports, Approvals, etc.)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (clientId && clientId !== 'all') {
      localStorage.setItem('clientRecordID', clientId);
    } else {
      localStorage.removeItem('clientRecordID');
    }
  }, [clientId]);

  return (
    <ClientDataContext.Provider
      value={{
        clientId,
        setClientId,
        availableClients,
        isLoading,
        getClientName: (clientId: string) => {
          return getClientNameSync(clientId);
        },
        filterDataByClient,
        clearClientDataCache,
        refreshClientData: loadClients,
      }}
    >
      {children}
    </ClientDataContext.Provider>
  );
}

export function useClientData() {
  const context = useContext(ClientDataContext);
  if (context === undefined) {
    throw new Error('useClientData must be used within a ClientDataProvider');
  }
  return context;
}
